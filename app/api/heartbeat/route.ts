// app/api/heartbeat/route.ts
export async function GET() {
  return Response.json({
    intervalMinutes: 15,
    nextInSeconds: 847,
    tasks: [
      "Search Twitter for OpenClaw use cases",
      "Review MISSION.md project statuses",
      "Check Exeris dev server status",
      "Distill daily log into MEMORY.md",
    ],
  });
}
