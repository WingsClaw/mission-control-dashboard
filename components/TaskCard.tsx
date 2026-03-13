import { Task, TaskStatus } from '@/lib/types';
import { Clock3, Gauge, Trash2, UserRound } from 'lucide-react';

import { cn, formatRelativeTime, titleCaseLabel } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  agentName?: string;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onProgressChange?: (id: string, progress: number) => void;
}

export function TaskCard({ task, agentName, onDelete, onStatusChange, onProgressChange }: TaskCardProps) {
  const priorityColors = {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    medium: 'border-sky-200 bg-sky-50 text-sky-800',
    high: 'border-amber-200 bg-amber-50 text-amber-800',
    critical: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  const statusColors = {
    pending: {
      accent: 'bg-slate-400',
      chip: 'border-slate-200 bg-slate-100 text-slate-700',
      bar: 'bg-slate-400',
    },
    in_progress: {
      accent: 'bg-sky-500',
      chip: 'border-sky-200 bg-sky-50 text-sky-800',
      bar: 'bg-sky-500',
    },
    completed: {
      accent: 'bg-emerald-500',
      chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      bar: 'bg-emerald-500',
    },
    failed: {
      accent: 'bg-rose-500',
      chip: 'border-rose-200 bg-rose-50 text-rose-800',
      bar: 'bg-rose-500',
    },
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
  };

  const status = statusColors[task.status];

  return (
    <article className="surface-panel flex h-full flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('status-chip border', priorityColors[task.priority])}>
              {titleCaseLabel(task.priority)}
            </span>
            <span className={cn('status-chip border', status.chip)}>
              <span className={cn('h-2 w-2 rounded-full', status.accent)} />
              {statusLabels[task.status]}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{task.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {task.description || 'No description provided for this task yet.'}
            </p>
          </div>
        </div>

        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Progress
          </span>
          <span>{task.progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div
            className={cn('h-full rounded-full transition-all', status.bar)}
            style={{ width: `${task.progress}%` }}
          />
        </div>

        {onProgressChange ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {[0, 25, 50, 75, 100].map((progress) => (
              <button
                key={progress}
                type="button"
                onClick={() => onProgressChange(task.id, progress)}
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  task.progress === progress
                    ? 'bg-slate-950 text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.85)]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950',
                )}
              >
                {progress}%
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <UserRound className="h-4 w-4 text-slate-400" />
            <span>{agentName ?? 'Unassigned'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock3 className="h-4 w-4 text-slate-400" />
            <span>Updated {formatRelativeTime(task.updatedAt)}</span>
          </div>
        </div>

        {onStatusChange ? (
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Task Status
            </span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="field-input rounded-xl py-2.5"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </article>
  );
}
