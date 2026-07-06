"use client";
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

// Import Premium Dashboard Components
import ExecutiveHero from '@/components/Dashboard/ExecutiveHero';
import BlueprintPanel from '@/components/Dashboard/BlueprintPanel';
import ProjectOverview from '@/components/Dashboard/ProjectOverview';
import SustainabilityDashboard from '@/components/Dashboard/SustainabilityDashboard';
import FeatureImportance from '@/components/Dashboard/FeatureImportance';
import MaterialBreakdown from '@/components/Dashboard/MaterialBreakdown';
import AlternativesTable from '@/components/Dashboard/AlternativesTable';
import AuditLogPanel from '@/components/Dashboard/AuditLogPanel';

export default function ReportPage() {
  const { reportData } = useMaterial();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: 'var(--text-primary)' }}>
        <Header />
        <div style={{ padding: '2rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10vh' }}>
          <h2>Initializing Engineering Dashboard...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div className="premium-bg">
        <div className="gradient-mesh" />
        <div className="blueprint-grid" />
        <div className="topo-pattern" />
      </div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        {!reportData ? (
          <div style={{ padding: '2rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10vh', minHeight: '60vh' }}>
            <h2>Initializing Engineering Dashboard...</h2>
          </div>
        ) : (
          <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Section 1: Executive Summary Hero Banner (Spans Full Width at the top) */}
            <ExecutiveHero data={reportData} />
            
            {/* Split Grid Layout */}
            <div className="report-layout-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
              gap: '2rem',
              alignItems: 'start'
            }}>
              
              {/* Left Column - Main Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Blueprint Centerpiece (Interactive 2D floorplan) */}
                <BlueprintPanel data={reportData} />
                
                {/* Recommended Material Package Details */}
                <MaterialBreakdown data={reportData} />
              </div>

              {/* Right Column - Climate & XAI Metrics Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Project & Climate Details Info Table */}
                <ProjectOverview data={reportData} />
                
                {/* Engineering Intelligence KPIs */}
                <SustainabilityDashboard data={reportData} />
                
                {/* XAI: Feature Importance Chart */}
                <FeatureImportance data={reportData} />
                
                {/* Alternatives Material Comparison Accordion (Spotlight View) */}
                <AlternativesTable data={reportData} />
                
                {/* Technical Audit Trail Appendix */}
                <AuditLogPanel data={reportData} />
              </div>

            </div>
            
          </main>
        )}
        <Footer />
      </div>
    </div>
  );
}
