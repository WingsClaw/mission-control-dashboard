import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  BookMarked,
  Bot,
  BrainCircuit,
  Clock3,
  FolderKanban,
  HardDrive,
  ScrollText,
  TimerReset,
} from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { getOpenClawSnapshot } from '@/lib/server/openclaw';
import { formatDateTime, formatRelativeTime, titleCaseLabel } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-[0_14px_35px_-30px_rgba(15,23,42,0.45)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}

export default async function LivePage() {
  const snapshot = await getOpenClawSnapshot();
  const totalSessions = snapshot.agents.reduce((total, agent) => total + agent.sessionCount, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="OpenClaw Live"
        title="Read the real local OpenClaw state without leaving Mission Control."
        description="This page reads your local OpenClaw config, session indexes, command log, scheduler, workspace docs, and memory files. It is intentionally read-only, and sensitive config values stay on the server."
        actions={
          <>
            <Link href="/" className="action-button gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/api/openclaw/snapshot" className="action-button-primary gap-2">
              Open JSON Snapshot
            </Link>
          </>
        }
        stats={[
          { label: 'Live Agents', value: snapshot.agents.length },
          { label: 'Open Sessions', value: totalSessions },
          { label: 'Workspace Docs', value: snapshot.docs.length },
          { label: 'Memory Files', value: snapshot.memoryFiles.length },
        ]}
      />

      {!snapshot.available ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <HardDrive className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            Local OpenClaw was not detected
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            This screen expects a local OpenClaw home directory. If your install lives outside the default location, set the OPENCLAW_HOME environment variable before starting the Next.js app.
          </p>
          {snapshot.warnings.length > 0 ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-amber-200 bg-amber-50/80 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Warnings</p>
              <div className="mt-4 space-y-3">
                {snapshot.warnings.map((warning) => (
                  <p key={warning} className="text-sm leading-6 text-amber-900">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          {snapshot.warnings.length > 0 ? (
            <section className="glass-panel p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Migration Notes</p>
              <div className="mt-4 grid gap-3">
                {snapshot.warnings.map((warning) => (
                  <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                    {warning}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Command Events"
              value={snapshot.activity.length}
              icon={<Activity size={24} />}
              trend={snapshot.activity.length > 0 ? 'up' : 'neutral'}
              description="Most recent entries from commands.log"
            />
            <StatCard
              title="Cron Jobs"
              value={snapshot.cronJobsCount}
              icon={<TimerReset size={24} />}
              trend={snapshot.cronJobsCount > 0 ? 'up' : 'neutral'}
              description="Jobs registered in the OpenClaw scheduler"
            />
            <StatCard
              title="Task Source"
              value={snapshot.taskSummary.fileName ?? 'Not Found'}
              icon={<FolderKanban size={24} />}
              trend={snapshot.taskSummary.source === 'none' ? 'down' : 'up'}
              description={`Current task source: ${titleCaseLabel(snapshot.taskSummary.source)}`}
            />
            <StatCard
              title="Heartbeat"
              value={snapshot.heartbeatHasInstructions ? 'Active' : 'Idle'}
              icon={<Clock3 size={24} />}
              trend={snapshot.heartbeatHasInstructions ? 'up' : 'neutral'}
              description={snapshot.heartbeatFilePresent ? 'HEARTBEAT.md discovered in workspace' : 'No heartbeat file found'}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <div className="space-y-6">
              <section className="glass-panel p-6 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Agent Sessions</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Live agent index</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      This is pulled from each agent session index, which still works even when the Gateway is offline.
                    </p>
                  </div>
                </div>

                {snapshot.agents.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
                    <Bot className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm leading-6 text-slate-600">No agent session data was found.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {snapshot.agents.map((agent) => (
                      <article key={agent.id} className="surface-panel p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold tracking-tight text-slate-950">{agent.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{agent.model ?? 'Model unavailable'}</p>
                          </div>
                          <span className="status-chip border border-sky-200 bg-sky-50 text-sky-800">
                            {agent.sessionCount} sessions
                          </span>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <InfoRow
                            label="Last Updated"
                            value={agent.lastUpdatedAt ? formatRelativeTime(agent.lastUpdatedAt) : 'Unknown'}
                          />
                          <InfoRow label="Context Window" value={agent.contextTokens ? `${agent.contextTokens.toLocaleString()} tokens` : 'Unknown'} />
                          <InfoRow label="Skills" value={`${agent.skillCount}`} />
                          <InfoRow label="Workspace Files" value={`${agent.workspaceFileCount}`} />
                        </div>

                        {agent.lastUpdatedAt ? (
                          <p className="mt-4 text-xs text-slate-500">{formatDateTime(agent.lastUpdatedAt)}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-panel p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Command Log</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent OpenClaw events</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These entries come from the real commands.log file, which is the best live activity source in your current setup.
                </p>

                {snapshot.activity.length === 0 ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
                    <ScrollText className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm leading-6 text-slate-600">No command events were found in the log.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {snapshot.activity.map((event) => (
                      <article key={event.id} className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="status-chip border border-emerald-200 bg-emerald-50 text-emerald-800">
                            {titleCaseLabel(event.action)}
                          </span>
                          <span className="text-xs text-slate-400">{formatRelativeTime(event.timestamp)}</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-900">
                          {event.source ?? 'unknown source'}
                          {event.sessionKey ? ` · ${event.sessionKey}` : ''}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="glass-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Control Plane</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Runtime summary</h2>
                <div className="mt-5 space-y-3">
                  <InfoRow label="OpenClaw Home" value={snapshot.openClawHome ?? 'Unavailable'} />
                  <InfoRow label="Workspace" value={snapshot.config?.workspaceDir ?? 'Unavailable'} />
                  <InfoRow label="Primary Model" value={snapshot.config?.primaryModel ?? 'Unavailable'} />
                  <InfoRow
                    label="Concurrency"
                    value={snapshot.config?.maxConcurrent ? `${snapshot.config.maxConcurrent} main / ${snapshot.config.subagentConcurrency ?? 0} subagents` : 'Unavailable'}
                  />
                  <InfoRow
                    label="Gateway"
                    value={snapshot.config?.gatewayConfigured ? `${snapshot.config.gatewayMode ?? 'configured'} on port ${snapshot.config.gatewayPort ?? 'unknown'}` : 'Not configured'}
                  />
                </div>
              </section>

              <section className="glass-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Docs</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Prompt surface</h2>
                  </div>
                  <BookMarked className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-5 space-y-3">
                  {snapshot.docs.length === 0 ? (
                    <p className="text-sm leading-6 text-slate-600">No markdown docs were found in the OpenClaw workspace root.</p>
                  ) : (
                    snapshot.docs.slice(0, 8).map((file) => (
                      <div key={file.relativePath} className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-950">{file.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{file.relativePath}</p>
                        {file.updatedAt ? (
                          <p className="mt-2 text-xs text-slate-400">{formatDateTime(file.updatedAt)}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="glass-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Memory</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Indexed notes</h2>
                  </div>
                  <BrainCircuit className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-5 space-y-3">
                  {snapshot.memoryFiles.length === 0 ? (
                    <p className="text-sm leading-6 text-slate-600">No memory markdown files were found in the workspace memory folder.</p>
                  ) : (
                    snapshot.memoryFiles.slice(0, 8).map((file) => (
                      <div key={file.relativePath} className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-950">{file.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{file.relativePath}</p>
                        {file.updatedAt ? (
                          <p className="mt-2 text-xs text-slate-400">{formatDateTime(file.updatedAt)}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="glass-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Scheduler And Tasks</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Automation surface</h2>
                <div className="mt-5 grid gap-3">
                  <InfoRow label="Cron Jobs" value={`${snapshot.cronJobsCount}`} />
                  <InfoRow label="Task Source" value={snapshot.taskSummary.fileName ?? 'No task file found'} />
                  <InfoRow label="Task Count" value={`${snapshot.taskSummary.total}`} />
                  <InfoRow label="Completed" value={`${snapshot.taskSummary.completed}`} />
                </div>
              </section>
            </aside>
          </section>

          <section className="glass-panel p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">System View</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The main app now uses the same server-side OpenClaw model as this page. Keep this route as the raw systems view for config summaries, scheduler state, and low-level runtime inspection.
            </p>
          </section>
        </>
      )}
    </AppShell>
  );
}