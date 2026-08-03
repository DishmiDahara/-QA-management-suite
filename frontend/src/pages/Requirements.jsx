import React, { useState, useEffect, useContext } from 'react';
import { requirementAPI, projectAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';

export default function Requirements() {
  const { user } = useContext(AuthContext);
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Approved');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, projRes] = await Promise.all([
        requirementAPI.getRequirements(),
        projectAPI.getProjects()
      ]);
      setRequirements(reqRes.data);
      setProjects(projRes.data);
      if (projRes.data.length > 0) {
        setProjectId(projRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus('Approved');
    if (projects.length > 0) setProjectId(projects[0]._id);
    setShowModal(true);
  };

  const handleOpenEdit = (reqItem) => {
    setEditId(reqItem._id);
    setProjectId(reqItem.projectId?._id || reqItem.projectId);
    setTitle(reqItem.title);
    setDescription(reqItem.description);
    setPriority(reqItem.priority);
    setStatus(reqItem.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await requirementAPI.updateRequirement(editId, { title, description, priority, status });
      } else {
        await requirementAPI.createRequirement({ projectId, title, description, priority, status });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving requirement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this requirement?')) {
      try {
        await requirementAPI.deleteRequirement(id);
        fetchData();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'QA Engineer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Requirement Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Track software requirements, define priority levels, and map to test cases.
          </p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Add Requirement
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Requirement Title</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created By</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requirements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                  No requirements found.
                </td>
              </tr>
            ) : (
              requirements.map(reqItem => (
                <tr key={reqItem._id}>
                  <td>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--accent-primary)" />
                      {reqItem.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {reqItem.description}
                    </div>
                  </td>
                  <td>{reqItem.projectId?.projectName || 'N/A'}</td>
                  <td>
                    <span className={`badge ${reqItem.priority === 'Critical' || reqItem.priority === 'High' ? 'badge-fail' : 'badge-new'}`}>
                      {reqItem.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-fixed">{reqItem.status}</span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{reqItem.createdBy?.name || 'QA'}</td>
                  {canManage && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(reqItem)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(reqItem._id)}>
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
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Edit Requirement' : 'Add New Requirement'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editId && (
                <div className="form-group">
                  <label>Select Project</label>
                  <select className="form-control" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.projectName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Requirement Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Multi-Factor Authentication Support"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description & Scope</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detail functional behavior requirements..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Implemented">Implemented</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Requirement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
