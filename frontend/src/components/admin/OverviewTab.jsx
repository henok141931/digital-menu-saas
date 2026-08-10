import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function OverviewTab({ restaurant, menuData, feedbacks }) {
  const qrRef = useRef();

  if (!restaurant) return null;

  const totalScans = restaurant.viewCount || 0;
  const itemCount = menuData.items.length || 0;
  const categoryCount = menuData.categories.length || 0;
  
  // Calculate Average Rating
  const validRatings = feedbacks.filter(f => f.rating > 0);
  const avgRating = validRatings.length > 0 
    ? (validRatings.reduce((acc, curr) => acc + curr.rating, 0) / validRatings.length).toFixed(1) 
    : 'N/A';

  const menuUrl = `${window.location.origin}/${restaurant.slug}`;

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${restaurant.slug}-qr.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Recent feedbacks (latest 3)
  const recentFeedbacks = feedbacks.slice(0, 3);

  return (
    <div className="tab-pane">
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Stat Cards */}
        <div className="stat-card">
          <div className="stat-label">Total QR Scans</div>
          <div className="stat-value">{totalScans}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">⭐ {avgRating}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Menu Items</div>
          <div className="stat-value">{itemCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{categoryCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* QR Code Section */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Your QR Menu</h3>
          <div ref={qrRef} style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <QRCodeSVG 
              value={menuUrl} 
              size={200}
              fgColor={restaurant.brandColor || "#000000"} 
            />
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
            Customers can scan this code to view your digital menu and leave feedback.
          </p>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button className="add-btn primary" onClick={downloadQR} style={{ flex: 1 }}>Download QR</button>
            <a href={menuUrl} target="_blank" rel="noreferrer" className="add-btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', background: '#e2e8f0', color: 'var(--text-main)' }}>View Menu</a>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Recent Feedback</h3>
          {recentFeedbacks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentFeedbacks.map(fb => (
                <div key={fb._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{fb.customerName}</strong>
                    <span style={{ color: '#fbbf24' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                  </div>
                  {fb.comment && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>"{fb.comment}"</p>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No feedback received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
