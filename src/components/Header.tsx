import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { useTranslation } from '../hooks/useTranslation';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { userProfile, isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { t } = useTranslation();
  
  const wishlist = useQuery(api.merch.getWishlist, isSignedIn && userProfile ? {} : 'skip');
  const wishlistCount = wishlist?.length || 0; 
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    isSignedIn && userProfile ? { userId: userProfile._id, limit: 12 } : 'skip'
  );
  const unreadCount = notifications?.filter(note => !note.isRead).length || 0;

  const markAllRead = useMutation(api.notifications.markAllRead);
  const markNotificationRead = useMutation(api.notifications.markNotificationRead);

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard' },
    { name: t('nav.store'), path: '/store' },
    { name: t('nav.events'), path: '/events' },
    { name: t('nav.gallery'), path: '/gallery' },
    { name: t('nav.forum'), path: '/forum' },
    { name: t('nav.chat'), path: '/chat' },
    { name: t('nav.ranking'), path: '/ranking' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    setAvatarError(false);
  }, [userProfile?.avatar]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    try {
      await markAllRead({ userId: userProfile._id });
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead({ notificationId: notification._id });
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error('Failed to open notification:', error);
    } finally {
      setIsNotificationsOpen(false);
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-[1000] bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800"
        onClick={() => {
          if (isCartOpen) setIsCartOpen(false);
          if (isWishlistOpen) setIsWishlistOpen(false);
          if (isNotificationsOpen) setIsNotificationsOpen(false);
        }}
      >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1020]">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold tracking-wider text-white">ROA</h1>
            </div>
            <div className="sm:hidden text-xl font-display font-bold tracking-wider text-white">ROA</div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
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
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-200 py-1 pl-3 pr-8 text-sm focus:outline-none focus:border-red-600 focus:w-48 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1.5 text-zinc-500 hover:text-white">
                <iconify-icon icon="solar:magnifer-linear" width="16" height="16"></iconify-icon>
              </button>
            </form>

            <div className="relative">
              <button
                className="text-zinc-400 hover:text-white transition-colors relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotificationsOpen((prev) => !prev);
                }}
              >
                <iconify-icon icon="solar:bell-linear" width="20" height="20"></iconify-icon>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  className="absolute right-0 mt-3 w-[320px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/70 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                    <div>
                      <p className="text-sm font-bold text-white">Notifications</p>
                      <p className="text-[11px] text-zinc-500">Latest updates and rewards</p>
                    </div>
                    <button
                      className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications && notifications.length === 0 && (
                      <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                        No notifications yet.
                      </div>
                    )}
                    {notifications?.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-900/60 transition-colors ${
                          notification.isRead ? 'bg-transparent' : 'bg-red-600/10'
                        } hover:bg-zinc-900/60`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full ${notification.isRead ? 'bg-zinc-700' : 'bg-red-500'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{notification.title}</p>
                            <p className="text-xs text-zinc-400 mt-1">{notification.message}</p>
                            <p className="text-[10px] text-zinc-600 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                  {userProfile?.avatar && !avatarError ? (
                   <img
                     src={userProfile.avatar}
                     alt="Profile"
                     className="w-full h-full object-cover"
                     onError={() => setAvatarError(true)}
                   />
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
            key={link.path} 
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
