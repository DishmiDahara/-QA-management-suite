import React, { useState, useEffect, useContext } from 'react';
import { projectAPI, userAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Folder, Users, Calendar, CheckCircle2 } from 'lucide-react';

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') {
      userAPI.getUsers().then(res => setAllUsers(res.data)).catch(err => console.error(err));
    }
  }, [user]);

  const fetchProjects = () => {
    setLoading(true);
    projectAPI.getProjects()
      .then(res => setProjects(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.createProject({
        projectName,
        description,
        status,
        members: selectedMembers
      });
      setShowModal(false);
      setProjectName('');
      setDescription('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'QA Engineer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Project Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage software projects, assign QA/Dev team members, and track status.
          </p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Project
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map(p => (
            <div key={p._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-new" style={{ fontSize: '11px' }}>{p.status}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  <Folder size={18} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-primary)' }} />
                  {p.projectName}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                  {p.description}
                </p>
              </div>

              <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="var(--text-dim)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {p.members?.length || 0} Members
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  By: {p.createdBy?.name || 'Admin'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Project */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create New Software Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g., E-Commerce Mobile App"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Project Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Overview of testing scope and target deliverables..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {allUsers.length > 0 && (
                <div className="form-group">
                  <label>Assign Team Members</label>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    {allUsers.map(u => (
                      <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox"
                          value={u._id}
                          checked={selectedMembers.includes(u._id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedMembers([...selectedMembers, u._id]);
                            else setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                          }}
                        />
                        <span>{u.name} ({u.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
