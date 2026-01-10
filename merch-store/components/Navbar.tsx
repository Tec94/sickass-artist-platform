import React from 'react';
import { ShoppingBag, Search, Menu, Heart } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onGoHome }) => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-sm border-b border-neutral-800">
      {/* Top Banner */}
      <div className="bg-red-900/20 text-red-500 border-b border-red-900/30 text-[10px] md:text-xs text-center py-2 tracking-[0.2em] uppercase font-bold">
        Transmission: Free Shipping on all Vinyl Bundles over $50
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Mobile Menu & Search */}
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-md md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center text-sm font-medium space-x-1">
              {['SHOP ALL', 'MUSIC', 'MERCH'].map((item) => (
                <button 
                  key={item}
                  onClick={item === 'SHOP ALL' ? onGoHome : undefined}
                  className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-neutral-800 transition-all font-mono text-xs uppercase tracking-wider"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex-shrink-0 flex items-center justify-center cursor-pointer group" onClick={onGoHome}>
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tighter uppercase display-text text-white group-hover:text-red-500 transition-colors duration-300 glow-text">
                NEON ECHO
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <input 
                type="text" 
                placeholder="SEARCH_DB..." 
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded text-gray-300 focus:outline-none focus:border-red-600 focus:text-white w-32 focus:w-48 transition-all font-mono placeholder:text-gray-700"
              />
              <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-gray-600 group-focus-within:text-red-500" />
            </div>
            
            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-neutral-900 rounded transition-colors relative">
              <Heart className="h-5 w-5" />
            </button>

            <button onClick={onOpenCart} className="p-2 text-gray-400 hover:text-white hover:bg-neutral-900 rounded transition-colors relative group">
              <ShoppingBag className="h-5 w-5 group-hover:text-red-500 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold h-3.5 w-3.5 rounded flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.8)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};