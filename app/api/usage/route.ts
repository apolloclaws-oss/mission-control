import { NextResponse } from 'next/server'
import { getDailyCosts, getModelBreakdown, getActiveSessions } from '@/lib/session-analyzer'

export async function GET() {
  try {
    const [dailyCosts, modelBreakdown, sessions] = await Promise.all([
      getDailyCosts(),
      getModelBreakdown(),
      getActiveSessions()
    ])

    // Calculate summary stats
    const totalCost = sessions.reduce((sum, s) => sum + s.totalCost, 0)
    const todayCost = dailyCosts[dailyCosts.length - 1]?.cost || 0
    const projectedMonth = todayCost * 30

    // Calculate cache hit rate across all sessions
    let totalCacheRead = 0
    let totalCacheWrite = 0
    for (const session of sessions) {
      for (const model of session.models.values()) {
        totalCacheRead += model.cacheReadTokens
        totalCacheWrite += model.cacheWriteTokens
      }
    }
    const totalCacheTokens = totalCacheRead + totalCacheWrite
    const cacheHitRate =
      totalCacheTokens > 0
        ? Math.round((totalCacheRead / totalCacheTokens) * 100)
        : 0

    // Calculate cache savings (approximate: $0.90 per 1M cached tokens vs $3.00 per 1M normal)
    const cacheSavings = (totalCacheRead / 1_000_000) * (3.00 - 0.90)

    return NextResponse.json({
      summary: {
        todayCost: Number(todayCost.toFixed(4)),
        totalCost: Number(totalCost.toFixed(4)),
        projectedMonth: Number(projectedMonth.toFixed(2)),
        cacheHitRate,
        cacheSavings: Number(cacheSavings.toFixed(2)),
        monthlyBudget: 50,
        budgetUsedPercent: Math.min(
          Math.round((totalCost / 50) * 100),
          100
        )
      },
      dailyCosts: dailyCosts.map(d => ({
        day: d.day,
        cost: Number(d.cost.toFixed(4))
      })),
      modelBreakdown: modelBreakdown.map(m => ({
        model: m.model,
        tokens: m.tokens,
        cost: Number(m.cost.toFixed(4)),
        percentage: sessions.length > 0
          ? Math.round((m.cost / totalCost) * 100)
          : 0
      })),
      updatedAt: Date.now()
    })
  } catch (error: any) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      {
        error: error.message,
        summary: {
          todayCost: 0,
          totalCost: 0,
          projectedMonth: 0,
          cacheHitRate: 0,
          cacheSavings: 0,
          monthlyBudget: 50,
          budgetUsedPercent: 0
        },
        dailyCosts: [],
        modelBreakdown: [],
        updatedAt: Date.now()
      },
      { status: 500 }
    )
  }
}
