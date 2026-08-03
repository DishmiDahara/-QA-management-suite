import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Users, Plus, Shield, UserCheck, Code, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('QA Engineer');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    userAPI.getUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('QA Engineer');
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (userItem) => {
    setEditId(userItem._id);
    setName(userItem.name);
    setEmail(userItem.email);
    setPassword('');
    setRole(userItem.role);
    setIsActive(userItem.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await userAPI.updateUser(editId, { name, email, role, isActive, password: password || undefined });
      } else {
        await userAPI.createUser({ name, email, password: password || 'password123', role });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleToggleStatus = async (userItem) => {
    try {
      await userAPI.updateUser(userItem._id, { isActive: !userItem.isActive });
      fetchUsers();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>User & Role Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Admin Panel: Create user accounts, assign system roles (Admin, QA Engineer, Developer), and toggle active access.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create User Account
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User Name & Email</th>
              <th>Assigned Role</th>
              <th>Account Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Loading system accounts...</td></tr>
            ) : (
              users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: u.role === 'Admin' ? 'rgba(99, 102, 241, 0.15)' : u.role === 'QA Engineer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                      color: u.role === 'Admin' ? '#818cf8' : u.role === 'QA Engineer' ? '#34d399' : '#c084fc',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {u.role === 'Admin' && <Shield size={12} style={{ marginRight: '4px' }} />}
                      {u.role === 'QA Engineer' && <UserCheck size={12} style={{ marginRight: '4px' }} />}
                      {u.role === 'Developer' && <Code size={12} style={{ marginRight: '4px' }} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: u.isActive ? 'var(--status-pass)' : 'var(--status-fail)'
                      }}
                    >
                      {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(u)}>
                      <Edit size={14} /> Edit
                    </button>
                  </td>
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
              <h2 className="modal-title">{editId ? 'Edit User Account' : 'Create User Account'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Password {editId && '(Leave blank to keep existing)'}</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required={!editId} />
              </div>

              <div className="form-group">
                <label>Assign Role</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Admin">Admin</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>

              {editId && (
                <div className="form-group">
                  <label>Account Status</label>
                  <select className="form-control" value={isActive ? 'true' : 'false'} onChange={e => setIsActive(e.target.value === 'true')}>
                    <option value="true">Active Access Enabled</option>
                    <option value="false">Account Deactivated</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
