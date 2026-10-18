import { useState } from 'react';

const VISIBLE_UNAPPROVED_LIMIT = 3;

const STATUS_STYLE = {
  pass: { icon: 'OK', class: 'bg-brand-green-dim border-brand-green-border text-brand-green' },
  fail: { icon: 'X', class: 'bg-brand-amber-dim border-brand-amber-border text-brand-amber' },
  not_verifiable: { icon: '!', class: 'bg-brand-amber-dim border-brand-amber-border text-brand-amber' },
};

export default function ApprovalChecklist({ items }) {
  const [showAllChecks, setShowAllChecks] = useState(false);

  if (!items || items.length === 0) return null;

  const approvedChecks = items.filter(item => item.status === 'pass');
  const failedChecks = items.filter(item => item.status === 'fail');
  const manualReviewChecks = items.filter(item => item.status === 'not_verifiable');
  const unapprovedChecks = items.filter(item => item.status !== 'pass');
  const visibleUnapprovedChecks = showAllChecks
    ? unapprovedChecks
    : unapprovedChecks.slice(0, VISIBLE_UNAPPROVED_LIMIT);
  const hiddenUnapprovedCount = Math.max(unapprovedChecks.length - VISIBLE_UNAPPROVED_LIMIT, 0);
  const visibleChecks = [...approvedChecks, ...visibleUnapprovedChecks];

  return (
    <div className="bg-eco-card backdrop-blur border border-eco-border rounded-card shadow-card p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-ink-primary flex items-center gap-2">
          Approval Checklist
        </h2>
        <span className="text-xs font-heading text-ink-muted">
          {approvedChecks.length} passed / {failedChecks.length} failed /{' '}
          {manualReviewChecks.length} need manual review
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {visibleChecks.map(item => {
          const style = STATUS_STYLE[item.status] || STATUS_STYLE.not_verifiable;
          return (
            <div
              key={item.item_no}
              className={`flex items-start gap-3 rounded-inner border px-4 py-3 ${style.class}`}
            >
              <span className="text-xs font-heading font-bold leading-none mt-0.5 min-w-5 text-center">{style.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-heading font-semibold text-ink-primary/90">
                  {item.item_no}. {item.question}
                </p>
                <p className="text-xs opacity-75 mt-0.5">{item.insight}</p>
              </div>
            </div>
          );
        })}
      </div>

      {unapprovedChecks.length > VISIBLE_UNAPPROVED_LIMIT && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-inner border border-brand-amber-border bg-brand-amber-dim px-4 py-3 text-brand-amber">
          <span className="text-sm font-heading font-semibold">
            {showAllChecks
              ? `All ${unapprovedChecks.length} checks requiring review are shown`
              : `+ ${hiddenUnapprovedCount} additional checks require review`}
          </span>
          <button
            type="button"
            onClick={() => setShowAllChecks(prev => !prev)}
            className="rounded-full border border-brand-amber-border bg-white/70 px-3 py-1 text-xs font-heading font-bold uppercase tracking-wide text-brand-amber transition hover:bg-white"
          >
            {showAllChecks ? 'Show fewer checks' : 'Show all checks'}
          </button>
        </div>
      )}
    </div>
  );
}
