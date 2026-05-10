'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Topbar({ title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-secondary lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <h1 className="font-orbitron text-xl font-bold text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-lg bg-secondary px-3 py-2 sm:flex">
            <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">System Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
