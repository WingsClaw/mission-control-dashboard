import Link from 'next/link';
import { ArrowLeft, BookMarked, PanelsTopLeft, Radar, Target } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';

function deriveProjectName(task: { project: string | null; title: string }) {
  if (task.project) {
    return task.project;
  }

  const bracketMatch = task.title.match(/^\[(.+?)\]/);
  if (bracketMatch) {
    return bracketMatch[1].trim();
  }

  const prefixMatch = task.title.match(/^([^:-]{3,36})[:\-]\s/);
  if (prefixMatch) {
    return prefixMatch[1].trim();
  }

  return 'General Operations';
}

export default async function ProjectsPage() {
  const model = await getOpenClawWorkspaceModel();

  const projectMap = new Map<
    string,
    {
      name: string;
      total: number;
      done: number;
      active: number;
      owners: Set<string>;
      docs: number;
      memory: number;
      latestUpdate: string | null;
      tasks: typeof model.board.tasks;
    }
  >();

  for (const task of model.board.tasks) {
    const name = deriveProjectName(task);
    const existing = projectMap.get(name) ?? {
      name,
      total: 0,
      done: 0,
      active: 0,
      owners: new Set<string>(),
      docs: 0,
      memory: 0,
      latestUpdate: null,
      tasks: [],
    };

    existing.total += 1;
    existing.done += task.lane === 'done' ? 1 : 0;
    existing.active += task.lane !== 'done' ? 1 : 0;
    if (task.assignedTo) {
      existing.owners.add(task.assignedTo);
    }
    existing.latestUpdate =
      !existing.latestUpdate || new Date(task.updatedAt).getTime() > new Date(existing.latestUpdate).getTime()
        ? task.updatedAt
        : existing.latestUpdate;
    existing.tasks.push(task);
    projectMap.set(name, existing);
  }

  const projects = [...projectMap.values()]
    .map((project) => {
      const keyword = project.name.toLowerCase();
      return {
        ...project,
        docs: model.docs.filter((entry) => entry.title.toLowerCase().includes(keyword) || entry.content.toLowerCase().includes(keyword)).length,
        memory: model.memoryEntries.filter((entry) => entry.title.toLowerCase().includes(keyword) || entry.content.toLowerCase().includes(keyword)).length,
      };
    })
    .sort((left, right) => {
      const leftTime = left.latestUpdate ? new Date(left.latestUpdate).getTime() : 0;
      const rightTime = right.latestUpdate ? new Date(right.latestUpdate).getTime() : 0;
      return rightTime - leftTime;
    });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Project Surface"
        title="Track real workstreams across the live board instead of isolated tasks."
        description="Projects are derived from the shared OpenClaw board. Give tasks a project name and this page turns them into trackable portfolios with progress, owners, and related workspace context."
        actions={
          <>
            <Link href="/" className="action-button gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/tasks" className="action-button gap-2">
              <PanelsTopLeft className="h-4 w-4" />
              Open Board
            </Link>
            <Link href="/live" className="action-button-primary gap-2">
              <Radar className="h-4 w-4" />
              Live System
            </Link>
          </>
        }
        stats={[
          { label: 'Projects', value: projects.length },
          { label: 'Board Tasks', value: model.board.tasks.length },
          { label: 'Open Work', value: model.board.tasks.filter((task) => task.lane !== 'done').length },
          { label: 'Resolved', value: model.board.tasks.filter((task) => task.lane === 'done').length },
        ]}
      />

      {projects.length === 0 ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">No projects on the board yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Add tasks on the board and assign them a project name. Mission Control will group them here automatically.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => {
            const progress = project.total === 0 ? 0 : Math.round((project.done / project.total) * 100);

            return (
              <article key={project.name} className="glass-panel p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Project</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{project.name}</h2>
                  </div>
                  <span className="status-chip border border-slate-200 bg-white text-slate-700">{progress}% complete</span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-950" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tasks</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{project.total}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Open</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{project.active}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Owners</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{project.owners.size || 1}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Docs</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{project.docs}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Recent Tasks</p>
                    <div className="mt-4 space-y-3">
                      {project.tasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-950">{task.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {task.lane.replace('_', ' ')} · {task.priority} · {(task.project ?? project.name)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Related Context</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-500">
                          <BookMarked className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Docs</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-950">{project.docs} matching documents</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Memory</p>
                        <p className="mt-3 text-sm font-medium text-slate-950">{project.memory} matching memory notes</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Latest Update</p>
                        <p className="mt-3 text-sm font-medium text-slate-950">{project.latestUpdate ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(project.latestUpdate)) : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AppShell>
  );
}