// app/api/status/route.ts
export async function GET() {
  return Response.json({
    name: "Apollo",
    status: "online",
    model: "claude-sonnet-4-6",
    uptime: "3h 14m",
    lastActive: "just now",
    tokensToday: 284000,
    tokenLimit: 1000000,
    activeCrons: 3,
    tasksQueued: 2,
    cacheHitRate: 99,
  });
}
