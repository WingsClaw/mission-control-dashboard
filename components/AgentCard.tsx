import { Agent, AgentStatus } from '@/lib/types';
import { Activity, CheckCircle2, Clock3, Trash2 } from 'lucide-react';

import { cn, formatDuration, formatRelativeTime } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: AgentStatus) => void;
}

export function AgentCard({ agent, onDelete, onStatusChange }: AgentCardProps) {
  const statusConfig = {
    online: {
      dot: 'bg-emerald-500',
      chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      label: 'Online',
      note: 'Accepting new workload and reporting in real time.',
    },
    offline: {
      dot: 'bg-slate-400',
      chip: 'border-slate-200 bg-slate-100 text-slate-600',
      label: 'Offline',
      note: 'Temporarily unavailable and excluded from new assignments.',
    },
    busy: {
      dot: 'bg-amber-500',
      chip: 'border-amber-200 bg-amber-50 text-amber-800',
      label: 'Busy',
      note: 'Processing active work and nearing allocation limits.',
    },
    error: {
      dot: 'bg-rose-500',
      chip: 'border-rose-200 bg-rose-50 text-rose-800',
      label: 'Error',
      note: 'Needs intervention before it can safely resume execution.',
    },
  };
  const statusLabels = Object.fromEntries(
    Object.entries(statusConfig).map(([value, config]) => [value, config.label]),
  ) as Record<AgentStatus, string>;
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

        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(agent.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{status.note}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock3 className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Last Active</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">{formatRelativeTime(agent.lastActive)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Completed</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">{agent.tasksCompleted}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Activity className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Uptime</span>
          </div>
          <p className="mt-3 text-base font-semibold text-slate-950">{formatDuration(agent.uptime)}</p>
        </div>
      </div>

      {onStatusChange ? (
        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Shift Status
            </p>
            <p className="text-xs text-slate-500">Update the agent availability ring.</p>
          </div>

          <select
            value={agent.status}
            onChange={(e) => onStatusChange(agent.id, e.target.value as AgentStatus)}
            className="field-input rounded-xl py-2.5"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </article>
  );
}
