import fs from 'fs'
import path from 'path'
import readline from 'readline'

const SESSIONS_DIR = '/Users/stefano/.openclaw/agents/main/sessions'

export interface SessionMessage {
  type: string
  id?: string
  timestamp?: number | string
  message?: any
  parentId?: string
}

export interface ModelUsage {
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  cost: number
}

export interface SessionData {
  sessionId: string
  sessionKey: string
  startTime: number
  endTime: number
  duration: number
  status: 'running' | 'done'
  task: string
  lastMessage: string
  models: Map<string, ModelUsage>
  totalTokens: number
  totalCost: number
  cacheHitRate: number // percentage
}

/**
 * Parse a single JSONL file and extract session metadata
 */
export async function analyzeSessionFile(filePath: string): Promise<SessionData | null> {
  return new Promise((resolve) => {
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    const models = new Map<string, ModelUsage>()
    let sessionId = ''
    let sessionKey = ''
    let startTime = 0
    let endTime = 0
    let task = 'Unknown'
    let lastMessage = ''
    let firstLine = true
    let totalTokens = 0
    let totalCost = 0
    let totalCacheReadTokens = 0
    let totalCacheWriteTokens = 0

    rl.on('line', (line: string) => {
      try {
        const entry = JSON.parse(line)

        if (firstLine && entry.type === 'session') {
          sessionId = entry.id || ''
          const timestamp = new Date(entry.timestamp).getTime()
          startTime = timestamp
          endTime = timestamp
          firstLine = false
          return
        }

        if (entry.type === 'message' && entry.message) {
          const msg = entry.message
          const timestamp = entry.timestamp
            ? new Date(entry.timestamp).getTime()
            : entry.message.timestamp || 0

          if (timestamp > endTime) {
            endTime = timestamp
          }

          // Extract session key from first message
          if (!sessionKey && msg.systemSent !== undefined) {
            sessionKey = 'agent:main:main' // default for main sessions
          }

          // Get task from first user message
          if (!task || task === 'Unknown') {
            if (msg.role === 'user') {
              const content = Array.isArray(msg.content)
                ? msg.content.find((c: any) => c.type === 'text')?.text || ''
                : msg.content || ''
              if (content) {
                task = content.slice(0, 150)
              }
            }
          }

          // Get last assistant message
          if (msg.role === 'assistant') {
            const content = Array.isArray(msg.content)
              ? msg.content.find((c: any) => c.type === 'text')?.text || ''
              : ''
            if (content) {
              lastMessage = content.slice(0, 500)
            }

            // Extract model and token usage
            const model = msg.model || 'unknown'
            const usage = msg.usage || {}

            const inputTokens = usage.inputTokens || usage.input || 0
            const outputTokens = usage.outputTokens || usage.output || 0
            const cacheReadTokens = usage.cacheRead || 0
            const cacheWriteTokens = usage.cacheWrite || 0
            const cost = usage.cost?.total || 0

            totalTokens += inputTokens + outputTokens
            totalCost += cost
            totalCacheReadTokens += cacheReadTokens
            totalCacheWriteTokens += cacheWriteTokens

            if (!models.has(model)) {
              models.set(model, {
                model,
                inputTokens: 0,
                outputTokens: 0,
                cacheReadTokens: 0,
                cacheWriteTokens: 0,
                cost: 0
              })
            }

            const modelData = models.get(model)!
            modelData.inputTokens += inputTokens
            modelData.outputTokens += outputTokens
            modelData.cacheReadTokens += cacheReadTokens
            modelData.cacheWriteTokens += cacheWriteTokens
            modelData.cost += cost
          }
        }
      } catch (e) {
        // Skip malformed lines
      }
    })

    rl.on('close', () => {
      if (!sessionId) {
        resolve(null)
        return
      }

      const duration = endTime - startTime
      const status = duration < 120000 ? 'running' : 'done'
      
      // Calculate cache hit rate
      const totalCacheTokens = totalCacheReadTokens + totalCacheWriteTokens
      const cacheHitRate = totalCacheTokens > 0
        ? Math.round((totalCacheReadTokens / totalCacheTokens) * 100)
        : 0

      resolve({
        sessionId,
        sessionKey,
        startTime,
        endTime,
        duration,
        status,
        task,
        lastMessage,
        models,
        totalTokens,
        totalCost,
        cacheHitRate
      })
    })
  })
}

/**
 * Get all active sessions sorted by recency
 */
export async function getActiveSessions(): Promise<SessionData[]> {
  const files = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
    .map(f => ({
      file: f,
      mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 50) // Last 50 sessions

  const sessions: SessionData[] = []

  for (const { file } of files) {
    const data = await analyzeSessionFile(path.join(SESSIONS_DIR, file))
    if (data) {
      sessions.push(data)
    }
  }

  return sessions.sort((a, b) => b.endTime - a.endTime)
}

/**
 * Calculate daily costs from session logs
 */
export async function getDailyCosts(): Promise<{ day: string; cost: number }[]> {
  const sessions = await getActiveSessions()
  const dailyCosts: { [key: string]: number } = {}

  for (const session of sessions) {
    const date = new Date(session.endTime)
    const day = date.toISOString().split('T')[0]

    if (!dailyCosts[day]) {
      dailyCosts[day] = 0
    }
    dailyCosts[day] += session.totalCost
  }

  // Get last 7 days
  const today = new Date()
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().split('T')[0]
    last7Days.push({
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: dailyCosts[dayStr] || 0
    })
  }

  return last7Days
}

/**
 * Get model breakdown from all sessions
 */
export async function getModelBreakdown(): Promise<
  { model: string; tokens: number; cost: number }[]
> {
  const sessions = await getActiveSessions()
  const modelStats: { [key: string]: { tokens: number; cost: number } } = {}

  for (const session of sessions) {
    for (const [model, usage] of session.models) {
      if (!modelStats[model]) {
        modelStats[model] = { tokens: 0, cost: 0 }
      }
      modelStats[model].tokens +=
        usage.inputTokens + usage.outputTokens
      modelStats[model].cost += usage.cost
    }
  }

  return Object.entries(modelStats)
    .map(([model, stats]) => ({
      model,
      tokens: stats.tokens,
      cost: stats.cost
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)
}
