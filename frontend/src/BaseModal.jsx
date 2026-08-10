import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './App.css';

export default function BaseModal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;

    // Scroll lock
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Hardware Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
