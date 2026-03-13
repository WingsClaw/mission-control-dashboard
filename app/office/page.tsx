import Link from 'next/link';
import { ArrowLeft, Radar, Users, Zap } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { OpenClawOfficeMap } from '@/components/OpenClawOfficeMap';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';

export default async function OfficePage() {
  const model = await getOpenClawWorkspaceModel();
  const activeAgents = model.agents.filter((agent) => agent.status === 'online' || agent.status === 'busy').length;
  const openTasks = model.board.tasks.filter((task) => task.lane !== 'done').length;
  const doneTasks = model.board.tasks.filter((task) => task.lane === 'done').length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Office Surface"
        title="Visualize where the agents are focusing inside the real workspace."
        description="This is the playful operations view from your transcript, but it is grounded in live data. Zones are derived from real task ownership and live agent status instead of hardcoded animation state."
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
          { label: 'Active Agents', value: activeAgents },
          { label: 'Open Work', value: openTasks },
          { label: 'Resolved', value: doneTasks },
          { label: 'Rooms', value: 3 },
        ]}
      />

      <OpenClawOfficeMap agents={model.agents} board={model.board} humanName={model.user.callName} />

      <section className="glass-panel p-5 sm:p-6">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Why This Matters</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The Office view is meant to be fun, but it still needs to stay honest. This screen is only a visualization layer over the real board and agent runtime, so it stays useful instead of drifting into decorative fiction.
          </p>
        </div>
      </section>
    </AppShell>
  );
}