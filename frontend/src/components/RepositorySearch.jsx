import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function RepositorySearch({ onAnalyze, isLoading, initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl);
  const [validationError, setValidationError] = useState('');

  const sampleRepos = [
    { name: 'fastapi/fastapi', label: 'FastAPI' },
    { name: 'pallets/flask', label: 'Flask' },
    { name: 'facebook/react', label: 'React' },
    { name: 'expressjs/express', label: 'Express' },
  ];

  const validateUrl = (value) => {
    if (!value || !value.trim()) {
      return 'Please enter a GitHub repository URL or owner/repo format.';
    }
    const clean = value.trim().replace(/\.git\/?$/, '').replace(/\/$/, '');
    const match = clean.match(/^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
    if (!match) {
      return 'Invalid repository format. Please enter a valid URL like https://github.com/owner/repository';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateUrl(url);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onAnalyze(url.trim());
  };

  const handleSelectSample = (repoPath) => {
    const fullUrl = `https://github.com/${repoPath}`;
    setUrl(fullUrl);
    setValidationError('');
    onAnalyze(fullUrl);
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)', backgroundColor: '#FFFFFF' }}>
      <form onSubmit={handleSubmit}>
        <label 
          htmlFor="repo-search-input"
          style={{ 
            display: 'block', 
            fontSize: '13px', 
            fontWeight: 600, 
            color: 'var(--color-text-main)', 
            marginBottom: 'var(--space-2)' 
          }}
        >
          GitHub Repository URL
        </label>

        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-text-muted)' 
              }} 
            />
            <input
              id="repo-search-input"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="https://github.com/owner/repository"
              disabled={isLoading}
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '12px',
                height: '44px',
                fontSize: '14px',
                borderColor: validationError ? 'var(--color-error)' : 'var(--color-border)',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{
              height: '44px',
              padding: '0 var(--space-6)',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            {isLoading ? (
              <>Analyzing...</>
            ) : (
              <>
                Analyze Repository
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Inline Validation Error */}
        {validationError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            fontSize: '13px',
            color: 'var(--color-error)',
          }}>
            <AlertCircle size={14} />
            <span>{validationError}</span>
          </div>
        )}
      </form>

      {/* Quick Sample Suggestions */}
      <div style={{
        marginTop: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          <Sparkles size={13} color="var(--color-primary)" />
          <span>Quick Samples:</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sampleRepos.map((sample) => (
            <button
              key={sample.name}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSample(sample.name)}
              style={{
                background: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                fontSize: '12px',
                color: 'var(--color-text-main)',
                cursor: 'pointer',
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
