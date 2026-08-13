import React, { useState } from 'react';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';

export default function SettingsTab({ restaurant, refreshRestaurant }) {
  // Local state for forms
  const [brandColor, setBrandColor] = useState(restaurant?.brandColor || '#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState(restaurant?.secondaryColor || '#1e40af');
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant?.coverImageUrl || '');
  const [enableAmharic, setEnableAmharic] = useState(restaurant?.enableAmharic || false);
  const [isColorSubmitting, setIsColorSubmitting] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState(restaurant?.paymentMethods || []);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const [contactPhone, setContactPhone] = useState(restaurant?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(restaurant?.contactEmail || '');
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

  const [socialLinks, setSocialLinks] = useState(restaurant?.socialLinks || { facebook: '', instagram: '', telegram: '', tiktok: '' });
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);

  const handleUpdateSection = async (section, payload, setSubmitting) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const restaurantId = localStorage.getItem('restaurantId');
      const res = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(`Failed to update ${section}`);
      Toast.success(`${section} updated successfully`);
      refreshRestaurant();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleColorUpdate = (e) => {
    e.preventDefault();
    handleUpdateSection('Branding & Features', { brandColor, secondaryColor, coverImageUrl, enableAmharic }, setIsColorSubmitting);
  };

  const handlePaymentUpdate = (e) => {
    e.preventDefault();
    handleUpdateSection('Payment Methods', { paymentMethods }, setIsPaymentSubmitting);
  };

  const handleContactUpdate = (e) => {
    e.preventDefault();
    handleUpdateSection('Contact Info', { contactPhone, contactEmail }, setIsContactSubmitting);
  };

  const handleSocialUpdate = (e) => {
    e.preventDefault();
    handleUpdateSection('Social Links', { socialLinks }, setIsSocialSubmitting);
  };

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { name: '', accountNumber: '' }]);
  };

  const removePaymentMethod = (index) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index, field, value) => {
    const updated = [...paymentMethods];
    updated[index][field] = value;
    setPaymentMethods(updated);
  };

  return (
    <div className="tab-pane">
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Branding */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>🎨 Branding</h3>
          <form onSubmit={handleColorUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
              <div style={{ flex: 1 }}>
                <label className="admin-label">Primary Color</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Used for buttons and active states</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
              <div style={{ flex: 1 }}>
                <label className="admin-label">Secondary Color</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Used for accents and gradients</div>
              </div>
            </div>

            <div>
              <label className="admin-label">Cover Image URL</label>
              <input type="url" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className="admin-input" placeholder="https://example.com/image.jpg" />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Displays at the top of the customer menu</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <input 
                type="checkbox" 
                id="enableAmharic" 
                checked={enableAmharic} 
                onChange={(e) => setEnableAmharic(e.target.checked)} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <label htmlFor="enableAmharic" style={{ fontWeight: '600', cursor: 'pointer' }}>Enable Amharic (Dual-Language)</label>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Show a language toggle on your live menu and allow Amharic translations for items.</div>
              </div>
            </div>

            <button type="submit" disabled={isColorSubmitting} className="add-btn primary" style={{ marginTop: '8px' }}>
              {isColorSubmitting ? 'Saving...' : 'Save Branding & Features'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>📞 Contact Info</h3>
          <form onSubmit={handleContactUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="admin-label">Phone Number</label>
              <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="admin-input" placeholder="+251 911 234 567" />
            </div>
            <div>
              <label className="admin-label">Email Address</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="admin-input" placeholder="contact@restaurant.com" />
            </div>
            <button type="submit" disabled={isContactSubmitting} className="add-btn primary" style={{ marginTop: '8px' }}>
              {isContactSubmitting ? 'Saving...' : 'Save Contact'}
            </button>
          </form>
        </div>

        {/* Payment Methods */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>💳 Digital Payment Methods</h3>
            <button type="button" onClick={addPaymentMethod} className="add-btn" style={{ background: '#e2e8f0', color: 'var(--text-main)', border: 'none', padding: '4px 12px', fontSize: '12px' }}>+ Add Account</button>
          </div>
          
          <form onSubmit={handlePaymentUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {paymentMethods.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No payment methods added yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {paymentMethods.map((pm, index) => (
                  <div key={index} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <button type="button" onClick={() => removePaymentMethod(index)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✖</button>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="admin-label">Bank / Wallet Name</label>
                      <input type="text" value={pm.name} onChange={e => handlePaymentChange(index, 'name', e.target.value)} className="admin-input" placeholder="e.g. CBE Birr, Telebirr" required />
                    </div>
                    <div>
                      <label className="admin-label">Account Number</label>
                      <input type="text" value={pm.accountNumber} onChange={e => handlePaymentChange(index, 'accountNumber', e.target.value)} className="admin-input" placeholder="1000123456789" required />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" disabled={isPaymentSubmitting} className="add-btn primary" style={{ minWidth: '150px' }}>
                {isPaymentSubmitting ? 'Saving...' : 'Save Payments'}
              </button>
            </div>
          </form>
        </div>

        {/* Social Links */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>🔗 Social Media Links</h3>
          <form onSubmit={handleSocialUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label className="admin-label">Instagram URL</label>
              <input type="url" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} className="admin-input" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="admin-label">Facebook URL</label>
              <input type="url" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} className="admin-input" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="admin-label">TikTok URL</label>
              <input type="url" value={socialLinks.tiktok} onChange={e => setSocialLinks({...socialLinks, tiktok: e.target.value})} className="admin-input" placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <label className="admin-label">Telegram URL</label>
              <input type="url" value={socialLinks.telegram} onChange={e => setSocialLinks({...socialLinks, telegram: e.target.value})} className="admin-input" placeholder="https://t.me/..." />
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" disabled={isSocialSubmitting} className="add-btn primary" style={{ minWidth: '150px' }}>
                {isSocialSubmitting ? 'Saving...' : 'Save Social Links'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
