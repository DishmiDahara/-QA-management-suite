import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { FolderKanban, CheckSquare, CheckCircle, AlertTriangle, Bug, XCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getDashboardStats()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading STLC Dashboard Metrics...</div>;
  }

  const {
    totalProjects = 0,
    totalTestCases = 0,
    passedExecutions = 0,
    failedExecutions = 0,
    blockedExecutions = 0,
    openDefects = 0,
    closedDefects = 0,
    severityDistribution = {},
    statusDistribution = {}
  } = stats || {};

  const totalExecutions = passedExecutions + failedExecutions + blockedExecutions;
  const passRate = totalExecutions > 0 ? Math.round((passedExecutions / totalExecutions) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Quality Assurance Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Real-time metrics, test execution statistics, and defect tracking progress.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard title="Active Projects" value={totalProjects} subtext="Total software projects" icon={FolderKanban} color="rgba(99, 102, 241, 0.2)" />
        <StatCard title="Total Test Cases" value={totalTestCases} subtext="Across all modules" icon={CheckSquare} color="rgba(168, 85, 247, 0.2)" />
        <StatCard title="Passed Executions" value={passedExecutions} subtext={`${passRate}% Overall Pass Rate`} icon={CheckCircle} color="rgba(16, 185, 129, 0.2)" />
        <StatCard title="Failed Executions" value={failedExecutions} subtext="Requires defect triage" icon={XCircle} color="rgba(239, 68, 68, 0.2)" />
        <StatCard title="Open Defects" value={openDefects} subtext={`${closedDefects} Resolved & Closed`} icon={Bug} color="rgba(245, 158, 11, 0.2)" />
      </div>

      {/* Visual Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Test Execution Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Test Execution Breakdown
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Pass Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--status-pass)', fontWeight: 600 }}>Passed Tests</span>
                <span>{passedExecutions} ({totalExecutions > 0 ? Math.round((passedExecutions/totalExecutions)*100) : 0}%)</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalExecutions > 0 ? (passedExecutions/totalExecutions)*100 : 0}%`, background: 'var(--status-pass)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Fail Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--status-fail)', fontWeight: 600 }}>Failed Tests</span>
                <span>{failedExecutions} ({totalExecutions > 0 ? Math.round((failedExecutions/totalExecutions)*100) : 0}%)</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalExecutions > 0 ? (failedExecutions/totalExecutions)*100 : 0}%`, background: 'var(--status-fail)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Blocked Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--status-blocked)', fontWeight: 600 }}>Blocked Tests</span>
                <span>{blockedExecutions} ({totalExecutions > 0 ? Math.round((blockedExecutions/totalExecutions)*100) : 0}%)</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalExecutions > 0 ? (blockedExecutions/totalExecutions)*100 : 0}%`, background: 'var(--status-blocked)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Defect Severity Matrix */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Defects by Severity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 700 }}>CRITICAL</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {severityDistribution.Critical || 0}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>HIGH</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {severityDistribution.High || 0}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 700 }}>MEDIUM</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {severityDistribution.Medium || 0}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>LOW</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {severityDistribution.Low || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Status Pipeline Summary */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
          Defect Lifecycle Pipeline Overview
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', textAlign: 'center' }}>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="badge badge-new">New</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{statusDistribution.New || 0}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="badge badge-assigned">Assigned</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{statusDistribution.Assigned || 0}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="badge badge-progress">In Progress</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{statusDistribution.InProgress || 0}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="badge badge-fixed">Fixed</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{statusDistribution.Fixed || 0}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="badge badge-retest">Retest</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{statusDistribution.Retest || 0}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span className="badge badge-closed">Closed</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px' }}>{statusDistribution.Closed || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
