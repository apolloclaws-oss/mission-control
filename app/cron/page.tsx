"use client";

const JOBS = [
  {
    id: 1, name: "Self-improvement sweep", schedule: "Every 15 min", status: "active",
    lastRun: "16:05", nextRun: "16:20",
    runs: [
      { time: "16:05", status: "ok", duration: "4s" },
      { time: "15:50", status: "ok", duration: "3s" },
      { time: "15:35", status: "ok", duration: "5s" },
    ]
  },
  {
    id: 2, name: "Twitter/X research scan", schedule: "Every 6 hours", status: "active",
    lastRun: "12:00", nextRun: "18:00",
    runs: [
      { time: "12:00", status: "ok", duration: "18s" },
    ]
  },
  {
    id: 3, name: "Dev server health check", schedule: "Every 30 min", status: "active",
    lastRun: "16:07", nextRun: "16:37",
    runs: [
      { time: "16:07", status: "ok", duration: "1s" },
      { time: "15:37", status: "ok", duration: "1s" },
      { time: "15:07", status: "warn", duration: "1s" },
    ]
  },
];

const STATUS: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "#00e676", bg: "#00e67615", label: "Active" },
  paused: { color: "#f59e0b", bg: "#f59e0b15", label: "Paused" },
  failed: { color: "#ef4444", bg: "#ef444415", label: "Failed" },
  ok: { color: "#00e676", bg: "#00e67615", label: "OK" },
  warn: { color: "#f59e0b", bg: "#f59e0b15", label: "Warn" },
};

export default function Cron() {
  return (
    <div style={{ width: "100%", animation: "fadeInUp 0.4s ease" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Cron Jobs</h1>
        <p className="text-white/40 text-sm">Scheduled tasks Apollo runs automatically</p>
      </div>

      <div className="space-y-4">
        {JOBS.map(job => {
          const cfg = STATUS[job.status];
          return (
            <div key={job.id} className="glass p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-white text-base mb-1">{job.name}</div>
                  <div className="text-white/40 text-sm">{job.schedule}</div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}30` }}>
                  ● {cfg.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/3 rounded-xl p-3">
                  <div className="text-xs text-white/30 mb-1">Last run</div>
                  <div className="text-white font-mono text-sm">{job.lastRun}</div>
                </div>
                <div className="bg-white/3 rounded-xl p-3">
                  <div className="text-xs text-white/30 mb-1">Next run</div>
                  <div className="text-[#00e676] font-mono text-sm">{job.nextRun}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Recent runs</div>
                <div className="flex gap-2">
                  {job.runs.map((r, i) => {
                    const rcfg = STATUS[r.status];
                    return (
                      <div key={i} className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: rcfg.color }} />
                        <span className="text-white/50 text-xs font-mono">{r.time}</span>
                        <span className="text-white/25 text-xs">{r.duration}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
