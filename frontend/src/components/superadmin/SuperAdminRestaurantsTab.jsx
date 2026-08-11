import { useState } from 'react';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';
import ConfirmModal from '../../ConfirmModal';

export default function SuperAdminRestaurantsTab({ restaurants, fetchRestaurants }) {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {restaurants.map(rest => (
              <div key={rest._id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{rest.name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                    URL: <a href={`/${rest.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-color)' }}>/{rest.slug}</a>
                  </p>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {rest.viewCount || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Total Scans
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeleteId(rest._id)} 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', fontSize: '18px' }}
                    title="Delete Restaurant"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {restaurants.length === 0 && <p className="empty-state">No restaurants found.</p>}
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
