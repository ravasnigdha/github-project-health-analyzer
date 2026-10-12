import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  RefreshCw,
  Download,
  Star,
  GitFork,
  CircleDot,
  Code,
  ShieldCheck,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  GitPullRequest,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';
import HealthScoreCard from '../components/HealthScoreCard';
import CategoryScoreCard from '../components/CategoryScoreCard';
import CommitActivityChart from '../components/CommitActivityChart';
import InsightsPanel from '../components/InsightsPanel';
import RecommendationsPanel from '../components/RecommendationsPanel';
import { api } from '../services/api';
import { historyStorage } from '../services/historyStorage';

export default function RepositoryReport({ currentAnalysis, setCurrentAnalysis }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!currentAnalysis) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{
          backgroundColor: '#FFFFFF',
          padding: 'var(--space-8)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <FileText size={36} color="var(--color-primary)" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-2)' }}>
            No Repository Report Loaded
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '440px', marginBottom: 'var(--space-4)' }}>
            Please select or analyze a public GitHub repository from the Dashboard to inspect its detailed evaluation report.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
            style={{ fontSize: '13px' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { metadata, summary, categories, commits, docs, issues_prs, contributors, recommendations, insights } = currentAnalysis;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.analyzeRepository(metadata.html_url);
      setCurrentAnalysis(data);
      historyStorage.saveAnalysis(data);
    } catch (e) {
      alert('Failed to refresh analysis: ' + (e.message || e));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentAnalysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${metadata.owner}-${metadata.repo}-health-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'commits', label: 'Commits & Activity' },
    { id: 'issues', label: 'Issues & PRs' },
    { id: 'contributors', label: 'Contributors' },
    { id: 'documentation', label: 'Documentation' },
    { id: 'recommendations', label: `Recommendations (${recommendations.length})` },
  ];

  return (
    <div className="page-wrapper">
      {/* Report Header */}
      <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {metadata.full_name}
              </h1>
              {metadata.language && (
                <span className="badge badge-teal">
                  <Code size={12} />
                  {metadata.language}
                </span>
              )}
              {currentAnalysis.from_cache && (
                <span className="badge badge-neutral">Cached Analysis</span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '720px' }}>
              {metadata.description || 'No description provided.'}
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span>Stars: <strong>{metadata.stars_count.toLocaleString()}</strong></span>
              <span>Forks: <strong>{metadata.forks_count.toLocaleString()}</strong></span>
              <span>Open Issues: <strong>{metadata.open_issues_count.toLocaleString()}</strong></span>
              <span>Created: <strong>{new Date(metadata.created_at).toLocaleDateString()}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Reanalyze'}
            </button>
            <button
              onClick={handleExportJson}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              <Download size={14} />
              Export JSON
            </button>
            <a
              href={metadata.html_url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ fontSize: '13px' }}
            >
              <ExternalLink size={14} />
              Open on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-6)',
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <HealthScoreCard summary={summary} repoName={metadata.full_name} />
          
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-3)' }}>
              Category Breakdowns
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-3)',
            }}>
              {categories.map((c) => (
                <CategoryScoreCard key={c.category_id} category={c} />
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            <InsightsPanel insights={insights} />
            <RecommendationsPanel recommendations={recommendations} />
          </div>
        </div>
      )}

      {/* TAB 2: COMMITS & ACTIVITY */}
      {activeTab === 'commits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <CommitActivityChart commits={commits} />

          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-4)' }}>
              Commit Recency & Cadence Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Days Since Last Commit</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {commits.days_since_last_commit !== null ? `${commits.days_since_last_commit} days` : 'No commits observed'}
                </span>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Last Commit Timestamp</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {commits.last_commit_date ? new Date(commits.last_commit_date).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Commits in Last 30 Days</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {commits.commits_last_30_days}
                </span>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>Commits in Last 90 Days</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {commits.commits_last_90_days}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ISSUES & PRS */}
      {activeTab === 'issues' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-4)' }}>
              Issue and Pull Request Separation
            </h3>

            {!issues_prs.issues_enabled ? (
              <div style={{
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-warning)',
                fontSize: '13px',
              }}>
                Issues are disabled on this repository by the maintainer.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Issues metrics */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', marginBottom: 'var(--space-3)' }}>
                    <CircleDot size={16} color="var(--color-primary)" />
                    <span>Issue Metrics</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Open Issues:</span>
                      <strong>{issues_prs.open_issues_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Closed Issues:</span>
                      <strong>{issues_prs.closed_issues_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Issue Resolution Rate:</span>
                      <strong>{issues_prs.issue_closure_rate !== null ? `${Math.round(issues_prs.issue_closure_rate * 100)}%` : 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Pull requests metrics */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', marginBottom: 'var(--space-3)' }}>
                    <GitPullRequest size={16} color="var(--color-primary)" />
                    <span>Pull Request Metrics</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Open PRs:</span>
                      <strong>{issues_prs.open_prs_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Merged PRs:</span>
                      <strong style={{ color: 'var(--color-success)' }}>{issues_prs.merged_prs_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Closed PRs:</span>
                      <strong>{issues_prs.closed_prs_count}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONTRIBUTORS */}
      {activeTab === 'contributors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-2)' }}>
              Community Diversity & Bus Factor
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Evaluating whether maintenance responsibility is shared or concentrated in a single contributor.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Total Contributors Sampled</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                  {contributors.total_contributors}
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Top Contributor Share</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  {contributors.top_contributor_share_percent}%
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Bus Factor Concentration</span>
                <div style={{ marginTop: '2px' }}>
                  <span className={`badge ${contributors.bus_factor_risk === 'low' ? 'badge-positive' : contributors.bus_factor_risk === 'moderate' ? 'badge-warning' : 'badge-critical'}`} style={{ textTransform: 'capitalize' }}>
                    {contributors.bus_factor_risk} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Top Contributors Table */}
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-3)' }}>
              Top Contributors
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '8px 12px' }}>Contributor</th>
                    <th style={{ padding: '8px 12px' }}>Commits</th>
                    <th style={{ padding: '8px 12px' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.top_contributors.map((c) => (
                    <tr key={c.login} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.login} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        ) : (
                          <Users size={18} color="var(--color-text-muted)" />
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{c.login}</span>
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--color-text-main)' }}>{c.contributions}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--color-primary)', fontWeight: 600 }}>{c.share_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTATION */}
      {activeTab === 'documentation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-2)' }}>
              README & Documentation Analysis
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Evaluating whether newcomers can install, execute, and contribute with clarity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>README Present</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: docs.has_readme ? 'var(--color-success)' : 'var(--color-error)', marginTop: '2px' }}>
                  {docs.has_readme ? 'Yes' : 'Missing'}
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Word Count</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                  {docs.word_count.toLocaleString()} words
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Code Examples</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: docs.has_code_examples ? 'var(--color-success)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                  {docs.has_code_examples ? 'Detected' : 'None'}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-3)' }}>
              Standard Section Checklist
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {docs.detected_sections.map((sec) => (
                <div key={sec.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-bg-page)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sec.detected ? (
                      <CheckCircle size={16} color="var(--color-success)" />
                    ) : (
                      <XCircle size={16} color="var(--color-error)" />
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{sec.name} Section</span>
                  </div>
                  <span style={{ fontSize: '12px', color: sec.detected ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {sec.detected ? (sec.evidence ? `Found (${sec.evidence})` : 'Detected') : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <RecommendationsPanel recommendations={recommendations} />
      )}
    </div>
  );
}
