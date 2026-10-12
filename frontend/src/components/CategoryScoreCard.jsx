import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export default function CategoryScoreCard({ category }) {
  const [expanded, setExpanded] = useState(false);

  if (!category) return null;

  const pct = category.percentage;
  let barColor = 'var(--color-primary)';
  if (category.status === 'strong') barColor = 'var(--color-success)';
  else if (category.status === 'moderate') barColor = 'var(--color-primary)';
  else if (category.status === 'weak') barColor = 'var(--color-warning)';
  else if (category.status === 'unavailable') barColor = 'var(--color-text-muted)';

  return (
    <div className="card" style={{
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'box-shadow var(--transition-fast)',
    }}>
      <div>
        {/* Header: Title and Points */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {category.title}
          </h4>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {category.earned_points} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>/ {category.max_points} pts</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: 'var(--space-3)',
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s ease',
          }} />
        </div>

        {/* Interpretation */}
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 'var(--space-3)' }}>
          {category.interpretation}
        </p>
      </div>

      {/* Accordion Toggle for Checks */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            padding: 'var(--space-1) 0',
            fontSize: '12px',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            cursor: 'pointer',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: 'var(--space-2)',
          }}
        >
          <span>{expanded ? 'Hide evidence' : `View ${category.checks.length} checks`}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Expanded Checklist */}
        {expanded && (
          <div style={{
            marginTop: 'var(--space-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}>
            {category.checks.map((check) => {
              let Icon = Check;
              let iconColor = 'var(--color-success)';

              if (check.status === 'passed') {
                Icon = Check;
                iconColor = 'var(--color-success)';
              } else if (check.status === 'warning') {
                Icon = AlertTriangle;
                iconColor = 'var(--color-warning)';
              } else if (check.status === 'failed') {
                Icon = XCircle;
                iconColor = 'var(--color-error)';
              } else {
                Icon = HelpCircle;
                iconColor = 'var(--color-text-muted)';
              }

              return (
                <div key={check.id} style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-bg-page)',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      <Icon size={12} color={iconColor} />
                      <span>{check.title}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {check.earned_points}/{check.max_points}
                    </span>
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                    {check.explanation}
                  </div>
                  {check.evidence && (
                    <div style={{ color: 'var(--color-text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                      Evidence: {check.evidence}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
