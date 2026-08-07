import { BASE_URL } from './config';
import { useState } from 'react';
import './App.css';

function FeedbackModal({ restaurant, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!restaurant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          rating,
          comment,
          customerName
        })
      });

      if (!res.ok) throw new Error('Failed to submit feedback');
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-main)', textAlign: 'center' }}>Leave Feedback</h2>
        
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Thank you!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your feedback helps us improve.</p>
            <button onClick={onClose} className="add-btn primary" style={{ width: '100%' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div className="status error">{error}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <label style={{ color: 'var(--text-main)', fontWeight: '500' }}>Rating (1-5)</label>
              <div style={{ display: 'flex', gap: '8px', fontSize: '32px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => setRating(star)}
                    style={{ color: star <= rating ? '#fbbf24' : '#e2e8f0' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: 'var(--text-muted)' }}>Name (Optional)</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="admin-input" 
                placeholder="Anonymous"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: 'var(--text-muted)' }}>Comment (Optional)</label>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="admin-input" 
                placeholder="How was your experience?"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={onClose} className="add-btn" style={{ flex: 1, background: '#e2e8f0', color: 'var(--text-main)', border: 'none' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="add-btn primary" style={{ flex: 1 }}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;
