import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  description,
}: StatCardProps) {
  const trendConfig = {
    up: {
      label: 'Rising',
      className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    },
    down: {
      label: 'Watch',
      className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    },
    neutral: {
      label: 'Stable',
      className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    },
  };

  return (
    <article className="surface-panel group relative overflow-hidden p-5 sm:p-6">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-teal-100 via-transparent to-transparent opacity-70 transition group-hover:scale-110" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {title}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
              {value}
            </p>
            <p className="text-sm text-slate-500">{description ?? 'Updated from live mission state'}</p>
          </div>

          {change !== undefined && (
            <p className="text-xs font-medium text-slate-500">
              {Math.abs(change)}% movement over the last hour
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_35px_-24px_rgba(15,23,42,0.95)]">
            {icon}
          </div>
          <span className={cn('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]', trendConfig[trend].className)}>
            {trendConfig[trend].label}
          </span>
        </div>
      </div>

      {change === undefined ? null : (
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              'h-full rounded-full',
              trend === 'up'
                ? 'bg-emerald-500'
                : trend === 'down'
                  ? 'bg-rose-500'
                  : 'bg-slate-400',
            )}
            style={{ width: `${Math.min(100, Math.max(18, Math.abs(change) * 2))}%` }}
          />
        </div>
      )}
    </article>
  );
}
