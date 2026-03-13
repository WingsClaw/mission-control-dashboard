import Link from 'next/link';
import { ArrowLeft, BrainCircuit, Radar, ScrollText } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { OpenClawDocumentLibrary } from '@/components/OpenClawDocumentLibrary';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';

export default async function MemoryPage() {
  const model = await getOpenClawWorkspaceModel();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Memory Surface"
        title="Read the indexed daily notes that OpenClaw keeps for continuity."
        description="This view turns the workspace memory folder into a searchable journal. Use it to revisit what OpenClaw recorded on each day without digging through raw files."
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
          { label: 'Memory Files', value: model.memoryEntries.length },
          { label: 'Workspace Docs', value: model.docs.length },
          { label: 'Operating Principles', value: model.operatingPrinciples.length },
          { label: 'Cron Jobs', value: model.schedulerJobs.length },
        ]}
      />

      <section className="glass-panel p-5 sm:p-6">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <BrainCircuit className="h-4 w-4 text-slate-700" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Workspace Memory</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            These entries are read directly from the OpenClaw workspace memory folder. They are the day-by-day continuity files that the runtime uses to recover context between sessions.
          </p>
        </div>
      </section>

      {model.memoryEntries.length === 0 ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ScrollText className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">No memory notes yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Once OpenClaw writes daily notes into the memory folder, Mission Control will surface them here automatically.
          </p>
        </section>
      ) : (
        <OpenClawDocumentLibrary
          entries={model.memoryEntries}
          searchPlaceholder="Search daily notes, dates, or remembered context"
          emptyTitle="No matching memory entries"
          emptyDescription="The search did not match any memory file. Try a date, keyword, or project name."
        />
      )}
    </AppShell>
  );
}