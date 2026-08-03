import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, FolderKanban, FileText, CheckSquare, 
  PlayCircle, Bug, BarChart3, Users 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'QA Engineer', 'Developer'] },
    { id: 'projects', label: 'Projects', icon: FolderKanban, roles: ['Admin', 'QA Engineer', 'Developer'] },
    { id: 'requirements', label: 'Requirements', icon: FileText, roles: ['Admin', 'QA Engineer'] },
    { id: 'testcases', label: 'Test Cases', icon: CheckSquare, roles: ['Admin', 'QA Engineer'] },
    { id: 'executions', label: 'Test Executions', icon: PlayCircle, roles: ['Admin', 'QA Engineer'] },
    { id: 'defects', label: 'Defects / Bugs', icon: Bug, roles: ['Admin', 'QA Engineer', 'Developer'] },
    { id: 'reports', label: 'Reports & RTM', icon: BarChart3, roles: ['Admin', 'QA Engineer', 'Developer'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['Admin'] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: '240px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid var(--border-color)',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ padding: '0 12px 12px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        STLC Navigation
      </div>

      {allowedItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isActive ? 'var(--accent-gradient)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
