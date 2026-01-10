import { useState } from 'react'

interface MerchSidebarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  maxPrice: number
  onPriceChange: (price: number) => void
}

export const MerchSidebar = ({
  activeCategory,
  onCategoryChange,
  maxPrice,
  onPriceChange
}: MerchSidebarProps) => {
  const [sections, setSections] = useState({
    categories: true,
    price: true,
    collections: true
  })

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const categories = ['All Products', 'New Arrivals', 'Apparel', 'Accessories', 'Vinyl', 'Limited Edition']
  const collections = ['Tour Collection', 'Signature Series', 'The Vault']

  return (
    <div className="merch-sidebar">
      {/* Categories Section */}
      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => toggleSection('categories')}
        >
          <h3>Categories</h3>
          <iconify-icon 
            icon={sections.categories ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} 
            width="14" 
            height="14"
          ></iconify-icon>
        </button>
        
        {sections.categories && (
          <div className="section-content">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat === 'All Products' ? '' : cat.toLowerCase())}
                className={`category-item ${
                  (cat === 'All Products' && !activeCategory) || 
                  activeCategory === cat.toLowerCase() 
                    ? 'active' 
                    : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => toggleSection('price')}
        >
          <h3>Max Price</h3>
          <iconify-icon 
            icon={sections.price ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} 
            width="14" 
            height="14"
          ></iconify-icon>
        </button>
        
        {sections.price && (
          <div className="section-content">
            <div className="price-labels">
              <span>$0</span>
              <span className="price-value">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="price-slider"
            />
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => toggleSection('collections')}
        >
          <h3>Collections</h3>
          <iconify-icon 
            icon={sections.collections ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} 
            width="14" 
            height="14"
          ></iconify-icon>
        </button>
        
        {sections.collections && (
          <div className="section-content">
            {collections.map((col) => (
              <label key={col} className="collection-item">
                <div className="checkbox"></div>
                <span>{col}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .merch-sidebar {
          width: 100%;
          padding-right: 1.5rem;
        }

        .sidebar-section {
          margin-bottom: 1.5rem;
          border-left: 2px solid #1a1a1a;
          padding-left: 1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem 0;
          color: #808080;
          transition: color 0.2s;
        }

        .section-header:hover {
          color: white;
        }

        .section-header h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin: 0;
        }

        .section-content {
          margin-top: 0.75rem;
        }

        .category-item {
          display: block;
          width: 100%;
          padding: 0.5rem 0;
          background: transparent;
          border: none;
          border-left: 2px solid transparent;
          text-align: left;
          font-size: 13px;
          color: #737373;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .category-item:hover {
          color: white;
          padding-left: 0.5rem;
        }

        .category-item.active {
          color: #dc2626;
          font-weight: 700;
          border-left-color: #dc2626;
          padding-left: 0.5rem;
        }

        .price-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-family: monospace;
          color: #737373;
          margin-bottom: 0.5rem;
        }

        .price-value {
          color: #dc2626;
          font-weight: 700;
        }

        .price-slider {
          width: 100%;
          height: 4px;
          background: #171717;
          border-radius: 2px;
          appearance: none;
          cursor: pointer;
        }

        .price-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
        }

        .price-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
        }

        .collection-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .collection-item:hover span {
          color: white;
        }

        .collection-item:hover .checkbox {
          border-color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .checkbox {
          width: 14px;
          height: 14px;
          border: 1px solid #262626;
          border-radius: 3px;
          transition: all 0.2s;
        }

        .collection-item span {
          font-size: 13px;
          color: #737373;
          transition: color 0.2s;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
