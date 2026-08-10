import { BASE_URL } from './config';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MenuCard from './MenuCard';
import ItemModal from './ItemModal';
import PaymentModal from './PaymentModal';
import FeedbackModal from './FeedbackModal';
import Footer from './Footer';

function CustomerMenu() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Refs for ScrollSpy
  const categoryRefs = useRef({});
  const navRef = useRef(null);

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [slug]);

  const fetchRestaurantAndMenu = async () => {
    try {
      // 1. Fetch Restaurant by slug
      const resRes = await fetch(`${BASE_URL}/api/restaurants/${slug || 'demo'}`);
      if (!resRes.ok) throw new Error('Restaurant not found');
      const restaurantData = await resRes.json();
      setRestaurant(restaurantData);

      // Inject brand color to CSS variable
      if (restaurantData.brandColor) {
        document.documentElement.style.setProperty('--brand-color', restaurantData.brandColor);
      }
      if (restaurantData.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', restaurantData.secondaryColor);
      }

      // 2. Fetch Menu using restaurantId
      const menuRes = await fetch(`${BASE_URL}/api/menu/${restaurantData._id}`);
      if (!menuRes.ok) throw new Error('Failed to fetch menu');
      const menuD = await menuRes.json();
      setMenuData(menuD);
      
      if (menuD.categories.length > 0) {
        setActiveCategory(menuD.categories[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ScrollSpy Logic
  useEffect(() => {
    const handleScroll = () => {
      if (!menuData.categories.length || searchQuery) return; // Don't scrollspy when searching

      let currentActiveId = activeCategory;
      let minDistance = Infinity;

      // Find the category closest to the top of the viewport
      menuData.categories.forEach(cat => {
        const el = categoryRefs.current[cat._id];
        if (el) {
          const rect = el.getBoundingClientRect();
          // We look for elements near the top of the viewport (offset by header height ~150px)
          const distance = Math.abs(rect.top - 150);
          if (distance < minDistance) {
            minDistance = distance;
            currentActiveId = cat._id;
          }
        }
      });

      if (currentActiveId && currentActiveId !== activeCategory) {
        setActiveCategory(currentActiveId);
        // Ensure active tab is visible in scrollable nav
        const tabEl = document.getElementById(`tab-${currentActiveId}`);
        if (tabEl && navRef.current) {
          navRef.current.scrollTo({
            left: tabEl.offsetLeft - 24,
            behavior: 'smooth'
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuData.categories, activeCategory, searchQuery]);

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const el = categoryRefs.current[categoryId];
    if (el) {
      // Offset by roughly the height of the sticky nav and search bar
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="menu-container" style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div className="menu-container" style={{ padding: '24px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  if (!restaurant) return null;

  // Filter items globally by search query
  const searchLower = searchQuery.toLowerCase();
  
  return (
    <div className="menu-container animate-slide-up">
      <header className="menu-header">
        <h1>{restaurant.name}</h1>
        <p>{restaurant.description || 'Welcome to our menu'}</p>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
            {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 && (
              <button 
                onClick={() => setShowPaymentModal(true)} 
                className="add-btn" 
                style={{ padding: '8px 16px', background: 'var(--brand-color)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}
              >
                Payment Info
              </button>
            )}
            <button 
              onClick={() => setShowFeedbackModal(true)} 
              className="add-btn" 
              style={{ padding: '8px 16px', background: 'transparent', color: 'var(--brand-color)', border: '1px solid var(--brand-color)', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}
            >
              Leave Feedback
            </button>
        </div>
      </header>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search menu..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {!searchQuery && (
        <div className="category-nav-wrapper">
          <nav className="category-nav" ref={navRef}>
            {menuData.categories.map(cat => (
              <button 
                key={cat._id}
                id={`tab-${cat._id}`}
                className={`category-tab ${activeCategory === cat._id ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Render Menu Sections */}
      {menuData.categories.map(cat => {
        const categoryItems = menuData.items.filter(item => {
          const matchCategory = item.categoryId === cat._id;
          const matchSearch = item.name.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower);
          return searchQuery ? matchSearch && matchCategory : matchCategory;
        });

        if (categoryItems.length === 0) return null;

        return (
          <section 
            key={cat._id} 
            className="menu-section" 
            ref={el => categoryRefs.current[cat._id] = el}
          >
            <h2 className="category-title">{cat.name}</h2>
            <div>
              {categoryItems.map(item => (
                <MenuCard 
                  key={item._id} 
                  item={item} 
                  onClick={(i) => setSelectedItem(i)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Empty Search State */}
      {searchQuery && menuData.items.filter(i => i.name.toLowerCase().includes(searchLower)).length === 0 && (
        <div className="empty-state">
          No items found matching "{searchQuery}"
        </div>
      )}

      {showPaymentModal && <PaymentModal restaurant={restaurant} onClose={() => setShowPaymentModal(false)} />}
      {showFeedbackModal && <FeedbackModal restaurant={restaurant} onClose={() => setShowFeedbackModal(false)} />}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      
      <Footer restaurant={restaurant} />
    </div>
  );
}

export default CustomerMenu;