import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { userProfile, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  const wishlist = useQuery(api.merch.getWishlist, isSignedIn && userProfile ? {} : 'skip');
  const wishlistCount = wishlist?.length || 0; 

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Store', path: '/store' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Forum', path: '/forum' },
    { name: 'Chat', path: '/chat' },
    { name: 'Ranking', path: '/ranking' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-[1000] bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800"
        onClick={() => {
          if (isCartOpen) setIsCartOpen(false);
          if (isWishlistOpen) setIsWishlistOpen(false);
        }}
      >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1020]">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold tracking-wider text-white">ROA WOLVES</h1>
            </div>
            <div className="sm:hidden text-xl font-display font-bold tracking-wider text-white">ROA</div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-xs font-display uppercase tracking-wider transition-colors hover:text-red-500 ${location.pathname.startsWith(link.path) ? 'text-white border-b-2 border-red-600' : 'text-zinc-400'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <form onSubmit={handleSearch} className="hidden md:flex relative group">
              <input 
                type="text" 
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-200 py-1 pl-3 pr-8 text-sm focus:outline-none focus:border-red-600 focus:w-48 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1.5 text-zinc-500 hover:text-white">
                <iconify-icon icon="solar:magnifer-linear" width="16" height="16"></iconify-icon>
              </button>
            </form>

            <button className="text-zinc-400 hover:text-white transition-colors relative">
              <iconify-icon icon="solar:bell-linear" width="20" height="20"></iconify-icon>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>

            {/* Wishlist */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsWishlistOpen(true);
              }}
              className="relative text-zinc-400 hover:text-red-500 transition-colors"
            >
              <iconify-icon icon="solar:heart-linear" width="20" height="20"></iconify-icon>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            
            {/* Cart */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsCartOpen(true);
              }}
              className="relative text-zinc-400 hover:text-red-500 transition-colors"
            >
              <iconify-icon icon="solar:bag-3-linear" width="20" height="20"></iconify-icon>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 hover:border-red-500 transition-colors">
                  {userProfile?.avatar ? (
                   <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs text-bold">
                     {isSignedIn ? (userProfile?.username?.charAt(0).toUpperCase() || 'U') : '?'}
                   </div>
                 )}
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex justify-between px-4 py-2 border-t border-zinc-800 overflow-x-auto bg-zinc-950 no-scrollbar relative z-[1020]">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className={`text-xs font-display uppercase tracking-wider px-3 py-1 whitespace-nowrap ${location.pathname.startsWith(link.path) ? 'text-white' : 'text-zinc-500'}`}
          >
            {link.name}
          </Link>
        ))}
      </div>
      
    </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
   </>
);
};

export default Header;
