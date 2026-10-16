import { useState } from 'react';

const VISIBLE_UNAPPROVED_LIMIT = 3;

export default function ApprovalChecklist({ items }) {
  const [showAllChecks, setShowAllChecks] = useState(false);

  if (!items || items.length === 0) return null;

  const approvedChecks = items.filter((item) => item.status === 'pass');
  const failedChecks = items.filter((item) => item.status === 'fail');
  const manualReviewChecks = items.filter((item) => item.status === 'not_verifiable');
  const unapprovedChecks = items.filter((item) => item.status !== 'pass');
  const visibleUnapprovedChecks = showAllChecks
    ? unapprovedChecks
    : unapprovedChecks.slice(0, VISIBLE_UNAPPROVED_LIMIT);
  const hiddenUnapprovedCount = Math.max(unapprovedChecks.length - VISIBLE_UNAPPROVED_LIMIT, 0);
  const visibleChecks = [...approvedChecks, ...visibleUnapprovedChecks];

  return (
    <div className="approval-checklist-container">
      <div className="approval-checklist-header">
        <div>
          <span style={{ fontSize: '0.68rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: 'uppercase', color: '#143825', letterSpacing: '0.08em' }}>
            REGULATORY VERIFICATION
          </span>
          <h3 style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#143825', margin: '0.2rem 0 0' }}>
            UDA Building Compliance Checklist
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="compliance-badge-pill is-ok">
            ✓ {approvedChecks.length} Passed
          </span>
          {failedChecks.length > 0 && (
            <span className="compliance-badge-pill is-fail">
              ✗ {failedChecks.length} Failed
            </span>
          )}
          {manualReviewChecks.length > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.65rem',
              borderRadius: '3px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#92400E',
            }}>
              ! {manualReviewChecks.length} Manual Review
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visibleChecks.map((item) => {
          const isPass = item.status === 'pass';
          const isFail = item.status === 'fail';
          const itemClass = isPass ? 'pass' : isFail ? 'fail' : 'review';
          const icon = isPass ? '✓' : isFail ? '✗' : '!';

          return (
            <div key={item.item_no} className={`approval-check-item ${itemClass}`}>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: '0.85rem',
                minWidth: '20px',
                textAlign: 'center',
                color: isPass ? '#065F46' : isFail ? '#B85C43' : '#92400E',
              }}>
                {icon}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.84rem', color: '#143825' }}>
                  {item.item_no}. {item.question}
                </p>
                {item.insight && (
                  <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#526158', lineHeight: 1.45 }}>
                    {item.insight}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {unapprovedChecks.length > VISIBLE_UNAPPROVED_LIMIT && (
        <div style={{
          marginTop: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: '#92400E',
        }}>
          <span>
            {showAllChecks
              ? `All ${unapprovedChecks.length} items requiring review are shown`
              : `+ ${hiddenUnapprovedCount} additional checks require review`}
          </span>
          <button
            type="button"
            onClick={() => setShowAllChecks((prev) => !prev)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '3px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: '#FFFFFF',
              color: '#92400E',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.70rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {showAllChecks ? 'Show Fewer Checks' : 'Show All Checks'}
          </button>
        </div>
      )}
    </div>
  );
}
