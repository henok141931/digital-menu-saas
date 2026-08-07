import './App.css';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 1200 }}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px', textAlign: 'center', maxWidth: '400px' }}>
        
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        
        <h2 style={{ marginBottom: '12px', color: 'var(--text-main)', fontSize: '20px' }}>{title || 'Are you sure?'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
          {message || 'This action cannot be undone.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={onCancel} 
            className="add-btn" 
            style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="add-btn danger" 
            style={{ flex: 1 }}
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
