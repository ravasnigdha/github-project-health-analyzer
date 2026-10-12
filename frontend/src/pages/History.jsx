import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Search, Trash2, ArrowUpRight, ExternalLink, RefreshCw } from 'lucide-react';
import { historyStorage } from '../services/historyStorage';

export default function History({ setCurrentAnalysis }) {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setHistoryItems(historyStorage.getHistory());
  }, []);

  const handleOpenReport = (item) => {
    if (item.fullData) {
      setCurrentAnalysis(item.fullData);
      navigate('/report');
    } else {
      navigate(`/?url=${encodeURIComponent(item.htmlUrl)}`);
    }
  };

  const handleRemove = (fullName) => {
    const updated = historyStorage.removeHistoryItem(fullName);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local analysis history?')) {
      historyStorage.clearHistory();
      setHistoryItems([]);
    }
  };

  const filtered = historyItems.filter((item) =>
    item.fullName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Analysis History
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Locally stored repository assessments from your browser session.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-secondary"
            style={{ fontSize: '13px', color: 'var(--color-error)' }}
          >
            <Trash2 size={14} />
            Clear History
          </button>
        )}
      </div>

      {/* Filter Bar */}
      {historyItems.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)', position: 'relative', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Filter repositories..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '13px' }}
          />
        </div>
      )}

      {/* History Table or Empty State */}
      {historyItems.length === 0 ? (
        <div className="card" style={{
          backgroundColor: '#FFFFFF',
          padding: 'var(--space-8)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <HistoryIcon size={36} color="var(--color-text-muted)" style={{ marginBottom: 'var(--space-3)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 'var(--space-2)' }}>
            No Analysis History Found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '400px', marginBottom: 'var(--space-4)' }}>
            Repositories you analyze on the dashboard will appear here for rapid reference and re-analysis.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ fontSize: '13px' }}>
            Analyze a Repository
          </button>
        </div>
      ) : (
        <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--color-bg-page)',
                  borderBottom: '1px solid var(--color-border)',
                  textAlign: 'left',
                  color: 'var(--color-text-secondary)',
                  fontSize: '12px',
                }}>
                  <th style={{ padding: '10px 16px' }}>Repository</th>
                  <th style={{ padding: '10px 16px' }}>Health Score</th>
                  <th style={{ padding: '10px 16px' }}>Status Indicator</th>
                  <th style={{ padding: '10px 16px' }}>Analyzed On</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  let toneClass = 'badge-neutral';
                  if (item.score >= 85) toneClass = 'badge-positive';
                  else if (item.score >= 70) toneClass = 'badge-teal';
                  else if (item.score >= 50) toneClass = 'badge-warning';
                  else toneClass = 'badge-critical';

                  return (
                    <tr
                      key={item.fullName}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {item.fullName}
                        </div>
                        {item.language && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            {item.language}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {item.score}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}> / 100</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${toneClass}`}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                        {new Date(item.analyzedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenReport(item)}
                            className="btn-outline-primary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            title="Open detailed report"
                          >
                            Open Report
                            <ArrowUpRight size={13} />
                          </button>
                          <button
                            onClick={() => handleRemove(item.fullName)}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-text-muted)' }}
                            title="Delete from history"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
