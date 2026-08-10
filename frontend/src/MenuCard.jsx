import { motion } from 'framer-motion';

export default function MenuCard({ item, onClick, index = 0 }) {
  return (
    <motion.div 
      className="menu-card" 
      onClick={() => onClick(item)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="card-info">
        <div className="card-header">
          <h3>{item.name}</h3>
          <span className="price">{item.price} ETB</span>
        </div>
        <p className="desc">{item.description}</p>
        
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="dietary-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {item.dietaryTags.map(tag => (
              <span key={tag} className={`dietary-tag ${tag.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="card-image" loading="lazy" />
      )}
    </motion.div>
  );
}
