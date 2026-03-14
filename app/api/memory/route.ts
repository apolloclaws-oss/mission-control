// app/api/memory/route.ts
const FALLBACK_ITEMS = [
  { text: "Exeris website built (Next.js + Tailwind)", done: true, time: "13:07" },
  { text: "Claude Code + Superpowers v5.0.2 installed", done: true, time: "13:53" },
  { text: "Claude-Mem v10.5.5 installed", done: true, time: "13:54" },
  { text: "UI UX Pro Max skill loaded", done: true, time: "13:55" },
  { text: "Screen control via Peekaboo unlocked", done: true, time: "14:54" },
  { text: "Gemini web search configured", done: true, time: "15:09" },
  { text: "Mission Control built", done: true, time: "15:56" },
];

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  return Response.json({ date: today, label: "Day One", items: FALLBACK_ITEMS });
}
