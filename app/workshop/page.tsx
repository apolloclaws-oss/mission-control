"use client";

const TASKS = [
  { id: 1, status: "done", title: "Build Exeris website", detail: "Next.js + Tailwind, bilingual NL/EN, contact form with Resend", time: "13:07", duration: "~45 min" },
  { id: 2, status: "done", title: "Install Claude Code + Superpowers", detail: "Claude Code v2.1.76, Superpowers v5.0.2 via plugin marketplace", time: "13:53", duration: "~8 min" },
  { id: 3, status: "done", title: "Wire Resend contact form", detail: "API route /api/contact, bilingual emails, loading + error states", time: "13:40", duration: "~15 min" },
  { id: 4, status: "done", title: "Build Mission Control dashboard", detail: "5-tab Next.js dashboard, liquid glass UI, live heartbeat countdown", time: "15:56", duration: "~20 min" },
  { id: 5, status: "running", title: "Polish Mission Control UI", detail: "Glass effects, live data, Apple-quality design", time: "16:09", duration: "In progress" },
  { id: 6, status: "queued", title: "Deploy Exeris to Vercel", detail: "Connect GitHub repo, deploy, update DNS on mijndomein.nl", time: "—", duration: "~15 min" },
  { id: 7, status: "queued", title: "Item Lending Tracker (SwiftUI)", detail: "iOS app — track lent items, reminders, App Store submission", time: "—", duration: "~3 days" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  done: { label: "Done", color: "#00e676", bg: "#00e67615" },
  running: { label: "Running", color: "#f59e0b", bg: "#f59e0b15" },
  queued: { label: "Queued", color: "#a855f7", bg: "#a855f715" },
};

export default function Workshop() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Workshop</h1>
        <p className="text-white/40 text-sm">Everything Apollo is working on — past, present, and queued</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Completed Today", value: "4", color: "#00e676" },
          { label: "Currently Running", value: "1", color: "#f59e0b" },
          { label: "In Queue", value: "2", color: "#a855f7" },
        ].map(s => (
          <div key={s.label} className="glass p-4 flex items-center gap-4">
            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {TASKS.map(task => {
          const cfg = STATUS_CONFIG[task.status];
          return (
            <div key={task.id} className="glass p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {task.status === "done" ? "✓" : task.status === "running" ? "▶" : "○"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{task.title}</div>
                    <div className="text-white/45 text-sm leading-relaxed">{task.detail}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}30` }}>
                    {cfg.label}
                  </span>
                  <span className="text-white/30 text-xs font-mono">{task.time}</span>
                  <span className="text-white/20 text-xs">{task.duration}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
