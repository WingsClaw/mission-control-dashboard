'use client';

import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, title, description, onClose, children, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className={cn(
            'relative w-full max-w-2xl rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_30px_120px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8',
            className,
          )}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700/80">
                Control Surface
              </p>
              <div>
                <h2 id="dialog-title" className="text-2xl font-semibold text-slate-950">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}