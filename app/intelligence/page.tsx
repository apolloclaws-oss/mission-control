"use client";
import { useState } from "react";

const PRESETS = [
  "Swift iOS development tips 2025",
  "OpenClaw best use cases",
  "iOS App Store low competition niches",
  "Dutch startup AI tools",
  "Indie app marketing strategies",
];

const RESULTS = [
  {
    title: "Top SwiftUI patterns for indie developers in 2025",
    source: "medium.com",
    summary: "Async/await, @Observable macro, SwiftData — these three changes make building iOS apps dramatically faster for solo developers. Combined with Xcode previews and Swift Package Manager, a single developer can ship App Store quality apps in days.",
    url: "#",
    tag: "Swift",
  },
  {
    title: "OpenClaw users are automating entire businesses while sleeping",
    source: "reddit.com/r/openclaw",
    summary: "Power users are setting up heartbeat tasks that run every 15 minutes — researching competitors, updating MEMORY.md, checking server status. The key insight: treat your AI agent like a new employee on day 1. Spend time training it.",
    url: "#",
    tag: "OpenClaw",
  },
  {
    title: "The #1 mistake indie devs make on the App Store",
    source: "twitter.com",
    summary: "Launching without ASO (App Store Optimization). Your icon, screenshots, and first 3 lines of description determine 80% of conversion. Use tools like AppFollow or Sensor Tower to find keywords with high search volume + low competition.",
    url: "#",
    tag: "Marketing",
  },
  {
    title: "Low competition app niches with proven demand in 2025",
    source: "indiehackers.com",
    summary: "Item lending tracker, medication reminders with photo scanning, hobby buddy matcher, hyper-local event alerts. These niches have Reddit posts with hundreds of upvotes saying 'why doesn't this app exist?' — validated demand, zero solutions.",
    url: "#",
    tag: "Ideas",
  },
];

const TAG_COLORS: Record<string, string> = {
  Swift: "#00b0ff",
  OpenClaw: "#00e676",
  Marketing: "#a855f7",
  Ideas: "#f59e0b",
};

export default function Intelligence() {
  const [query, setQuery] = useState(PRESETS[0]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div style={{ width: "100%", animation: "fadeInUp 0.4s ease" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence Feed</h1>
        <p className="text-white/40 text-sm">Research and insights for what we're building</p>
      </div>

      {/* Search */}
      <div className="glass p-5 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00e676]/40 transition"
            placeholder="Search for insights..."
          />
          <button className="bg-[#00e676] text-[#080d1a] font-bold px-5 py-3 rounded-xl text-sm hover:bg-[#00c853] transition">
            Search
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setQuery(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                query === p
                  ? "bg-[#00e676]/10 text-[#00e676] border-[#00e676]/30"
                  : "bg-white/3 text-white/40 border-white/10 hover:text-white/60"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {RESULTS.map((r, i) => {
          const tagColor = TAG_COLORS[r.tag] || "#00e676";
          const hovered = hoveredIdx === i;
          return (
            <div
              key={i}
              className="glass p-6"
              style={{
                transition: "all 0.2s ease",
                transform: hovered ? "scale(1.005)" : "scale(1)",
                border: hovered ? "1px solid rgba(0,230,118,0.2)" : "1px solid rgba(255,255,255,0.09)",
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-white leading-snug">{r.title}</h3>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0"
                  style={{ color: tagColor, background: `${tagColor}15`, borderColor: `${tagColor}30` }}
                >
                  {r.tag}
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-3">{r.summary}</p>
              <div className="text-white/25 text-xs">{r.source}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
