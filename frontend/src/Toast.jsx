import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';

function Toast({ message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // wait for fade out animation before unmounting
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'error' ? '#ef4444' : '#10b981';

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: `translateX(-50%) translateY(${isVisible ? '0' : '20px'})`,
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: bgColor,
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: '500',
      fontSize: '14px',
      pointerEvents: 'none'
    }}>
      <span style={{ fontSize: '18px' }}>
        {type === 'error' ? '⚠️' : '✓'}
      </span>
      {message}
    </div>
  );
}
let toastRoot = null;

Toast.show = (message, type = 'success') => {
  if (typeof document === 'undefined') return;
  const containerId = 'toast-container-global';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
    toastRoot = createRoot(container);
  }
  
  toastRoot.render(
    <Toast message={message} type={type} onClose={() => {
      if (toastRoot) toastRoot.render(null);
    }} />
  );
};

Toast.success = (message) => Toast.show(message, 'success');
Toast.error = (message) => Toast.show(message, 'error');

export default Toast;
