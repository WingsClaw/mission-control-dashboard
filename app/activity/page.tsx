import Link from 'next/link';

import { AppShell } from '@/components/AppShell';
import { OpenClawActivityTimeline } from '@/components/OpenClawActivityTimeline';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';
import { ArrowLeft, CheckSquare, Cpu, Radar, User } from 'lucide-react';

export default async function ActivityPage() {
  const model = await getOpenClawWorkspaceModel();
  const webchatCount = model.activity.filter((event) => (event.source ?? '').toLowerCase().includes('webchat')).length;
  const automationCount = model.activity.filter((event) => {
    const source = (event.source ?? '').toLowerCase();
    return source.includes('cron') || source.includes('heartbeat') || source.includes('scheduler');
  }).length;
  const uniqueSenders = new Set(model.activity.map((event) => event.senderId).filter(Boolean)).size;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Activity Timeline"
        title="Track the real OpenClaw command stream across the workspace."
        description="This feed is sourced from the live commands.log file. It shows what OpenClaw actually recorded, not browser-session activity cached inside the dashboard."
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
          { label: 'All Events', value: model.activity.length },
          { label: 'Webchat', value: webchatCount },
          { label: 'Automation', value: automationCount },
          { label: 'Senders', value: uniqueSenders },
        ]}
      />

      {model.warnings.length > 0 ? (
        <section className="glass-panel p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {model.warnings.slice(0, 3).map((warning) => (
              <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                {warning}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <OpenClawActivityTimeline events={model.activity} />
    </AppShell>
  );
}
