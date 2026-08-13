import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import AdminLayout from './AdminLayout';

// Tabs
import OverviewTab from './OverviewTab';
import MenuTab from './MenuTab';
import TaxonomyTab from './TaxonomyTab';
import BulkUploadTab from './BulkUploadTab';
import ReviewsTab from './ReviewsTab';
import SettingsTab from './SettingsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurantData, setRestaurantData] = useState(null);
  const [menuData, setMenuData] = useState({ categories: [], items: [], tags: [] });
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
      navigate('/login');
      return;
    }
    
    // Simple RBAC: only SUPER_ADMIN or ADMIN can access
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      navigate('/');
      return;
    }

    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      const restaurantId = localStorage.getItem('restaurantId');
      
      // If super admin and no specific restaurant selected, this might need handling
      // For now, assume a restaurant context exists for Admin
      
      const resRes = await fetch(`${BASE_URL}/api/restaurants/id/${restaurantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resRes.ok) throw new Error('Failed to fetch restaurant settings');
      const rData = await resRes.json();
      setRestaurantData(rData);

      // Inject brand color to CSS variable for consistency in Admin too
      if (rData.brandColor) {
        document.documentElement.style.setProperty('--brand-color', rData.brandColor);
      }

      // Fetch Menu
      const menuRes = await fetch(`${BASE_URL}/api/menu/${restaurantId}?all=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (menuRes.ok) {
        const mData = await menuRes.json();
        setMenuData({
          categories: mData.categories || [],
          items: mData.items || [],
          tags: mData.tags || []
        });
      }

      // Fetch Feedbacks
      const fbRes = await fetch(`${BASE_URL}/api/feedback/${restaurantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        setFeedbacks(fbData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('restaurantId');
    navigate('/login');
  };

  // Callback to refresh menu data after edits without full page loader
  const refreshMenu = async () => {
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    const menuRes = await fetch(`${BASE_URL}/api/menu/${restaurantId}?all=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (menuRes.ok) {
      const mData = await menuRes.json();
      setMenuData({
        categories: mData.categories || [],
        items: mData.items || [],
        tags: mData.tags || []
      });
    }
  };

  const refreshRestaurant = async () => {
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    const resRes = await fetch(`${BASE_URL}/api/restaurants/id/${restaurantId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resRes.ok) {
      const rData = await resRes.json();
      setRestaurantData(rData);
      if (rData.brandColor) {
        document.documentElement.style.setProperty('--brand-color', rData.brandColor);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <p style={{ color: '#64748b' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        <p>Error loading dashboard: {error}</p>
        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}>
          Logout and Try Again
        </button>
      </div>
    );
  }

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
      restaurant={restaurantData}
    >
      {activeTab === 'overview' && (
        <OverviewTab restaurant={restaurantData} menuData={menuData} feedbacks={feedbacks} />
      )}
      
      {activeTab === 'menu' && (
        <MenuTab menuData={menuData} setMenuData={setMenuData} refreshMenu={refreshMenu} restaurant={restaurantData} />
      )}
      
      {activeTab === 'taxonomy' && (
        <TaxonomyTab menuData={menuData} refreshMenu={refreshMenu} restaurant={restaurantData} />
      )}
      
      {activeTab === 'bulk' && (
        <BulkUploadTab refreshMenu={refreshMenu} restaurant={restaurantData} />
      )}
      
      {activeTab === 'reviews' && (
        <ReviewsTab feedbacks={feedbacks} />
      )}
      
      {activeTab === 'settings' && (
        <SettingsTab restaurant={restaurantData} refreshRestaurant={refreshRestaurant} />
      )}
    </AdminLayout>
  );
}
