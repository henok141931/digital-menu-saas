import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import './App.css';

function EditItemModal({ item, categories, tags = [], restaurant, onClose, onSave }) {
  const [name, setName] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [dietaryTags, setDietaryTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setNameAm(item.nameAm || '');
      setDescription(item.description || '');
      setDescriptionAm(item.descriptionAm || '');
      setPrice(item.price || '');
      setImageUrl(item.imageUrl || '');
      setCategoryId(item.categoryId || '');
      setDietaryTags(item.dietaryTags || []);
    }
  }, [item]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Cloudinary error:", data);
        throw new Error(data.error?.message || 'Image upload failed');
      }
      
      setImageUrl(data.secure_url);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    const updatedData = {
      name,
      nameAm,
      description,
      descriptionAm,
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
    <BaseModal isOpen={true} onClose={onClose}>
      <h2 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '20px' }}>Edit Menu Item</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Name (English)</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="admin-input" 
                style={{ width: '100%' }}
                required 
              />
            </div>
            {restaurant?.enableAmharic && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Name (Amharic)</label>
                <input 
                  type="text" 
                  value={nameAm}
                  onChange={e => setNameAm(e.target.value)}
                  className="admin-input" 
                  style={{ width: '100%' }}
                />
              </div>
            )}
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
          
          <div style={{ display: 'flex', gap: '16px', flexDirection: restaurant?.enableAmharic ? 'row' : 'column' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Description (English)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="admin-input" 
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            {restaurant?.enableAmharic && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Description (Amharic)</label>
                <textarea 
                  value={descriptionAm}
                  onChange={e => setDescriptionAm(e.target.value)}
                  className="admin-input" 
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            )}
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
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontSize: '14px' }}>Menu Item Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                style={{ color: 'var(--text-main)', fontSize: '14px' }}
              />
              {isUploading && <span style={{ fontSize: '13px', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>Uploading image to Cloudinary...</span>}
              {imageUrl && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <img src={imageUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                  <button type="button" onClick={() => setImageUrl('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', padding: '4px 0', marginTop: '4px' }}>Remove Image</button>
                </div>
              )}
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
    </BaseModal>
  );
}

export default EditItemModal;
