import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SESSIONS_DIR = '/Users/stefano/.openclaw/agents/main/sessions'

interface AgentSession {
  sessionKey: string
  sessionId: string
  status: 'running' | 'done' | 'error'
  task: string
  model: string
  totalTokens: number
  cost: number
  runtimeMs: number
  startedAt: number
  endedAt?: number
  lastMessage: string
}

export async function GET() {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) {
      return NextResponse.json({ agents: [], updatedAt: Date.now() })
    }

    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({
        file: f,
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 20) // last 20 sessions

    const agents: AgentSession[] = []

    for (const { file } of files) {
      try {
        const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8')
        const lines = content.trim().split('\n').filter(Boolean)
        if (lines.length === 0) continue

        const messages = lines.map(l => {
          try { return JSON.parse(l) } catch { return null }
        }).filter(Boolean)

        // Skip main session (agent:main:main)
        const firstMsg = messages[0]
        if (!firstMsg?.sessionKey || firstMsg.sessionKey === 'agent:main:main') continue
        if (!firstMsg.sessionKey?.includes('subagent')) continue

        const sessionId = file.replace('.jsonl', '')
        
        // Find task from first user message
        const userMsgs = messages.filter((m: any) => m.role === 'user')
        const taskMsg = userMsgs[0]
        let task = 'Unknown task'
        if (taskMsg?.content) {
          const text = Array.isArray(taskMsg.content)
            ? taskMsg.content.find((c: any) => c.type === 'text')?.text || ''
            : taskMsg.content
          task = text.slice(0, 120) + (text.length > 120 ? '...' : '')
        }

        // Find last assistant message
        const assistantMsgs = messages.filter((m: any) => m.role === 'assistant')
        const lastAssistant = assistantMsgs[assistantMsgs.length - 1]
        let lastMessage = ''
        let totalTokens = 0
        let cost = 0
        
        if (lastAssistant) {
          const textContent = Array.isArray(lastAssistant.content)
            ? lastAssistant.content.find((c: any) => c.type === 'text')?.text || ''
            : ''
          lastMessage = textContent.slice(0, 300) + (textContent.length > 300 ? '...' : '')
          totalTokens = lastAssistant.usage?.totalTokens || 0
          cost = lastAssistant.usage?.cost?.total || 0
        }

        // Determine status: if last message is within 60s of now, assume running
        const lastMsgTime = lastAssistant?.timestamp || 0
        const now = Date.now()
        const age = now - lastMsgTime
        const status = age < 90000 && lastAssistant?.stopReason !== 'stop' ? 'running' : 'done'

        const startedAt = messages[0]?.timestamp || 0
        const endedAt = lastAssistant?.timestamp

        agents.push({
          sessionKey: firstMsg.sessionKey || `subagent:${sessionId}`,
          sessionId,
          status,
          task,
          model: lastAssistant?.model || 'claude-sonnet-4-6',
          totalTokens,
          cost,
          runtimeMs: endedAt ? endedAt - startedAt : now - startedAt,
          startedAt,
          endedAt,
          lastMessage,
        })
      } catch (e) {
        // skip malformed sessions
      }
    }

    return NextResponse.json({ agents, updatedAt: Date.now() })
  } catch (e: any) {
    return NextResponse.json({ agents: [], error: e.message, updatedAt: Date.now() })
  }
}
