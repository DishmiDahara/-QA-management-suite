import React, { useState, useEffect, useContext } from 'react';
import { testCaseAPI, executionAPI, bugAPI, userAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, CheckCircle2, XCircle, AlertOctagon, History, Bug, Plus } from 'lucide-react';

export default function TestExecutions() {
  const { user } = useContext(AuthContext);
  const [testCases, setTestCases] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [devUsers, setDevUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Runner State
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [resultStatus, setResultStatus] = useState('Pass');
  const [remarks, setRemarks] = useState('');

  // Bug Modal Trigger on Execution Failure
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSteps, setBugSteps] = useState('');
  const [bugExpected, setBugExpected] = useState('');
  const [bugActual, setBugActual] = useState('');
  const [severity, setSeverity] = useState('High');
  const [priority, setPriority] = useState('High');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tcRes, execRes] = await Promise.all([
        testCaseAPI.getTestCases(),
        executionAPI.getExecutionHistory()
      ]);
      setTestCases(tcRes.data);
      setExecutions(execRes.data);
      if (user?.role === 'Admin' || user?.role === 'QA Engineer') {
        userAPI.getUsers().then(res => {
          setDevUsers(res.data.filter(u => u.role === 'Developer'));
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!selectedTestCase) return;

    try {
      await executionAPI.recordExecution({
        testCaseId: selectedTestCase._id,
        projectId: selectedTestCase.projectId?._id || selectedTestCase.projectId,
        result: resultStatus,
        remarks
      });

      if (resultStatus === 'Fail') {
        // Pre-fill bug report trigger modal
        setBugTitle(`[FAILED TEST] ${selectedTestCase.title}`);
        setBugDesc(`Test Case execution failed.\n\nExpected: ${selectedTestCase.expectedResult}\nRemarks: ${remarks}`);
        setBugSteps(selectedTestCase.steps?.map(s => `${s.stepNumber}. ${s.action}`).join('\n') || '');
        setBugExpected(selectedTestCase.expectedResult);
        setBugActual(remarks || 'Actual outcome did not match expected result');
        setShowBugModal(true);
      } else {
        alert(`Execution saved as ${resultStatus}`);
      }

      setSelectedTestCase(null);
      setRemarks('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording execution');
    }
  };

  const handleCreateDefect = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('projectId', selectedTestCase ? (selectedTestCase.projectId?._id || selectedTestCase.projectId) : testCases[0]?.projectId?._id);
      if (selectedTestCase) formData.append('testCaseId', selectedTestCase._id);
      formData.append('title', bugTitle);
      formData.append('description', bugDesc);
      formData.append('stepsToReproduce', bugSteps);
      formData.append('expectedResult', bugExpected);
      formData.append('actualResult', bugActual);
      formData.append('severity', severity);
      formData.append('priority', priority);
      if (assignedTo) formData.append('assignedTo', assignedTo);

      await bugAPI.createBug(formData);
      alert('Defect report created successfully!');
      setShowBugModal(false);
    } catch (err) {
      alert('Error creating bug report');
    }
  };

  const canExecute = user?.role === 'Admin' || user?.role === 'QA Engineer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Test Case Execution Suite</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Run test scenarios, record Pass/Fail/Blocked execution status, and file defects immediately.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Test Execution Runner Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlayCircle size={18} color="var(--accent-primary)" /> Test Execution Runner
          </h3>

          {!canExecute ? (
            <div style={{ padding: '20px', color: 'var(--text-dim)', textAlign: 'center' }}>
              Only QA Engineers and Admins are authorized to execute test cases.
            </div>
          ) : (
            <form onSubmit={handleExecute}>
              <div className="form-group">
                <label>Select Test Case to Execute</label>
                <select 
                  className="form-control" 
                  value={selectedTestCase?._id || ''} 
                  onChange={e => setSelectedTestCase(testCases.find(tc => tc._id === e.target.value) || null)}
                  required
                >
                  <option value="">-- Choose Test Case --</option>
                  {testCases.map(tc => (
                    <option key={tc._id} value={tc._id}>
                      [{tc.moduleName}] {tc.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTestCase && (
                <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Target Module: {selectedTestCase.moduleName}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>{selectedTestCase.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <strong>Expected Outcome:</strong> {selectedTestCase.expectedResult}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Execution Result Status</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    className={`btn ${resultStatus === 'Pass' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setResultStatus('Pass')}
                    style={{ flex: 1, justifyContent: 'center', background: resultStatus === 'Pass' ? 'var(--status-pass-bg)' : '', color: resultStatus === 'Pass' ? 'var(--status-pass)' : '' }}
                  >
                    <CheckCircle2 size={16} /> PASS
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${resultStatus === 'Fail' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setResultStatus('Fail')}
                    style={{ flex: 1, justifyContent: 'center', background: resultStatus === 'Fail' ? 'var(--status-fail-bg)' : '', color: resultStatus === 'Fail' ? 'var(--status-fail)' : '' }}
                  >
                    <XCircle size={16} /> FAIL
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${resultStatus === 'Blocked' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setResultStatus('Blocked')}
                    style={{ flex: 1, justifyContent: 'center', background: resultStatus === 'Blocked' ? 'var(--status-blocked-bg)' : '', color: resultStatus === 'Blocked' ? 'var(--status-blocked)' : '' }}
                  >
                    <AlertOctagon size={16} /> BLOCKED
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Execution Remarks / Execution Notes</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Record actual test environment observations or failure trace..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={!selectedTestCase}>
                <PlayCircle size={16} /> Record Execution Result
              </button>
            </form>
          )}
        </div>

        {/* Right: Execution History Log */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--accent-secondary)" /> Recent Execution History Log
          </h3>

          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {executions.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px' }}>No execution history logged.</div>
            ) : (
              executions.map(ex => (
                <div key={ex._id} style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${ex.result.toLowerCase()}`}>{ex.result}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {new Date(ex.executionDate).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px' }}>
                    {ex.testCaseId?.title || 'Test Case'}
                  </div>
                  {ex.remarks && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <em>"{ex.remarks}"</em>
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', textAlign: 'right' }}>
                    Executed by: {ex.executedBy?.name || 'QA Engineer'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Triggered Bug Creation Modal */}
      {showBugModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                <Bug size={20} /> File Defect for Failed Test Case
              </h2>
              <button className="close-btn" onClick={() => setShowBugModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateDefect}>
              <div className="form-group">
                <label>Bug Title</label>
                <input type="text" className="form-control" value={bugTitle} onChange={e => setBugTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Bug Description</label>
                <textarea className="form-control" rows="2" value={bugDesc} onChange={e => setBugDesc(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Severity</label>
                  <select className="form-control" value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign to Developer</label>
                  <select className="form-control" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {devUsers.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBugModal(false)}>Skip Filing Bug</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--status-fail)' }}>Report Defect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
