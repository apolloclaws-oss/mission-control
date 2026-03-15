"use client";

import { useEffect, useState } from "react";

interface UsageData {
  summary: {
    todayCost: number;
    totalCost: number;
    projectedMonth: number;
    cacheHitRate: number;
    cacheSavings: number;
    monthlyBudget: number;
    budgetUsedPercent: number;
  };
  dailyCosts: { day: string; cost: number }[];
  modelBreakdown: {
    model: string;
    tokens: number;
    cost: number;
    percentage: number;
  }[];
  updatedAt: number;
}

export default function Usage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/usage");
        if (!response.ok) throw new Error("Failed to fetch usage data");
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        console.error("Usage fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ width: "100%", animation: "fadeInUp 0.4s ease" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">API Usage</h1>
          <p className="text-white/40 text-sm">
            Token consumption and cost tracking
          </p>
        </div>
        <div className="glass p-8 text-center">
          <div className="text-white/40">Loading usage data...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ width: "100%", animation: "fadeInUp 0.4s ease" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">API Usage</h1>
          <p className="text-white/40 text-sm">
            Token consumption and cost tracking
          </p>
        </div>
        <div className="glass p-8 text-center border-l-2 border-red-500">
          <div className="text-red-400">{error || "No data available"}</div>
        </div>
      </div>
    );
  }

  const { summary, dailyCosts, modelBreakdown } = data;
  const maxCost = Math.max(...dailyCosts.map((d) => d.cost), 0.01);

  return (
    <div style={{ width: "100%", animation: "fadeInUp 0.4s ease" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">API Usage</h1>
        <p className="text-white/40 text-sm">
          Token consumption and cost tracking
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Today's Cost",
            value: `$${summary.todayCost.toFixed(3)}`,
            color: "#00e676",
            sub: "Real-time tracking",
          },
          {
            label: "Projected/Month",
            value: `$${summary.projectedMonth.toFixed(0)}`,
            color: "#f59e0b",
            sub: "Based on today",
          },
          {
            label: "Cache Hit Rate",
            value: `${summary.cacheHitRate}%`,
            color: "#00b0ff",
            sub:
              summary.cacheHitRate > 80
                ? "Excellent"
                : summary.cacheHitRate > 50
                  ? "Good"
                  : "Could improve",
          },
          {
            label: "Cache Savings",
            value: `$${summary.cacheSavings.toFixed(2)}`,
            color: "#a855f7",
            sub: "Saved all-time",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass p-5 border-t-2"
            style={{ borderTopColor: s.color }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              {s.label}
            </div>
            <div className="text-xs text-white/25 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass p-6 mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-6">
          Daily Spend — Last 7 Days
        </div>
        <div className="flex items-end gap-3 h-32">
          {dailyCosts.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs text-white/40">
                ${d.cost.toFixed(3)}
              </div>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(d.cost / maxCost) * 120}px`,
                  background:
                    i === dailyCosts.length - 1
                      ? "linear-gradient(to top, #00e676, #00b0ff)"
                      : "rgba(255,255,255,0.08)",
                  boxShadow:
                    i === dailyCosts.length - 1
                      ? "0 0 12px rgba(0,230,118,0.3)"
                      : undefined,
                }}
              />
              <div className="text-[10px] text-white/30">{d.day.split(" ")[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Model breakdown */}
      <div className="glass p-6">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">
          Model Breakdown
        </div>
        <div className="space-y-3">
          {modelBreakdown.length > 0 ? (
            modelBreakdown.map((m) => (
              <div key={m.model} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70 text-xs">{m.model}</span>
                    <span className="text-white font-medium">${m.cost.toFixed(3)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00e676] to-[#00b0ff] rounded-full"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-white/30 text-xs w-16 text-right">
                  {(m.tokens / 1000).toFixed(0)}K tokens
                </div>
              </div>
            ))
          ) : (
            <div className="text-white/30 text-sm">No model data available</div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-white/40 text-sm">Budget alert threshold</span>
          <span className="text-white font-semibold">
            ${summary.monthlyBudget} / month
          </span>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>${summary.totalCost.toFixed(3)} spent</span>
            <span>${summary.monthlyBudget.toFixed(2)} budget</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00e676] rounded-full"
              style={{ width: `${Math.min(summary.budgetUsedPercent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-[#00e676] mt-1">
            {summary.budgetUsedPercent}% of monthly budget used — you're safe
            🌞
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-white/20 text-right">
        Last updated: {new Date(data.updatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
