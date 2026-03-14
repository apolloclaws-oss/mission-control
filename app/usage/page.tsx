"use client";

const DAILY = [
  { day: "Mar 8", cost: 0.02 },
  { day: "Mar 9", cost: 0.01 },
  { day: "Mar 10", cost: 0.03 },
  { day: "Mar 11", cost: 0.01 },
  { day: "Mar 12", cost: 0.02 },
  { day: "Mar 13", cost: 0.04 },
  { day: "Mar 14", cost: 0.48 },
];

const maxCost = Math.max(...DAILY.map(d => d.cost));

export default function Usage() {
  const todayCost = 0.48;
  const projectedMonth = todayCost * 30;
  const cacheHitRate = 99;
  const cacheSavings = 0.40;

  return (
    <div style={{ width: "100%" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">API Usage</h1>
        <p className="text-white/40 text-sm">Token consumption and cost tracking</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Cost", value: `$${todayCost.toFixed(2)}`, color: "#00e676", sub: "First day = lots of setup" },
          { label: "Projected/Month", value: `$${projectedMonth.toFixed(0)}`, color: "#f59e0b", sub: "Based on today" },
          { label: "Cache Hit Rate", value: `${cacheHitRate}%`, color: "#00b0ff", sub: "Excellent" },
          { label: "Cache Savings", value: `$${cacheSavings.toFixed(2)}`, color: "#a855f7", sub: "Saved today" },
        ].map(s => (
          <div key={s.label} className="glass p-5 border-t-2" style={{ borderTopColor: s.color }}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{s.label}</div>
            <div className="text-xs text-white/25 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass p-6 mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-6">Daily Spend — Last 7 Days</div>
        <div className="flex items-end gap-3 h-32">
          {DAILY.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs text-white/40">${d.cost.toFixed(2)}</div>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(d.cost / maxCost) * 120}px`,
                  background: d.day === "Mar 14"
                    ? "linear-gradient(to top, #00e676, #00b0ff)"
                    : "rgba(255,255,255,0.08)",
                  boxShadow: d.day === "Mar 14" ? "0 0 12px rgba(0,230,118,0.3)" : undefined
                }}
              />
              <div className="text-[10px] text-white/30">{d.day.split(" ")[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Model breakdown */}
      <div className="glass p-6">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">Model Breakdown</div>
        <div className="space-y-3">
          {[
            { model: "claude-sonnet-4-6 (Apollo)", tokens: "284K", cost: "$0.38", pct: 79 },
            { model: "claude-sonnet-4-6 (Claude Code)", tokens: "74K", cost: "$0.10", pct: 21 },
          ].map(m => (
            <div key={m.model} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/70">{m.model}</span>
                  <span className="text-white font-medium">{m.cost}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00e676] to-[#00b0ff] rounded-full"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
              <div className="text-white/30 text-xs w-12 text-right">{m.tokens}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-white/40 text-sm">Budget alert threshold</span>
          <span className="text-white font-semibold">$50 / month</span>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>$0.48 spent</span>
            <span>$50.00 budget</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#00e676] rounded-full" style={{ width: "1%" }} />
          </div>
          <div className="text-xs text-[#00e676] mt-1">1% of monthly budget used — you're safe 🌞</div>
        </div>
      </div>
    </div>
  );
}
