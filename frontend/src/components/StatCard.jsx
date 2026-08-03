import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color }) {
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          {title}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {subtext}
          </div>
        )}
      </div>
      {Icon && (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: color || 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color ? '#fff' : 'var(--accent-primary)'
        }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
