import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationDrawer from './components/NotificationDrawer';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Requirements from './pages/Requirements';
import TestCases from './pages/TestCases';
import TestExecutions from './pages/TestExecutions';
import Defects from './pages/Defects';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

export default function App() {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '16px'
      }}>
        Initializing QA Management Suite...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'requirements':
        return <Requirements />;
      case 'testcases':
        return <TestCases />;
      case 'executions':
        return <TestExecutions />;
      case 'defects':
        return <Defects />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onToggleNotifications={() => setShowNotifications(!showNotifications)} />
      
      <NotificationDrawer 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main style={{ flex: 1, padding: '28px', background: 'var(--bg-primary)', overflowY: 'auto' }}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
