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
