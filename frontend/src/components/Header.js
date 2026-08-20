"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header style={{
      padding: '0.85rem 2rem',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#0b0f19',
      zIndex: 2000,
      position: 'sticky',
      top: 0,
      width: '100%'
    }}>
      {/* Brand & Project Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '4px',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981',
          fontWeight: 800,
          fontSize: '0.85rem',
          fontFamily: 'Space Grotesk'
        }}>
          GC
        </div>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div>
            <div style={{ fontWeight: 700, letterSpacing: '1px', fontSize: '1rem', color: '#f8fafc', fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: '8px' }}>
              GREENCONSTRUCT<span style={{ color: '#10b981' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Sri Lankan Construction Material Intelligence Platform
            </div>
          </div>
        </Link>
      </div>

      {/* System Status Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px',
          background: '#0f172a',
          padding: '4px 10px',
          borderRadius: '4px',
          border: '1px solid #1e293b',
          fontSize: '0.68rem',
          color: '#94a3b8'
        }} className="md-flex">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span>ENGINEERING DECISION ENGINE</span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '1.75rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            color: pathname === '/' ? '#10b981' : '#94a3b8',
            textDecoration: 'none',
            position: 'relative',
            padding: '4px 0'
          }}>
            PROJECT COMMAND
            {pathname === '/' && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#10b981' }} />}
          </Link>
          <Link href="/plan-analyzer" style={{
            color: pathname === '/plan-analyzer' ? '#10b981' : '#94a3b8',
            textDecoration: 'none',
            position: 'relative',
            padding: '4px 0'
          }}>
            PLAN ANALYZER
            {pathname === '/plan-analyzer' && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#10b981' }} />}
          </Link>
          <Link href="/materials" style={{
            color: pathname.startsWith('/materials') ? '#10b981' : '#94a3b8',
            textDecoration: 'none',
            position: 'relative',
            padding: '4px 0'
          }}>
            MATERIAL RECOMMENDATIONS
            {pathname.startsWith('/materials') && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#10b981' }} />}
          </Link>
          <Link href="/feedback" style={{
            color: pathname === '/feedback' ? '#10b981' : '#94a3b8',
            textDecoration: 'none',
            position: 'relative',
            padding: '4px 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: pathname === '/feedback' ? 1 : 0.8 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            USER FEEDBACK
            {pathname === '/feedback' && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#10b981' }} />}
          </Link>
        </nav>
      </div>
    </header>
  );
}
