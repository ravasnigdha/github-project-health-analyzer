import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Calendar, GitCommit } from 'lucide-react';

export default function CommitActivityChart({ commits }) {
  const [period, setPeriod] = useState('30d'); // '30d', '90d', '180d'

  if (!commits) return null;

  let data = commits.timeline_30d || [];
  let periodLabel = 'Daily (Past 30 Days)';

  if (period === '90d') {
    data = commits.timeline_90d || [];
    periodLabel = 'Weekly (Past 90 Days)';
  } else if (period === '180d') {
    data = commits.timeline_180d || [];
    periodLabel = 'Bi-weekly (Past 180 Days)';
  }

  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '12px',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>
            {payload[0].payload.date}
          </div>
          <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <GitCommit size={14} />
            <span><strong>{payload[0].value}</strong> commits</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ backgroundColor: '#FFFFFF', padding: 'var(--space-6)' }}>
      {/* Header and Period Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={16} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Commit Activity Over Time
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {periodLabel} • {commits.commits_last_30_days} in last 30d, {commits.commits_last_90_days} in last 90d
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--color-bg-page)',
          borderRadius: 'var(--radius-md)',
          padding: '2px',
          border: '1px solid var(--color-border)',
        }}>
          {[
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: '180d', label: '180 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              style={{
                background: period === tab.id ? '#FFFFFF' : 'transparent',
                border: 'none',
                boxShadow: period === tab.id ? 'var(--shadow-sm)' : 'none',
                color: period === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: period === tab.id ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      {!hasData ? (
        <div style={{
          height: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-page)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          textAlign: 'center',
          padding: 'var(--space-4)',
        }}>
          <GitCommit size={28} color="var(--color-text-muted)" style={{ marginBottom: 'var(--space-2)' }} />
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>No Commit History in this Period</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px' }}>
            {commits.days_since_last_commit
              ? `Last observed commit was ${commits.days_since_last_commit} days ago.`
              : 'Repository has no recorded commit history on default branch.'}
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
                interval={period === '30d' ? 4 : 1}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
