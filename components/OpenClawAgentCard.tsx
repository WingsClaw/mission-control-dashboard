import { Activity, Bot, CheckCircle2, Clock3, Layers3 } from 'lucide-react';

import { OpenClawAgentSnapshot } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';

interface OpenClawAgentCardProps {
  agent: OpenClawAgentSnapshot;
}

export function OpenClawAgentCard({ agent }: OpenClawAgentCardProps) {
  const statusConfig = {
    online: {
      dot: 'bg-emerald-500',
      chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      label: 'Online',
      note: 'Current session is responsive and ready for more work.',
    },
    offline: {
      dot: 'bg-slate-400',
      chip: 'border-slate-200 bg-slate-100 text-slate-700',
      label: 'Offline',
      note: 'No recent session activity was detected for this agent.',
    },
    busy: {
      dot: 'bg-amber-500',
      chip: 'border-amber-200 bg-amber-50 text-amber-800',
      label: 'Busy',
      note: 'This agent currently owns active work on the real board.',
    },
    error: {
      dot: 'bg-rose-500',
      chip: 'border-rose-200 bg-rose-50 text-rose-800',
      label: 'Error',
      note: 'The agent needs attention before it can continue safely.',
    },
  };

  const status = statusConfig[agent.status];

  return (
    <article className="surface-panel flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn('h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.95)]', status.dot)} />
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{agent.name}</h3>
              <p className="text-sm text-slate-500">{agent.role}</p>
            </div>
          </div>

          <span className={cn('status-chip border', status.chip)}>{status.label}</span>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_35px_-24px_rgba(15,23,42,0.95)]">
          <Bot className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{status.note}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Layers3 className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Sessions</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">{agent.sessionCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock3 className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Last Active</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">
            {agent.lastUpdatedAt ? formatRelativeTime(agent.lastUpdatedAt) : 'Unknown'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Activity className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Active Tasks</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">{agent.activeTaskCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Completed</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">{agent.completedTaskCount}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Runtime</p>
        <p className="mt-3 text-sm font-medium text-slate-950">{agent.model ?? 'Model unavailable'}</p>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          {agent.contextTokens ? `${agent.contextTokens.toLocaleString()} token context` : 'Unknown context size'}
          {' · '}
          {agent.skillCount} skills
          {' · '}
          {agent.workspaceFileCount} workspace files
        </p>
      </div>
    </article>
  );
}