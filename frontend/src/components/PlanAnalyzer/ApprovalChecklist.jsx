const STATUS_STYLE = {
  pass:           { icon: '✓', class: 'bg-brand-green-dim border-brand-green-border text-brand-green' },
  fail:           { icon: '✗', class: 'bg-brand-red-dim border-brand-red-border text-brand-red' },
  not_verifiable: { icon: '⚠', class: 'bg-brand-amber-dim border-brand-amber-border text-brand-amber' },
};

export default function ApprovalChecklist({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-eco-card backdrop-blur border border-eco-border rounded-card shadow-card p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-ink-primary flex items-center gap-2">
          📋 Approval Checklist
        </h2>
        <span className="text-xs font-heading text-ink-muted">
          {items.filter(i => i.status === 'pass').length} passed · {items.filter(i => i.status === 'fail').length} failed ·{' '}
          {items.filter(i => i.status === 'not_verifiable').length} need manual review
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map(item => {
          const style = STATUS_STYLE[item.status] || STATUS_STYLE.not_verifiable;
          return (
            <div
              key={item.item_no}
              className={`flex items-start gap-3 rounded-inner border px-4 py-3 ${style.class}`}
            >
              <span className="text-base leading-none mt-0.5">{style.icon}</span>
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
    </div>
  );
}
