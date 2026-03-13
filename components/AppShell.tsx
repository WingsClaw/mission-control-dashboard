import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-8rem] h-[30rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.18),_transparent_60%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-56 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.18),_transparent_62%)] blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.16),_transparent_64%)] blur-3xl" />
      </div>

      <Navbar />

      <main
        className={cn(
          'relative mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8',
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}