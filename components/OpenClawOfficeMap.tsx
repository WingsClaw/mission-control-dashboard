import { Bot, CheckCircle2, Clock3, Focus, UserRound } from 'lucide-react';

import { OpenClawAgentSnapshot, OpenClawKanbanBoard, OpenClawKanbanTask } from '@/lib/types';

interface OpenClawOfficeMapProps {
  agents: OpenClawAgentSnapshot[];
  board: OpenClawKanbanBoard;
  humanName: string;
}

function getFocusTask(tasks: OpenClawKanbanTask[]) {
  return tasks.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0];
}

export function OpenClawOfficeMap({ agents, board, humanName }: OpenClawOfficeMapProps) {
  const zones = [
    {
      id: 'planning',
      title: 'Planning Desk',
      description: 'Backlog review, triage, and mission shaping.',
      agents: agents.filter((agent) => agent.activeTaskCount === 0 && agent.status !== 'offline'),
      accent: 'from-slate-100 to-white',
    },
    {
      id: 'build',
      title: 'Build Bay',
      description: 'Active execution owned by agents with open tasks.',
      agents: agents.filter((agent) => agent.activeTaskCount > 0 && agent.status !== 'offline'),
      accent: 'from-sky-100 to-white',
    },
    {
      id: 'quiet',
      title: 'Quiet Zone',
      description: 'Agents without recent activity or currently offline.',
      agents: agents.filter((agent) => agent.status === 'offline'),
      accent: 'from-slate-200 to-white',
    },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="glass-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Control Booth</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Human oversight</h2>
        <div className="mt-6 rounded-[26px] border border-slate-200/80 bg-white/90 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">{humanName}</p>
              <p className="text-sm text-slate-500">Human operator</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Mission Control now reads the real OpenClaw board and command log. This room is the oversight layer, not the source of truth.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Focus className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Open Work</span>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-950">
                {board.tasks.filter((task) => task.lane !== 'done').length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Resolved</span>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-950">
                {board.tasks.filter((task) => task.lane === 'done').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {zones.map((zone) => (
          <section key={zone.id} className="glass-panel p-5 sm:p-6">
            <div className={`rounded-[24px] bg-gradient-to-br ${zone.accent} p-4`}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{zone.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{zone.description}</p>
            </div>

            <div className="mt-4 space-y-3">
              {zone.agents.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm leading-6 text-slate-500">
                  No agents in this zone.
                </div>
              ) : (
                zone.agents.map((agent) => {
                  const focusTask = getFocusTask(board.tasks.filter((task) => task.assignedTo === agent.id && task.lane !== 'done'));

                  return (
                    <article key={agent.id} className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{agent.name}</p>
                          <p className="text-xs text-slate-500">{agent.role}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock3 className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Current Focus</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-950">
                          {focusTask ? focusTask.title : 'Standing by for the next assignment'}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}