import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  GitFork, 
  CircleDot, 
  Code, 
  ExternalLink, 
  Calendar, 
  Scale, 
  CheckCircle2, 
  HelpCircle,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import RepositorySearch from '../components/RepositorySearch';
import HealthScoreCard from '../components/HealthScoreCard';
import CategoryScoreCard from '../components/CategoryScoreCard';
import MetricCard from '../components/MetricCard';
import CommitActivityChart from '../components/CommitActivityChart';
import InsightsPanel from '../components/InsightsPanel';
import RecommendationsPanel from '../components/RecommendationsPanel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { api } from '../services/api';
import { historyStorage } from '../services/historyStorage';

export default function Dashboard({ currentAnalysis, setCurrentAnalysis }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchUrl, setSearchUrl] = useState('');

  const handleAnalyze = async (url) => {
    setSearchUrl(url);
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.analyzeRepository(url);
      setCurrentAnalysis(data);
      historyStorage.saveAnalysis(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = () => {
    navigate('/report');
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
          GitHub Project Health Analyzer
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Understand repository health through activity, documentation, and maintainability insights.
        </p>
      </div>

      {/* Prominent Search Input */}
      <RepositorySearch
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        initialUrl={searchUrl}
      />

      {/* Loading State */}
      {isLoading && <LoadingState repoUrl={searchUrl} />}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState
          error={error}
          onRetry={() => handleAnalyze(searchUrl)}
        />
      )}

      {/* Empty State (Before first analysis) */}
      {!currentAnalysis && !isLoading && !error && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <div className="card" style={{
            backgroundColor: '#FFFFFF',
            padding: 'var(--space-8)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-surface)',
              border: '1px solid var(--color-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              <Shield size={26} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-2)' }}>
              Deterministic, Observable Repository Evaluation
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '580px', lineHeight: 1.5, marginBottom: 'var(--space-6)' }}>
              Enter any public GitHub repository to calculate an explainable health score out of 100 based on commit cadence, documentation completeness, issue resolution patterns, contributor distribution, and community governance.
            </p>

            {/* 5 Evaluated Categories Pillars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
              width: '100%',
              maxWidth: '960px',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
            }}>
              {[
                { title: '1. Maintenance & Activity', pts: '25 pts', desc: 'Commit recency, 90-day cadence, and consistency' },
                { title: '2. Documentation', pts: '20 pts', desc: 'README substance, install steps, usage, contributing' },
                { title: '3. Issues & Pull Requests', pts: '20 pts', desc: 'Resolution rates, PR lifecycle, backlog balance' },
                { title: '4. Contributor Activity', pts: '15 pts', desc: 'Community diversity and bus-factor distribution' },
                { title: '5. Repository Organization', pts: '20 pts', desc: 'Open license, tags, governance files, branch hygiene' },
              ].map((pillar, i) => (
                <div key={i} style={{
                  backgroundColor: 'var(--color-bg-page)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)' }}>{pillar.title}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>{pillar.pts}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>{pillar.desc}</p>
                </div>
              ))}
            </div>

            <div style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 'var(--space-4)',
              width: '100%',
              maxWidth: '680px',
            }}>
              <strong>Evaluation Disclaimer:</strong> The health score measures observable repository maintenance indicators. It does not certify code security, vulnerability absence, or architectural quality.
            </div>
          </div>
        </div>
      )}

      {/* Populated Dashboard Content */}
      {currentAnalysis && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
          {/* Repository Overview Header Card */}
          <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {currentAnalysis.metadata.full_name}
                  </h2>
                  {currentAnalysis.metadata.language && (
                    <span className="badge badge-teal">
                      <Code size={12} />
                      {currentAnalysis.metadata.language}
                    </span>
                  )}
                  {currentAnalysis.metadata.is_archived && (
                    <span className="badge badge-critical">Archived</span>
                  )}
                </div>

                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)', maxWidth: '780px' }}>
                  {currentAnalysis.metadata.description || 'No description provided.'}
                </p>

                {/* Topics */}
                {currentAnalysis.metadata.topics && currentAnalysis.metadata.topics.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                    {currentAnalysis.metadata.topics.slice(0, 6).map((topic) => (
                      <span key={topic} style={{
                        fontSize: '11px',
                        backgroundColor: 'var(--color-bg-page)',
                        color: 'var(--color-text-secondary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                      }}>
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <a
                  href={currentAnalysis.metadata.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  <ExternalLink size={14} />
                  View on GitHub
                </a>
                <button
                  onClick={handleViewReport}
                  className="btn-primary"
                  style={{ fontSize: '13px' }}
                >
                  Detailed Report
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Stars</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {currentAnalysis.metadata.stars_count.toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Forks</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {currentAnalysis.metadata.forks_count.toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Open Issues</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {currentAnalysis.metadata.open_issues_count.toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>License</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {currentAnalysis.metadata.license_spdx || currentAnalysis.metadata.license_name || 'None detected'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Last Push</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {currentAnalysis.metadata.pushed_at ? new Date(currentAnalysis.metadata.pushed_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Health Score Card */}
          <HealthScoreCard
            summary={currentAnalysis.summary}
            repoName={currentAnalysis.metadata.full_name}
            onOpenDetails={handleViewReport}
          />

          {/* Five Category Score Cards Grid */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-3)' }}>
              Category Breakdowns (100 Points Total)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-3)',
            }}>
              {currentAnalysis.categories.map((category) => (
                <CategoryScoreCard key={category.category_id} category={category} />
              ))}
            </div>
          </div>

          {/* Commit Activity Visualization */}
          <CommitActivityChart commits={currentAnalysis.commits} />

          {/* Two-Column Insights & Actionable Recommendations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            <InsightsPanel insights={currentAnalysis.insights} />
            <RecommendationsPanel recommendations={currentAnalysis.recommendations} />
          </div>
        </div>
      )}
    </div>
  );
}
