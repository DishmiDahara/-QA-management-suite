import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, LogOut, ShieldCheck, UserCheck, Code } from 'lucide-react';
import { notificationAPI } from '../services/api';

export default function Navbar({ onToggleNotifications }) {
  const { user, logout, quickSwitchRole } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationAPI.getNotifications()
        .then(res => {
          const unread = res.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  return (
    <header style={{
      height: '64px',
      background: 'rgba(30, 41, 59, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#fff',
          boxShadow: 'var(--shadow-glow)'
        }}>QA</div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }} className="gradient-text">
            QA Management Suite
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>STLC & Defect Lifecycle Engine</span>
        </div>
      </div>

      {/* Quick Role Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Role Switcher Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '3px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', paddingLeft: '8px', fontWeight: 600 }}>
            Quick Role:
          </span>
          <button 
            onClick={() => quickSwitchRole('admin@qasuite.com')}
            className={`btn btn-sm ${user?.role === 'Admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 10px', fontSize: '11px' }}
          >
            <ShieldCheck size={12} /> Admin
          </button>
          <button 
            onClick={() => quickSwitchRole('qa@qasuite.com')}
            className={`btn btn-sm ${user?.role === 'QA Engineer' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 10px', fontSize: '11px' }}
          >
            <UserCheck size={12} /> QA
          </button>
          <button 
            onClick={() => quickSwitchRole('dev@qasuite.com')}
            className={`btn btn-sm ${user?.role === 'Developer' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 10px', fontSize: '11px' }}
          >
            <Code size={12} /> Dev
          </button>
        </div>

        {/* Notifications Icon */}
        <button 
          onClick={onToggleNotifications}
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>{unreadCount}</span>
          )}
        </button>

        {/* Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--accent-secondary)' }}>{user?.role}</div>
          </div>
          <button 
            onClick={logout} 
            className="btn btn-secondary btn-sm"
            title="Logout"
            style={{ padding: '8px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
