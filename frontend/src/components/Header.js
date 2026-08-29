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
    { href: '/feedback', label: 'USER FEEDBACK', active: pathname === '/feedback', isIcon: true },
  ];

  return (
    <header style={{
      padding: '0.75rem 2rem',
      borderBottom: '1px solid rgba(74, 122, 92, 0.25)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(242, 247, 243, 0.94)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 2000,
      position: 'sticky',
      top: 0,
      width: '100%',
      boxShadow: '0 2px 16px rgba(20, 34, 27, 0.05)'
    }}>
      <style>{`
        .nav-link-item {
          color: #42554A;
          text-decoration: none;
          position: relative;
          padding: 6px 10px;
          border-radius: 8px;
          transition: color 0.2s ease, background 0.2s ease;
          font-size: 0.73rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .nav-link-item:hover {
          background: #D7E7DC;
          color: #1E5438;
        }
        .nav-link-item.active {
          color: #1E5438;
          background: #D7E7DC;
        }
        .nav-active-bar {
          position: absolute;
          bottom: -1px;
          left: 8px;
          right: 8px;
          height: 2.5px;
          background: #1E5438;
          border-radius: 2px 2px 0 0;
        }
      `}</style>

      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #1E5438 0%, #0F2D1E 100%)',
            border: '1px solid rgba(30, 84, 56, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 3px 12px rgba(30, 84, 56, 0.25)',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7EDAA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div>
            <div style={{
              fontWeight: 800,
              letterSpacing: '0.02em',
              fontSize: '1.1rem',
              fontFamily: 'Space Grotesk, sans-serif',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1.1
            }}>
              <span style={{ color: '#1E5438' }}>GREEN</span>
              <span style={{ color: '#18251F' }}>CONSTRUCT</span>
              <span style={{ color: '#4A7A5C' }}>AI</span>
            </div>
            <div style={{
              fontSize: '0.6rem',
              letterSpacing: '0.07em',
              color: '#7B877F',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              marginTop: '1px'
            }}>
              Sri Lankan Construction Decision Support Platform
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', fontFamily: 'Space Grotesk, sans-serif' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link-item${item.active ? ' active' : ''}`}
          >
            {item.isIcon && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
            {item.label}
            {item.active && <div className="nav-active-bar" />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
