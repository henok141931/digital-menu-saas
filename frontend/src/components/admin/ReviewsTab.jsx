import React, { useState } from 'react';

export default function ReviewsTab({ feedbacks }) {
  const [ratingFilter, setRatingFilter] = useState('All');

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (ratingFilter === 'All') return true;
    return fb.rating === parseInt(ratingFilter);
  });

  // Calculate stats
  const validRatings = feedbacks.filter(f => f.rating > 0);
  const avgRating = validRatings.length > 0 
    ? (validRatings.reduce((acc, curr) => acc + curr.rating, 0) / validRatings.length).toFixed(1) 
    : 0;
  
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  validRatings.forEach(f => {
    if (ratingCounts[f.rating] !== undefined) ratingCounts[f.rating]++;
  });

  return (
    <div className="tab-pane">
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Customer Reviews</h2>

      {/* Summary Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', minWidth: '150px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-main)' }}>{avgRating}</div>
          <div style={{ color: '#fbbf24', fontSize: '24px', marginBottom: '8px' }}>
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Based on {validRatings.length} reviews</div>
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star];
            const percentage = validRatings.length > 0 ? (count / validRatings.length) * 100 : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ minWidth: '40px', fontSize: '14px', color: 'var(--text-main)' }}>{star} ★</span>
                <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: '#fbbf24' }}></div>
                </div>
                <span style={{ minWidth: '30px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px' }}>All Reviews</h3>
        <select 
          className="admin-input" 
          value={ratingFilter} 
          onChange={e => setRatingFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars only</option>
          <option value="4">4 Stars only</option>
          <option value="3">3 Stars only</option>
          <option value="2">2 Stars only</option>
          <option value="1">1 Star only</option>
        </select>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map(fb => (
            <div key={fb._id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>{fb.customerName}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(fb.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ color: '#fbbf24', fontSize: '18px' }}>
                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                </div>
              </div>
              {fb.comment && (
                <p style={{ color: 'var(--text-main)', lineHeight: '1.5', marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  {fb.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            No reviews found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
