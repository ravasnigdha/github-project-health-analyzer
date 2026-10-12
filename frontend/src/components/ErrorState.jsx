import React from 'react';
import { AlertCircle, RefreshCw, KeyRound, SearchX } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred during repository analysis.';
  const isRateLimit = errorMessage.toLowerCase().includes('rate limit');
  const isNotFound = errorMessage.toLowerCase().includes('not found') || error?.status === 404;

  let Icon = AlertCircle;
  let title = 'Analysis Failed';
  let suggestion = 'Please check the URL syntax and verify that the backend server is operational.';

  if (isRateLimit) {
    Icon = KeyRound;
    title = 'GitHub API Rate Limit Reached';
    suggestion = 'Unauthenticated GitHub API calls are capped at 60 per hour. Configure a personal access token (GITHUB_TOKEN) in backend/.env to enjoy 5,000 requests per hour, or wait for the quota to reset.';
  } else if (isNotFound) {
    Icon = SearchX;
    title = 'Repository Not Found';
    suggestion = 'The requested repository does not exist, has been renamed, or is private. Please confirm the owner and repository name.';
  }

  return (
    <div className="card" style={{
      backgroundColor: 'var(--color-error-bg)',
      borderColor: 'var(--color-error-border)',
      padding: 'var(--space-6)',
      marginTop: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-error)',
        marginBottom: 'var(--space-3)',
        border: '1px solid var(--color-error-border)',
      }}>
        <Icon size={22} />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>

      <p style={{ fontSize: '13px', color: 'var(--color-text-main)', maxWidth: '500px', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
        {errorMessage}
      </p>

      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '480px', lineHeight: 1.4, marginBottom: 'var(--space-4)' }}>
        {suggestion}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
          style={{ fontSize: '13px' }}
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}
