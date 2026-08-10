import { BASE_URL } from './config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import EditItemModal from './EditItemModal';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';
import PromptModal from './PromptModal';
import Papa from 'papaparse';
import './App.css';

function AdminPanel() {
  const [menuData, setMenuData] = useState({ categories: [], items: [], tags: [] });
  const [restaurantData, setRestaurantData] = useState(null);
  const [error, setError] = useState(null);
  
  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);

  // Tag Form State
  const [newTagName, setNewTagName] = useState('');
  const [isTagSubmitting, setIsTagSubmitting] = useState(false);

  // Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemCatId, setNewItemCatId] = useState('');
  const [newItemDietary, setNewItemDietary] = useState([]);
  const [isItemSubmitting, setIsItemSubmitting] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);

  // Bulk Action State
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Settings State
  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    telegram: '',
    tiktok: ''
  });

  const [isColorSubmitting, setIsColorSubmitting] = useState(false);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState([]);

  // Bulk Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Category,ItemName,Description,Price,DietaryTags\nStarters,Garlic Bread,Crispy bread with garlic butter,5.99,Fasting\nMains,Margherita Pizza,Classic cheese and tomato pizza,12.99,Fasting\nMains,Chicken Wings,Spicy buffalo wings,8.99,Non-Fasting";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "menu_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      processCSV(file);
    } else {
      showToast('Please upload a valid CSV file', 'error');
    }
  };

  const processCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: async (results) => {
        const expectedHeaders = ['category', 'itemname', 'description', 'price', 'dietarytags'];
        const headers = results.meta.fields;
        const isValid = expectedHeaders.every(h => headers.includes(h));
        
        if (!isValid) {
          showToast('Invalid CSV format. Please ensure you have the correct columns (Category, ItemName, Description, Price, DietaryTags).', 'error');
          return;
        }
        
        setIsUploadingCSV(true);
        try {
          const res = await fetch(`${BASE_URL}/api/menu/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ items: results.data })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to upload CSV');
          
          showToast(data.message, 'success');
          await fetchMenu();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setIsUploadingCSV(false);
          document.getElementById('csvFileInput').value = '';
        }
      },
      error: () => {
        showToast('Error parsing CSV file', 'error');
      }
    });
  };

  // UI Dialog State
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [promptDialog, setPromptDialog] = useState({ isOpen: false, title: '', initialValue: '', onConfirm: null });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const restaurantId = localStorage.getItem('restaurantId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    fetchMenu();
  }, [token, role, navigate]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/menu/${restaurantId}`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setMenuData(data);
      if (data.categories.length > 0 && !newItemCatId) {
        setNewItemCatId(data.categories[0]._id);
      }

      const restRes = await fetch(`${BASE_URL}/api/restaurants/id/${restaurantId}`);
      if (restRes.ok) {
        const restData = await restRes.json();
        setRestaurantData(restData);
        if (restData.brandColor) setBrandColor(restData.brandColor);
        if (restData.secondaryColor) setSecondaryColor(restData.secondaryColor);
        if (restData.paymentMethods) setPaymentMethods(restData.paymentMethods);
        if (restData.contactPhone) setContactPhone(restData.contactPhone);
        if (restData.contactEmail) setContactEmail(restData.contactEmail);
        if (restData.socialLinks) setSocialLinks({ ...socialLinks, ...restData.socialLinks });
      }

      const fbRes = await fetch(`${BASE_URL}/api/feedback/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (fbRes.ok) {
        setFeedbacks(await fbRes.json());
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsCatSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/menu/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, restaurantId })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to add category');
      }

      setNewCatName('');
      await fetchMenu();
      showToast('Category added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCatSubmitting(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName) return;
    setIsTagSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/menu/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTagName, restaurantId })
      });

      if (!res.ok) throw new Error(await res.text());

      setNewTagName('');
      await fetchMenu();
      showToast('Dietary tag added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTagSubmitting(false);
    }
  };

  const handleDeleteTag = (tagId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Dietary Tag',
      message: 'Are you sure? This tag will be removed from all menu items.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${BASE_URL}/api/menu/tags/${tagId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete tag');
          await fetchMenu();
          showToast('Tag deleted successfully');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCatId) return;
    setIsItemSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDesc,
          price: Number(newItemPrice),
          imageUrl: newItemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Fallback image
          categoryId: newItemCatId,
          restaurantId,
          dietaryTags: newItemDietary
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to add item');
      }

      setNewItemName('');
      setNewItemDesc('');
      setNewItemPrice('');
      setNewItemImage('');
      setNewItemDietary([]);
      await fetchMenu();
      showToast('Menu item added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleUpdateColor = async (e) => {
    e.preventDefault();
    setIsColorSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}/color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ brandColor, secondaryColor, paymentMethods, contactPhone, contactEmail, socialLinks })
      });
      if (!res.ok) throw new Error('Failed to update restaurant settings');
      showToast('Settings updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsColorSubmitting(false);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure? This will delete the category and all its items.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${BASE_URL}/api/menu/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete category');
          await fetchMenu();
          showToast('Category deleted successfully');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  };

  const handleDeleteItem = (itemId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this item?',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${BASE_URL}/api/menu/items/${itemId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to delete item');
          await fetchMenu();
          showToast('Item deleted successfully');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  };

  const handleSelectItem = (itemId) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectCategory = (categoryId, isSelected) => {
    const categoryItemIds = menuData.items.filter(item => item.categoryId === categoryId).map(item => item._id);
    if (isSelected) {
      setSelectedItemIds(prev => [...new Set([...prev, ...categoryItemIds])]);
    } else {
      setSelectedItemIds(prev => prev.filter(id => !categoryItemIds.includes(id)));
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${selectedItemIds.length} Items`,
      message: `Are you sure you want to permanently delete these ${selectedItemIds.length} menu items?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsBulkDeleting(true);
        try {
          const res = await fetch(`${BASE_URL}/api/menu/items/bulk-delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ itemIds: selectedItemIds })
          });
          if (!res.ok) throw new Error('Failed to delete items');
          const data = await res.json();
          setSelectedItemIds([]);
          await fetchMenu();
          showToast(data.message || 'Items deleted successfully');
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setIsBulkDeleting(false);
        }
      }
    });
  };

  const handleEditCategory = (categoryId, currentName) => {
    setPromptDialog({
      isOpen: true,
      title: 'Edit Category Name',
      initialValue: currentName,
      onConfirm: async (newName) => {
        setPromptDialog(prev => ({ ...prev, isOpen: false }));
        if (newName === currentName) return;
        
        try {
          const res = await fetch(`${BASE_URL}/api/menu/categories/${categoryId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ name: newName })
          });
          if (!res.ok) throw new Error('Failed to update category');
          await fetchMenu();
          showToast('Category updated successfully');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  };

  const handleSaveItemEdit = async (itemId, updatedData) => {
    try {
      const res = await fetch(`${BASE_URL}/api/menu/items/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update item');
      setEditingItem(null);
      await fetchMenu();
      showToast('Item updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <div className="menu-container" style={{ padding: '20px' }}>
      <header className="menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Panel</h1>
          <p>Manage Menu Items & Categories</p>
        </div>
        <button onClick={handleLogout} className="add-btn" style={{ padding: '8px 16px' }}>Logout</button>
      </header>

      {error && <div className="status error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
        
        {/* QR CODE & SCAN ANALYTICS */}
        {restaurantData && (
          <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Your QR Code & Analytics</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Print this code and place it on your tables.</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--brand-color)', padding: '16px', borderRadius: '12px', color: '#fff', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{restaurantData.viewCount || 0}</div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Scans</div>
                </div>
                <a 
                  href={`/${restaurantData.slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--brand-color)', fontWeight: '600', textDecoration: 'none' }}
                >
                  View Live Menu &rarr;
                </a>
              </div>
            </div>
            
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <QRCodeSVG 
                value={`http://localhost:5173/${restaurantData.slug}`} 
                size={120} 
                level="M"
                fgColor={brandColor}
              />
            </div>
          </section>
        )}

        {/* SETTINGS FORM */}
        <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Restaurant Settings</h2>
          <form onSubmit={handleUpdateColor} style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <label style={{ color: 'var(--text-main)', fontSize: '15px' }}>Primary Color:</label>
              <input 
                type="color" 
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <label style={{ color: 'var(--text-main)', fontSize: '15px', marginLeft: '16px' }}>Secondary Color:</label>
              <input 
                type="color" 
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
            </div>
            
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-main)' }}>Payment Methods (Wallets/Banks)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                {paymentMethods.map((pm, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <input 
                      type="text" 
                      placeholder="Name (e.g. CBE, Telebirr)" 
                      value={pm.name}
                      onChange={(e) => {
                        const newPM = [...paymentMethods];
                        newPM[index].name = e.target.value;
                        setPaymentMethods(newPM);
                      }}
                      className="admin-input"
                      style={{ flex: 1 }}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Account Number" 
                      value={pm.accountNumber}
                      onChange={(e) => {
                        const newPM = [...paymentMethods];
                        newPM[index].accountNumber = e.target.value;
                        setPaymentMethods(newPM);
                      }}
                      className="admin-input"
                      style={{ flex: 2 }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethods(paymentMethods.filter((_, i) => i !== index))}
                      className="add-btn danger" 
                      style={{ padding: '8px 12px' }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setPaymentMethods([...paymentMethods, { name: '', accountNumber: '' }])}
                className="add-btn" 
                style={{ padding: '6px 12px', fontSize: '13px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)' }}
              >
                + Add Account
              </button>
            </div>

            <div style={{ width: '100%', marginBottom: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-main)' }}>Contact Information</h3>
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Contact Phone (Optional)" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="admin-input"
                  style={{ flex: 1 }}
                />
                <input 
                  type="email" 
                  placeholder="Contact Email (Optional)" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="admin-input"
                  style={{ flex: 1 }}
                />
              </div>

              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-main)' }}>Social Media Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', color: 'var(--text-main)', fontSize: '14px' }}>Telegram</span>
                  <input type="url" placeholder="https://t.me/..." value={socialLinks.telegram} onChange={(e) => setSocialLinks({...socialLinks, telegram: e.target.value})} className="admin-input" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', color: 'var(--text-main)', fontSize: '14px' }}>Instagram</span>
                  <input type="url" placeholder="https://instagram.com/..." value={socialLinks.instagram} onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})} className="admin-input" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', color: 'var(--text-main)', fontSize: '14px' }}>Facebook</span>
                  <input type="url" placeholder="https://facebook.com/..." value={socialLinks.facebook} onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})} className="admin-input" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', color: 'var(--text-main)', fontSize: '14px' }}>TikTok</span>
                  <input type="url" placeholder="https://tiktok.com/..." value={socialLinks.tiktok} onChange={(e) => setSocialLinks({...socialLinks, tiktok: e.target.value})} className="admin-input" style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <button type="submit" className="add-btn primary" disabled={isColorSubmitting} style={{ whiteSpace: 'nowrap' }}>
              {isColorSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </section>

        {/* BULK UPLOAD CSV */}
        <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Bulk Upload Menu (CSV)</h2>
            <button onClick={handleDownloadTemplate} type="button" className="add-btn" style={{ background: 'transparent', border: '1px solid var(--text-muted)', fontSize: '13px', padding: '6px 12px' }}>
              Download Template
            </button>
          </div>
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            style={{ 
              width: '100%', 
              padding: '40px 20px', 
              border: `2px dashed ${isDragging ? 'var(--brand-color)' : 'var(--text-muted)'}`, 
              borderRadius: '12px', 
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('csvFileInput').click()}
          >
            {isUploadingCSV ? (
              <p style={{ color: 'var(--brand-color)', margin: 0 }}>Processing CSV Upload...</p>
            ) : (
              <>
                <p style={{ color: 'var(--text-main)', margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '16px' }}>Drag & Drop your filled CSV here</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>or click to browse files</p>
              </>
            )}
            <input 
              type="file" 
              id="csvFileInput" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={(e) => e.target.files[0] && processCSV(e.target.files[0])}
            />
          </div>
        </section>

        {/* ADD CATEGORY FORM */}
        <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Add New Category</h2>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Category Name (e.g., Desserts)" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              className="admin-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="add-btn primary" disabled={isCatSubmitting} style={{ whiteSpace: 'nowrap' }}>
              {isCatSubmitting ? 'Adding...' : '+ Category'}
            </button>
          </form>
        </section>

        {/* ADD TAG FORM */}
        <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Add New Dietary Tag</h2>
          <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Tag Name (e.g., Vegan, Spicy)" 
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              required
              className="admin-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="add-btn primary" disabled={isTagSubmitting} style={{ whiteSpace: 'nowrap' }}>
              {isTagSubmitting ? 'Adding...' : '+ Tag'}
            </button>
          </form>
        </section>

        {/* ADD ITEM FORM */}
        <section className="menu-card glass-panel animate-slide-up" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px', animationDelay: '0.1s' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Add New Menu Item</h2>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Item Name" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                className="admin-input"
                style={{ flex: 2 }}
              />
              <input 
                type="number" 
                placeholder="Price (ETB)" 
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
                min="0"
                className="admin-input"
                style={{ flex: 1 }}
              />
            </div>
            
            <input 
              type="text" 
              placeholder="Description (Optional)" 
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="admin-input"
            />
            
            <input 
              type="url" 
              placeholder="Image URL (Optional)" 
              value={newItemImage}
              onChange={(e) => setNewItemImage(e.target.value)}
              className="admin-input"
            />

            <select 
              value={newItemCatId} 
              onChange={(e) => setNewItemCatId(e.target.value)} 
              required
              className="admin-input"
            >
              {menuData.categories.length === 0 && <option value="">No categories available</option>}
              {menuData.categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-main)', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', width: '100%', marginBottom: '-8px' }}>Dietary Tags:</span>
              {menuData.tags && menuData.tags.map(tag => (
                <label key={tag._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={newItemDietary.includes(tag.name)}
                    onChange={(e) => {
                      if (e.target.checked) setNewItemDietary(prev => [...prev, tag.name]);
                      else setNewItemDietary(prev => prev.filter(t => t !== tag.name));
                    }}
                  />
                  {tag.name}
                </label>
              ))}
              {(!menuData.tags || menuData.tags.length === 0) && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tags available. Add some above!</span>
              )}
            </div>

            <button type="submit" className="add-btn primary" disabled={isItemSubmitting} style={{ alignSelf: 'flex-start' }}>
              {isItemSubmitting ? 'Adding...' : '+ Menu Item'}
            </button>
          </form>
        </section>

        {/* CURRENT MENU VIEW */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ marginBottom: '16px' }}>Current Menu & Tags</h2>
          
          {menuData.tags && menuData.tags.length > 0 && (
            <div className="glass-panel" style={{ marginBottom: '24px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Dietary Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {menuData.tags.map(tag => (
                  <div key={tag._id} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-main)' }}>
                    {tag.name}
                    <button onClick={() => handleDeleteTag(tag._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>&times;</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {menuData.categories.map(cat => (
            <div key={cat._id} className="glass-panel" style={{ marginBottom: '24px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectCategory(cat._id, e.target.checked)}
                    checked={
                      menuData.items.filter(item => item.categoryId === cat._id).length > 0 && 
                      menuData.items.filter(item => item.categoryId === cat._id).every(item => selectedItemIds.includes(item._id))
                    }
                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                    title="Select all items in this category"
                  />
                  <h3 style={{ margin: 0, fontSize: '20px' }}>{cat.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditCategory(cat._id, cat.name)} className="add-btn" style={{ fontSize: '14px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--text-muted)' }}>Edit</button>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="add-btn danger" style={{ fontSize: '14px', padding: '6px 12px' }}>Delete</button>
                </div>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {menuData.items.filter(item => item.categoryId === cat._id).map(item => (
                  <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedItemIds.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-main)' }}>{item.name}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.price} ETB</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditingItem(item)} className="add-btn" style={{ fontSize: '13px', padding: '4px 8px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--text-muted)' }}>Edit</button>
                      <button onClick={() => handleDeleteItem(item._id)} className="add-btn danger" style={{ fontSize: '13px', padding: '4px 8px', borderRadius: '6px' }}>Remove</button>
                    </div>
                  </li>
                ))}
                {menuData.items.filter(item => item.categoryId === cat._id).length === 0 && (
                  <li style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', paddingTop: '8px' }}>No items in this category.</li>
                )}
              </ul>
            </div>
          ))}
        </section>

        {/* FEEDBACK SECTION */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Customer Feedback</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px', color: '#fbbf24' }}>★</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{avgRating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({feedbacks.length} reviews)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {feedbacks.map(fb => (
              <div key={fb._id} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{fb.customerName}</div>
                  <div style={{ color: '#fbbf24' }}>
                    {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                  </div>
                </div>
                {fb.comment && <p style={{ margin: 0, color: 'var(--text-muted)' }}>"{fb.comment}"</p>}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.7 }}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="empty-state">No feedback received yet.</div>
            )}
          </div>
        </section>

      </div>
      
      {/* BULK ACTIONS BAR */}
      {selectedItemIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          color: '#fff'
        }}>
          <div style={{ fontWeight: '600' }}>
            {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setSelectedItemIds([])}
              className="add-btn" 
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              className="add-btn danger"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <EditItemModal 
          item={editingItem}
          categories={menuData.categories}
          tags={menuData.tags}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItemEdit}
        />
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      
      <ConfirmModal 
        isOpen={confirmDialog.isOpen} 
        title={confirmDialog.title} 
        message={confirmDialog.message} 
        onConfirm={confirmDialog.onConfirm} 
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
      />
      
      <PromptModal 
        isOpen={promptDialog.isOpen} 
        title={promptDialog.title} 
        initialValue={promptDialog.initialValue} 
        onConfirm={promptDialog.onConfirm} 
        onCancel={() => setPromptDialog(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}

export default AdminPanel;
