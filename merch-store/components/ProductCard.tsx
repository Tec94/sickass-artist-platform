import React from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div className="group cursor-pointer flex flex-col h-full" onClick={() => onClick(product)}>
      <div className="relative aspect-[4/5] bg-neutral-900 mb-4 overflow-hidden border border-neutral-800 group-hover:border-red-900/50 transition-colors">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        {/* Second Image on Hover */}
        {product.images[1] && (
          <img 
            src={product.images[1]} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest border border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.4)]">
              New
            </span>
          )}
          {product.stock === 0 && (
             <span className="bg-neutral-900 text-gray-400 border border-neutral-700 text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
             Sold Out
           </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:text-white border border-neutral-700 hover:border-red-500">
          <Heart className="h-4 w-4 text-white" />
        </button>

        {/* Quick Add Overlay (Desktop) */}
        <div className="absolute bottom-0 left-0 right-0 bg-red-600/95 backdrop-blur-md py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex justify-center border-t border-red-500">
            <span className="text-xs font-bold uppercase tracking-widest text-white">Quick View</span>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-bold uppercase tracking-tight text-gray-100 mb-1 group-hover:text-red-500 transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-400 font-mono">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-600 line-through font-mono">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        
        {/* Mini CTA */}
        <button className="w-full mt-auto bg-neutral-800 text-white text-xs font-bold uppercase py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hidden border border-neutral-700">
          View Details
        </button>
      </div>
    </div>
  );
};