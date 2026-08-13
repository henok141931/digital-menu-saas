import React, { useState, useMemo } from 'react';
import EditItemModal from '../../EditItemModal';
import BaseModal from '../../BaseModal';
import ConfirmModal from '../../ConfirmModal';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';

export default function MenuTab({ menuData, setMenuData, refreshMenu, restaurant }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  
  // Selection
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Modals
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Add Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemNameAm, setNewItemNameAm] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDescAm, setNewItemDescAm] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCatId, setNewItemCatId] = useState('');
  const [newItemDietary, setNewItemDietary] = useState([]);
  const [newItemImage, setNewItemImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isItemSubmitting, setIsItemSubmitting] = useState(false);

  // Filter Logic
  const filteredCategories = useMemo(() => {
    return menuData.categories.map(cat => {
      const items = menuData.items.filter(item => {
        const matchesCat = item.categoryId === cat._id;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = filterTag === 'All' || (item.dietaryTags && item.dietaryTags.includes(filterTag));
        return matchesCat && matchesSearch && matchesTag;
      });
      return { ...cat, items };
    }).filter(cat => cat.items.length > 0);
  }, [menuData, searchQuery, filterTag]);

  // Bulk Selection
  const toggleSelectAll = (e, items) => {
    if (e.target.checked) {
      const newIds = [...new Set([...selectedItemIds, ...items.map(i => i._id)])];
      setSelectedItemIds(newIds);
    } else {
      const itemIds = items.map(i => i._id);
      setSelectedItemIds(selectedItemIds.filter(id => !itemIds.includes(id)));
    }
  };

  const toggleSelect = (id) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItemIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const restaurantId = localStorage.getItem('restaurantId');
      const res = await fetch(`${BASE_URL}/api/menu/items/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemIds: selectedItemIds })
      });
      
      if (!res.ok) throw new Error('Failed to bulk delete items');
      Toast.success(`Deleted ${selectedItemIds.length} items`);
      setSelectedItemIds([]);
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/menu/items/${itemToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete item');
      Toast.success('Item deleted');
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    // Optimistic UI update
    if (setMenuData) {
      setMenuData(prev => ({
        ...prev,
        items: prev.items.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item)
      }));
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/menu/items/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to toggle availability');
      Toast.success(currentStatus ? 'Item marked Out of Stock' : 'Item marked Available');
    } catch (err) {
      Toast.error(err.message);
      // Revert on failure
      if (setMenuData) {
        setMenuData(prev => ({
          ...prev,
          items: prev.items.map(item => item._id === id ? { ...item, isAvailable: currentStatus } : item)
        }));
      }
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (isItemSubmitting) return;
    setIsItemSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const restaurantId = localStorage.getItem('restaurantId');
      
      const payload = {
        restaurantId,
        name: newItemName,
        nameAm: newItemNameAm,
        description: newItemDesc,
        descriptionAm: newItemDescAm,
        price: parseFloat(newItemPrice),
        categoryId: newItemCatId,
        dietaryTags: newItemDietary,
        imageUrl: newItemImage
      };

      const res = await fetch(`${BASE_URL}/api/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to create item');
      Toast.success('Item added');
      
      // Reset form
      setNewItemName('');
      setNewItemNameAm('');
      setNewItemDesc('');
      setNewItemDescAm('');
      setNewItemPrice('');
      setNewItemCatId('');
      setNewItemDietary([]);
      setNewItemImage('');
      setIsAddingItem(false);
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleImageUpload = async (e, setter) => {
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
      setter(data.secure_url);
      Toast.success('Image uploaded');
    } catch (err) {
      Toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="tab-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Menu Items</h2>
        <button className="add-btn primary" onClick={() => setIsAddingItem(true)}>
          + Add Item
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search items..." 
          className="admin-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select 
          className="admin-input" 
          value={filterTag} 
          onChange={e => setFilterTag(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="All">All Dietary Tags</option>
          {menuData.tags.map(tag => (
            <option key={tag._id} value={tag.name}>{tag.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedItemIds.length > 0 && (
        <div className="bulk-action-bar" style={{ position: 'sticky', top: '0', zIndex: 5, background: 'var(--brand-color)', color: 'white', padding: '12px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <span style={{ fontWeight: '600' }}>{selectedItemIds.length} items selected</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setSelectedItemIds([])} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button 
              onClick={handleBulkDelete} 
              disabled={isBulkDeleting}
              style={{ background: 'white', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {/* Item List by Category */}
      {filteredCategories.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredCategories.map(cat => (
            <div key={cat._id} className="category-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                <input 
                  type="checkbox" 
                  onChange={(e) => toggleSelectAll(e, cat.items)}
                  checked={cat.items.every(i => selectedItemIds.includes(i._id))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{cat.name}</h3>
                <span className="badge" style={{ background: '#e2e8f0', color: 'var(--text-muted)' }}>{cat.items.length}</span>
              </div>
              
              <div className="item-table" style={{ display: 'grid', gap: '12px' }}>
                {cat.items.map(item => (
                  <div key={item._id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '16px', borderLeft: selectedItemIds.includes(item._id) ? '4px solid var(--brand-color)' : '4px solid transparent' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedItemIds.includes(item._id)}
                      onChange={() => toggleSelect(item._id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>🍽️</div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ color: 'var(--brand-color)', fontWeight: 'bold', fontSize: '14px' }}>{item.price} ETB</div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                      {item.dietaryTags && item.dietaryTags.map(tag => (
                        <span key={tag} className={`dietary-tag ${tag.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                        style={{ 
                          width: '40px', height: '22px', borderRadius: '12px', 
                          background: item.isAvailable ? '#22c55e' : '#cbd5e1', 
                          position: 'relative', cursor: 'pointer', transition: '0.2s',
                          marginRight: '8px'
                        }}
                        title={item.isAvailable ? "Mark Out of Stock" : "Mark Available"}
                      >
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                          position: 'absolute', top: '2px', left: item.isAvailable ? '20px' : '2px',
                          transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                      <button onClick={() => setEditingItem(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }} title="Edit Item">✏️</button>
                      <button onClick={() => setItemToDelete(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px', color: '#ef4444' }} title="Delete Item">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No items found matching your filters.
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal 
          item={editingItem} 
          categories={menuData.categories}
          tags={menuData.tags}
          restaurant={restaurant}
          onClose={() => setEditingItem(null)} 
          onSave={refreshMenu} 
        />
      )}

      {/* Add Item Modal */}
      <BaseModal isOpen={isAddingItem} onClose={() => setIsAddingItem(false)}>
        <h2 style={{ marginBottom: '20px', color: 'var(--text-main)', fontSize: '20px' }}>Add Menu Item</h2>
        
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Item Name (English)</label>
              <input 
                type="text" 
                value={newItemName} 
                onChange={e => setNewItemName(e.target.value)} 
                className="admin-input" 
                required
              />
            </div>
            {restaurant?.enableAmharic && (
              <div style={{ flex: 1 }}>
                <label className="admin-label">Item Name (Amharic)</label>
                <input 
                  type="text" 
                  value={newItemNameAm} 
                  onChange={e => setNewItemNameAm(e.target.value)} 
                  className="admin-input" 
                />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexDirection: restaurant?.enableAmharic ? 'row' : 'column' }}>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Description (English)</label>
              <textarea 
                value={newItemDesc} 
                onChange={e => setNewItemDesc(e.target.value)} 
                className="admin-input" 
                rows={3}
              />
            </div>
            {restaurant?.enableAmharic && (
              <div style={{ flex: 1 }}>
                <label className="admin-label">Description (Amharic)</label>
                <textarea 
                  value={newItemDescAm} 
                  onChange={e => setNewItemDescAm(e.target.value)} 
                  className="admin-input" 
                  rows={3}
                />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Price (ETB)</label>
              <input 
                type="number" 
                step="0.01" 
                value={newItemPrice} 
                onChange={e => setNewItemPrice(e.target.value)} 
                className="admin-input" 
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Category</label>
              <select 
                value={newItemCatId} 
                onChange={e => setNewItemCatId(e.target.value)} 
                className="admin-input" 
                required
              >
                <option value="">Select Category</option>
                {menuData.categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="admin-label">Dietary Tags</label>
            <div className="tags-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {menuData.tags.map(tag => (
                <label key={tag._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
                  <input 
                    type="checkbox"
                    checked={newItemDietary.includes(tag.name)}
                    onChange={(e) => {
                      if (e.target.checked) setNewItemDietary([...newItemDietary, tag.name]);
                      else setNewItemDietary(newItemDietary.filter(t => t !== tag.name));
                    }}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="admin-label">Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, setNewItemImage)} 
              className="admin-input" 
            />
            {isUploading && <span style={{ fontSize: '12px', color: 'var(--brand-color)' }}>Uploading to Cloudinary...</span>}
            {newItemImage && (
              <img src={newItemImage} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
            )}
          </div>
          
          <button type="submit" disabled={isItemSubmitting || isUploading} className="add-btn primary" style={{ marginTop: '8px', padding: '12px' }}>
            {isItemSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </BaseModal>

      {/* Delete Confirmation */}
      {itemToDelete && (
        <ConfirmModal 
          isOpen={true}
          message={`Are you sure you want to delete ${itemToDelete.name}?`} 
          onConfirm={handleDeleteItem} 
          onCancel={() => setItemToDelete(null)} 
        />
      )}
    </div>
  );
}
