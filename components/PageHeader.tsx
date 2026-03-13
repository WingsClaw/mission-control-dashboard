import { cn } from '@/lib/utils';

interface PageHeaderStat {
  label: string;
  value: string | number;
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  stats?: PageHeaderStat[];
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  stats = [],
  className,
}: PageHeaderProps) {
  return (
    <section className={cn('glass-panel relative overflow-hidden p-6 sm:p-8', className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-700/80">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>

      {stats.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}