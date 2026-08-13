import { BASE_URL } from './config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminRestaurantsTab from './components/superadmin/SuperAdminRestaurantsTab';
import SuperAdminAccountsTab from './components/superadmin/SuperAdminAccountsTab';
import './components/admin/AdminLayout.css';
import './App.css';

function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('restaurants');

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar open`}>
        <div className="sidebar-header">
          <h2>Super Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <i className="fa-solid fa-store"></i> Restaurants
          </button>
          <button 
            className={`nav-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <i className="fa-solid fa-users"></i> Accounts
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-title">
            <h1>{activeTab === 'restaurants' ? 'Platform Overview' : 'Account Management'}</h1>
          </div>
        </header>

        <div className="admin-content">
          {error && <div className="status error" style={{ marginBottom: '16px' }}>{error}</div>}
          
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {activeTab === 'restaurants' && (
                <SuperAdminRestaurantsTab 
                  restaurants={restaurants} 
                  setRestaurants={setRestaurants}
                  fetchRestaurants={fetchRestaurants} 
                />
              )}
              {activeTab === 'accounts' && (
                <SuperAdminAccountsTab 
                  restaurants={restaurants} 
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SuperAdminDashboard;
