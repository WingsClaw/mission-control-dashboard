'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BookMarked,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Home,
  Orbit,
  PanelsTopLeft,
  Radar,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/projects', label: 'Projects', icon: PanelsTopLeft },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/docs', label: 'Docs', icon: BookMarked },
    { href: '/memory', label: 'Memory', icon: Activity },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/office', label: 'Office', icon: Orbit },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/live', label: 'Live', icon: Radar },
  ];

  const mobileNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/projects', label: 'Projects', icon: PanelsTopLeft },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/docs', label: 'Docs', icon: BookMarked },
    { href: '/live', label: 'Live', icon: Radar },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="glass-panel flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_38px_-24px_rgba(15,23,42,0.9)]">
                  <Orbit className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold tracking-tight text-slate-950">
                    Mission Control
                  </p>
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Local-First Orchestration Board
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/80 bg-white/85 p-1 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-slate-950 text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.85)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                Local Workspace
              </div>

              <Link href="/live" className="action-button-primary gap-2">
                Open Live View
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="sm:hidden inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <Activity className="h-4 w-4 text-teal-600" />
              Local
            </div>
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="glass-panel grid grid-cols-6 gap-1 p-1.5">
          {mobileNavItems.map((item) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center gap-1 rounded-[20px] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition',
                  isActive
                    ? 'bg-slate-950 text-white shadow-[0_16px_36px_-24px_rgba(15,23,42,0.85)]'
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-950',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
