"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MaterialSubNav() {
  const pathname = usePathname();

  const tabs = [
    { num: '01', href: '/materials/form', label: 'Intake Brief', active: pathname === '/materials/form' },
    { num: '02', href: '/materials/building-requirements', label: 'SLS Requirements', active: pathname === '/materials/building-requirements' },
    { num: '03', href: '/materials/3d', label: '3D BIM Model', active: pathname === '/materials/3d' || pathname === '/visualization' },
    { num: '04', href: '/materials/report', label: 'Specification Report', active: pathname === '/materials/report' },
    { num: '05', href: '/history', label: 'History & Comparison', active: pathname.startsWith('/history') },
  ];

  return (
    <nav style={{
      background: '#FAF8F4',
      borderBottom: '1px solid #E2DCD0',
      padding: '0.55rem 2rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Module Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.62rem',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            background: '#143825',
            color: '#FCFAF6',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            WORKSPACE
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#143825',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Material Specification Intelligence
          </span>
        </div>

        {/* Tab Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: tab.active ? '#143825' : '#F5F1E8',
                color: tab.active ? '#FCFAF6' : '#55655B',
                border: tab.active ? '1px solid #143825' : '1px solid #E2DCD0',
                textDecoration: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.70rem',
                fontWeight: tab.active ? 800 : 600,
                boxShadow: tab.active ? '0 1px 3px rgba(20,56,37,0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                fontSize: '0.62rem',
                color: tab.active ? '#D2E4D6' : '#8D6A4F',
                fontWeight: 700,
              }}>
                {tab.num}
              </span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
