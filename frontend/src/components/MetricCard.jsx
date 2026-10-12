import React from 'react';

export default function MetricCard({ label, value, icon: Icon, subtitle, tone = 'neutral' }) {
  let iconBg = 'var(--color-bg-page)';
  let iconColor = 'var(--color-text-secondary)';

  if (tone === 'teal') {
    iconBg = 'var(--color-primary-surface)';
    iconColor = 'var(--color-primary)';
  } else if (tone === 'positive') {
    iconBg = 'var(--color-success-bg)';
    iconColor = 'var(--color-success)';
  } else if (tone === 'warning') {
    iconBg = 'var(--color-warning-bg)';
    iconColor = 'var(--color-warning)';
  }

  return (
    <div className="card" style={{
      padding: 'var(--space-4)',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
    }}>
      {Icon && (
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}>
          <Icon size={18} />
        </div>
      )}

      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-text-main)',
          marginTop: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
