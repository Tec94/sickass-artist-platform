import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarProps {
  onCategoryChange: (cat: string) => void;
  activeCategory: string;
  maxPrice: number;
  onPriceChange: (price: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCategoryChange, activeCategory, maxPrice, onPriceChange }) => {
  const [sections, setSections] = useState({
    categories: true,
    price: true,
    collections: true
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="hidden md:block w-64 flex-shrink-0 pr-8 pt-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
      {/* Categories Section */}
      <div className="mb-8 border-l-2 border-neutral-800 pl-4">
        <div 
          className="flex justify-between items-center cursor-pointer mb-4 group"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">Categories</h3>
          {sections.categories ? <ChevronUp className="h-3 w-3 text-gray-600" /> : <ChevronDown className="h-3 w-3 text-gray-600" />}
        </div>
        
        {sections.categories && (
          <div className="space-y-2">
             {['All Products', 'New Arrivals', 'Music', 'Apparel', 'Accessories'].map((cat) => (
               <button
                 key={cat}
                 onClick={() => onCategoryChange(cat)}
                 className={`block text-sm w-full text-left transition-all duration-200 ${
                   activeCategory === cat 
                   ? 'font-bold text-red-500 pl-2 border-l border-red-500' 
                   : 'text-gray-500 hover:text-gray-300 hover:pl-1'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="mb-8 border-l-2 border-neutral-800 pl-4 pt-2">
        <div 
          className="flex justify-between items-center cursor-pointer mb-4 group"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">Max Price</h3>
          {sections.price ? <ChevronUp className="h-3 w-3 text-gray-600" /> : <ChevronDown className="h-3 w-3 text-gray-600" />}
        </div>
        
        {sections.price && (
          <div className="px-1">
            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2">
              <span>$0</span>
              <span className="text-red-500">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={maxPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none focus:ring-1 focus:ring-red-900/50"
            />
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div className="mb-8 border-l-2 border-neutral-800 pl-4 pt-2">
        <div 
          className="flex justify-between items-center cursor-pointer mb-4 group"
          onClick={() => toggleSection('collections')}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">Collections</h3>
          {sections.collections ? <ChevronUp className="h-3 w-3 text-gray-600" /> : <ChevronDown className="h-3 w-3 text-gray-600" />}
        </div>
        
        {sections.collections && (
          <div className="space-y-3">
            {['Midnight Frequency', 'World Tour 2025', 'The Vault'].map((col) => (
              <label key={col} className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-3 h-3 border border-neutral-600 rounded-sm group-hover:border-red-500 group-hover:bg-red-500/20 transition-all"></div>
                <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">{col}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};