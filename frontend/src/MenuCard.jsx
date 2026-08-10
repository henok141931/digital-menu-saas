export default function MenuCard({ item, onClick }) {
  return (
    <div className="menu-card" onClick={(e) => onClick(item, e)}>
      <div className="card-info">
        <div className="card-header">
          <h3>{item.name}</h3>
          <span className="price">{item.price} ETB</span>
        </div>
        <p className="desc">{item.description}</p>
        
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="dietary-tags">
            {item.dietaryTags.map(tag => (
              <span key={tag} className={`dietary-tag ${tag.toLowerCase().replace(' ', '-')}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="card-image" loading="lazy" />
      )}
    </div>
  );
}
