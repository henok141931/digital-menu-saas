import { useState, useEffect } from 'react';
import './App.css';

function PromptModal({ isOpen, title, initialValue, placeholder, onConfirm, onCancel }) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue || '');
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 1200 }}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px' }}>
        
        <h2 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '20px' }}>{title}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="admin-input"
            autoFocus
            required
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          />
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button 
              type="button"
              onClick={onCancel} 
              className="add-btn" 
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="add-btn primary" 
              style={{ padding: '8px 16px' }}
              disabled={!inputValue.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PromptModal;
