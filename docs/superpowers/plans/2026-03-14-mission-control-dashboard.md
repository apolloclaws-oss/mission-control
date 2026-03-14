# Mission Control Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium Next.js 16 dashboard for Apollo (AI agent) and Stefano to monitor projects, tasks, API usage, cron jobs, and intelligence feeds.

**Architecture:** Next.js App Router with file-system API routes that read workspace markdown files. All UI uses a reusable Liquid Glass design system (frosted glass cards, blur effects). Pages are tab-navigated via a persistent sidebar. Data is fetched client-side from API routes on mount.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, recharts, lucide-react, date-fns

---

## File Structure

```
mission-control/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar + font
│   ├── page.tsx                      # Redirect → /overview
│   ├── globals.css                   # Tailwind + CSS variables
│   ├── overview/page.tsx             # Tab 1: Overview
│   ├── workshop/page.tsx             # Tab 2: Workshop
│   ├── usage/page.tsx                # Tab 3: API Usage & Cost
│   ├── cron/page.tsx                 # Tab 4: Cron Jobs
│   ├── intelligence/page.tsx         # Tab 5: Intelligence Feed
│   └── api/
│       ├── mission/route.ts          # GET → reads MISSION.md
│       ├── memory/route.ts           # GET → reads today's memory file
│       ├── heartbeat/route.ts        # GET → reads HEARTBEAT.md
│       └── status/route.ts          # GET → mock Apollo status + token stats
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx               # Navigation sidebar
│   └── ui/
│       ├── GlassCard.tsx             # Reusable frosted glass card
│       ├── StatusBadge.tsx           # Colored status pill
│       ├── CountdownTimer.tsx        # Live countdown to next heartbeat
│       ├── TokenGauge.tsx            # Circular/bar token usage gauge
│       └── TaskCard.tsx              # Expandable task card
├── lib/
│   └── types.ts                      # Shared TypeScript types
├── tailwind.config.ts                # Tailwind configuration
├── next.config.ts                    # Next.js config (allow fs reads)
└── package.json
```

---

## Chunk 1: Project Bootstrap

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css`

- [ ] **Step 1: Create the Next.js app**

```bash
cd /Users/stefano/.openclaw/workspace/mission-control
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

Expected: project files created, `npm run dev` works

- [ ] **Step 2: Install dependencies**

```bash
npm install recharts lucide-react date-fns
```

Expected: packages added to node_modules

- [ ] **Step 3: Update next.config.ts to allow filesystem reads**

Replace contents of `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow server-side filesystem reads from workspace
};

export default nextConfig;
```

- [ ] **Step 4: Set up CSS variables and globals in app/globals.css**

```css
@import "tailwindcss";

:root {
  --bg-primary: #0a0f1e;
  --bg-secondary: #0d1530;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --accent-green: #00e676;
  --accent-purple: #a855f7;
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-muted: rgba(255, 255, 255, 0.35);
}

* {
  box-sizing: border-box;
}

html, body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}

/* Glass morphism utility */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
```

- [ ] **Step 5: Verify project builds**

```bash
npm run build
```

Expected: build succeeds (Next.js default pages)

---

## Chunk 2: Shared Types and Core UI Components

### Task 2: Define shared types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write types**

```typescript
// lib/types.ts

export type ApolloStatus = 'online' | 'offline' | 'thinking';

export interface ApollStatusData {
  status: ApolloStatus;
  model: string;
  uptime: string;
  lastActive: string;
  nextHeartbeat: string; // ISO timestamp
  tokensUsedToday: number;
  tokenLimit: number;
  activeCronJobs: number;
  tasksQueued: number;
}

export interface Project {
  name: string;
  emoji: string;
  status: 'in-progress' | 'done' | 'blocked';
  description: string;
  nextStep: string;
}

export interface MissionData {
  mission: string;
  activeProjects: Project[];
  revenueGoals: string[];
}

export interface MemoryEntry {
  date: string;
  content: string;
}

export interface HeartbeatTask {
  id: string;
  title: string;
  description?: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface HeartbeatData {
  raw: string;
  tasks: HeartbeatTask[];
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  humanSchedule: string;
  lastRun: string | null;
  nextRun: string;
  status: 'active' | 'paused' | 'failed';
  history: Array<{ runAt: string; status: 'success' | 'failed'; duration: string }>;
}

export interface UsageData {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalCost: number;
  cacheHitRate: number;
  dailyHistory: Array<{ date: string; cost: number; tokens: number }>;
  modelBreakdown: Array<{ model: string; tokens: number; cost: number }>;
}
```

---

### Task 3: GlassCard component

**Files:**
- Create: `components/ui/GlassCard.tsx`

- [ ] **Step 1: Build GlassCard**

