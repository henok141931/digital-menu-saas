import { useState, useEffect } from 'react';
import './App.css';

function EditItemModal({ item, categories, tags = [], onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dietaryTags, setDietaryTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setDescription(item.description || '');
      setPrice(item.price || '');
      setImageUrl(item.imageUrl || '');
      setCategoryId(item.categoryId || '');
      setDietaryTags(item.dietaryTags || []);
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    const updatedData = {
      name,
      description,
      price: Number(price),
      imageUrl,
      categoryId,
      dietaryTags
    };

    await onSave(item._id, updatedData);
    setIsSubmitting(false);
  };

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '20px' }}>Edit Menu Item</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="admin-input" 
              style={{ width: '100%' }}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Category</label>
            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)} 
              className="admin-input" 
              style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }}
              required
            >
              {categories.map(cat => (
                <option key={cat._id} value={cat._id} style={{ color: '#000' }}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="admin-input" 
              style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Price (ETB)</label>
              <input 
                type="number" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="admin-input" 
                style={{ width: '100%' }}
                required 
                min="0"
                step="0.01"
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Image URL</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="admin-input" 
                style={{ width: '100%' }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <span style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Dietary Tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-main)' }}>
              {tags && tags.map(tag => (
                <label key={tag._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={dietaryTags.includes(tag.name)}
                    onChange={(e) => {
                      if (e.target.checked) setDietaryTags(prev => [...prev, tag.name]);
                      else setDietaryTags(prev => prev.filter(t => t !== tag.name));
                    }}
                  />
                  {tag.name}
                </label>
              ))}
              {(!tags || tags.length === 0) && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tags available. Add some in the Admin Panel!</span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="add-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
              Cancel
            </button>
            <button type="submit" className="add-btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditItemModal;
