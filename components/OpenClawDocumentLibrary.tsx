'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { OpenClawDocumentDetail } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface OpenClawDocumentLibraryProps {
  entries: OpenClawDocumentDetail[];
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function OpenClawDocumentLibrary({
  entries,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
}: OpenClawDocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) {
      return entries;
    }

    return entries.filter((entry) => {
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.excerpt.toLowerCase().includes(query) ||
        entry.relativePath.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query)
      );
    });
  }, [entries, searchQuery]);

  return (
    <>
      <section className="glass-panel p-5 sm:p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="field-input pl-11"
          />
        </div>
      </section>

      {filteredEntries.length === 0 ? (
        <section className="glass-panel px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">{emptyTitle}</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">{emptyDescription}</p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredEntries.map((entry) => (
            <details key={entry.relativePath} className="glass-panel overflow-hidden p-5 sm:p-6">
              <summary className="cursor-pointer list-none">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{entry.relativePath}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{entry.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{entry.excerpt}</p>
                {entry.updatedAt ? (
                  <p className="mt-4 text-xs text-slate-400">{formatDateTime(entry.updatedAt)}</p>
                ) : null}
              </summary>

              <pre className="mt-5 overflow-x-auto rounded-[22px] bg-slate-950 p-5 text-xs leading-6 text-slate-100 whitespace-pre-wrap">
                {entry.content}
              </pre>
            </details>
          ))}
        </section>
      )}
    </>
  );
}