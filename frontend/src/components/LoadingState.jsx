import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function LoadingState({ repoUrl }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Connecting to GitHub REST API endpoints...',
    'Fetching commits, pull requests, and issue history...',
    'Analyzing README structure and documentation sections...',
    'Evaluating contributor distribution and bus factor...',
    'Synthesizing deterministic health score and recommendations...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
      {/* Progress Box */}
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
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-3)',
        }}>
          <Loader2 size={24} className="spin-animation" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Analyzing Repository Health
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Evaluating real observable indicators for <strong>{repoUrl || 'repository'}</strong>
        </p>

        {/* Step List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          maxWidth: '460px',
          textAlign: 'left',
          fontSize: '12px',
        }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: isCompleted
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-text-muted)',
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={14} color="var(--color-success)" />
                ) : isCurrent ? (
                  <Loader2 size={14} className="spin-animation" color="var(--color-primary)" />
                ) : (
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--color-border)', display: 'inline-block' }} />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle Skeleton Placeholder Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
        opacity: 0.5,
      }}>
        <div className="card" style={{ height: '140px', backgroundColor: '#FFFFFF' }} />
        <div className="card" style={{ height: '140px', backgroundColor: '#FFFFFF' }} />
        <div className="card" style={{ height: '140px', backgroundColor: '#FFFFFF' }} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
