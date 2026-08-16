import { BASE_URL } from './config';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MenuCard from './MenuCard';
import ItemModal from './ItemModal';
import PaymentModal from './PaymentModal';
import FeedbackModal from './FeedbackModal';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import ReactGA from 'react-ga4';
import { useTranslation } from 'react-i18next';
import './CustomerMenuUI.css';
import './Templates.css';

function CustomerMenu() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

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

      // Track menu page view in GA4
      if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
        ReactGA.send({ hitType: "pageview", page: `/${restaurantData.slug || 'demo'}`, title: `${restaurantData.name} Menu` });
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
  
  const activeTemplate = restaurant.activeTemplate || 'modern-light';

  return (
    <>
      <div className={`menu-container template-${activeTemplate}`} style={{ paddingBottom: '100px' }}>
          <header 
            className="customer-hero"
            style={{ 
              backgroundImage: restaurant.coverImageUrl ? `url(${restaurant.coverImageUrl})` : `linear-gradient(135deg, var(--brand-color) 0%, var(--secondary-color, #1e40af) 100%)`,
              position: 'relative'
            }}
          >
            {restaurant.enableAmharic && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                <button 
                  onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', 
                    border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white', 
                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '14px', display: 'flex', gap: '6px', alignItems: 'center'
                  }}
                >
                  <i className="fa-solid fa-globe"></i> {i18n.language === 'en' ? 'አማርኛ' : 'English'}
                </button>
              </div>
            )}
            
            {restaurant.coverImageUrl && <div className="hero-overlay"></div>}
            <div className="hero-content">
              <h1>{restaurant.name}</h1>
              <p>{restaurant.description || 'Welcome to our menu'}</p>
            </div>
          </header>

      <div className="search-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder={t('menu.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{ flex: 1 }}
        />
        {menuData.tags && menuData.tags.length > 0 && (
          <button 
            className="filter-btn"
            onClick={() => setShowFilterModal(true)}
            style={{ 
              position: 'relative',
              background: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: '20px', 
              width: '42px', 
              height: '42px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: filterTag !== 'All' ? 'var(--brand-color)' : 'var(--text-main)',
              borderColor: filterTag !== 'All' ? 'var(--brand-color)' : 'var(--border-color)'
            }}
          >
            <i className="fa-solid fa-sliders"></i>
            {filterTag !== 'All' && <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--brand-color)', borderRadius: '50%' }}></span>}
          </button>
        )}
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
                {i18n.language === 'am' && cat.nameAm ? cat.nameAm : cat.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Render Menu Sections */}
      {menuData.categories.map(cat => {
        const categoryItems = menuData.items.filter(item => {
          const matchCategory = item.categoryId === cat._id;
          const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower);
          const matchTag = filterTag === 'All' || (item.dietaryTags && item.dietaryTags.includes(filterTag));
          return searchQuery ? (matchSearch && matchCategory && matchTag) : (matchCategory && matchTag);
        });

        if (categoryItems.length === 0) return null;

        return (
          <section 
            key={cat._id} 
            className="menu-section" 
            ref={el => categoryRefs.current[cat._id] = el}
          >
            <h2 className="category-title">{i18n.language === 'am' && cat.nameAm ? cat.nameAm : cat.name}</h2>
            <div>
              {categoryItems.map((item, index) => (
                <MenuCard 
                  key={item._id} 
                  item={item} 
                  index={index}
                  template={activeTemplate}
                  onClick={(i) => {
                    setSelectedItem(i);
                    // Track item click event
                    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
                      ReactGA.event({
                        category: "Menu Activity",
                        action: "Clicked Item",
                        label: i.name,
                      });
                    }
                  }}
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

      <div className="fab-container">
        {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 && (
          <button onClick={() => setShowPaymentModal(true)} className="fab-btn secondary">
            <i className="fa-solid fa-credit-card"></i> {t('menu.paymentMethods')}
          </button>
        )}
        <button onClick={() => setShowFeedbackModal(true)} className="fab-btn primary">
          <i className="fa-solid fa-star"></i> Feedback
        </button>
      </div>

      <AnimatePresence>
        {showPaymentModal && <PaymentModal restaurant={restaurant} onClose={() => setShowPaymentModal(false)} />}
        {showFeedbackModal && <FeedbackModal restaurant={restaurant} onClose={() => setShowFeedbackModal(false)} />}
        {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        {showFilterModal && (
          <div className="modal-overlay" onClick={() => setShowFilterModal(false)} style={{ zIndex: 100 }}>
            <motion.div 
              className="modal-content bottom-sheet"
              onClick={e => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              style={{ padding: '24px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', position: 'absolute', bottom: 0, width: '100%', maxWidth: '500px' }}
            >
              <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', margin: '0 auto 20px' }}></div>
              <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>{i18n.language === 'am' ? 'የአመጋገብ ምርጫዎች' : 'Dietary Preferences'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className={`filter-chip ${filterTag === 'All' ? 'active' : ''}`}
                  onClick={() => { setFilterTag('All'); setShowFilterModal(false); }}
                  style={{ textAlign: 'left', padding: '16px', fontSize: '16px', borderRadius: '12px', width: '100%' }}
                >
                  {i18n.language === 'am' ? 'ሁሉም' : 'All Items'}
                </button>
                {menuData.tags.map(tag => (
                  <button 
                    key={tag._id}
                    className={`filter-chip ${filterTag === tag.name ? 'active' : ''}`}
                    onClick={() => { setFilterTag(tag.name); setShowFilterModal(false); }}
                    style={{ textAlign: 'left', padding: '16px', fontSize: '16px', borderRadius: '12px', width: '100%' }}
                  >
                    {i18n.language === 'am' && tag.nameAm ? tag.nameAm : tag.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <Footer restaurant={restaurant} />
    </div>
    </>
  );
}

export default CustomerMenu;