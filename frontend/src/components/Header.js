"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
// Logo import removed; using public path directly

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="glass-panel" style={{
      padding: '1rem 3rem',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(4, 13, 10, 0.9)',
      backdropFilter: 'blur(40px)',
      zIndex: 2000,
      position: 'sticky',
      top: 0,
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Image src="/logo.svg" alt="logo" width={45} height={45} style={{ objectFit: 'contain' }} />
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: '4px', fontSize: '1.1rem', color: '#fff', fontFamily: 'Space Grotesk' }}>
              GREENCONSTRUCT<span style={{ color: 'var(--eco-glow)', textShadow: '0 0 15px var(--eco-glow-soft)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '5px', color: 'var(--text-secondary)', fontWeight: 900, textTransform: 'uppercase' }}>
              Engineering Intelligence v18.2
            </div>
          </div>
        </Link>
      </div>
      {/* Dark mode toggle */}
      <button onClick={() => {
        const html = document.documentElement;
        if (html.dataset.theme === 'light') {
          html.dataset.theme = 'dark';
          localStorage.setItem('theme', 'dark');
        } else {
          html.dataset.theme = 'light';
          localStorage.setItem('theme', 'light');
        }
      }} style={{
        background: 'transparent',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        color: 'var(--eco-glow)',
        padding: '0.4rem 0.8rem',
        cursor: 'pointer',
        fontWeight: 600
      }}>
        {typeof window !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>



      <nav style={{ display: 'flex', gap: '3rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>
        <Link href="/" style={{
          color: pathname === '/' ? 'var(--eco-glow)' : 'var(--text-secondary)',
          textDecoration: 'none',
          position: 'relative'
        }}>
          DASHBOARD
          {pathname === '/' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
        <Link href="/plan-analyzer" style={{
          color: pathname === '/plan-analyzer' ? 'var(--eco-glow)' : 'var(--text-secondary)',
          textDecoration: 'none',
          position: 'relative'
        }}>
          PLAN ANALYZER
          {pathname === '/plan-analyzer' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
        <Link href="/materials" style={{
          color: pathname.startsWith('/materials') ? 'var(--eco-glow)' : 'var(--text-secondary)',
          textDecoration: 'none',
          position: 'relative'
        }}>
          MATERIAL RECOMMENDATION
          {pathname.startsWith('/materials') && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
      </nav>
    </header>

  );
};

export default Header;
