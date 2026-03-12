'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, CheckSquare, Activity, Rocket } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/agents', label: 'Agents', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/activity', label: 'Activity', icon: Activity },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Rocket className="text-blue-500" size={24} />
            <span className="text-xl font-bold text-gray-900">Mission Control</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
                <Activity size={24} />
              </summary>
              <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border p-2 min-w-[200px]">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}
