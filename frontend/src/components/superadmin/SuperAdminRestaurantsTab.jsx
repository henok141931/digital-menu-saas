import { useState } from 'react';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';
import ConfirmModal from '../../ConfirmModal';

export default function SuperAdminRestaurantsTab({ restaurants, setRestaurants, fetchRestaurants }) {
  const [newRestName, setNewRestName] = useState('');
  const [newRestSlug, setNewRestSlug] = useState('');
  const [newRestDesc, setNewRestDesc] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });

  const token = localStorage.getItem('token');

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestName || !newRestSlug) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newRestName,
          slug: newRestSlug,
          description: newRestDesc,
          currency: 'ETB'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create restaurant');
      }
      
      const d = await res.json();

      // 2. Create the Admin user for this restaurant
      const userRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
          role: 'ADMIN',
          restaurantId: d._id
        })
      });

      if (!userRes.ok) {
        throw new Error('Restaurant created, but failed to create admin user');
      }

      setNewRestName('');
      setNewRestSlug('');
      setNewRestDesc('');
      setAdminUsername('');
      setAdminPassword('');
      showToast('Restaurant created successfully!');
      await fetchRestaurants();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/restaurants/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete restaurant');
      }
      Toast.success('Restaurant deleted successfully');
      setDeleteId(null);
      fetchRestaurants();
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const handleToggleAmharic = async (restId, currentValue) => {
    // Optimistic UI update
    setRestaurants(restaurants.map(r => r._id === restId ? { ...r, enableAmharic: !currentValue } : r));

    try {
      const res = await fetch(`${BASE_URL}/api/restaurants/${restId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enableAmharic: !currentValue })
      });
      if (!res.ok) throw new Error('Failed to update Amharic setting');
      showToast('Amharic setting updated!');
    } catch (err) {
      showToast(err.message, 'error');
      // Revert on failure
      setRestaurants(restaurants.map(r => r._id === restId ? { ...r, enableAmharic: currentValue } : r));
    }
  };

  return (
    <div className="tab-pane">
      {error && <div className="status error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* ADD RESTAURANT FORM */}
        <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Onboard New Restaurant</h2>
          <form onSubmit={handleCreateRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Restaurant Name (e.g. Roha Cafe)" 
                value={newRestName}
                onChange={(e) => {
                  setNewRestName(e.target.value);
                  setNewRestSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }}
                required
                className="admin-input"
                style={{ flex: 1 }}
              />
              <input 
                type="text" 
                placeholder="URL Slug (e.g. roha-cafe)" 
                value={newRestSlug}
                onChange={(e) => setNewRestSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                className="admin-input"
                style={{ flex: 1 }}
              />
            </div>
            
            <input 
              type="text" 
              placeholder="Short Description" 
              value={newRestDesc}
              onChange={(e) => setNewRestDesc(e.target.value)}
              className="admin-input"
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Admin Username" 
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
                className="admin-input"
                style={{ flex: 1 }}
              />
              <input 
                type="password" 
                placeholder="Admin Password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="admin-input"
                style={{ flex: 1 }}
              />
            </div>
            <button type="submit" className="add-btn primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'Creating...' : '+ Create Restaurant'}
            </button>
          </form>
        </section>

        {/* RESTAURANT LIST & ANALYTICS */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ marginBottom: '16px' }}>Active Restaurants & Analytics</h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Restaurant</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>URL</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Total Scans</th>
                  <th style={{ padding: '16px', fontWeight: '600' }}>Amharic Support</th>
                  <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(rest => (
                  <tr key={rest._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--bg-main)' } }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{rest.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {rest._id.slice(-6)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}><a href={`/${rest.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-color)', textDecoration: 'none', fontWeight: '500' }}>/{rest.slug}</a></td>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-main)' }}>{rest.viewCount || 0}</td>
                    <td style={{ padding: '16px' }}>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={rest.enableAmharic || false}
                          onChange={() => handleToggleAmharic(rest._id, rest.enableAmharic)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setDeleteId(rest._id)} 
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', fontSize: '18px', borderRadius: '4px', transition: 'background-color 0.2s' }}
                        title="Delete Restaurant"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {restaurants.length === 0 && <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No restaurants found.</p>}
          </div>
        </section>

      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      {deleteId && (
        <ConfirmModal 
          isOpen={true}
          message="Are you sure you want to delete this restaurant and ALL of its associated accounts, menus, and feedback? This action cannot be undone."
          onConfirm={handleDeleteRestaurant}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
