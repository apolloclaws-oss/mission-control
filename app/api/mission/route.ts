// app/api/mission/route.ts
import fs from "fs";

const FALLBACK_PROJECTS = [
  { name: "Exeris Website", status: "In Progress", next: "Deploy to Vercel → update DNS on mijndomein.nl" },
  { name: "Mission Control App", status: "In Progress", next: "Polish UI, add real data connections" },
  { name: "Item Lending Tracker", status: "Planned", next: "Start after Xcode installs" },
];

export async function GET() {
  try {
    const content = fs.readFileSync("/Users/stefano/.openclaw/workspace/MISSION.md", "utf-8");
    return Response.json({ projects: FALLBACK_PROJECTS, raw: content });
  } catch {
    return Response.json({ projects: FALLBACK_PROJECTS, raw: "" });
  }
}
