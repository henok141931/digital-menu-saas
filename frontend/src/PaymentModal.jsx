import { useState } from 'react';
import './App.css';

function PaymentModal({ restaurant, onClose, originStyle }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!restaurant) return null;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, ...(originStyle ? { background: 'transparent' } : {}) }}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px', textAlign: 'center', ...(originStyle || {}) }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Payment Information</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Please use the following accounts to make your payment.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 ? (
            restaurant.paymentMethods.map((pm, i) => (
              <div key={i} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--brand-color)' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>{pm.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: '500' }}>{pm.accountNumber}</div>
                  <button 
                    onClick={() => handleCopy(pm.accountNumber, i)}
                    style={{ background: 'transparent', border: 'none', color: copiedIndex === i ? '#10b981' : 'var(--brand-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {copiedIndex === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No digital payment methods available.</p>
          )}
        </div>

        <button onClick={onClose} className="add-btn" style={{ width: '100%', marginTop: '24px', padding: '12px', background: '#e2e8f0', color: 'var(--text-main)', border: 'none' }}>
          Close
        </button>
      </div>
    </div>
  );
}

export default PaymentModal;
