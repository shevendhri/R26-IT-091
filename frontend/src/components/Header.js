"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMaterial } from '@/context/MaterialContext';

export default function Header() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const materialContext = useMaterial();
  const buildingInfo = mounted ? (materialContext?.buildingInfo || {}) : {};

  // 4 Core Research Pillars + Home (Visualization & Report are integrated within Materials)
  const primaryNav = [
    { num: '00', href: '/', label: 'HOME', active: pathname === '/' },
    { num: '01', href: '/plan-analyzer', label: 'ANALYZE', active: pathname.startsWith('/plan-analyzer') },
    { num: '02', href: '/materials/form', label: 'MATERIALS', active: pathname.startsWith('/materials') || pathname.startsWith('/visualization') || pathname.startsWith('/history') },
    { num: '03', href: '/fire-safety', label: 'SAFETY', active: pathname.startsWith('/fire-safety') },
    { num: '04', href: '/green-assessment', label: 'GREEN', active: pathname.startsWith('/green-assessment') },
  ];

  const secondaryNav = [
    { href: '/materials/report#research-trace', label: 'Research Trace & Audit Log' },
    { href: '/blueprint', label: 'CAD Floor Plan & Blueprints' },
    { href: '/history', label: 'Historical Project Archives' },
    { href: '/workspace', label: 'Full Research Workspace' },
    { href: '/feedback', label: 'Viva Dissertation Feedback' },
  ];

  // Only resolve dynamic values after mount to avoid SSR/client hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  const projectType = buildingInfo.building_type || 'Residential Villa';
  const location = buildingInfo.location || 'Colombo';
  const floors = buildingInfo.floor_count || buildingInfo.floors || 2;
  const area = buildingInfo.total_floor_area || buildingInfo.total_area || 170;

  return (
    <header className="arch-header" style={{
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 2000,
      background: 'rgba(250, 247, 240, 0.98)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #E2DCD0',
      boxShadow: '0 1px 8px rgba(23, 58, 43, 0.03)',
    }}>
      <style>{`
        .arch-nav-item {
          color: #6C746E;
          text-decoration: none;
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          position: relative;
          transition: all 0.2s ease;
          border-radius: 6px;
          border: 1px solid transparent;
        }
        .arch-nav-item:hover {
          color: #173A2B;
          background: rgba(23, 58, 43, 0.05);
        }
        .arch-nav-item.active {
          color: #173A2B;
          background: #ECE5D8;
          border-color: #D5CCBC;
          font-weight: 800;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .arch-nav-num {
          font-size: 0.65rem;
          font-weight: 700;
          color: #8D7765;
          letter-spacing: 0.04em;
        }
        .arch-nav-item.active .arch-nav-num {
          color: #173A2B;
        }
        .arch-badge-project {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #FAF8F4;
          border: 1px solid #D5CCBC;
          border-radius: 6px;
          padding: 5px 14px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.70rem;
          color: #252823;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }
        .arch-badge-project:hover {
          border-color: #173A2B;
        }
        .arch-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #FAF8F4;
          border: 1px solid #D5CCBC;
          border-radius: 6px;
          box-shadow: 0 12px 36px rgba(23, 58, 43, 0.12);
          min-width: 240px;
          padding: 6px 0;
          z-index: 2010;
        }
        .arch-dropdown-item {
          display: block;
          padding: 8px 16px;
          font-size: 0.76rem;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          color: #252823;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .arch-dropdown-item:hover {
          background: #ECE5D8;
          color: #173A2B;
        }
      `}</style>

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0.70rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
      }}>
        {/* Left: Brand Identity */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '1px solid #C8C0B2',
            background: '#FAF8F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            borderRadius: '6px',
          }}>
            {/* Botanical Leaf Emblem */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#173A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 4 13C4 7 11 2 20 2c0 9-5 16-12 17a8 8 0 0 1-5 1" />
              <path d="M2 21c0-4 3-7 7-7" />
            </svg>
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '6px',
              height: '6px',
              background: '#B85C43',
              borderRadius: '1px',
            }} />
          </div>

          <div>
            <div style={{
              fontFamily: 'Outfit, Space Grotesk, sans-serif',
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              lineHeight: 1,
            }}>
              <span style={{
                fontWeight: 900,
                fontSize: '1.15rem',
                color: '#173A2B',
                letterSpacing: '-0.02em',
              }}>GREENCONSTRUCT</span>
              <span style={{
                fontWeight: 800,
                fontSize: '0.65rem',
                color: '#B85C43',
                letterSpacing: '0.12em',
                fontFamily: 'Space Grotesk',
              }}>AI</span>
            </div>
            <div style={{
              fontSize: '0.58rem',
              letterSpacing: '0.14em',
              color: '#687068',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'Space Grotesk',
              marginTop: '4px',
            }}>
              Sri Lankan Construction Material Intelligence
            </div>
          </div>
        </Link>

        {/* Center: 7-Stage Primary Research Pipeline */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`arch-nav-item${item.active ? ' active' : ''}`}
            >
              <span className="arch-nav-num">{item.num}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Project Telemetry Indicator & Ancillary Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Dynamic Project Status Pill — only rendered client-side and hidden on homepage */}
          {mounted && pathname !== '/' && (
            <Link href="/materials/report" style={{ textDecoration: 'none' }} title="Current Project Context">
              <div className="arch-badge-project">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#285642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <div>
                  <span style={{ fontWeight: 700, color: '#173A2B' }}>{projectType}</span>
                  <span style={{ color: '#687068', margin: '0 5px' }}>|</span>
                  <span style={{ color: '#687068' }}>{location} • {floors}F • {area} m²</span>
                </div>
              </div>
            </Link>
          )}

          {/* Research Trace / More Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 220)}
              style={{
                background: (pathname.startsWith('/history') || pathname.startsWith('/workspace') || pathname.startsWith('/feedback')) ? '#ECE5D8' : '#FAF8F4',
                border: '1px solid #D5CCBC',
                borderRadius: '6px',
                padding: '5px 12px',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk',
                fontSize: '0.70rem',
                fontWeight: (pathname.startsWith('/history') || pathname.startsWith('/workspace') || pathname.startsWith('/feedback')) ? 800 : 700,
                color: '#173A2B',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>ARCHIVES</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="arch-dropdown">
                {secondaryNav.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="arch-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
