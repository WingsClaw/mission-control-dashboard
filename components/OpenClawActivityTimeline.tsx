'use client';

import { useMemo, useState } from 'react';
import { Activity, Bot, Filter, TimerReset, UserRound } from 'lucide-react';

import { OpenClawCommandEvent } from '@/lib/types';
import { formatDateTime, formatRelativeTime, titleCaseLabel } from '@/lib/utils';

interface OpenClawActivityTimelineProps {
  events: OpenClawCommandEvent[];
}

type ActivityFilter = 'all' | 'webchat' | 'automation' | 'other';

function getEventBucket(event: OpenClawCommandEvent): ActivityFilter {
  const source = (event.source ?? '').toLowerCase();

  if (source.includes('webchat')) {
    return 'webchat';
  }

  if (source.includes('cron') || source.includes('heartbeat') || source.includes('scheduler')) {
    return 'automation';
  }

  if (source) {
    return 'other';
  }

  return 'other';
}

export function OpenClawActivityTimeline({ events }: OpenClawActivityTimelineProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredEvents = useMemo(
    () => (filter === 'all' ? events : events.filter((event) => getEventBucket(event) === filter)),
    [events, filter],
  );

  const filterLabels: Record<ActivityFilter, string> = {
    all: 'All Events',
    webchat: 'Webchat',
    automation: 'Automation',
    other: 'Other',
  };

  return (
    <>
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as ActivityFilter[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                filter === type
                  ? 'bg-slate-950 text-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)]'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
              }`}
            >
              {filterLabels[type]}
              <span className="ml-2 text-xs opacity-75">
                {type === 'all' ? events.length : events.filter((event) => getEventBucket(event) === type).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {filteredEvents.length === 0 ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Filter className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">No matching events</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            This filter has no activity right now. Mission Control is reading the real commands.log file, so the feed only shows what OpenClaw has actually recorded.
          </p>
        </section>
      ) : (
        <section className="glass-panel overflow-hidden p-2 sm:p-3">
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <article key={event.id} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_35px_-24px_rgba(15,23,42,0.9)]">
                    <Activity className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="status-chip border border-emerald-200 bg-emerald-50 text-emerald-800">
                            {titleCaseLabel(event.action)}
                          </span>
                          <span className="status-chip border border-slate-200 bg-slate-100 text-slate-700">
                            {titleCaseLabel(getEventBucket(event))}
                          </span>
                          <span className="text-xs text-slate-400">{formatRelativeTime(event.timestamp)}</span>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-6 text-slate-950">
                          {event.source ?? 'Unknown source'}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Bot className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Sender</span>
                        </div>
                        <p className="mt-3 break-all text-sm font-medium text-slate-950">{event.senderId ?? 'Unknown'}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <UserRound className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Session</span>
                        </div>
                        <p className="mt-3 break-all text-sm font-medium text-slate-950">{event.sessionKey ?? 'No session key'}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <TimerReset className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Action</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-950">{event.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}