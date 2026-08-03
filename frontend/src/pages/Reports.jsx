import React, { useState, useEffect } from 'react';
import { reportAPI, projectAPI } from '../services/api';
import { BarChart3, Printer, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

export default function Reports() {
  const [rtmData, setRtmData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getProjects()
      .then(res => {
        setProjects(res.data);
        fetchRTM('');
      })
      .catch(err => console.error(err));
  }, []);

  const fetchRTM = (projId) => {
    setLoading(true);
    reportAPI.getRTMData({ projectId: projId })
      .then(res => setRtmData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleProjectFilter = (projId) => {
    setSelectedProject(projId);
    fetchRTM(projId);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Requirement Traceability Matrix (RTM) & Quality Reports</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Bi-directional traceability cross-referencing Requirements, Test Cases, Execution Results, and Reported Defects.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Export / Print Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Project:</span>
        <select 
          className="form-control" 
          style={{ width: '260px' }}
          value={selectedProject} 
          onChange={e => handleProjectFilter(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.projectName}</option>
          ))}
        </select>
      </div>

      {/* RTM Matrix Table */}
      {loading ? (
        <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Generating Traceability Matrix...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Requirement ID & Title</th>
                <th>Priority</th>
                <th>Test Case Scenario</th>
                <th>Latest Execution Result</th>
                <th>Linked Defects / Bugs</th>
              </tr>
            </thead>
            <tbody>
              {rtmData.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                    No matrix traceability records available.
                  </td>
                </tr>
              ) : (
                rtmData.map((row, idx) => {
                  const req = row.requirement;
                  const tc = row.testCase;
                  const latestExec = row.executions && row.executions[0];
                  const defects = row.defects || [];

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                          REQ-{req?._id?.substring(0, 6)}: {req?.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Project: {req?.projectId?.projectName || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${req?.priority === 'Critical' || req?.priority === 'High' ? 'badge-fail' : 'badge-new'}`}>
                          {req?.priority}
                        </span>
                      </td>
                      <td>
                        {tc ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{tc.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Module: {tc.moduleName}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>No Test Case Linked</span>
                        )}
                      </td>
                      <td>
                        {latestExec ? (
                          <span className={`badge badge-${latestExec.result.toLowerCase()}`}>
                            {latestExec.result}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Not Executed Yet</span>
                        )}
                      </td>
                      <td>
                        {defects.length === 0 ? (
                          <span style={{ color: 'var(--status-pass)', fontSize: '12px', fontWeight: 600 }}>Clean (0 Bugs)</span>
                        ) : (
                          defects.map(b => (
                            <div key={b._id} style={{ marginBottom: '4px' }}>
                              <span className="badge badge-fail" style={{ fontSize: '10px' }}>{b.status}</span>
                              <span style={{ fontSize: '12px', marginLeft: '6px' }}>{b.title}</span>
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
