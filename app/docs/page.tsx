import Link from 'next/link';
import { ArrowLeft, BookMarked, Radar, ScrollText } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { OpenClawDocumentLibrary } from '@/components/OpenClawDocumentLibrary';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';

export default async function DocsPage() {
  const model = await getOpenClawWorkspaceModel();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Document Surface"
        title="Search the real OpenClaw workspace documents and prompt files."
        description="This screen turns the markdown files inside the OpenClaw workspace into a searchable document library, so generated plans and core instructions are easier to find than scrolling back through chat."
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
          { label: 'Docs', value: model.docs.length },
          { label: 'Memory Files', value: model.memoryEntries.length },
          { label: 'Agents', value: model.agents.length },
          { label: 'Board Tasks', value: model.board.tasks.length },
        ]}
      />

      <section className="glass-panel p-5 sm:p-6">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <BookMarked className="h-4 w-4 text-slate-700" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Workspace Root</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            These files come directly from the OpenClaw workspace root and include your runtime guidance documents like AGENTS.md, SOUL.md, USER.md, and any generated planning docs saved there.
          </p>
        </div>
      </section>

      {model.docs.length === 0 ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ScrollText className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">No workspace documents yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Save planning or generated markdown files into the OpenClaw workspace root and they will show up here automatically.
          </p>
        </section>
      ) : (
        <OpenClawDocumentLibrary
          entries={model.docs}
          searchPlaceholder="Search document titles, summaries, or content"
          emptyTitle="No matching documents"
          emptyDescription="The search did not match any workspace document. Try a broader term or search for a file name."
        />
      )}
    </AppShell>
  );
}