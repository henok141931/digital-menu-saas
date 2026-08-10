import { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';

export default function SuperAdminAccountsTab({ restaurants }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Only for changing
  const [role, setRole] = useState('ADMIN');
  const [restaurantId, setRestaurantId] = useState('');

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUsername(user.username);
      setPassword('');
      setRole(user.role);
      setRestaurantId(user.restaurantId?._id || '');
    } else {
      setEditingUser(null);
      setUsername('');
      setPassword('');
      setRole('ADMIN');
      setRestaurantId('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { username, role, restaurantId };
      if (password) payload.password = password; // Only send if changed

      if (editingUser) {
        // Update User
        const res = await fetch(`${BASE_URL}/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.json().then(d => d.message));
        showToast('Account updated successfully!');
      } else {
        // Create User (via auth/register)
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.json().then(d => d.message));
        showToast('Account created successfully!');
      }

      fetchUsers();
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.json().then(d => d.message));
      showToast('Account deleted successfully!');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="tab-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Account Management</h2>
        <button onClick={() => openModal()} className="add-btn primary">+ Add User</button>
      </div>

      {error && <div className="status error" style={{ marginBottom: '16px' }}>{error}</div>}

      {isLoading ? <p>Loading users...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map(user => (
            <div key={user._id} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {user.username}
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: user.role === 'SUPER_ADMIN' ? '#fef08a' : user.role === 'ADMIN' ? '#bfdbfe' : '#e2e8f0', color: '#1e293b', textTransform: 'uppercase' }}>
                    {user.role}
                  </span>
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                  {user.restaurantId ? user.restaurantId.name : 'No Restaurant Attached'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openModal(user)} className="add-btn" style={{ background: '#e2e8f0', color: 'var(--text-main)', border: 'none' }}>Edit</button>
                {user.role !== 'SUPER_ADMIN' && (
                  <button onClick={() => handleDelete(user._id)} className="add-btn danger" style={{ border: 'none' }}>Delete</button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="empty-state">No users found.</p>}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} style={{ zIndex: 1000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
            <h2>{editingUser ? 'Edit Account' : 'Create Account'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div>
                <label className="admin-label">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="admin-input" />
              </div>
              
              <div>
                <label className="admin-label">{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUser} minLength={6} className="admin-input" />
              </div>

              <div>
                <label className="admin-label">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="admin-input">
                  <option value="ADMIN">Admin</option>
                  <option value="WAITER">Waiter</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {role !== 'SUPER_ADMIN' && (
                <div>
                  <label className="admin-label">Assigned Restaurant</label>
                  <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} required className="admin-input">
                    <option value="" disabled>Select a restaurant</option>
                    {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" disabled={isSubmitting} className="add-btn primary" style={{ flex: 1 }}>{isSubmitting ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={closeModal} className="add-btn" style={{ flex: 1, background: '#e2e8f0', color: '#1e293b', border: 'none' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}
