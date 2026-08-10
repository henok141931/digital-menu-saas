import React from 'react';

export default function ItemModal({ item, onClose, originStyle }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={originStyle ? { background: 'transparent' } : {}}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={originStyle || {}}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="modal-image" />
        )}
        
        <h2 className="modal-title">{item.name}</h2>
        <span className="modal-price">{item.price} ETB</span>
        
        <p className="modal-desc">{item.description}</p>
        
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="dietary-tags" style={{ marginBottom: '20px' }}>
            {item.dietaryTags.map(tag => (
              <span key={tag} className={`dietary-tag ${tag.toLowerCase().replace(' ', '-')}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
