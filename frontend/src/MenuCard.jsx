import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function MenuCard({ item, onClick, index = 0, template = 'modern-light' }) {
  const { i18n } = useTranslation();
  const displayName = i18n.language === 'am' && item.nameAm ? item.nameAm : item.name;
  const displayDesc = i18n.language === 'am' && item.descriptionAm ? item.descriptionAm : item.description;

  const cardProps = {
    className: `menu-card tpl-${template}`,
    onClick: () => { if (item.isAvailable !== false) onClick(item) },
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.3, delay: index * 0.05 },
    whileTap: item.isAvailable !== false ? { scale: 0.98 } : {},
    style: {
      position: 'relative',
      opacity: item.isAvailable === false ? 0.6 : 1,
      filter: item.isAvailable === false ? 'grayscale(80%)' : 'none',
      cursor: item.isAvailable === false ? 'not-allowed' : 'pointer'
    }
  };

  const outOfStockBadge = item.isAvailable === false && (
    <div className="out-of-stock-badge">
      {i18n.language === 'am' ? 'አልቋል' : 'Out of Stock'}
    </div>
  );

  const dietaryTags = item.dietaryTags && item.dietaryTags.length > 0 && (
    <div className="dietary-tags">
      {item.dietaryTags.map(tag => (
        <span key={tag} className={`dietary-tag ${tag.toLowerCase().replace(' ', '-')}`}>
          {tag}
        </span>
      ))}
    </div>
  );

  if (template === 'modern-light' || template === 'elegant-dark') {
    return (
      <motion.div {...cardProps}>
        {outOfStockBadge}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={displayName} className="card-image" loading="lazy" />
        ) : (
          <div className="card-image-placeholder"></div>
        )}
        <div className="card-info">
          <h3>{displayName}</h3>
          <p className="desc">{displayDesc}</p>
          {dietaryTags}
          <div className="price-tag">{item.price} {item.currency || 'ETB'}</div>
        </div>
      </motion.div>
    );
  }

  if (template === 'app-style') {
    return (
      <motion.div {...cardProps}>
        {outOfStockBadge}
        {item.imageUrl && (
          <div className="card-image-wrapper">
            <img src={item.imageUrl} alt={displayName} className="card-image" loading="lazy" />
          </div>
        )}
        <div className="card-info">
          <h3>{displayName}</h3>
          <p className="desc">{displayDesc}</p>
          <div className="card-footer">
            <span className="price">{item.price} {item.currency || 'ETB'}</span>
            {dietaryTags}
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback / Classic
  return (
    <motion.div {...cardProps}>
      {outOfStockBadge}
      <div className="card-info">
        <div className="card-header">
          <h3>{displayName}</h3>
          <span className="price">{item.price} ETB</span>
        </div>
        <p className="desc">{displayDesc}</p>
        {dietaryTags}
      </div>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={displayName} className="card-image" loading="lazy" />
      )}
    </motion.div>
  );
}
