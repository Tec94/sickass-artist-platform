import React, { useState } from 'react';
import { ChevronLeft, Heart, Music, Play, Minus, Plus } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const [selectedFormat, setSelectedFormat] = useState(product.formats ? product.formats[0] : null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      selectedSize: selectedSize || undefined,
      selectedFormat: selectedFormat || undefined,
      quantity
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-neutral-900 overflow-hidden relative border border-neutral-800">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest border border-red-500 shadow-lg">
                New
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square bg-neutral-900 overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? 'border-red-600 opacity-100' : 'border-transparent hover:border-neutral-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col h-full text-white">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-2 display-text glow-text">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-mono text-red-500">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-600 line-through font-mono">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="space-y-8 flex-grow">
            {/* Format Selection (Music) */}
            {product.formats && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">Select Format</h3>
                <div className="flex flex-wrap gap-2">
                  {product.formats.map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-6 py-3 text-sm font-medium border transition-all ${
                        selectedFormat === format 
                          ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                          : 'bg-transparent text-gray-400 border-neutral-800 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection (Apparel) */}
            {product.sizes && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center text-sm font-medium border transition-all ${
                        selectedSize === size 
                          ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                          : 'bg-transparent text-gray-400 border-neutral-800 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button className="text-xs text-gray-500 underline mt-2 hover:text-red-500">Size Guide</button>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500">Quantity</h3>
              <div className="flex items-center border border-neutral-800 w-32 bg-neutral-900">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 text-gray-400 hover:text-white"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="flex-1 text-center text-sm font-mono">{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 text-gray-400 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 text-sm font-bold uppercase tracking-widest py-4 transition-all ${
                  product.stock === 0 
                    ? 'bg-neutral-800 text-gray-600 cursor-not-allowed border border-neutral-800' 
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                }`}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="px-4 border border-neutral-800 hover:border-red-500 hover:text-red-500 transition-colors bg-neutral-900">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Tracklist for Music */}
            {product.tracklist && (
              <div className="border-t border-neutral-800 pt-6 mt-6">
                <h3 className="flex items-center text-sm font-bold uppercase tracking-wider mb-4 text-white">
                  <Music className="h-4 w-4 mr-2 text-red-500" /> Tracklist
                </h3>
                <ul className="space-y-3">
                  {product.tracklist.map((track, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-400 group cursor-pointer hover:text-white transition-colors">
                      <span className="w-8 text-neutral-600 font-mono text-xs group-hover:text-red-500">{(i + 1).toString().padStart(2, '0')}</span>
                      {track.replace(/^\d+\.\s*/, '')}
                      <Play className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 text-red-500" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-gray-500">Description</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};