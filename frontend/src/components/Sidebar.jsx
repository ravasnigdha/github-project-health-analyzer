import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  BarChart2, 
  FileText, 
  History, 
  GitCompare, 
  Settings, 
  X,
  Github
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart2 },
    { name: 'Detailed Report', path: '/report', icon: FileText },
    { name: 'History', path: '/history', icon: History },
    { name: 'Compare Repositories', path: '/compare', icon: GitCompare },
    { name: 'Settings & About', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'transform var(--transition-normal)',
          flexShrink: 0,
        }}
        className={isOpen ? 'sidebar-open' : 'sidebar-desktop'}
      >
        {/* Brand Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-surface)',
              border: '1px solid var(--color-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1.2 }}>
                Project Health
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                GitHub Analyzer
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              padding: 'var(--space-1)',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: 'var(--space-4) var(--space-3)', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-surface)' : 'transparent',
                  border: isActive ? '1px solid var(--color-primary-border)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                })}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#FAFAFA',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
            <Github size={14} color="var(--color-text-secondary)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Open Source Tool
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Understand. Improve. Build better.
          </p>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1023px) {
          .sidebar-desktop {
            position: fixed !important;
            transform: translateX(-100%);
          }
          .sidebar-open {
            position: fixed !important;
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .sidebar-desktop {
            transform: none !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
