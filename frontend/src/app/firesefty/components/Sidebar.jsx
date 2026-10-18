'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileCheck, BarChart3, Plus, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/submission/new', label: 'New Submission', icon: Plus },
  ];

  return (
    <aside className="hidden w-64 border-r border-border bg-sidebar lg:block">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Flame size={24} className="text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-orbitron text-lg font-bold text-sidebar-primary">FireSafe</h2>
          <p className="text-xs text-sidebar-muted-foreground">LK Certification</p>
        </div>
      </div>

      <nav className="space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
