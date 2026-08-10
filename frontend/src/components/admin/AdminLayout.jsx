import React, { useState } from 'react';
import './AdminLayout.css';

export default function AdminLayout({ activeTab, setActiveTab, children, onLogout, restaurant }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-solid fa-chart-line' },
    { id: 'menu', label: 'Menu', icon: 'fa-solid fa-burger' },
    { id: 'taxonomy', label: 'Categories & Tags', icon: 'fa-solid fa-tags' },
    { id: 'bulk', label: 'Bulk Upload', icon: 'fa-solid fa-file-csv' },
    { id: 'reviews', label: 'Reviews', icon: 'fa-solid fa-star' },
    { id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear' },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false); // Close sidebar on mobile after selecting a tab
  };

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{restaurant ? restaurant.name : 'Dashboard'}</h2>
          <span className="badge">Admin</span>
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="nav-icon"><i className={tab.icon}></i></span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={onLogout}>
            <span className="nav-icon"><i className="fa-solid fa-right-from-bracket"></i></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h2>{restaurant ? restaurant.name : 'Dashboard'}</h2>
          </div>
          <button className="logout-btn-mobile" onClick={onLogout}>
             <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </header>
        
        <div className="tab-container">
          {children}
        </div>
      </main>
    </div>
  );
}
