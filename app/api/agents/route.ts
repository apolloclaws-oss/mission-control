import { NextResponse } from 'next/server'
import { getActiveSessions } from '@/lib/session-analyzer'

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
  cacheHitRate: number
}

export async function GET() {
  try {
    const sessions = await getActiveSessions()

    const agents: AgentSession[] = sessions
      .filter(s => s.sessionKey && s.sessionKey !== 'agent:main:main')
      .map(s => {
        const models = Array.from(s.models.values())
        const primaryModel = models.length > 0
          ? models[0].model
          : 'claude-haiku-4-5'

        return {
          sessionKey: s.sessionKey || `subagent:${s.sessionId}`,
          sessionId: s.sessionId,
          status: s.status,
          task: s.task,
          model: primaryModel,
          totalTokens: s.totalTokens,
          cost: s.totalCost,
          runtimeMs: s.duration,
          startedAt: s.startTime,
          endedAt: s.endTime,
          lastMessage: s.lastMessage,
          cacheHitRate: s.cacheHitRate
        }
      })

    return NextResponse.json({
      agents: agents.slice(0, 20), // Last 20 agents
      updatedAt: Date.now(),
      count: agents.length
    })
  } catch (error: any) {
    console.error('Agents API error:', error)
    return NextResponse.json(
      { agents: [], error: error.message, updatedAt: Date.now() },
      { status: 500 }
    )
  }
}
