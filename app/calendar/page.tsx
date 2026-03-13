import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3, Radar, TimerReset } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';
import { formatDateTime } from '@/lib/utils';

export default async function CalendarPage() {
  const model = await getOpenClawWorkspaceModel();
  const openTasks = model.board.tasks.filter((task) => task.lane !== 'done').length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Calendar And Automation"
        title="See what OpenClaw has actually scheduled, and what heartbeat is checking."
        description="This screen verifies proactive behavior. It reads the real cron registry and HEARTBEAT.md so you can confirm that scheduled work exists instead of trusting chat promises."
        actions={
          <>
            <Link href="/" className="action-button gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/live" className="action-button-primary gap-2">
              <Radar className="h-4 w-4" />
              Live System
            </Link>
          </>
        }
        stats={[
          { label: 'Cron Jobs', value: model.schedulerJobs.length },
          { label: 'Heartbeat', value: model.heartbeatHasInstructions ? 'Active' : 'Idle' },
          { label: 'Open Work', value: openTasks },
          { label: 'Review Queue', value: model.board.tasks.filter((task) => task.lane === 'review').length },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <section className="glass-panel p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Scheduler</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Registered cron jobs</h2>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>

          {model.schedulerJobs.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
              <TimerReset className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-xl font-semibold text-slate-950">No scheduled jobs yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                OpenClaw has not registered cron tasks yet. Once it does, this screen will show the schedule, target, and next run details directly from cron/jobs.json.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {model.schedulerJobs.map((job) => (
                <article key={job.id} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-chip border border-sky-200 bg-sky-50 text-sky-800">
                      {job.enabled ? 'Enabled' : 'Paused'}
                    </span>
                    {job.schedule ? (
                      <span className="status-chip border border-slate-200 bg-slate-100 text-slate-700">{job.schedule}</span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{job.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{job.prompt ?? 'No prompt text recorded for this job.'}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Target</p>
                      <p className="mt-3 text-sm font-medium text-slate-950">{job.target ?? 'Workspace'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Timezone</p>
                      <p className="mt-3 text-sm font-medium text-slate-950">{job.timezone ?? model.user.timezone ?? 'Unset'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Next Run</p>
                      <p className="mt-3 text-sm font-medium text-slate-950">{job.nextRunAt ? formatDateTime(job.nextRunAt) : 'Unknown'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Heartbeat</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Periodic checklist</h2>
              </div>
              <Clock3 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`status-chip border ${model.heartbeatHasInstructions ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                  {model.heartbeatHasInstructions ? 'Heartbeat Active' : 'Heartbeat Idle'}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {model.heartbeatFilePresent
                  ? 'Mission Control found HEARTBEAT.md in the real OpenClaw workspace.'
                  : 'No HEARTBEAT.md file was found in the OpenClaw workspace.'}
              </p>
              <pre className="mt-5 overflow-x-auto rounded-[22px] bg-slate-950 p-5 text-xs leading-6 text-slate-100 whitespace-pre-wrap">
                {model.heartbeatContent ?? '# HEARTBEAT.md\n\nNo heartbeat file found.'}
              </pre>
            </div>
          </section>

          {model.warnings.length > 0 ? (
            <section className="glass-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Automation Notes</p>
              <div className="mt-4 grid gap-3">
                {model.warnings.map((warning) => (
                  <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                    {warning}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </AppShell>
  );
}