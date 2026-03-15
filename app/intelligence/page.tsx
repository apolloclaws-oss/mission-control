"use client";
import { useState, useEffect } from "react";

const PRESETS = [
  "Swift iOS development tips 2025",
  "OpenClaw best use cases",
  "iOS App Store low competition niches",
  "Dutch startup AI tools",
  "Indie app marketing strategies",
];

const TAG_COLORS: Record<string, string> = {
  Swift: "#00b0ff",
  OpenClaw: "#00e676",
  Marketing: "#a855f7",
  Ideas: "#f59e0b",
  Research: "#00e676",
};

interface FeedItem {
  title: string;
  source: string;
  summary: string;
  tag: string;
  time: string;
  url?: string;
}

export default function Intelligence() {
  const [query, setQuery] = useState(PRESETS[0]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/intelligence")
      .then(r => r.json())
      .then(data => {
        setItems(data.items || []);
        setLastUpdated(data.lastUpdated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: "100%", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, marginBottom: 6 }}>Intelligence Feed</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Research Apollo collects every heartbeat</p>
        </div>
        {lastUpdated ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
            <span style={{ color: "#00e676" }}>● </span>Last updated: {lastUpdated}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            Updates every heartbeat (~15 min)
          </div>
        )}
      </div>

      {/* Search */}
      <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              padding: "12px 16px", color: "#fff", fontSize: 14,
              outline: "none", transition: "border 0.2s",
            }}
            placeholder="Search for insights..."
          />
          <button style={{
            background: "#00e676", color: "#080d1a", fontWeight: 700,
            padding: "12px 20px", borderRadius: 12, fontSize: 14,
            border: "none", cursor: "pointer", transition: "background 0.2s",
          }}>
            Search
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESETS.map(p => (
            <button key={p} onClick={() => setQuery(p)} style={{
              fontSize: 11, padding: "6px 12px", borderRadius: 20, cursor: "pointer",
              transition: "all 0.15s",
              background: query === p ? "rgba(0,230,118,0.1)" : "rgba(255,255,255,0.03)",
              color: query === p ? "#00e676" : "rgba(255,255,255,0.4)",
              border: query === p ? "1px solid rgba(0,230,118,0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 40 }}>Loading intelligence feed...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((r, i) => {
            const tagColor = TAG_COLORS[r.tag] || "#00e676";
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                className="glass"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: 24,
                  transform: isHovered ? "scale(1.005)" : "scale(1)",
                  border: isHovered ? "1px solid rgba(0,230,118,0.2)" : "1px solid rgba(255,255,255,0.09)",
                  transition: "all 0.2s ease",
                  cursor: r.url ? "pointer" : "default",
                  animation: `fadeInUp 0.4s ease ${i * 0.08}s both`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 600, color: "#fff", lineHeight: 1.4, margin: 0, fontSize: 15 }}>{r.title}</h3>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      color: tagColor, background: `${tagColor}15`, border: `1px solid ${tagColor}30`,
                    }}>{r.tag}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{r.time}</span>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, margin: "0 0 10px 0" }}>{r.summary}</p>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{r.source}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      <div style={{
        marginTop: 24, padding: "14px 20px", borderRadius: 12,
        background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.15)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
          Apollo automatically searches Twitter/X, Reddit, and the web every heartbeat (~15 min) and saves findings here. 
          Results improve as Apollo learns what's relevant to our projects.
        </span>
      </div>
    </div>
  );
}
