import React, { useState } from 'react';
import { GitCompare, ArrowRight, ShieldCheck, Check, AlertTriangle, Layers, Info } from 'lucide-react';
import { api } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Compare() {
  const [url1, setUrl1] = useState('https://github.com/fastapi/fastapi');
  const [url2, setUrl2] = useState('https://github.com/pallets/flask');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!url1.trim() || !url2.trim()) {
      setError('Please provide two valid GitHub repository URLs to compare.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.compareRepositories(url1.trim(), url2.trim());
      setComparisonResult(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Compare Repositories
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          Evaluate two open-source projects side-by-side across observable maintenance, documentation, and activity dimensions.
        </p>
      </div>

      {/* Comparison Form */}
      <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <form onSubmit={handleCompare}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Repository 1
              </label>
              <input
                type="text"
                placeholder="https://github.com/owner/repo"
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                style={{ width: '100%', height: '42px', fontSize: '13px' }}
                disabled={isLoading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Repository 2
              </label>
              <input
                type="text"
                placeholder="https://github.com/owner/repo"
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                style={{ width: '100%', height: '42px', fontSize: '13px' }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Preset: FastAPI vs. Flask (Python Web Frameworks)
            </span>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ padding: '0 var(--space-6)', height: '42px', fontSize: '13px' }}
            >
              <GitCompare size={16} />
              {isLoading ? 'Comparing Repositories...' : 'Run Side-by-Side Comparison'}
            </button>
          </div>
        </form>
      </div>

      {isLoading && <LoadingState repoUrl={`${url1} vs ${url2}`} />}
      {error && !isLoading && <ErrorState error={error} onRetry={handleCompare} />}

      {/* Comparison Results */}
      {comparisonResult && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Summary Narrative Banner */}
          <div className="card" style={{
            backgroundColor: 'var(--color-primary-surface)',
            borderColor: 'var(--color-primary-border)',
            padding: 'var(--space-5)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
          }}>
            <Info size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-hover)', marginBottom: '4px' }}>
                Comparative Summary & Nuance
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                {comparisonResult.comparison_summary}
              </p>
            </div>
          </div>

          {/* Aligned Cards Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {/* Repo 1 Overview */}
            <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Repository 1
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {comparisonResult.repo_1.metadata.full_name}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
                    {comparisonResult.repo_1.summary.overall_score}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>/ 100 Health</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Language:</span>
                  <strong>{comparisonResult.repo_1.metadata.language || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Stars:</span>
                  <strong>{comparisonResult.repo_1.metadata.stars_count.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Open Issues:</span>
                  <strong>{comparisonResult.repo_1.metadata.open_issues_count.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Commits in Last 30d:</span>
                  <strong>{comparisonResult.repo_1.commits.commits_last_30_days}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>License:</span>
                  <strong>{comparisonResult.repo_1.metadata.license_spdx || 'None'}</strong>
                </div>
              </div>
            </div>

            {/* Repo 2 Overview */}
            <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Repository 2
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {comparisonResult.repo_2.metadata.full_name}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
                    {comparisonResult.repo_2.summary.overall_score}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>/ 100 Health</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Language:</span>
                  <strong>{comparisonResult.repo_2.metadata.language || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Stars:</span>
                  <strong>{comparisonResult.repo_2.metadata.stars_count.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Open Issues:</span>
                  <strong>{comparisonResult.repo_2.metadata.open_issues_count.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Commits in Last 30d:</span>
                  <strong>{comparisonResult.repo_2.commits.commits_last_30_days}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>License:</span>
                  <strong>{comparisonResult.repo_2.metadata.license_spdx || 'None'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Category by Category Table */}
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-4)' }}>
              Category Points Comparison
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px' }}>Category</th>
                    <th style={{ padding: '10px 14px' }}>Max Pts</th>
                    <th style={{ padding: '10px 14px' }}>{comparisonResult.repo_1.metadata.full_name}</th>
                    <th style={{ padding: '10px 14px' }}>{comparisonResult.repo_2.metadata.full_name}</th>
                    <th style={{ padding: '10px 14px' }}>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResult.repo_1.categories.map((cat1) => {
                    const cat2 = comparisonResult.repo_2.categories.find((c) => c.category_id === cat1.category_id) || { earned_points: 0 };
                    const delta = Math.round((cat1.earned_points - cat2.earned_points) * 10) / 10;

                    return (
                      <tr key={cat1.category_id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {cat1.title}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                          {cat1.max_points}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {cat1.earned_points}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {cat2.earned_points}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            fontWeight: 600,
                            color: delta > 0 ? 'var(--color-success)' : delta < 0 ? 'var(--color-error)' : 'var(--color-text-secondary)',
                          }}>
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
