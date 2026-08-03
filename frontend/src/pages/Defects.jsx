import React, { useState, useEffect, useContext } from 'react';
import { bugAPI, projectAPI, userAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Bug, Plus, Search, Filter, MessageSquare, Paperclip, User, Edit, CheckCircle } from 'lucide-react';

export default function Defects() {
  const { user } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [devUsers, setDevUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Active View
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeBug, setActiveBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Form State
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bugRes, projRes, userRes] = await Promise.all([
        bugAPI.getBugs(),
        projectAPI.getProjects(),
        userAPI.getUsers().catch(() => ({ data: [] }))
      ]);
      setBugs(bugRes.data);
      setProjects(projRes.data);
      setDevUsers(userRes.data?.filter(u => u.role === 'Developer') || []);
      if (projRes.data.length > 0) setProjectId(projRes.data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBugDetails = async (bugItem) => {
    try {
      const res = await bugAPI.getBugById(bugItem._id);
      setActiveBug(res.data.bug);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      const res = await bugAPI.updateBug(bugId, formData);
      setBugs(prev => prev.map(b => b._id === bugId ? res.data : b));
      if (activeBug && activeBug._id === bugId) {
        setActiveBug(res.data);
      }
    } catch (err) {
      alert('Error updating bug status');
    }
  };

  const handleAssignDeveloper = async (bugId, devId) => {
    try {
      const formData = new FormData();
      formData.append('assignedTo', devId);
      formData.append('status', devId ? 'Assigned' : 'New');
      const res = await bugAPI.updateBug(bugId, formData);
      setBugs(prev => prev.map(b => b._id === bugId ? res.data : b));
      if (activeBug && activeBug._id === bugId) {
        setActiveBug(res.data);
      }
    } catch (err) {
      alert('Error assigning developer');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment || !activeBug) return;
    try {
      const res = await bugAPI.addComment(activeBug._id, { commentText: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      alert('Error adding comment');
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('stepsToReproduce', stepsToReproduce);
      formData.append('expectedResult', expectedResult);
      formData.append('actualResult', actualResult);
      formData.append('severity', severity);
      formData.append('priority', priority);
      if (assignedTo) formData.append('assignedTo', assignedTo);
      if (attachment) formData.append('attachment', attachment);

      await bugAPI.createBug(formData);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setAttachment(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error reporting bug');
    }
  };

  const filteredBugs = bugs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus ? b.status === filterStatus : true;
    const matchesSeverity = filterSeverity ? b.severity === filterSeverity : true;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Defect & Bug Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Track complete defect lifecycle: New → Assigned → In Progress → Fixed → Retest → Closed / Reopened.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Report Bug
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '36px' }}
            placeholder="Search defects by title or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '180px' }}>
          <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Fixed">Fixed</option>
            <option value="Retest">Retest</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>
        </div>

        <div style={{ width: '180px' }}>
          <select className="form-control" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Defects Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: activeBug ? '1fr 400px' : '1fr', gap: '20px' }}>
        {/* Bugs List */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bug ID & Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Reported By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                    No defect reports found.
                  </td>
                </tr>
              ) : (
                filteredBugs.map(b => (
                  <tr key={b._id} style={{ background: activeBug?._id === b._id ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)' }} onClick={() => handleOpenBugDetails(b)}>
                        <Bug size={14} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#f87171' }} />
                        {b.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Project: {b.projectId?.projectName || 'General'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${b.severity === 'Critical' || b.severity === 'High' ? 'badge-fail' : 'badge-blocked'}`}>
                        {b.severity}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-control" 
                        value={b.status} 
                        onChange={e => handleStatusChange(b._id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                      >
                        <option value="New">New</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Retest">Retest</option>
                        <option value="Closed">Closed</option>
                        <option value="Reopened">Reopened</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className="form-control" 
                        value={b.assignedTo?._id || ''} 
                        onChange={e => handleAssignDeveloper(b._id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                      >
                        <option value="">Unassigned</option>
                        {devUsers.map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: '13px' }}>{b.createdBy?.name || 'QA'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenBugDetails(b)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right Active Bug Details & Comment Drawer */}
        {activeBug && (
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`badge badge-${activeBug.status.toLowerCase().replace(' ', '')}`}>{activeBug.status}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>{activeBug.title}</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveBug(null)}>×</button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <strong>Description:</strong>
              <div style={{ marginTop: '4px' }}>{activeBug.description}</div>
            </div>

            {activeBug.stepsToReproduce && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <strong>Steps to Reproduce:</strong>
                <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', marginTop: '4px', background: 'rgba(15,23,42,0.4)', padding: '8px', borderRadius: '4px' }}>
                  {activeBug.stepsToReproduce}
                </pre>
              </div>
            )}

            {activeBug.attachmentUrl && (
              <div>
                <strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attachment Screenshot:</strong>
                <div style={{ marginTop: '6px' }}>
                  <a href={activeBug.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Paperclip size={14} /> View Uploaded Screenshot
                  </a>
                </div>
              </div>
            )}

            {/* Comments Thread */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} /> Discussion Thread ({comments.length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
                {comments.map(c => (
                  <div key={c._id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                      <span>{c.userId?.name} ({c.userId?.role})</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-main)', marginTop: '4px' }}>{c.commentText}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Add resolution details or comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">Post</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Reporting New Bug */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Report New Defect / Bug</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateBug}>
              <div className="form-group">
                <label>Select Project</label>
                <select className="form-control" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bug Title</label>
                <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="Summary of defect..." required />
              </div>

              <div className="form-group">
                <label>Detailed Description</label>
                <textarea className="form-control" rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Observed anomaly details..." required />
              </div>

              <div className="form-group">
                <label>Steps to Reproduce</label>
                <textarea className="form-control" rows="2" value={stepsToReproduce} onChange={e => setStepsToReproduce(e.target.value)} placeholder="1. Go to page... 2. Click button..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
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
                  <label>Priority</label>
                  <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign Developer</label>
                  <select className="form-control" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {devUsers.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Upload Screenshot / Log Attachment</label>
                <input type="file" className="form-control" onChange={e => setAttachment(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Defect Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
