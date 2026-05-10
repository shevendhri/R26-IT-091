"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  return (
    <header style={{ 
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
        <div className="neural-core-v2" style={{ width: '45px', height: '45px' }}>
          <div className="core-ring core-ring-1"></div>
          <div className="core-ring core-ring-2"></div>
          <div style={{ fontSize: '1rem', zIndex: 10 }}>🏗️</div>
        </div>
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
      <nav style={{ display: 'flex', gap: '3rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>
        <Link href="/" style={{ 
          color: pathname === '/' ? 'var(--eco-glow)' : 'var(--text-secondary)', 
          textDecoration: 'none',
          position: 'relative'
        }}>
          DASHBOARD
          {pathname === '/' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
        <Link href="/materials" style={{ 
          color: pathname === '/materials' ? 'var(--eco-glow)' : 'var(--text-secondary)', 
          textDecoration: 'none',
          position: 'relative'
        }}>
          ENGINEERING MATRIX
          {pathname === '/materials' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
        <Link href="/blueprint" style={{ 
          color: pathname === '/blueprint' ? 'var(--eco-glow)' : 'var(--text-secondary)', 
          textDecoration: 'none',
          position: 'relative'
        }}>
          BLUEPRINT AI
          {pathname === '/blueprint' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
        <Link href="/plan-analyzer" style={{ 
          color: pathname === '/plan-analyzer' ? 'var(--eco-glow)' : 'var(--text-secondary)', 
          textDecoration: 'none',
          position: 'relative'
        }}>
          PLAN ANALYZER
          {pathname === '/plan-analyzer' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
                <Link href="/firesefty/feature/submission/new" style={{ 
          color: pathname === '/firesefty/feature/submission/new' ? 'var(--eco-glow)' : 'var(--text-secondary)', 
          textDecoration: 'none',
          position: 'relative'
        }}>
            FIRE ANALYZER
          {pathname === '/firesefty/feature/submission/new' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '2px', background: 'var(--eco-glow)' }} />}
        </Link>
      </nav>
    </header>
  );
};

export default Header;
