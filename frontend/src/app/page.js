"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ─── Navigation entry cards ─────────────────────────────── */
const NAV_CARDS = [
  {
    title: "Material Recommendation",
    line: "AI-optimised packages for every climate zone",
    href: "/materials",
    accent: "#10b981",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Plan Analyzer",
    line: "Structural parameter extraction from floor plans",
    href: "/plan-analyzer",
    accent: "#38bdf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    title: "Blueprint Vision",
    line: "Computer vision compliance & spatial validation",
    href: "/plan-analyzer",
    accent: "#818cf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Explainable AI",
    line: "Transparent engineering logic behind every decision",
    href: "/materials/report",
    accent: "#f59e0b",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Sustainability",
    line: "Embodied carbon, service life & environmental resilience",
    href: "/materials/report",
    accent: "#34d399",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2c2.5 3 4 6.5 4 10" />
        <path d="M12 2C9.5 5 8 8.5 8 12" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    title: "Audit & Logs",
    line: "Full execution trace & material evaluation diagnostics",
    href: "/materials/report",
    accent: "#94a3b8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

/* ─── Pillars of capability ──────────────────────────────── */
const PILLARS = [
  { label: "Climate-Aware", sub: "14 Sri Lankan micro-climate zones" },
  { label: "AI + Engineering", sub: "Hybrid deterministic & ML architecture" },
  { label: "Explainable", sub: "Every decision traced & reasoned" },
  { label: "SLS-Referenced", sub: "SLS 134 / SLS 139 rule-checked outputs" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        /* ── Landing-page scoped styles ── */

        .lp-root {
          min-height: 100vh;
          background: #06090f;
          color: #e8edf4;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* ── Sticky nav bar ── */
        .lp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 900;
          padding: 0 2.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease;
          border-bottom: 1px solid transparent;
        }
        .lp-nav.scrolled {
          background: rgba(6, 9, 15, 0.88);
          border-color: rgba(30, 45, 72, 0.7);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .lp-brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          background: linear-gradient(135deg, #0b1422 0%, #152035 100%);
          border: 1px solid rgba(16,185,129,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 0.78rem;
          color: #10b981;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .lp-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: #f0f4f8;
          letter-spacing: 0.03em;
        }
        .lp-brand-name span { color: #10b981; }

        .lp-nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
        }
        .lp-nav-links a {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #7a96b0;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-nav-links a:hover { color: #c8ddf0; }

        .lp-nav-cta {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          color: #10b981;
          border-radius: 6px;
          padding: 0.45rem 1.1rem;
          font-size: 0.72rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .lp-nav-cta:hover {
          background: rgba(16,185,129,0.18);
          border-color: rgba(16,185,129,0.55);
        }

        /* ── Hero ── */
        .lp-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 1.5rem 5rem;
          overflow: hidden;
        }

        /* background image */
        .lp-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/lp-hero.png');
          background-size: cover;
          background-position: center 40%;
          opacity: 0.32;
          z-index: 0;
        }

        /* cinematic overlay gradient */
        .lp-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 55% at 50% -5%, rgba(16,185,129,0.055) 0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 80% 70%, rgba(56,189,248,0.03) 0%, transparent 55%),
            linear-gradient(to bottom, rgba(6,9,15,0.12) 0%, rgba(6,9,15,0.5) 70%, #06090f 100%);
          z-index: 1;
        }

        /* subtle blueprint grid */
        .lp-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 56px 56px;
          z-index: 2;
          pointer-events: none;
        }

        .lp-hero-content {
          position: relative;
          z-index: 10;
          max-width: 780px;
          margin: 0 auto;
        }

        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #10b981;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.22);
          border-radius: 100px;
          padding: 0.35rem 1rem;
          margin-bottom: 2rem;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .lp-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseGreen 2.5s ease-in-out infinite;
        }

        .lp-hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.6rem);
          font-weight: 700;
          line-height: 1.04;
          letter-spacing: -0.03em;
          color: #f0f4f8;
          margin: 0 0 1.5rem;
          animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .lp-hero-title .accent {
          background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-hero-sub {
          font-size: clamp(1rem, 1.8vw, 1.18rem);
          color: #7a96b0;
          line-height: 1.7;
          font-weight: 400;
          max-width: 560px;
          margin: 0 auto 2.8rem;
          animation: fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }

        .lp-hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }

        .btn-primary-lp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: #fff;
          border: 1px solid rgba(16,185,129,0.4);
          border-radius: 8px;
          padding: 0.85rem 1.8rem;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .btn-primary-lp:hover {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          box-shadow: 0 6px 28px rgba(16,185,129,0.28);
          transform: translateY(-1px);
        }
        .btn-primary-lp svg { flex-shrink: 0; }

        .btn-ghost-lp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.03);
          color: #a8c0d4;
          border: 1px solid rgba(200,221,240,0.14);
          border-radius: 8px;
          padding: 0.85rem 1.8rem;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.88rem;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .btn-ghost-lp:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(200,221,240,0.28);
          color: #c8ddf0;
        }

        /* ── Scroll cue ── */
        .lp-scroll-cue {
          position: absolute;
          bottom: 2.2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0.4;
          animation: fadeUp 1s 1s ease both;
        }
        .lp-scroll-cue span {
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7a96b0;
        }
        .lp-scroll-chevron {
          width: 20px;
          height: 20px;
          border-right: 1.5px solid #7a96b0;
          border-bottom: 1.5px solid #7a96b0;
          transform: rotate(45deg);
          animation: scrollBounce 1.8s ease-in-out infinite;
        }

        /* ── Capability pillars ── */
        .lp-pillars {
          display: flex;
          justify-content: center;
          gap: 0;
          border-top: 1px solid rgba(30,45,72,0.7);
          border-bottom: 1px solid rgba(30,45,72,0.7);
          background: rgba(11,17,28,0.6);
          animation: fadeUp 0.7s 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .lp-pillar {
          flex: 1;
          padding: 1.8rem 2rem;
          text-align: center;
          border-right: 1px solid rgba(30,45,72,0.6);
          transition: background 0.2s;
        }
        .lp-pillar:last-child { border-right: none; }
        .lp-pillar:hover { background: rgba(16,185,129,0.025); }
        .lp-pillar-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          color: #c8ddf0;
          letter-spacing: -0.01em;
          margin-bottom: 0.3rem;
        }
        .lp-pillar-sub {
          font-size: 0.72rem;
          color: #4f6880;
          letter-spacing: 0.01em;
        }

        /* ── Section spacing helpers ── */
        .lp-section {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 6rem 2.5rem;
        }

        /* ── Introduction block ── */
        .lp-intro-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr 1fr;
          gap: 3.5rem;
          align-items: start;
        }

        /* ── Feature image panel ── */
        .lp-img-panel {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 3/4;
          border: 1px solid rgba(30,45,72,0.8);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
        }
        .lp-img-panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .lp-img-panel:hover img { transform: scale(1.03); }
        .lp-img-panel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(6,9,15,0.75) 0%,
            rgba(6,9,15,0.1) 50%,
            transparent 100%
          );
          pointer-events: none;
        }
        .lp-img-panel-caption {
          position: absolute;
          bottom: 1.2rem;
          left: 1.2rem;
          right: 1.2rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(200,221,240,0.65);
        }

        /* ── Wide image band ── */
        .lp-img-band {
          margin: 0 2.5rem;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          height: 320px;
          border: 1px solid rgba(30,45,72,0.5);
          box-shadow: 0 4px 32px rgba(0,0,0,0.4);
        }
        .lp-img-band img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 55%;
          display: block;
          filter: brightness(0.72) saturate(0.85);
        }
        .lp-img-band-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(6,9,15,0.82) 0%,
            rgba(6,9,15,0.3) 40%,
            rgba(6,9,15,0.1) 100%
          );
        }
        .lp-img-band-text {
          position: absolute;
          top: 50%;
          left: 3.5rem;
          transform: translateY(-50%);
          max-width: 380px;
        }
        .lp-img-band-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 0.7rem;
        }
        .lp-img-band-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.3rem, 2.5vw, 1.75rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.25;
          color: #e8edf4;
          margin-bottom: 1.2rem;
        }
        @media (max-width: 900px) {
          .lp-img-band { height: 260px; margin: 0 1.25rem; }
          .lp-img-band-text { left: 2rem; }
        }
        @media (max-width: 580px) {
          .lp-img-band { height: 220px; }
          .lp-img-band-text { left: 1.5rem; max-width: 280px; }
        }
        .lp-intro-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 1.2rem;
        }
        .lp-intro-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.025em;
          color: #e8edf4;
          margin-bottom: 1.4rem;
        }
        .lp-intro-body {
          font-size: 0.95rem;
          color: #6b8499;
          line-height: 1.8;
        }
        .lp-intro-body p + p { margin-top: 0.9rem; }

        .lp-intro-features {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .lp-feature-row {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.2rem 1.4rem;
          background: rgba(15,26,46,0.5);
          border: 1px solid rgba(30,45,72,0.7);
          border-radius: 8px;
          transition: border-color 0.2s, background 0.2s;
        }
        .lp-feature-row:hover {
          border-color: rgba(16,185,129,0.2);
          background: rgba(16,185,129,0.03);
        }
        .lp-feature-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-feature-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: #c8ddf0;
          margin-bottom: 0.2rem;
        }
        .lp-feature-desc {
          font-size: 0.78rem;
          color: #4f6880;
          line-height: 1.55;
        }

        /* ── Section divider ── */
        .lp-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(30,45,72,0.8), transparent);
          margin: 0 2.5rem;
        }

        /* ── Section heading ── */
        .lp-section-head {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .lp-section-head .lp-intro-label { margin-bottom: 0.8rem; }
        .lp-section-head h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.5rem, 2.8vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #e8edf4;
          margin-bottom: 0.7rem;
        }
        .lp-section-head p {
          font-size: 0.92rem;
          color: #5c7a92;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Navigation cards ── */
        .lp-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .lp-nav-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding: 1.6rem 1.75rem;
          background: rgba(11,17,28,0.7);
          border: 1px solid rgba(30,45,72,0.8);
          border-radius: 10px;
          text-decoration: none;
          overflow: hidden;
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.25s ease, box-shadow 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        /* accent line top */
        .lp-nav-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--card-accent, #10b981), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        /* subtle inner shine */
        .lp-nav-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.012) 0%, transparent 55%);
          pointer-events: none;
        }

        .lp-nav-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(15,24,42,0.9);
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.2);
        }
        .lp-nav-card:hover::before { opacity: 1; }

        .lp-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.25s;
        }

        .lp-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #c8ddf0;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .lp-card-line {
          font-size: 0.78rem;
          color: #4a6275;
          line-height: 1.55;
          flex: 1;
        }
        .lp-card-arrow {
          align-self: flex-end;
          opacity: 0.35;
          transition: opacity 0.2s, transform 0.2s;
        }
        .lp-nav-card:hover .lp-card-arrow {
          opacity: 0.7;
          transform: translateX(3px);
        }

        /* ── Footer ── */
        .lp-footer {
          border-top: 1px solid rgba(20,30,50,0.9);
          background: rgba(5,8,14,0.9);
          padding: 2.2rem 2.5rem;
        }
        .lp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .lp-footer-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.82rem;
          color: #3d5568;
          letter-spacing: 0.03em;
        }
        .lp-footer-brand span { color: #10b981; opacity: 0.6; }
        .lp-footer-phrase {
          font-size: 0.68rem;
          color: #2a3d50;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .lp-footer-copy {
          font-size: 0.68rem;
          color: #273342;
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(5px); }
        }

        /* ── Scroll-reveal utility ── */
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .lp-intro-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .lp-img-panel { aspect-ratio: 16/9; }
          .lp-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-pillars { flex-wrap: wrap; }
          .lp-pillar { flex: 1 1 50%; border-right: none; border-bottom: 1px solid rgba(30,45,72,0.5); }
          .lp-nav-links { display: none; }
        }
        @media (max-width: 580px) {
          .lp-cards-grid { grid-template-columns: 1fr; }
          .lp-nav { padding: 0 1.25rem; }
          .lp-section { padding: 4rem 1.25rem; }
          .lp-hero { padding-bottom: 4rem; }
          .lp-pillar { flex: 1 1 100%; }
        }
      `}</style>

      <div className="lp-root">

        {/* ── STICKY NAV ── */}
        <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
          <Link href="/" className="lp-brand">
            <div className="lp-brand-mark">GC</div>
            <div className="lp-brand-name">GREENCONSTRUCT<span>AI</span></div>
          </Link>

          <ul className="lp-nav-links">
            <li><Link href="/materials">Materials</Link></li>
            <li><Link href="/plan-analyzer">Plan Analyzer</Link></li>
            <li><Link href="/materials/report">Reports</Link></li>
            <li><Link href="/feedback">User Feedback</Link></li>
          </ul>

          <Link href="/materials" className="lp-nav-cta">Begin</Link>
        </nav>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── HERO SECTION ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section className="lp-hero" ref={heroRef}>
          <div className="lp-hero-bg" aria-hidden="true" />
          <div className="lp-hero-overlay" aria-hidden="true" />
          <div className="lp-hero-grid" aria-hidden="true" />

          <div className="lp-hero-content">

            {/* Eyebrow pill */}
            <div className="lp-eyebrow">
              <div className="lp-eyebrow-dot" aria-hidden="true" />
              Sri Lankan Construction Intelligence Platform
            </div>

            {/* Title */}
            <h1 className="lp-hero-title">
              Engineering decisions,<br />
              <span className="accent">climate-aware.</span>
            </h1>

            {/* Sub-line */}
            <p className="lp-hero-sub">
              GreenConstructAI pairs AI-assisted material science with climate data
              across Sri Lanka's 14 micro-zones — delivering explainable, standards-backed
              recommendations for serious construction decisions.
            </p>

            {/* CTA buttons */}
            <div className="lp-hero-actions">
              <Link href="/materials" className="btn-primary-lp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Start Material Recommendation
              </Link>
              <Link href="/plan-analyzer" className="btn-ghost-lp">
                Analyze a Floor Plan
              </Link>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="lp-scroll-cue" aria-hidden="true">
            <span>Explore</span>
            <div className="lp-scroll-chevron" />
          </div>
        </section>

        {/* ── PILLARS STRIP ── */}
        <div className="lp-pillars">
          {PILLARS.map((p, i) => (
            <div key={i} className="lp-pillar">
              <div className="lp-pillar-label">{p.label}</div>
              <div className="lp-pillar-sub">{p.sub}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── PRODUCT INTRODUCTION ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="lp-section">
            <div className="lp-intro-grid">
              {/* Left: prose */}
              <div>
                <div className="lp-intro-label">What it does</div>
                <h2 className="lp-intro-heading">
                  Research-grade intelligence for every material decision
                </h2>
                <div className="lp-intro-body">
                  <p>
                    Construction material choice is a high-stakes engineering judgement — one that
                    intersects climate resilience, structural performance, service life, embodied
                    carbon, and local availability. GreenConstructAI makes that judgement tractable.
                  </p>
                  <p>
                    Built specifically for Sri Lankan context, the system combines a calibrated
                    multi-attribute decision engine with computer vision plan analysis and
                    explainable AI outputs — so engineers and researchers understand exactly why
                    each recommendation was made.
                  </p>
                </div>
              </div>

              {/* Centre: feature image panel */}
              <div className="lp-img-panel">
                <img
                  src="/lp-feature.png"
                  alt="Materials and blueprint architectural composition"
                  loading="lazy"
                />
                <div className="lp-img-panel-overlay" aria-hidden="true" />
                <div className="lp-img-panel-caption">
                  Materials · Blueprints · Climate Intelligence
                </div>
              </div>

              {/* Right: capability tiles */}
              <div className="lp-intro-features">
                {[
                  {
                    icon: "🧠",
                    bg: "rgba(16,185,129,0.08)",
                    title: "AI-assisted material recommendation",
                    desc: "Hybrid ML + deterministic scoring across structural, climate, sustainability, and cost dimensions.",
                  },
                  {
                    icon: "🌦",
                    bg: "rgba(56,189,248,0.07)",
                    title: "Climate-aware building decisions",
                    desc: "Zone-specific data for 14 micro-climates — coastal humidity, highland thermal, monsoon resilience.",
                  },
                  {
                    icon: "📐",
                    bg: "rgba(129,140,248,0.07)",
                    title: "Floor plan & blueprint analysis",
                    desc: "Upload architectural drawings for automated parameter extraction and spatial compliance checking.",
                  },
                  {
                    icon: "🔍",
                    bg: "rgba(245,158,11,0.07)",
                    title: "Fully explainable outputs",
                    desc: "Every score component is visible. No black boxes — engineering reasoning exposed at every step.",
                  },
                ].map((f, i) => (
                  <div key={i} className="lp-feature-row">
                    <div className="lp-feature-icon" style={{ background: f.bg, fontSize: '1.1rem' }}>
                      {f.icon}
                    </div>
                    <div>
                      <div className="lp-feature-title">{f.title}</div>
                      <div className="lp-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── CINEMATIC IMAGE BAND ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div style={{ paddingBottom: '0', maxWidth: '1200px', margin: '0 auto 3rem' }}>
            <div className="lp-img-band">
              <img
                src="/lp-hero.png"
                alt="Aerial construction site in Sri Lanka at dusk"
                loading="lazy"
              />
              <div className="lp-img-band-overlay" aria-hidden="true" />
              <div className="lp-img-band-text">
                <div className="lp-img-band-label">Built for Sri Lankan construction</div>
                <div className="lp-img-band-heading">
                  14 micro-climate zones.<br />One intelligent platform.
                </div>
                <Link href="/materials" className="btn-primary-lp" style={{ fontSize: '0.8rem', padding: '0.65rem 1.3rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Start Recommendation
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="lp-rule" />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── NAVIGATION CARDS ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="lp-section">
            <div className="lp-section-head">
              <div className="lp-intro-label">Enter the system</div>
              <h2>Choose your entry point</h2>
              <p>Each module provides a dedicated view into the platform's intelligence layer.</p>
            </div>

            <div className="lp-cards-grid">
              {NAV_CARDS.map((card, i) => (
                <Link
                  key={i}
                  href={card.href}
                  className="lp-nav-card"
                  style={{ '--card-accent': card.accent }}
                >
                  <div
                    className="lp-card-icon"
                    style={{
                      background: `${card.accent}14`,
                      color: card.accent,
                      border: `1px solid ${card.accent}28`,
                    }}
                  >
                    {card.icon}
                  </div>

                  <div>
                    <div className="lp-card-title">{card.title}</div>
                    <div className="lp-card-line" style={{ marginTop: '0.35rem' }}>{card.line}</div>
                  </div>

                  <div className="lp-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={card.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TRUST STATEMENT ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div style={{ padding: '0 2.5rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              background: 'rgba(10,16,28,0.6)',
              border: '1px solid rgba(30,45,72,0.7)',
              borderRadius: '12px',
              padding: '2.8rem 3.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle green glimmer */}
              <div style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '300px',
                height: '100%',
                background: 'radial-gradient(ellipse at right top, rgba(16,185,129,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ maxWidth: '520px' }}>
                <div className="lp-intro-label" style={{ marginBottom: '0.6rem' }}>Built for research & practice</div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#c8ddf0',
                  lineHeight: 1.45,
                  letterSpacing: '-0.015em',
                }}>
                  Grounded in SLS 134 & SLS 139 standards,
                  calibrated on Sri Lankan construction data,
                  and designed for transparency.
                </div>
              </div>

              <Link href="/materials" className="btn-primary-lp" style={{ flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Begin Analysis
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              GREENCONSTRUCT<span>AI</span>
            </div>
            <div className="lp-footer-phrase">
              Intelligent sustainable engineering for Sri Lanka
            </div>
            <div className="lp-footer-copy">
              © 2026 · Research Edition v2.0
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ─── Scroll-reveal wrapper component ───────────────────── */
function ScrollReveal({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
