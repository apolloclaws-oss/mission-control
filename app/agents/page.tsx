"use client";
import { useEffect, useState } from "react";

const G = {
  green: "#00e676",
  blue: "#00b0ff",
  purple: "#a855f7",
  amber: "#f59e0b",
  red: "#ff5252",
  bg: "#080d1a",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.09)",
  text: "rgba(255,255,255,0.9)",
  muted: "rgba(255,255,255,0.4)",
  dim: "rgba(255,255,255,0.25)",
};

interface Agent {
  sessionKey: string;
  sessionId: string;
  status: "running" | "done" | "error";
  task: string;
  model: string;
  totalTokens: number;
  cost: number;
  runtimeMs: number;
  startedAt: number;
  endedAt?: number;
  lastMessage: string;
}

function formatRuntime(ms: number) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function formatTokens(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function StatusDot({ status }: { status: string }) {
  const color = status === "running" ? G.green : status === "error" ? G.red : G.muted;
  const pulse = status === "running";
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, flexShrink: 0,
      boxShadow: pulse ? `0 0 8px ${G.green}` : "none",
      animation: pulse ? "pulse 1.5s infinite" : "none",
    }} />
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);
  const shortId = agent.sessionId.slice(0, 8);
  const isRunning = agent.status === "running";

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: isRunning ? "rgba(0,230,118,0.03)" : G.card,
        border: isRunning ? "1px solid rgba(0,230,118,0.15)" : `1px solid ${G.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: 12,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <StatusDot status={agent.status} />
        <span style={{ fontFamily: "monospace", fontSize: 11, color: G.muted, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 6 }}>
          {shortId}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
          background: isRunning ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.06)",
          color: isRunning ? G.green : G.muted,
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {agent.status}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: G.dim }}>{timeAgo(agent.startedAt)}</span>
      </div>

      {/* Task */}
      <div style={{ fontSize: 13, color: G.text, lineHeight: 1.5, marginBottom: 14 }}>
        {agent.task}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { label: "Runtime", value: formatRuntime(agent.runtimeMs) },
          { label: "Tokens", value: formatTokens(agent.totalTokens) },
          { label: "Cost", value: `€${agent.cost.toFixed(4)}` },
          { label: "Model", value: agent.model.split("/").pop() || agent.model },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 10, color: G.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
            <span style={{ fontSize: 13, color: G.muted, fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Expanded: last message */}
      {expanded && agent.lastMessage && (
        <div style={{
          marginTop: 16, padding: "14px 16px",
          background: "rgba(0,0,0,0.3)", borderRadius: 10,
          borderLeft: `3px solid ${isRunning ? G.green : G.blue}`,
        }}>
          <div style={{ fontSize: 10, color: G.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Last output
          </div>
          <pre style={{ fontSize: 12, color: G.muted, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontFamily: "inherit", lineHeight: 1.6 }}>
            {agent.lastMessage}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "running" | "done">("all");

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const data = await res.json();
      setAgents(data.agents || []);
      setUpdatedAt(data.updatedAt);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  const running = agents.filter(a => a.status === "running");
  const done = agents.filter(a => a.status !== "running");
  const filtered = filter === "running" ? running : filter === "done" ? done : agents;

  const totalCost = agents.reduce((s, a) => s + a.cost, 0);
  const totalTokens = agents.reduce((s, a) => s + a.totalTokens, 0);

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: G.text, margin: 0 }}>Agents</h1>
          {running.length > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
              background: "rgba(0,230,118,0.12)", color: G.green, border: "1px solid rgba(0,230,118,0.2)",
            }}>
              {running.length} running
            </span>
          )}
        </div>
        <p style={{ color: G.muted, fontSize: 14, margin: 0 }}>
          Live feed van alle mini-agents. Elke 3 seconden bijgewerkt.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Totaal agents", value: agents.length, color: G.blue },
          { label: "Nu actief", value: running.length, color: G.green },
          { label: "Totaal tokens", value: formatTokens(totalTokens), color: G.purple },
          { label: "Totale kosten", value: `€${totalCost.toFixed(4)}`, color: G.amber },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: G.card, border: `1px solid ${G.border}`, borderRadius: 16,
            padding: "20px 24px",
          }}>
            <div style={{ fontSize: 10, color: G.dim, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "running", "done"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 500,
            border: filter === f ? `1px solid ${G.green}` : `1px solid ${G.border}`,
            background: filter === f ? "rgba(0,230,118,0.08)" : "transparent",
            color: filter === f ? G.green : G.muted,
            cursor: "pointer", transition: "all 0.15s",
          }}>
            {f === "all" ? "Alle" : f === "running" ? "Actief" : "Klaar"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: G.dim, alignSelf: "center" }}>
          {updatedAt ? `bijgewerkt ${timeAgo(updatedAt)}` : ""}
        </span>
      </div>

      {/* Agent list */}
      {loading ? (
        <div style={{ color: G.muted, fontSize: 14 }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: G.card, border: `1px solid ${G.border}`, borderRadius: 16,
          padding: 48, textAlign: "center", color: G.muted, fontSize: 14,
        }}>
          {filter === "running" ? "Geen actieve agents op dit moment." : "Geen agents gevonden."}
        </div>
      ) : (
        filtered.map(agent => <AgentCard key={agent.sessionId} agent={agent} />)
      )}
    </div>
  );
}
