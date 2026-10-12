import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function HealthScoreCard({ summary, repoName, onOpenDetails }) {
  if (!summary) return null;

  const score = summary.overall_score;

  // Determine color and icons based on score
  let strokeColor = '#0F766E'; // Teal
  let toneClass = 'badge-teal';
  let IconComponent = ShieldCheck;

  if (score >= 85) {
    strokeColor = '#15803D'; // Success green
    toneClass = 'badge-positive';
    IconComponent = CheckCircle2;
  } else if (score >= 70) {
    strokeColor = '#0F766E'; // Primary teal
    toneClass = 'badge-teal';
    IconComponent = ShieldCheck;
  } else if (score >= 50) {
    strokeColor = '#B45309'; // Warning amber
    toneClass = 'badge-warning';
    IconComponent = AlertTriangle;
  } else {
    strokeColor = '#B91C1C'; // Error red
    toneClass = 'badge-critical';
    IconComponent = AlertCircle;
  }

  // SVG circular progress calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card" style={{
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Assessment
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
            Repository Health Score
          </h3>
        </div>
        <div className={`badge ${toneClass}`}>
          <IconComponent size={13} />
          <span>{summary.status_label}</span>
        </div>
      </div>

      {/* Main Gauge & Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-2) 0',
      }}>
        {/* SVG Circular Ring */}
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="var(--color-border)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 'var(--font-size-score)',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              lineHeight: 1,
            }}>
              {score}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              / 100
            </span>
          </div>
        </div>

        {/* Narrative & Coverage */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-main)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
            {summary.short_explanation}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: summary.is_provisional ? 'var(--color-warning)' : 'var(--color-success)',
              }} />
              <span>
                {summary.is_provisional
                  ? `Provisional score (${summary.coverage_percentage}% data evaluated)`
                  : `Full assessment (${summary.coverage_percentage}% data evaluated)`}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-muted)' }}>
              Engine: {summary.scoring_version}
            </div>
          </div>
        </div>
      </div>

      {/* Footer action */}
      <div style={{
        marginTop: 'var(--space-4)',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          Calculated from 5 observable categories
        </span>
        {onOpenDetails ? (
          <button
            onClick={onOpenDetails}
            className="btn-outline-primary"
            style={{ padding: '4px 12px', fontSize: '12px' }}
          >
            Detailed Breakdown
            <ArrowUpRight size={14} />
          </button>
        ) : (
          <Link
            to="/report"
            className="btn-outline-primary"
            style={{ padding: '4px 12px', fontSize: '12px' }}
          >
            Detailed Breakdown
            <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
