import Link from 'next/link';

import { AppShell } from '@/components/AppShell';
import { OpenClawAgentCard } from '@/components/OpenClawAgentCard';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { TaskCard } from '@/components/TaskCard';
import { getOpenClawWorkspaceModel, toUiTask } from '@/lib/server/openclaw';
import { formatDateTime, formatDuration, formatRelativeTime, titleCaseLabel } from '@/lib/utils';
import {
  Activity,
  ArrowRight,
  BookMarked,
  BrainCircuit,
  CalendarDays,
  CheckSquare,
  Clock3,
  Cpu,
  HardDrive,
  Radar,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export default async function HomePage() {
  const model = await getOpenClawWorkspaceModel();

  const liveAgents = model.agents.filter((agent) => agent.status === 'online' || agent.status === 'busy');
  const recentTasks = [...model.board.tasks]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4)
    .map((task) => toUiTask(task));
  const recentActivities = model.activity.slice(0, 5);
  const assignmentMap = Object.fromEntries(model.assignmentOptions.map((option) => [option.id, option.label]));
  const completedTasks = model.board.tasks.filter((task) => task.lane === 'done').length;
  const activeTasks = model.board.tasks.filter((task) => task.lane !== 'done').length;
  const reviewTasks = model.board.tasks.filter((task) => task.lane === 'review').length;

  const averageCycle = (() => {
    const completedBoardTasks = model.board.tasks.filter((task) => task.lane === 'done');

    if (completedBoardTasks.length === 0) {
      return 0;
    }

    const totalMinutes = completedBoardTasks.reduce((sum, task) => {
      return sum + (new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime()) / 60000;
    }, 0);

    return Math.round(totalMinutes / completedBoardTasks.length);
  })();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Mission Overview"
        title="Run your real OpenClaw workspace from one control plane."
        description="Mission Control now reads the live OpenClaw workspace, task board, scheduler, docs, and memory. Use the dashboard to scan the system fast, then jump into the deeper surfaces when you want to inspect or intervene."
        actions={
          <>
            <Link href="/activity" className="action-button">
              Open Activity Log
            </Link>
            <Link href="/tasks" className="action-button-primary gap-2">
              Open Live Board
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
        stats={[
          { label: 'Registered Agents', value: model.agents.length },
          { label: 'Active Operators', value: liveAgents.length },
          { label: 'Tasks Resolved', value: completedTasks },
          { label: 'Workspace Notes', value: model.memoryEntries.length },
        ]}
      />

      {!model.available ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <HardDrive className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">OpenClaw home not detected</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Start OpenClaw or set OPENCLAW_HOME before using Mission Control. The live pages are wired, but they need the local workspace to exist.
          </p>
        </section>
      ) : (
        <>
          {model.warnings.length > 0 ? (
            <section className="glass-panel p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Workspace Notes</p>
              <div className="mt-4 grid gap-3">
                {model.warnings.map((warning) => (
                  <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                    {warning}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Agents"
            value={model.agents.length}
            icon={<Users size={24} />}
            trend="neutral"
            description="Live agents discovered from OpenClaw session indexes"
          />
          <StatCard
            title="Open Tasks"
            value={activeTasks}
            icon={<Activity size={24} />}
            trend={activeTasks > 0 ? 'up' : 'neutral'}
            description="Backlog, in-progress, and review items from the real board"
          />
          <StatCard
            title="Review Queue"
            value={reviewTasks}
            icon={<CheckSquare size={24} />}
            trend={reviewTasks > 0 ? 'up' : 'neutral'}
            description="Tasks waiting for verification or human sign-off"
          />
          <StatCard
            title="Average Cycle"
            value={averageCycle > 0 ? formatDuration(averageCycle) : 'No data'}
            icon={<TrendingUp size={24} />}
            trend="neutral"
            description="Mean completion time across resolved board items"
          />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <div className="space-y-6">
              <section className="glass-panel p-6 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Agent Roster</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Live operators</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      These agents come directly from the OpenClaw session indexes, so the roster reflects the actual runtime instead of browser-local mock data.
                    </p>
                  </div>

                  <Link href="/agents" className="action-button gap-2 self-start">
                    Open Agent View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {model.agents.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">No agents detected</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                      OpenClaw has not recorded active session indexes yet, so the live roster is empty.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {(liveAgents.length > 0 ? liveAgents : model.agents).slice(0, 4).map((agent) => (
                      <OpenClawAgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-panel p-6 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Task Board</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recently active missions</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      These tasks are being read from the live kanban.json file in your OpenClaw workspace, so changes on the board show up here immediately.
                    </p>
                  </div>

                  <Link href="/tasks" className="action-button gap-2 self-start">
                    Open Task View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {recentTasks.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
                    <CheckSquare className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">No tasks yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                      Use the Tasks screen to create work. Mission Control now persists the board in the real OpenClaw workspace.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {recentTasks.map((task) => (
                      <TaskCard key={task.id} task={task} agentName={assignmentMap[task.assignedTo ?? ''] ?? 'Unassigned'} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="glass-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mission Feed</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent activity</h2>
                  </div>

                  <Link href="/activity" className="action-button">
                    View All
                  </Link>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center">
                    <Clock3 className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-600">The live activity feed is waiting for command log events.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_35px_-24px_rgba(15,23,42,0.9)]">
                            <Cpu className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="status-chip border border-emerald-200 bg-emerald-50 text-emerald-800">
                                {titleCaseLabel(activity.action)}
                              </span>
                              <span className="text-xs text-slate-400">{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                            <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
                              {activity.source ?? 'Unknown source'}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">{formatDateTime(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Routes</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Jump into operations</h2>
                <div className="mt-5 space-y-3">
                  <Link href="/calendar" className="surface-panel flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Calendar</p>
                      <p className="mt-1 text-sm text-slate-500">Cron jobs, heartbeat, and proactive work cadence.</p>
                    </div>
                    <CalendarDays className="h-5 w-5 text-slate-400" />
                  </Link>

                  <Link href="/docs" className="surface-panel flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Documents</p>
                      <p className="mt-1 text-sm text-slate-500">Search the real workspace documents and prompts.</p>
                    </div>
                    <BookMarked className="h-5 w-5 text-slate-400" />
                  </Link>

                  <Link href="/memory" className="surface-panel flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Memory</p>
                      <p className="mt-1 text-sm text-slate-500">Read the indexed daily notes from the OpenClaw workspace.</p>
                    </div>
                    <BrainCircuit className="h-5 w-5 text-slate-400" />
                  </Link>

                  <Link href="/team" className="surface-panel flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Team</p>
                      <p className="mt-1 text-sm text-slate-500">See the current org map, identity, and operating principles.</p>
                    </div>
                    <Users className="h-5 w-5 text-slate-400" />
                  </Link>

                  <Link href="/office" className="surface-panel flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Office</p>
                      <p className="mt-1 text-sm text-slate-500">Visualize where the agents are focusing inside the runtime.</p>
                    </div>
                    <Zap className="h-5 w-5 text-amber-500" />
                  </Link>

                  <Link href="/live" className="surface-panel flex items-center justify-between p-4 transition hover:-translate-y-0.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Live System</p>
                      <p className="mt-1 text-sm text-slate-500">Inspect raw runtime state, config summary, and logs.</p>
                    </div>
                    <Radar className="h-5 w-5 text-slate-400" />
                  </Link>
                </div>
              </section>
            </aside>
          </section>
        </>
      )}
    </AppShell>
  );
}
