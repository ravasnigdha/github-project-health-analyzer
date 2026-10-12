import React, { useState, useEffect } from 'react';
import { Menu, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Header({ onMenuClick, currentRepo }) {
  const [rateLimit, setRateLimit] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const rl = await api.getRateLimit();
        if (isMounted) {
          setRateLimit(rl);
          setBackendHealthy(true);
        }
      } catch (e) {
        if (isMounted) {
          setBackendHealthy(false);
        }
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // 1 minute
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Mobile Menu + Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button
          onClick={onMenuClick}
          className="header-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            padding: 'var(--space-2)',
            color: 'var(--color-text-main)',
            borderRadius: 'var(--radius-md)',
          }}
          aria-label="Open navigation sidebar"
        >
          <Menu size={20} />
        </button>

        {currentRepo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Analyzing:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              {currentRepo}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
            GitHub Project Health Analyzer
          </div>
        )}
      </div>

      {/* Right: API Quota & Health Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {backendHealthy ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-bg-page)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
            }} />
            <span>API Online</span>
            {rateLimit && (
              <span style={{ color: 'var(--color-text-muted)' }}>
                • {rateLimit.remaining}/{rateLimit.limit} req left
              </span>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--color-error)',
            backgroundColor: 'var(--color-error-bg)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-error-border)',
          }}>
            <AlertCircle size={13} />
            <span>Backend Offline</span>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .header-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
