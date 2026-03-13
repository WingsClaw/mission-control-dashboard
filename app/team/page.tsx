import Link from 'next/link';
import { ArrowLeft, BrainCircuit, Orbit, Radar, Users } from 'lucide-react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getOpenClawWorkspaceModel } from '@/lib/server/openclaw';

export default async function TeamPage() {
  const model = await getOpenClawWorkspaceModel();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Team Surface"
        title="See the current org map, identity, and operating rules behind the workspace."
        description="This screen translates the real OpenClaw workspace context into an org view. It combines the user profile, assistant identity, agent sessions, and the principles loaded from SOUL.md."
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
          { label: 'Team Members', value: model.teamMembers.length },
          { label: 'Agents', value: model.agents.length },
          { label: 'Principles', value: model.operatingPrinciples.length },
          { label: 'Timezone', value: model.user.timezone ?? 'Unset' },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="glass-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Org Map</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Current team topology</h2>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {model.teamMembers.map((member) => (
                <article key={member.id} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`status-chip border ${member.type === 'human' ? 'border-sky-200 bg-sky-50 text-sky-800' : member.type === 'assistant' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                      {member.type}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{member.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{member.detail}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                      <p className="mt-3 text-sm font-medium text-slate-950">{member.status}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Location</p>
                      <p className="mt-3 text-sm font-medium text-slate-950 break-all">{member.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Operating Principles</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Loaded from SOUL.md</h2>
              </div>
              <BrainCircuit className="h-5 w-5 text-slate-400" />
            </div>

            {model.operatingPrinciples.length === 0 ? (
              <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-sm leading-6 text-slate-500">
                No operating principles were parsed from SOUL.md.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {model.operatingPrinciples.map((principle) => (
                  <article key={principle.source} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">{principle.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{principle.body}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Identity</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Assistant profile</h2>
              </div>
              <Orbit className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Name</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{model.identity.name}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Creature</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{model.identity.creature ?? 'Unset'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Vibe</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{model.identity.vibe ?? 'Unset'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Operator</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{model.user.callName}</p>
              </div>
            </div>
          </section>

          {model.warnings.length > 0 ? (
            <section className="glass-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Context Notes</p>
              <div className="mt-4 grid gap-3">
                {model.warnings.map((warning) => (
                  <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900">
                    {warning}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </AppShell>
  );
}