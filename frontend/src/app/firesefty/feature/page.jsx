'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { db } from '@/lib/db';
import { Eye, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    analyzing: 0,
    pending: 0,
    recentActivity: [],
  });

  useEffect(() => {
    const allSubmissions = db.getAllSubmissions();
    setSubmissions(allSubmissions);
    setStats(db.getStats());
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'text-primary bg-primary/10';
      case 'analyzing':
        return 'text-accent bg-accent/10';
      case 'submitted':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle size={16} />;
      case 'analyzing':
        return <Clock size={16} className="animate-spin" />;
      case 'submitted':
        return <FileText size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title="Dashboard"
          subtitle="Fire Safety Certification Overview"
        />

        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: 'Total Submissions', value: stats.total, color: 'bg-blue-900/20 border-blue-800' },
                { label: 'Completed', value: stats.completed, color: 'bg-green-900/20 border-primary' },
                { label: 'Analyzing', value: stats.analyzing, color: 'bg-amber-900/20 border-accent' },
                { label: 'Pending', value: stats.pending, color: 'bg-slate-900/20 border-border' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${stat.color}`}
                >
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold font-orbitron text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-primary bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron font-bold text-foreground">Ready to Submit?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a new fire safety certification submission for your building.
                  </p>
                </div>
                <Link
                  href="/submission/new"
                  className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  New Submission
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-orbitron font-bold text-foreground">Recent Submissions</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Building Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-border hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {submission.buildingInfo.buildingName}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {submission.buildingInfo.address}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                              submission.status
                            )}`}
                          >
                            {getStatusIcon(submission.status)}
                            {submission.status.charAt(0).toUpperCase() +
                              submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {submission.submittedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {submission.status === 'complete' ? (
                            <Link
                              href={`/results/${submission.id}`}
                              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <Eye size={14} />
                              View Results
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
