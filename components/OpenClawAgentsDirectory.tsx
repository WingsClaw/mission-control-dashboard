'use client';

import { useMemo, useState } from 'react';
import { Search, ShieldAlert, TimerReset, Wifi } from 'lucide-react';

import { OpenClawAgentSnapshot } from '@/lib/types';
import { OpenClawAgentCard } from '@/components/OpenClawAgentCard';

interface OpenClawAgentsDirectoryProps {
  agents: OpenClawAgentSnapshot[];
}

export function OpenClawAgentsDirectory({ agents }: OpenClawAgentsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(
    () =>
      agents.filter((agent) => {
        const query = searchQuery.toLowerCase();

        return (
          agent.name.toLowerCase().includes(query) ||
          agent.role.toLowerCase().includes(query) ||
          (agent.model ?? '').toLowerCase().includes(query)
        );
      }),
    [agents, searchQuery],
  );

  const onlineCount = agents.filter((agent) => agent.status === 'online').length;
  const busyCount = agents.filter((agent) => agent.status === 'busy').length;
  const attentionCount = agents.filter((agent) => agent.status === 'error').length;

  return (
    <>
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by agent name, role, or model"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="field-input pl-11"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Connected</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-950">{onlineCount} active</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <TimerReset className="h-4 w-4 text-amber-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Allocated</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-950">{busyCount} busy</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Intervention</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-950">{attentionCount} issues</p>
            </div>
          </div>
        </div>
      </section>

      {filteredAgents.length === 0 ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            {searchQuery ? 'No matching agents' : 'No agents detected'}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            {searchQuery
              ? 'Try a broader search phrase. The search checks agent names, roles, and model labels.'
              : 'OpenClaw has not written any session indexes yet, so there is no live roster to show.'}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => (
            <OpenClawAgentCard key={agent.id} agent={agent} />
          ))}
        </section>
      )}
    </>
  );
}