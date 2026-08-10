import React from 'react';
import './AdminLayout.css';

export default function AdminLayout({ activeTab, setActiveTab, children, onLogout, restaurant }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'menu', label: 'Menu', icon: '🍔' },
    { id: 'taxonomy', label: 'Categories & Tags', icon: '🏷️' },
    { id: 'bulk', label: 'Bulk Upload', icon: '📁' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>{restaurant ? restaurant.name : 'Dashboard'}</h2>
          <span className="badge">Admin</span>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="mobile-header">
          <h2>{restaurant ? restaurant.name : 'Dashboard'}</h2>
          <button className="logout-btn-mobile" onClick={onLogout}>Logout</button>
        </header>
        
        <div className="tab-container">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
