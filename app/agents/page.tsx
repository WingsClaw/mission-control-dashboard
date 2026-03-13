import Link from 'next/link';

import { AppShell } from '@/components/AppShell';
import { OpenClawAgentsDirectory } from '@/components/OpenClawAgentsDirectory';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';
import { ArrowLeft, Radar } from 'lucide-react';

export default async function AgentsPage() {
  const model = await getOpenClawWorkspaceModel();
  const onlineCount = model.agents.filter((agent) => agent.status === 'online').length;
  const busyCount = model.agents.filter((agent) => agent.status === 'busy').length;
  const sessionCount = model.agents.reduce((total, agent) => total + agent.sessionCount, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Agent Operations"
        title="Inspect the live OpenClaw roster and session health."
        description="This view no longer uses browser-local mock agents. It reads the real OpenClaw session indexes, model assignments, skill counts, and task ownership directly from the runtime."
        actions={
          <>
            <Link href="/" className="action-button gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/live" className="action-button-primary gap-2">
              <Radar className="h-4 w-4" />
              Live Runtime
            </Link>
          </>
        }
        stats={[
          { label: 'Roster Size', value: model.agents.length },
          { label: 'Online', value: onlineCount },
          { label: 'Busy', value: busyCount },
          { label: 'Sessions', value: sessionCount },
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

      <OpenClawAgentsDirectory agents={model.agents} />
    </AppShell>
  );
}
