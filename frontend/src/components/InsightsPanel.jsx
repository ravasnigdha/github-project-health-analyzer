import React from 'react';
import { Lightbulb, CheckCircle2, Info } from 'lucide-react';

export default function InsightsPanel({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Lightbulb size={18} color="var(--color-primary)" />
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
          Observed Project Insights
        </h3>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        Key signals synthesized directly from repository telemetry and configuration data:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              backgroundColor: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--color-text-main)',
            }}
          >
            <CheckCircle2 size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ lineHeight: 1.4 }}>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
