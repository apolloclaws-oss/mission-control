"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/overview", icon: "⊙", label: "Overview" },
  { href: "/agents", icon: "◎", label: "Agents" },
  { href: "/workshop", icon: "⚗", label: "Workshop" },
  { href: "/usage", icon: "◉", label: "API Usage" },
  { href: "/cron", icon: "◷", label: "Cron Jobs" },
  { href: "/intelligence", icon: "◈", label: "Intelligence" },
];

export default function Sidebar() {
  const path = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  return (
    <aside className="sidebar" style={{
      position: "fixed", left: 0, top: 0, height: "100%", width: "224px",
      display: "flex", flexDirection: "column", zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, #00e676, #00b0ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(0,230,118,0.3)",
          }}>
            <span style={{ color: "#080d1a", fontWeight: 900, fontSize: 14 }}>A</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, lineHeight: 1 }}>Mission Control</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 3 }}>Apollo × Stefano</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {nav.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          const hovered = hoveredHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, textDecoration: "none",
                transition: "all 0.15s",
                background: active
                  ? "rgba(0,230,118,0.08)"
                  : hovered
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                border: active ? "1px solid rgba(0,230,118,0.2)" : "1px solid transparent",
                borderLeft: active ? "3px solid #00e676" : "3px solid transparent",
                color: active ? "#00e676" : hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.45)",
              }}
              onMouseEnter={() => setHoveredHref(item.href)}
              onMouseLeave={() => setHoveredHref(null)}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
              {active && (
                <span className="pulse-dot" style={{
                  marginLeft: "auto", width: 6, height: 6,
                  borderRadius: "50%", background: "#00e676",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e676", display: "block" }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>apollo is online</span>
        </div>
      </div>
    </aside>
  );
}
