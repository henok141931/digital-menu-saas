import { BASE_URL } from './config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import './App.css';

function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Restaurant State
  const [newRestName, setNewRestName] = useState('');
  const [newRestSlug, setNewRestSlug] = useState('');
  const [newRestDesc, setNewRestDesc] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'SUPER_ADMIN') {
      navigate('/login');
      return;
    }
    fetchRestaurants();
  }, [token, role, navigate]);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch restaurants');
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
        const d = await res.json();
        throw new Error(d.message || 'Failed to create restaurant');
      }

      setNewRestName('');
      setNewRestSlug('');
      setNewRestDesc('');
      setPassword('');
      showToast('Restaurant created successfully!');
      await fetchRestaurants();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="menu-container" style={{ padding: '20px', maxWidth: '800px' }}>
      <header className="menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Platform Overview</h1>
          <p>Super Admin Dashboard</p>
        </div>
        <button onClick={handleLogout} className="add-btn danger" style={{ padding: '8px 16px' }}>Logout</button>
      </header>

      {error && <div className="status error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
        
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
            <button type="submit" className="add-btn primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'Creating...' : '+ Create Restaurant'}
            </button>
          </form>
        </section>

        {/* RESTAURANT LIST & ANALYTICS */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ marginBottom: '16px' }}>Active Restaurants & Analytics</h2>
          {isLoading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {restaurants.map(rest => (
                <div key={rest._id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{rest.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                      URL: <a href={`/${rest.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-color)' }}>/{rest.slug}</a>
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {rest.viewCount || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Total Scans
                    </div>
                  </div>
                </div>
              ))}
              {restaurants.length === 0 && <p className="empty-state">No restaurants found.</p>}
            </div>
          )}
        </section>

      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
    </div>
  );
}

export default SuperAdminDashboard;
