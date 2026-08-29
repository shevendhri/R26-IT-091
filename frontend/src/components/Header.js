"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'HOME', active: pathname === '/' },
    { href: '/plan-analyzer', label: 'PLAN ANALYZER', active: pathname === '/plan-analyzer' },
    { href: '/materials', label: 'MATERIAL RECOMMENDATIONS', active: pathname.startsWith('/materials') },
    { href: '/green-assessment', label: 'GREEN ASSESSMENT', active: pathname.startsWith('/green-assessment') },
    { href: '/fire-safety', label: 'FIRE SAFETY', active: pathname.startsWith('/fire-safety') },
    { href: '/history', label: 'RECOMMENDATION HISTORY', active: pathname.startsWith('/history') },
  ];

  return (
    <header style={{
      padding: '0.8rem 2.2rem',
      borderBottom: '1px solid rgba(143, 182, 156, 0.28)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0F2D1E 0%, #153F2B 55%, #0B2418 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 2000,
      position: 'sticky',
      top: 0,
      width: '100%',
      boxShadow: '0 4px 24px rgba(10, 30, 20, 0.35)'
    }}>
      <style>{`
        .nav-link-item-dark {
          color: #B5D1C2;
          text-decoration: none;
          position: relative;
          padding: 7px 11px;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 0.73rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link-item-dark:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
        }
        .nav-link-item-dark.active {
          color: #65D28A;
          background: rgba(101, 210, 138, 0.16);
          border: 1px solid rgba(101, 210, 138, 0.28);
        }
        .nav-active-bar-dark {
          position: absolute;
          bottom: -1px;
          left: 10px;
          right: 10px;
          height: 2px;
          background: #65D28A;
          border-radius: 2px;
        }
      `}</style>

      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1E5438 0%, #0A2215 100%)',
            border: '1px solid rgba(101, 210, 138, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 3px 14px rgba(0, 0, 0, 0.3)',
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65D28A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div>
            <div style={{
              fontWeight: 800,
              letterSpacing: '0.02em',
              fontSize: '1.15rem',
              fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1.1
            }}>
              <span style={{ color: '#FFFFFF' }}>GREEN</span>
              <span style={{ color: '#E2EFE7' }}>CONSTRUCT</span>
              <span style={{ color: '#65D28A', marginLeft: '1px' }}>AI</span>
            </div>
            <div style={{
              fontSize: '0.62rem',
              letterSpacing: '0.08em',
              color: '#9AB8A3',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              marginTop: '2px'
            }}>
              Sri Lankan Construction Decision Support Platform
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', fontFamily: 'Space Grotesk, sans-serif' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link-item-dark${item.active ? ' active' : ''}`}
          >
            {item.isIcon && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
            {item.label}
            {item.active && <div className="nav-active-bar-dark" />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
