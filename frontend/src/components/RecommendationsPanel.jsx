import React from 'react';
import { Target, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RecommendationsPanel({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card" style={{
        backgroundColor: '#FFFFFF',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-success-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-success)',
          marginBottom: 'var(--space-3)',
        }}>
          <CheckCircle2 size={24} />
        </div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          No Critical Action Items
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '420px' }}>
          This repository satisfies all evaluated documentation, licensing, maintenance cadence, and governance benchmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Target size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
            Actionable Maintainer Improvements
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {recommendations.length} {recommendations.length === 1 ? 'item' : 'items'} prioritized
        </span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        Deterministic steps to enhance developer experience, contributor onboarding, and project health:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {recommendations.map((rec) => {
          let badgeClass = 'badge-neutral';
          if (rec.priority === 'high') badgeClass = 'badge-critical';
          else if (rec.priority === 'medium') badgeClass = 'badge-warning';

          return (
            <div
              key={rec.id}
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              {/* Header: Title and Priority */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {rec.title}
                </h4>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {rec.category}
                  </span>
                  <span className={`badge ${badgeClass}`} style={{ textTransform: 'capitalize' }}>
                    {rec.priority} Priority
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <p style={{ fontSize: '13px', color: 'var(--color-text-main)', lineHeight: 1.4, marginBottom: 'var(--space-2)' }}>
                {rec.explanation}
              </p>

              {/* Supporting Evidence */}
              {rec.evidence && (
                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  marginBottom: 'var(--space-3)',
                  display: 'inline-block',
                }}>
                  <strong>Observed Evidence:</strong> {rec.evidence}
                </div>
              )}

              {/* Suggested Action */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                backgroundColor: 'var(--color-primary-surface)',
                border: '1px solid var(--color-primary-border)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--color-primary-hover)',
              }}>
                <ArrowRight size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--color-primary)' }} />
                <span>
                  <strong>Recommended Step:</strong> {rec.suggested_action}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
