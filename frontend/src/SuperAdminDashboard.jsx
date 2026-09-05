import { BASE_URL } from './config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminRestaurantsTab from './components/superadmin/SuperAdminRestaurantsTab';
import SuperAdminAccountsTab from './components/superadmin/SuperAdminAccountsTab';
import './components/admin/AdminLayout.css';
import './App.css';

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState('restaurants');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Super Admin</h2>
          <span className="badge">System</span>
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => handleTabClick('restaurants')}
          >
            <span className="nav-icon"><i className="fa-solid fa-chart-line"></i></span>
            <span className="nav-label">Platform Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => handleTabClick('accounts')}
          >
            <span className="nav-icon"><i className="fa-solid fa-users-gear"></i></span>
            <span className="nav-label">Account Management</span>
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
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h2>Super Admin</h2>
          </div>
          <button className="logout-btn-mobile" onClick={handleLogout}>
             <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </header>

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
