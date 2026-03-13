import Link from 'next/link';

import { AppShell } from '@/components/AppShell';
import { OpenClawTaskBoard } from '@/components/OpenClawTaskBoard';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';
import { ArrowLeft, CalendarDays, FolderKanban, Radar } from 'lucide-react';

export default async function TasksPage() {
  const model = await getOpenClawWorkspaceModel();
  const backlogCount = model.board.tasks.filter((task) => task.lane === 'backlog').length;
  const reviewCount = model.board.tasks.filter((task) => task.lane === 'review').length;
  const doneCount = model.board.tasks.filter((task) => task.lane === 'done').length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Task Operations"
        title="Run the real kanban board that OpenClaw can share with Mission Control."
        description="This board persists directly to the OpenClaw workspace kanban.json file. It is now the real writable task surface for Mission Control, not a browser-only mock queue."
        actions={
          <>
            <Link href="/" className="action-button gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/calendar" className="action-button gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Link>
            <Link href="/live" className="action-button-primary gap-2">
              <Radar className="h-4 w-4" />
              Live System
            </Link>
          </>
        }
        stats={[
          { label: 'All Tasks', value: model.board.tasks.length },
          { label: 'Backlog', value: backlogCount },
          { label: 'Review', value: reviewCount },
          { label: 'Done', value: doneCount },
        ]}
      />

      {model.warnings.length > 0 ? (
        <section className="glass-panel p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {model.warnings.map((warning) => (
              <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                {warning}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="glass-panel p-5 sm:p-6">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <FolderKanban className="h-4 w-4 text-slate-700" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Source Of Truth</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Mission Control is now reading and writing the real OpenClaw workspace board at{' '}
            <span className="font-semibold text-slate-950">{model.workspaceDir ? `${model.workspaceDir}\kanban.json` : 'kanban.json'}</span>.
          </p>
        </div>
      </section>

      <OpenClawTaskBoard initialBoard={model.board} assignmentOptions={model.assignmentOptions} />
    </AppShell>
  );
}
