import React from 'react';
import BaseModal from './BaseModal';

export default function ItemModal({ item, onClose }) {
  if (!item) return null;

  return (
    <BaseModal isOpen={!!item} onClose={onClose}>
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
    </BaseModal>
  );
}
