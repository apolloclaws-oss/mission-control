"use client";
import { useEffect, useState } from "react";

const G = {
  green: "#00e676",
  blue: "#00b0ff",
  purple: "#a855f7",
  amber: "#f59e0b",
  bg: "#080d1a",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.09)",
  text: "rgba(255,255,255,0.9)",
  muted: "rgba(255,255,255,0.4)",
  dim: "rgba(255,255,255,0.35)",
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="glass" style={{ padding: 24, ...style }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: string; color: string; sub: string }) {
  return (
    <div className="glass" style={{ padding: 20, borderTop: `2px solid ${color}` }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 12,
      }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: G.muted }}>{label}</div>
      <div style={{ fontSize: 11, color: G.dim, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Countdown({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setS(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return (
    <span style={{ fontFamily: "monospace", fontSize: 42, fontWeight: 700, letterSpacing: "0.1em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
      {m}:{sec}
    </span>
  );
}

const PROJECTS = [
  { name: "Exeris Website", status: "In Progress", color: G.green, next: "Deploy to Vercel → update DNS on mijndomein.nl" },
  { name: "Mission Control", status: "In Progress", color: G.green, next: "Polish UI, wire live data" },
  { name: "Item Lending Tracker", status: "Planned", color: G.blue, next: "Start after Xcode installs" },
];

const ACTIVITY = [
  { time: "13:07", text: "Exeris website built" },
  { time: "13:53", text: "Superpowers v5.0.2 installed" },
  { time: "13:54", text: "Claude-Mem v10.5.5 installed" },
  { time: "13:55", text: "UI UX Pro Max skill loaded" },
  { time: "14:54", text: "Screen control via Peekaboo unlocked" },
  { time: "15:09", text: "Gemini web search configured" },
  { time: "15:56", text: "Mission Control dashboard built" },
];

export default function Overview() {
  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, marginBottom: 6 }}>Overview</h1>
        <p style={{ fontSize: 13, color: G.muted, margin: 0 }}>Apollo's live status and daily activity</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard icon="⚡" label="Tokens Today" value="284K" color={G.green} sub="28% of daily limit" />
        <StatCard icon="⏱" label="Active Crons" value="3" color={G.amber} sub="All healthy" />
        <StatCard icon="☑" label="Tasks Queued" value="2" color={G.purple} sub="Next heartbeat" />
        <StatCard icon="◎" label="Cache Hits" value="99%" color={G.blue} sub="Saving ~$0.40/day" />
      </div>

      {/* Main 3-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Apollo Status */}
        <Card>
          <Label>Apollo Status</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #00e676, #00b0ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(0,230,118,0.25)", flexShrink: 0,
            }}>
              <span style={{ color: "#080d1a", fontWeight: 900, fontSize: 16 }}>A</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>Apollo</div>
              <div style={{ color: G.muted, fontSize: 11 }}>claude-sonnet-4-6</div>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
              background: "rgba(0,230,118,0.1)", color: G.green,
              border: "1px solid rgba(0,230,118,0.2)",
            }}>● Online</div>
          </div>
          {[
            { label: "Uptime", value: "3h 14m", color: "#fff" },
            { label: "Cache hit rate", value: "99%", color: G.green },
            { label: "Context used", value: "13%", color: "#fff" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: G.muted, fontSize: 13 }}>{r.label}</span>
              <span style={{ color: r.color, fontWeight: 600, fontSize: 13 }}>{r.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.dim, marginBottom: 6 }}>
              <span>284K used</span><span>1M limit</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "28%", height: "100%", background: `linear-gradient(90deg, ${G.green}, ${G.blue})`, borderRadius: 4 }} />
            </div>
          </div>
        </Card>

        {/* Heartbeat */}
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <Label>Next Heartbeat</Label>
          <div style={{ marginBottom: 8 }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: G.green, display: "inline-block" }} />
          </div>
          <Countdown seconds={847} />
          <div style={{ color: G.dim, fontSize: 12, marginTop: 8, marginBottom: 20 }}>Every ~15 minutes</div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Search Twitter for OpenClaw tips", "Review project statuses", "Check dev servers"].map(t => (
              <div key={t} style={{
                fontSize: 11, color: G.muted, background: "rgba(255,255,255,0.03)",
                borderRadius: 10, padding: "10px 12px", textAlign: "left",
              }}>→ {t}</div>
            ))}
          </div>
        </Card>

        {/* Active Projects */}
        <Card>
          <Label>Active Projects</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROJECTS.map(p => (
              <div key={p.name} style={{
                padding: 14, borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{p.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                    color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}30`,
                  }}>{p.status}</span>
                </div>
                <p style={{ color: G.dim, fontSize: 12, lineHeight: 1.5, margin: 0, wordBreak: "break-word" }}>{p.next}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity */}
      <Card>
        <Label>Day One — 2026-03-14</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ACTIVITY.map((a, i) => (
            <div key={a.text} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              gridColumn: i === ACTIVITY.length - 1 ? "1 / -1" : undefined,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.green, flexShrink: 0 }} />
              <span style={{ color: G.muted, fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>{a.time}</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{a.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