```typescript
// components/ui/GlassCard.tsx
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  glow?: 'green' | 'purple' | 'none';
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  padding = 'md',
  glow = 'none',
  onClick,
}: GlassCardProps) {
  const paddingClass = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  }[padding];

  const glowClass = {
    green: 'shadow-[0_0_30px_rgba(0,230,118,0.08)] border-[rgba(0,230,118,0.2)]',
    purple: 'shadow-[0_0_30px_rgba(168,85,247,0.08)] border-[rgba(168,85,247,0.2)]',
    none: 'border-white/10',
  }[glow];

  return (
    <div
      className={`
        rounded-2xl border backdrop-blur-xl
        bg-white/[0.04] transition-all duration-200
        ${glowClass} ${paddingClass}
        ${onClick ? 'cursor-pointer hover:bg-white/[0.07]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
```

---

### Task 4: StatusBadge component

**Files:**
- Create: `components/ui/StatusBadge.tsx`

- [ ] **Step 1: Build StatusBadge**

```typescript
// components/ui/StatusBadge.tsx

type BadgeVariant = 'online' | 'offline' | 'thinking' | 'active' | 'paused' | 'failed' | 'queued' | 'running' | 'done' | 'in-progress' | 'blocked';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  pulse?: boolean;
}

const VARIANT_CONFIG: Record<BadgeVariant, { color: string; dot: string; defaultLabel: string }> = {
  online:      { color: 'text-[#00e676] bg-[#00e676]/10 border-[#00e676]/30', dot: 'bg-[#00e676]', defaultLabel: 'Online' },
  offline:     { color: 'text-white/50 bg-white/5 border-white/15', dot: 'bg-white/50', defaultLabel: 'Offline' },
  thinking:    { color: 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30', dot: 'bg-[#a855f7]', defaultLabel: 'Thinking' },
  active:      { color: 'text-[#00e676] bg-[#00e676]/10 border-[#00e676]/30', dot: 'bg-[#00e676]', defaultLabel: 'Active' },
  paused:      { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400', defaultLabel: 'Paused' },
  failed:      { color: 'text-red-400 bg-red-400/10 border-red-400/30', dot: 'bg-red-400', defaultLabel: 'Failed' },
  queued:      { color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', dot: 'bg-blue-400', defaultLabel: 'Queued' },
  running:     { color: 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30', dot: 'bg-[#a855f7]', defaultLabel: 'Running' },
  done:        { color: 'text-[#00e676] bg-[#00e676]/10 border-[#00e676]/30', dot: 'bg-[#00e676]', defaultLabel: 'Done' },
  'in-progress': { color: 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30', dot: 'bg-[#a855f7]', defaultLabel: 'In Progress' },
  blocked:     { color: 'text-red-400 bg-red-400/10 border-red-400/30', dot: 'bg-red-400', defaultLabel: 'Blocked' },
};

export function StatusBadge({ variant, label, pulse = false }: StatusBadgeProps) {
  const config = VARIANT_CONFIG[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {label ?? config.defaultLabel}
    </span>
  );
}
```

---

### Task 5: CountdownTimer component

**Files:**
- Create: `components/ui/CountdownTimer.tsx`

- [ ] **Step 1: Build CountdownTimer**

```typescript
// components/ui/CountdownTimer.tsx
'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetTime: string; // ISO timestamp
  label?: string;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

export function CountdownTimer({ targetTime, label = 'Next heartbeat' }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const target = new Date(targetTime).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const isDue = remaining === 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-white/50 text-xs uppercase tracking-widest">{label}</span>
      <span className={`font-mono text-3xl font-bold tabular-nums ${isDue ? 'text-[#00e676] animate-pulse' : 'text-white'}`}>
        {isDue ? 'NOW' : formatDuration(remaining)}
      </span>
    </div>
  );
}
```

---

### Task 6: TokenGauge component

**Files:**
- Create: `components/ui/TokenGauge.tsx`

- [ ] **Step 1: Build TokenGauge**

```typescript
// components/ui/TokenGauge.tsx
'use client';

interface TokenGaugeProps {
  used: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TokenGauge({ used, total, label = 'Tokens', size = 'md' }: TokenGaugeProps) {
  const pct = Math.min(100, (used / total) * 100);
  const color = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#00e676';

  const sizeConfig = {
    sm: { r: 30, stroke: 5, dim: 80, fontSize: 'text-sm' },
    md: { r: 45, stroke: 7, dim: 110, fontSize: 'text-base' },
    lg: { r: 60, stroke: 9, dim: 140, fontSize: 'text-xl' },
  }[size];

  const { r, stroke, dim, fontSize } = sizeConfig;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          {/* Progress ring */}
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none" stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold tabular-nums ${fontSize}`} style={{ color }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white/40 text-xs">{(used / 1000).toFixed(0)}K / {(total / 1000).toFixed(0)}K</p>
      </div>
    </div>
  );
}
```

---

### Task 7: TaskCard component

**Files:**
- Create: `components/ui/TaskCard.tsx`

- [ ] **Step 1: Build TaskCard**

```typescript
// components/ui/TaskCard.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { GlassCard } from './GlassCard';
import type { HeartbeatTask } from '@/lib/types';

interface TaskCardProps {
  task: HeartbeatTask;
}

const STATUS_ICONS = {
  queued: <Clock className="w-4 h-4 text-blue-400" />,
  running: <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />,
  done: <CheckCircle2 className="w-4 h-4 text-[#00e676]" />,
  failed: <AlertCircle className="w-4 h-4 text-red-400" />,
};

export function TaskCard({ task }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard
      padding="sm"
      onClick={() => setExpanded(!expanded)}
      className="select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {STATUS_ICONS[task.status]}
          <div>
            <p className="text-sm font-medium text-white/90">{task.title}</p>
            {task.startedAt && !expanded && (
              <p className="text-xs text-white/40">{task.startedAt}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={task.status} />
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
            : <ChevronDown className="w-3.5 h-3.5 text-white/30" />
          }
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/8 space-y-1.5">
          {task.description && (
            <p className="text-sm text-white/60">{task.description}</p>
          )}
          <div className="flex gap-4 text-xs text-white/40">
            {task.startedAt && <span>Started: {task.startedAt}</span>}
            {task.completedAt && <span>Completed: {task.completedAt}</span>}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
```

---

## Chunk 3: Sidebar Navigation and Root Layout

### Task 8: Sidebar component

**Files:**
- Create: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Build Sidebar**

```typescript
// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FlaskConical, DollarSign, Clock, Telescope } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/overview',     icon: Home,          label: 'Overview',    emoji: '🏠' },
  { href: '/workshop',     icon: FlaskConical,  label: 'Workshop',    emoji: '🔬' },
  { href: '/usage',        icon: DollarSign,    label: 'API Usage',   emoji: '💰' },
  { href: '/cron',         icon: Clock,         label: 'Cron Jobs',   emoji: '⏰' },
  { href: '/intelligence', icon: Telescope,     label: 'Intelligence', emoji: '🔭' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="
      fixed left-0 top-0 h-screen w-64
      bg-[#080d1a]/80 backdrop-blur-2xl
      border-r border-white/8
      flex flex-col z-50
    ">
      {/* Logo / Header */}
      <div className="px-6 pt-7 pb-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e676]/30 to-[#a855f7]/30 flex items-center justify-center border border-white/10">
            <span className="text-lg">🌞</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white/90 tracking-tight">Mission Control</p>
            <p className="text-xs text-white/40">Apollo × Stefano</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label, emoji }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${active
                  ? 'bg-white/10 text-white border border-white/15 shadow-[0_0_20px_rgba(0,230,118,0.05)]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e676]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
          <span className="text-xs text-white/40">Apollo is online</span>
        </div>
      </div>
    </aside>
  );
}
```

---

### Task 9: Root layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update root layout**

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mission Control — Apollo × Stefano",
  description: "Apollo's Mission Control dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f1e] min-h-screen`}>
        <Sidebar />
        <main className="ml-64 min-h-screen">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Root page redirect**

```typescript
// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/overview');
}
```

---

## Chunk 4: API Routes

### Task 10: /api/mission route

**Files:**
- Create: `app/api/mission/route.ts`

- [ ] **Step 1: Build the mission API route**

```typescript
// app/api/mission/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const WORKSPACE = '/Users/stefano/.openclaw/workspace';

export async function GET() {
  try {
    const raw = await readFile(path.join(WORKSPACE, 'MISSION.md'), 'utf-8');

    // Parse active projects from markdown
    const projects = [];
    const projectRegex = /### \d+\. (.+?) \((.+?)\)\n([\s\S]*?)(?=###|\n## |$)/g;
    let match;
    while ((match = projectRegex.exec(raw)) !== null) {
      const name = match[1].trim();
      const statusRaw = match[2].trim();
      const body = match[3].trim();
      const lines = body.split('\n').filter(l => l.trim());
      const description = lines[0]?.replace(/^- /, '') ?? '';
      const nextStep = lines.find(l => l.includes('Next step'))?.replace(/^- Next step: /, '') ?? '';

      const status = statusRaw.includes('Progress') ? 'in-progress'
        : statusRaw.includes('Done') ? 'done'
        : 'blocked';

      projects.push({ name, status, description, nextStep, emoji: statusRaw.includes('🟡') ? '🟡' : '🟢' });
    }

    // Parse revenue goals
    const goalsMatch = raw.match(/## Revenue Goals\n([\s\S]*?)(?=\n## |$)/);
    const goals = goalsMatch
      ? goalsMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- \[.\] /, ''))
      : [];

    return NextResponse.json({ raw, projects, goals });
  } catch (err) {
    return NextResponse.json({ error: 'Could not read MISSION.md', projects: [], goals: [] }, { status: 500 });
  }
}
```

---

### Task 11: /api/memory route

**Files:**
- Create: `app/api/memory/route.ts`

- [ ] **Step 1: Build the memory API route**

```typescript
// app/api/memory/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

const WORKSPACE = '/Users/stefano/.openclaw/workspace';

export async function GET() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const filePath = path.join(WORKSPACE, 'memory', `${today}.md`);

  try {
    const raw = await readFile(filePath, 'utf-8');

    // Extract "What we built today" section
    const builtMatch = raw.match(/## What (?:we|I) built today\n([\s\S]*?)(?=\n## |$)/);
    const items = builtMatch
      ? builtMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, ''))
      : [];

    // Extract title (first H1)
    const titleMatch = raw.match(/^# (.+)$/m);
    const title = titleMatch?.[1] ?? today;

    return NextResponse.json({ date: today, title, raw, items });
  } catch {
    return NextResponse.json({
      date: today,
      title: `${today} — No entries yet`,
      raw: '',
      items: [],
    });
  }
}
```

---

### Task 12: /api/heartbeat route

**Files:**
- Create: `app/api/heartbeat/route.ts`

- [ ] **Step 1: Build the heartbeat API route**

```typescript
// app/api/heartbeat/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const WORKSPACE = '/Users/stefano/.openclaw/workspace';

export async function GET() {
  try {
    const raw = await readFile(path.join(WORKSPACE, 'HEARTBEAT.md'), 'utf-8');

    // Parse tasks (lines that start with #task or - [ ] or similar)
    const tasks = [];
    const lines = raw.split('\n');
    let id = 0;
    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;
      if (line.startsWith('-') || line.startsWith('*')) {
        id++;
        tasks.push({
          id: `task-${id}`,
          title: line.replace(/^[-*]\s*/, '').trim(),
          status: 'queued' as const,
        });
      }
    }

    return NextResponse.json({ raw, tasks });
  } catch {
    return NextResponse.json({ raw: '', tasks: [] });
  }
}
```

---

### Task 13: /api/status route

**Files:**
- Create: `app/api/status/route.ts`

- [ ] **Step 1: Build the status API route with mock data**

```typescript
// app/api/status/route.ts
import { NextResponse } from 'next/server';
import type { ApollStatusData } from '@/lib/types';

export async function GET() {
  // Next heartbeat: every 15 minutes from now
  const nextHeartbeat = new Date(Date.now() + 14 * 60 * 1000 + Math.random() * 60000);

  const status: ApollStatusData = {
    status: 'online',
    model: 'claude-sonnet-4-6',
    uptime: '2h 34m',
    lastActive: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    nextHeartbeat: nextHeartbeat.toISOString(),
    tokensUsedToday: 284_000,
    tokenLimit: 1_000_000,
    activeCronJobs: 3,
    tasksQueued: 2,
  };

  return NextResponse.json(status);
}
```

---

## Chunk 5: Page Implementations

### Task 14: Overview page

**Files:**
- Create: `app/overview/page.tsx`

- [ ] **Step 1: Build Overview page**

```typescript
// app/overview/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { TokenGauge } from '@/components/ui/TokenGauge';
import { Cpu, Zap, Clock, CheckSquare } from 'lucide-react';
import type { ApollStatusData, MissionData, MemoryEntry } from '@/lib/types';

export default function OverviewPage() {
  const [apolloStatus, setApolloStatus] = useState<ApollStatusData | null>(null);
  const [mission, setMission] = useState<MissionData | null>(null);
  const [memory, setMemory] = useState<MemoryEntry | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/status').then(r => r.json()),
      fetch('/api/mission').then(r => r.json()),
      fetch('/api/memory').then(r => r.json()),
    ]).then(([status, missionData, memData]) => {
      setApolloStatus(status);
      setMission(missionData);
      setMemory(memData);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90">Overview</h1>
        <p className="text-sm text-white/40 mt-1">Apollo's Mission Control — live status and daily activity</p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Zap, label: 'Tokens Today', value: apolloStatus ? `${(apolloStatus.tokensUsedToday / 1000).toFixed(0)}K` : '—', color: 'text-[#00e676]' },
          { icon: Clock, label: 'Active Crons', value: apolloStatus?.activeCronJobs?.toString() ?? '—', color: 'text-[#a855f7]' },
          { icon: CheckSquare, label: 'Tasks Queued', value: apolloStatus?.tasksQueued?.toString() ?? '—', color: 'text-blue-400' },
          { icon: Cpu, label: 'Model', value: 'Sonnet 4.6', color: 'text-white/70' },
        ].map(({ icon: Icon, label, value, color }) => (
          <GlassCard key={label} padding="sm">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <div>
                <p className="text-xs text-white/40">{label}</p>
                <p className={`text-base font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Apollo Status Card */}
        <GlassCard glow="green" className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Apollo Status</h2>
            {apolloStatus && <StatusBadge variant={apolloStatus.status} pulse />}
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00e676]/20 to-[#a855f7]/20 flex items-center justify-center border border-white/10 text-3xl">
              🌞
            </div>
            <div>
              <p className="text-lg font-bold text-white/90">Apollo</p>
              <p className="text-xs text-white/40">{apolloStatus?.model ?? 'Loading...'}</p>
              <p className="text-xs text-white/30 mt-0.5">Uptime: {apolloStatus?.uptime ?? '—'}</p>
            </div>
          </div>

          {apolloStatus && (
            <TokenGauge
              used={apolloStatus.tokensUsedToday}
              total={apolloStatus.tokenLimit}
              label="Tokens used today"
              size="sm"
            />
          )}
        </GlassCard>

        {/* Heartbeat Countdown */}
        <GlassCard className="col-span-1 flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-5">Heartbeat</h2>
          {apolloStatus?.nextHeartbeat ? (
            <CountdownTimer targetTime={apolloStatus.nextHeartbeat} />
          ) : (
            <div className="text-white/30 text-sm">Loading...</div>
          )}
          <p className="text-xs text-white/30 mt-4">Every ~15 minutes</p>
        </GlassCard>

        {/* Currently Working On */}
        <GlassCard glow="purple" className="col-span-1">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Active Projects</h2>
          {mission?.activeProjects?.length ? (
            <div className="space-y-3">
              {mission.activeProjects.map((project, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={project.status as any} />
                    <span className="text-sm font-medium text-white/80">{project.name}</span>
                  </div>
                  {project.nextStep && (
                    <p className="text-xs text-white/40 pl-1">→ {project.nextStep}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/30">No active projects</p>
          )}
        </GlassCard>
      </div>

      {/* Recently Completed */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          {memory?.title ?? 'Recent Activity'}
        </h2>
        {memory?.items?.length ? (
          <ul className="space-y-2">
            {memory.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-[#00e676] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/30 italic">
            {memory?.raw ? 'Day just started. Nothing logged yet.' : 'Loading...'}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
```

---

### Task 15: Workshop page

**Files:**
- Create: `app/workshop/page.tsx`

- [ ] **Step 1: Build Workshop page**

```typescript
// app/workshop/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TaskCard } from '@/components/ui/TaskCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Moon } from 'lucide-react';
import type { HeartbeatTask } from '@/lib/types';

const MOCK_OVERNIGHT_TASKS: HeartbeatTask[] = [
  { id: 'o1', title: 'Memory consolidation', description: 'Reviewed and structured daily memory file', status: 'done', startedAt: '03:15 AM', completedAt: '03:17 AM' },
  { id: 'o2', title: 'Cron health check', description: 'All scheduled jobs checked, no failures detected', status: 'done', startedAt: '04:00 AM', completedAt: '04:01 AM' },
];

export default function WorkshopPage() {
  const [tasks, setTasks] = useState<HeartbeatTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/heartbeat')
      .then(r => r.json())
      .then(data => {
        setTasks(data.tasks ?? []);
        setLoading(false);
      });
  }, []);

  const queued = tasks.filter(t => t.status === 'queued');
  const running = tasks.filter(t => t.status === 'running');
  const done = tasks.filter(t => t.status === 'done');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white/90">Workshop</h1>
        <p className="text-sm text-white/40 mt-1">What Apollo is working on</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Queued', count: queued.length, color: 'text-blue-400' },
          { label: 'Running', count: running.length, color: 'text-purple-400' },
          { label: 'Done Today', count: done.length, color: 'text-[#00e676]' },
        ].map(({ label, count, color }) => (
          <GlassCard key={label} padding="sm">
            <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{count}</p>
          </GlassCard>
        ))}
      </div>

      {/* Currently Running */}
      {running.length > 0 && (
        <GlassCard glow="purple">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Currently Running</h2>
            <StatusBadge variant="running" pulse />
          </div>
          <div className="space-y-2">
            {running.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </GlassCard>
      )}

      {/* Task Queue */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Task Queue</h2>
        {loading ? (
          <p className="text-sm text-white/30">Loading tasks...</p>
        ) : queued.length > 0 ? (
          <div className="space-y-2">
            {queued.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-sm text-white/40">Queue is empty. Add tasks to HEARTBEAT.md</p>
          </div>
        )}
      </GlassCard>

      {/* Completed Today */}
      {done.length > 0 && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Completed Today</h2>
          <div className="space-y-2">
            {done.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </GlassCard>
      )}

      {/* Working While You Sleep */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-4 h-4 text-[#a855f7]" />
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Working While You Sleep</h2>
        </div>
        <div className="space-y-2">
          {MOCK_OVERNIGHT_TASKS.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </GlassCard>
    </div>
  );
}
```

---

### Task 16: API Usage & Cost page

**Files:**
- Create: `app/usage/page.tsx`

- [ ] **Step 1: Build API Usage page**

```typescript
// app/usage/page.tsx
'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TokenGauge } from '@/components/ui/TokenGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Zap, Database } from 'lucide-react';

// Mock data
const DAILY_HISTORY = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: +(Math.random() * 0.8 + 0.1).toFixed(3),
    tokens: Math.floor(Math.random() * 400000 + 50000),
  };
});

const MODEL_BREAKDOWN = [
  { model: 'claude-sonnet-4-6', tokens: 284_000, cost: 0.42 },
  { model: 'claude-haiku-4-5', tokens: 45_000, cost: 0.03 },
];

const INPUT_TOKENS = 180_000;
const OUTPUT_TOKENS = 104_000;
const CACHE_READ_TOKENS = 85_000;
const CACHE_WRITE_TOKENS = 45_000;

function calcCost(input: number, output: number, cacheRead: number): number {
  return (input * 3 + output * 15 + cacheRead * 0.3) / 1_000_000;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1530]/90 border border-white/10 rounded-xl px-3 py-2 text-xs backdrop-blur-xl">
      <p className="text-white/60 mb-1">{label}</p>
      <p className="text-[#00e676] font-bold">${payload[0]?.value?.toFixed(3)}</p>
    </div>
  );
};

export default function UsagePage() {
  const [budgetThreshold, setBudgetThreshold] = useState('20');
  const totalCost = calcCost(INPUT_TOKENS, OUTPUT_TOKENS, CACHE_READ_TOKENS);
  const monthlyCost = totalCost * 30;
  const cacheHitRate = (CACHE_READ_TOKENS / (INPUT_TOKENS + CACHE_READ_TOKENS)) * 100;
  const cacheSavings = (CACHE_READ_TOKENS * (3 - 0.3)) / 1_000_000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white/90">API Usage & Cost</h1>
        <p className="text-sm text-white/40 mt-1">Token consumption, costs, and efficiency metrics</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Today's Cost", value: `$${totalCost.toFixed(4)}`, color: 'text-[#00e676]' },
          { icon: TrendingUp, label: 'Monthly (projected)', value: `$${monthlyCost.toFixed(2)}`, color: monthlyCost > +budgetThreshold ? 'text-red-400' : 'text-white/80' },
          { icon: Zap, label: 'Total Tokens', value: `${((INPUT_TOKENS + OUTPUT_TOKENS) / 1000).toFixed(0)}K`, color: 'text-[#a855f7]' },
          { icon: Database, label: 'Cache Savings', value: `$${cacheSavings.toFixed(4)}`, color: 'text-blue-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <GlassCard key={label} padding="sm">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <div>
                <p className="text-xs text-white/40">{label}</p>
                <p className={`text-base font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Gauges */}
        <GlassCard className="flex flex-col items-center gap-5">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider self-start">Token Usage</h2>
          <TokenGauge used={INPUT_TOKENS + OUTPUT_TOKENS} total={1_000_000} label="Daily limit" size="lg" />
          <div className="w-full space-y-2 text-xs text-white/50">
            <div className="flex justify-between">
              <span>Input tokens</span>
              <span className="text-white/70">{(INPUT_TOKENS/1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between">
              <span>Output tokens</span>
              <span className="text-white/70">{(OUTPUT_TOKENS/1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between">
              <span>Cache reads</span>
              <span className="text-[#00e676]">{(CACHE_READ_TOKENS/1000).toFixed(0)}K</span>
            </div>
          </div>
        </GlassCard>

        {/* Cache Hit Rate */}
        <GlassCard className="flex flex-col items-center gap-5">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider self-start">Cache Efficiency</h2>
          <TokenGauge used={Math.round(cacheHitRate * 10)} total={1000} label="Cache hit rate" size="lg" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[#00e676]">{cacheHitRate.toFixed(1)}%</p>
            <p className="text-xs text-white/40">hit rate — excellent</p>
          </div>
        </GlassCard>

        {/* Budget */}
        <GlassCard>
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Budget Alert</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40">Monthly threshold ($)</label>
              <input
                type="number"
                value={budgetThreshold}
                onChange={e => setBudgetThreshold(e.target.value)}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00e676]/50"
              />
            </div>
            <div className={`p-3 rounded-xl border ${monthlyCost > +budgetThreshold ? 'border-red-400/30 bg-red-400/5' : 'border-[#00e676]/30 bg-[#00e676]/5'}`}>
              <p className={`text-sm font-medium ${monthlyCost > +budgetThreshold ? 'text-red-400' : 'text-[#00e676]'}`}>
                {monthlyCost > +budgetThreshold ? '⚠️ Over budget' : '✓ Within budget'}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Projected: ${monthlyCost.toFixed(2)} / Limit: ${budgetThreshold}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Daily Spend Chart */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-5">Daily Spend — Last 14 Days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={DAILY_HISTORY} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="cost" stroke="#00e676" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00e676' }} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Model Breakdown */}
      <GlassCard>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Model Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-white/30 uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Model</th>
                <th className="text-right pb-3 font-medium">Tokens</th>
                <th className="text-right pb-3 font-medium">Cost</th>
                <th className="text-right pb-3 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MODEL_BREAKDOWN.map(row => (
                <tr key={row.model}>
                  <td className="py-2.5 text-white/80 font-mono text-xs">{row.model}</td>
                  <td className="py-2.5 text-right text-white/60">{(row.tokens/1000).toFixed(0)}K</td>
                  <td className="py-2.5 text-right text-[#00e676]">${row.cost.toFixed(3)}</td>
                  <td className="py-2.5 text-right text-white/40">
                    {((row.cost / totalCost) * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
```

---

### Task 17: Cron Jobs page

**Files:**
- Create: `app/cron/page.tsx`

- [ ] **Step 1: Build Cron Jobs page**

```typescript
// app/cron/page.tsx
'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChevronDown, ChevronUp, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import type { CronJob } from '@/lib/types';

const MOCK_CRON_JOBS: CronJob[] = [
  {
    id: '1',
    name: 'Heartbeat Check',
    schedule: '*/15 * * * *',
    humanSchedule: 'Every 15 minutes',
    lastRun: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
    status: 'active',
    history: [
      { runAt: '5m ago', status: 'success', duration: '1.2s' },
      { runAt: '20m ago', status: 'success', duration: '0.9s' },
      { runAt: '35m ago', status: 'success', duration: '1.1s' },
      { runAt: '50m ago', status: 'failed', duration: '5.0s' },
      { runAt: '1h 5m ago', status: 'success', duration: '1.0s' },
    ],
  },
  {
    id: '2',
    name: 'Memory Consolidation',
    schedule: '0 3 * * *',
    humanSchedule: 'Daily at 3:00 AM',
    lastRun: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    status: 'active',
    history: [
      { runAt: 'Yesterday 3:00 AM', status: 'success', duration: '2.4s' },
      { runAt: '2 days ago', status: 'success', duration: '2.1s' },
    ],
  },
  {
    id: '3',
    name: 'Intelligence Feed Refresh',
    schedule: '0 */6 * * *',
    humanSchedule: 'Every 6 hours',
    lastRun: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: 'paused',
    history: [
      { runAt: '2h ago', status: 'success', duration: '3.1s' },
      { runAt: '8h ago', status: 'success', duration: '2.8s' },
    ],
  },
  {
    id: '4',
    name: 'Exeris Deploy Check',
    schedule: '0 9 * * 1-5',
    humanSchedule: 'Weekdays at 9:00 AM',
    lastRun: null,
    nextRun: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
    status: 'active',
    history: [],
  },
];

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatNextRun(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  return `in ${Math.floor(hrs / 24)}d`;
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>(MOCK_CRON_JOBS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const toggleJob = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id
      ? { ...j, status: j.status === 'active' ? 'paused' : 'active' }
      : j
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Cron Jobs</h1>
          <p className="text-sm text-white/40 mt-1">Scheduled automation tasks</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] text-sm font-medium hover:bg-[#00e676]/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', count: jobs.filter(j => j.status === 'active').length, color: 'text-[#00e676]' },
          { label: 'Paused', count: jobs.filter(j => j.status === 'paused').length, color: 'text-yellow-400' },
          { label: 'Failed', count: jobs.filter(j => j.status === 'failed').length, color: 'text-red-400' },
        ].map(({ label, count, color }) => (
          <GlassCard key={label} padding="sm">
            <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{count}</p>
          </GlassCard>
        ))}
      </div>

      {/* Add Job Form */}
      {showAdd && (
        <GlassCard glow="green">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Add Cron Job</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Name', 'Schedule (cron syntax)', 'Description', 'Command'].map(field => (
              <div key={field}>
                <label className="text-xs text-white/40">{field}</label>
                <input
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00e676]/50"
                  placeholder={field === 'Schedule (cron syntax)' ? '*/15 * * * *' : field}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-[#00e676]/20 border border-[#00e676]/30 text-[#00e676] text-sm font-medium">
              Create Job
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-white/50 text-sm hover:text-white/80">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map(job => (
          <GlassCard key={job.id} padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleJob(job.id)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                  title={job.status === 'active' ? 'Pause' : 'Enable'}
                >
                  {job.status === 'active'
                    ? <ToggleRight className="w-6 h-6 text-[#00e676]" />
                    : <ToggleLeft className="w-6 h-6" />
                  }
                </button>
                <div>
                  <p className="text-sm font-semibold text-white/90">{job.name}</p>
                  <p className="text-xs text-white/40 font-mono">{job.schedule} — {job.humanSchedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-white/40">Last run</p>
                  <p className="text-xs text-white/70">{formatRelativeTime(job.lastRun)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Next run</p>
                  <p className="text-xs text-[#00e676]">{formatNextRun(job.nextRun)}</p>
                </div>
                <StatusBadge variant={job.status} />
                <button onClick={() => setExpanded(expanded === job.id ? null : job.id)} className="text-white/30 hover:text-white/60">
                  {expanded === job.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expanded === job.id && (
              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Run History</p>
                {job.history.length > 0 ? (
                  <div className="space-y-1.5">
                    {job.history.map((run, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/50">{run.runAt}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/30">{run.duration}</span>
                          <span className={run.status === 'success' ? 'text-[#00e676]' : 'text-red-400'}>
                            {run.status === 'success' ? '✓' : '✗'} {run.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30">No history yet</p>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 18: Intelligence Feed page

**Files:**
- Create: `app/intelligence/page.tsx`

- [ ] **Step 1: Build Intelligence Feed page**

```typescript
// app/intelligence/page.tsx
'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Search, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';

const PRESET_SEARCHES = [
  'Swift iOS development tips 2025',
  'AI SaaS marketing strategies',
  'Dutch startup ecosystem funding',
  'Recruitment agency automation AI',
];

interface FeedResult {
  title: string;
  source: string;
  summary: string;
  url: string;
  tags: string[];
}

const MOCK_RESULTS: Record<string, FeedResult[]> = {
  'Swift iOS development tips 2025': [
    {
      title: 'Swift 6 Concurrency: What every iOS dev needs to know',
      source: 'Swift.org Blog',
      summary: 'Swift 6 introduces stricter concurrency checking. Actor isolation is now enforced at compile time, catching data races before they reach production.',
      url: '#',
      tags: ['Swift', 'Concurrency', 'iOS'],
    },
    {
      title: 'SwiftUI vs UIKit in 2025: When to use each',
      source: 'Hacking with Swift',
      summary: 'SwiftUI handles 90% of modern app UI elegantly. UIKit is still preferred for complex custom rendering and legacy app integration.',
      url: '#',
      tags: ['SwiftUI', 'UIKit', 'Architecture'],
    },
  ],
  'AI SaaS marketing strategies': [
    {
      title: 'How Cursor grew to $100M ARR with product-led growth',
      source: 'Lenny\'s Newsletter',
      summary: 'Cursor\'s freemium model with generous free tier drove viral adoption among developers. Word-of-mouth in dev communities is 10x more valuable than paid ads.',
      url: '#',
      tags: ['PLG', 'Growth', 'AI'],
    },
    {
      title: 'AI tool pricing psychology: Why $20/mo outperforms $19/mo',
      source: 'First Round Capital',
      summary: 'Round numbers signal confidence and premium positioning. AI tools priced at cognitive anchors see 23% higher conversion than those just below them.',
      url: '#',
      tags: ['Pricing', 'Psychology', 'SaaS'],
    },
  ],
};

const DEFAULT_KEY = 'Swift iOS development tips 2025';

export default function IntelligencePage() {
  const [query, setQuery] = useState(DEFAULT_KEY);
  const [activeQuery, setActiveQuery] = useState(DEFAULT_KEY);
  const [loading, setLoading] = useState(false);

  const results = MOCK_RESULTS[activeQuery] ?? [];

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setActiveQuery(query);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white/90">Intelligence Feed</h1>
        <p className="text-sm text-white/40 mt-1">Research and insights curated for Apollo & Stefano</p>
      </div>

      {/* Search Bar */}
      <GlassCard padding="sm">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              placeholder="Search intelligence..."
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] text-sm font-medium hover:bg-[#00e676]/25 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Search
          </button>
        </div>
      </GlassCard>

      {/* Preset Searches */}
      <div className="flex flex-wrap gap-2">
        {PRESET_SEARCHES.map(preset => (
          <button
            key={preset}
            onClick={() => { setQuery(preset); setActiveQuery(preset); }}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${activeQuery === preset
                ? 'bg-[#a855f7]/15 border-[#a855f7]/40 text-[#a855f7]'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:bg-white/8'
              }
            `}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#a855f7] animate-pulse" />
            <p className="text-sm text-white/40">Searching intelligence...</p>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, i) => (
            <GlassCard key={i} className="hover:bg-white/[0.06] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 font-medium">{result.source}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white/90">{result.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{result.summary}</p>
                  <div className="flex gap-2 pt-1">
                    {result.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={result.url}
                  className="shrink-0 p-2 rounded-xl border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-colors"
                  title="Open source"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard>
          <div className="text-center py-10">
            <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">No results for "{activeQuery}"</p>
            <p className="text-xs text-white/25 mt-1">Try one of the preset searches above</p>
          </div>
        </GlassCard>
      )}

      {/* Coming Soon Banner */}
      <GlassCard glow="purple">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#a855f7]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#a855f7]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a855f7]">Live web search coming soon</p>
            <p className="text-xs text-white/40">Will be powered by Gemini API — configured and ready</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
```

---

## Chunk 6: Final Verification

### Task 19: Build verification

**Files:** None created, just verification

- [ ] **Step 1: Run build and fix any errors**

```bash
cd /Users/stefano/.openclaw/workspace/mission-control
npm run build
```

Expected: Build succeeds with 0 errors. Fix any TypeScript errors before marking done.

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000/api/status | head -c 200
```

Expected: JSON response from status API

- [ ] **Step 3: Commit all work**

```bash
git add -A
git commit -m "feat: build Mission Control dashboard — Apollo × Stefano

- Next.js 16 App Router with TypeScript + Tailwind CSS v4
- Liquid Glass design system: frosted glass cards, blur effects
- 5 pages: Overview, Workshop, API Usage, Cron Jobs, Intelligence Feed
- File-system API routes reading workspace markdown files
- Reusable components: GlassCard, StatusBadge, CountdownTimer, TokenGauge, TaskCard
- Live countdown timer, token gauge, recharts cost visualization
- Mock data for API costs and cron jobs (real data wiring pending)"
```
