import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Shield, KeyRound, RefreshCw, CheckCircle2, Code2, Info } from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [rateLimit, setRateLimit] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');

  const loadInfo = async () => {
    try {
      const rl = await api.getRateLimit();
      setRateLimit(rl);
      const h = await api.getHealth();
      setHealthInfo(h);
    } catch (e) {
      console.warn('Error loading settings status info:', e);
    }
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const res = await api.clearCache();
      setCacheMessage(res.message || 'Cache flushed successfully.');
      await loadInfo();
      setTimeout(() => setCacheMessage(''), 4000);
    } catch (e) {
      alert('Failed to clear cache: ' + (e.message || e));
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Settings & About
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Application diagnostic status, GitHub API rate limits, cache management, and architecture.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* 1. API Quota & Rate Limits */}
        <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <KeyRound size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              GitHub REST API Quota Status
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            Monitors real-time API rate limits returned by GitHub response headers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Remaining Hourly Requests</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                {rateLimit ? `${rateLimit.remaining} / ${rateLimit.limit}` : 'Loading...'}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Authentication Mode</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '4px' }}>
                {rateLimit?.is_authenticated ? (
                  <span style={{ color: 'var(--color-success)' }}>Token Authenticated (5,000/hr)</span>
                ) : (
                  <span style={{ color: 'var(--color-text-secondary)' }}>Unauthenticated IP (60/hr)</span>
                )}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Reset Time</span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '4px' }}>
                {rateLimit?.reset_time_utc || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. In-Memory Cache Controls */}
        <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Database size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Cache Management
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', maxWidth: '640px' }}>
            The backend employs an in-memory TTL cache (15-minute expiration) to avoid redundant GitHub API queries and preserve rate-limiting quotas.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              <RefreshCw size={14} className={isClearingCache ? 'spin-animation' : ''} />
              {isClearingCache ? 'Flushing...' : 'Flush Backend Cache'}
            </button>

            {healthInfo && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Currently holding <strong>{healthInfo.cached_repos}</strong> cached repository analyses.
              </span>
            )}

            {cacheMessage && (
              <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                {cacheMessage}
              </span>
            )}
          </div>
        </div>

        {/* 3. Tech Stack & Architecture */}
        <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Code2 size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Architecture & Tech Stack
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
              <strong>Frontend Layer:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '6px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <li>React 18 with Vite bundling</li>
                <li>React Router v6 for client routing</li>
                <li>Recharts for responsive SVG commit trends</li>
                <li>Lucide React for consistent icons</li>
                <li>Custom CSS design system with strict tokens</li>
              </ul>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
              <strong>Backend Layer:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '6px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <li>Python 3.10+ with FastAPI framework</li>
                <li>Uvicorn high-performance ASGI server</li>
                <li>HTTPX async HTTP client with concurrent fetching</li>
                <li>Pydantic v2 for data schemas and validation</li>
                <li>Pytest test suite with mocked GitHub responses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Privacy & Data Handling */}
        <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Shield size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Privacy & Data Integrity
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            This application analyzes only public repository data accessed via official GitHub REST API endpoints. No GitHub personal access tokens are ever sent to or stored in client browser storage. Analysis history is retained purely in your local browser storage (<code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>localStorage</code>) and can be cleared at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
