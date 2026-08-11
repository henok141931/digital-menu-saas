import React, { useState } from 'react';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';
import ConfirmModal from '../../ConfirmModal';
import PromptModal from '../../PromptModal';

export default function TaxonomyTab({ menuData, refreshMenu }) {
  const [newCatName, setNewCatName] = useState('');
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  
  const [newTagName, setNewTagName] = useState('');
  const [isTagSubmitting, setIsTagSubmitting] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null); // { type: 'category' | 'tag', id: string, name: string }
  const [editItem, setEditItem] = useState(null); // { type: 'category' | 'tag', id: string, name: string }

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsCatSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const restaurantId = localStorage.getItem('restaurantId');
      const res = await fetch(`${BASE_URL}/api/menu/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, name: newCatName })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to add category');
      }
      setNewCatName('');
      Toast.success('Category added');
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setIsCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteItem || deleteItem.type !== 'category') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/menu/categories/${deleteItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete category');
      }
      Toast.success('Category deleted');
      setDeleteItem(null);
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsTagSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const restaurantId = localStorage.getItem('restaurantId');
      const res = await fetch(`${BASE_URL}/api/menu/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, name: newTagName })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to add tag');
      }
      setNewTagName('');
      Toast.success('Tag added');
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setIsTagSubmitting(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteItem || deleteItem.type !== 'tag') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/menu/tags/${deleteItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete tag');
      }
      Toast.success('Tag deleted');
      setDeleteItem(null);
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const confirmDelete = () => {
    if (deleteItem.type === 'category') handleDeleteCategory();
    if (deleteItem.type === 'tag') handleDeleteTag();
  };

  const handleEditConfirm = async (newName) => {
    if (!editItem || !newName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = editItem.type === 'category' ? `/api/menu/categories/${editItem.id}` : `/api/menu/tags/${editItem.id}`;
      
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update ${editItem.type}`);
      }
      
      Toast.success(`${editItem.type === 'category' ? 'Category' : 'Tag'} updated`);
      setEditItem(null);
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    }
  };

  return (
    <div className="tab-pane">
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Categories & Tags</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Categories Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Categories</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input 
              type="text" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              placeholder="e.g. Starters, Mains" 
              className="admin-input" 
              style={{ flex: 1 }}
              required 
            />
            <button type="submit" disabled={isCatSubmitting} className="add-btn primary" style={{ whiteSpace: 'nowrap' }}>
              {isCatSubmitting ? 'Adding...' : 'Add'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {menuData.categories.length > 0 ? menuData.categories.map(cat => (
              <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '500' }}>{cat.name}</span>
                <div>
                  <button 
                    onClick={() => setEditItem({ type: 'category', id: cat._id, name: cat.name })} 
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
                    title="Edit Category"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => setDeleteItem({ type: 'category', id: cat._id, name: cat.name })} 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Delete Category"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)' }}>No categories created yet.</p>
            )}
          </div>
        </div>

        {/* Dietary Tags Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Dietary Tags</h3>
          <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input 
              type="text" 
              value={newTagName} 
              onChange={e => setNewTagName(e.target.value)} 
              placeholder="e.g. Vegan, Gluten-Free" 
              className="admin-input" 
              style={{ flex: 1 }}
              required 
            />
            <button type="submit" disabled={isTagSubmitting} className="add-btn primary" style={{ whiteSpace: 'nowrap' }}>
              {isTagSubmitting ? 'Adding...' : 'Add'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {menuData.tags && menuData.tags.length > 0 ? menuData.tags.map(tag => (
              <div key={tag._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className={`dietary-tag ${tag.name.toLowerCase().replace(' ', '-')}`}>
                  {tag.name}
                </span>
                <div>
                  <button 
                    onClick={() => setEditItem({ type: 'tag', id: tag._id, name: tag.name })} 
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
                    title="Edit Tag"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => setDeleteItem({ type: 'tag', id: tag._id, name: tag.name })} 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Delete Tag"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)' }}>No dietary tags created yet.</p>
            )}
          </div>
        </div>

      </div>

      {deleteItem && (
        <ConfirmModal 
          isOpen={true}
          message={`Are you sure you want to delete the ${deleteItem.type} "${deleteItem.name}"? This action cannot be undone.`} 
          onConfirm={confirmDelete} 
          onCancel={() => setDeleteItem(null)} 
        />
      )}

      <PromptModal
        isOpen={!!editItem}
        title={`Edit ${editItem?.type === 'category' ? 'Category' : 'Tag'}`}
        initialValue={editItem?.name}
        placeholder="Enter new name"
        onConfirm={handleEditConfirm}
        onCancel={() => setEditItem(null)}
      />
    </div>
  );
}
