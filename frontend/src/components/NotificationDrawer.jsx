import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, Check, X } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) {
      notificationAPI.getNotifications()
        .then(res => setNotifications(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '64px',
      right: '24px',
      width: '360px',
      maxHeight: '480px',
      background: '#1e293b',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-main)',
      zIndex: 90,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
          <Bell size={16} /> Notifications
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            No notifications available.
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                border: '1px solid ' + (n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.2)'),
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{n.message}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(n._id)}
                  title="Mark as read"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
