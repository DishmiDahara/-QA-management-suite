import React, { useState, useEffect, useContext } from 'react';
import { testCaseAPI, projectAPI, requirementAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Filter, CheckSquare, Trash2, Edit, ListPlus } from 'lucide-react';

export default function TestCases() {
  const { user } = useContext(AuthContext);
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');

  // Form State
  const [projectId, setProjectId] = useState('');
  const [requirementId, setRequirementId] = useState('');
  const [title, setTitle] = useState('');
  const [moduleName, setModuleName] = useState('Authentication');
  const [expectedResult, setExpectedResult] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [steps, setSteps] = useState([{ stepNumber: 1, action: '', expected: '' }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tcRes, projRes, reqRes] = await Promise.all([
        testCaseAPI.getTestCases(),
        projectAPI.getProjects(),
        requirementAPI.getRequirements()
      ]);
      setTestCases(tcRes.data);
      setProjects(projRes.data);
      setRequirements(reqRes.data);
      if (projRes.data.length > 0) setProjectId(projRes.data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, action: '', expected: '' }]);
  };

  const handleStepChange = (index, field, val) => {
    const updated = [...steps];
    updated[index][field] = val;
    setSteps(updated);
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setModuleName('Authentication');
    setExpectedResult('');
    setPriority('Medium');
    setRequirementId('');
    setSteps([{ stepNumber: 1, action: '', expected: '' }]);
    if (projects.length > 0) setProjectId(projects[0]._id);
    setShowModal(true);
  };

  const handleOpenEdit = (tc) => {
    setEditId(tc._id);
    setProjectId(tc.projectId?._id || tc.projectId);
    setRequirementId(tc.requirementId?._id || tc.requirementId || '');
    setTitle(tc.title);
    setModuleName(tc.moduleName || 'General');
    setExpectedResult(tc.expectedResult);
    setPriority(tc.priority);
    setSteps(tc.steps && tc.steps.length > 0 ? tc.steps : [{ stepNumber: 1, action: '', expected: '' }]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        projectId,
        requirementId: requirementId || null,
        title,
        moduleName,
        expectedResult,
        priority,
        steps
      };

      if (editId) {
        await testCaseAPI.updateTestCase(editId, payload);
      } else {
        await testCaseAPI.createTestCase(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving test case');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this test case?')) {
      try {
        await testCaseAPI.deleteTestCase(id);
        fetchData();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = tc.title.toLowerCase().includes(search.toLowerCase()) || 
                          tc.moduleName.toLowerCase().includes(search.toLowerCase());
    const matchesModule = filterModule ? tc.moduleName === filterModule : true;
    return matchesSearch && matchesModule;
  });

  const modulesList = Array.from(new Set(testCases.map(tc => tc.moduleName)));
  const canManage = user?.role === 'Admin' || user?.role === 'QA Engineer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Test Case Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Create step-by-step test scenarios, categorize by project module, and define expected outcomes.
          </p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Create Test Case
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '36px' }}
            placeholder="Search test case title or module..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '200px' }}>
          <select className="form-control" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="">All Project Modules</option>
            {modulesList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Test Case ID & Title</th>
              <th>Module</th>
              <th>Linked Requirement</th>
              <th>Priority</th>
              <th>Test Steps</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTestCases.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                  No test cases found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTestCases.map(tc => (
                <tr key={tc._id}>
                  <td>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckSquare size={16} color="var(--accent-secondary)" />
                      {tc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <strong>Expected:</strong> {tc.expectedResult}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-new" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      {tc.moduleName}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {tc.requirementId?.title ? tc.requirementId.title : <span style={{ color: 'var(--text-dim)' }}>Unlinked</span>}
                  </td>
                  <td>
                    <span className={`badge ${tc.priority === 'Critical' || tc.priority === 'High' ? 'badge-fail' : 'badge-new'}`}>
                      {tc.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {tc.steps?.length || 0} Steps
                  </td>
                  {canManage && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(tc)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tc._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Edit Test Case' : 'Create New Test Case'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {!editId && (
                  <div className="form-group">
                    <label>Project</label>
                    <select className="form-control" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.projectName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Project Module</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={moduleName}
                    onChange={e => setModuleName(e.target.value)}
                    placeholder="e.g. Authentication, Checkout, User Settings"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Test Case Title / Scenario</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. TC_AUTH_001: Verify login with invalid password"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Link Requirement (Optional)</label>
                  <select className="form-control" value={requirementId} onChange={e => setRequirementId(e.target.value)}>
                    <option value="">None (Standalone Test)</option>
                    {requirements.map(r => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Expected Result</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  value={expectedResult}
                  onChange={e => setExpectedResult(e.target.value)}
                  placeholder="Expected system behavior after executing steps..."
                  required
                />
              </div>

              {/* Steps Builder */}
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Execution Steps</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddStep}>
                    <ListPlus size={14} /> Add Step
                  </button>
                </div>

                {steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      #{idx + 1}
                    </div>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Action step..."
                      value={step.action}
                      onChange={e => handleStepChange(idx, 'action', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Expected outcome..."
                      value={step.expected}
                      onChange={e => handleStepChange(idx, 'expected', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Test Case</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
