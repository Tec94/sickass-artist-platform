import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { setNextTransition } from '../Effects/PageTransition';
import { Search, User, ShoppingBag } from 'lucide-react';
import SearchOverlay from './SearchOverlay';
import CheckoutOverlay from './CheckoutOverlay';

export default function SharedNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const location = useLocation();

  // Highlight active link functionality
  const getLinkClasses = (path: string) => {
    const baseClasses = "text-sm font-semibold uppercase tracking-wider transition-colors nav-link-hover flex items-center h-full";
    if (location.pathname === path) {
      return `${baseClasses} text-[#C36B42] border-b-2 border-[#C36B42]`;
    }
    return `${baseClasses} text-[#3C2A21] hover:text-[#C36B42]`;
  };

  return (
    <>
    <header className="h-[72px] border-b border-[#3C2A21] bg-[#F4EFE6] flex items-center justify-between px-8 relative z-40">
      <div className="flex items-center gap-12 h-full">
        <Link to="/dashboard" className="font-['Cormorant_Garamond'] text-2xl font-semibold tracking-tight text-[#3C2A21] hover:text-[#C36B42] transition-colors">THE ESTATE</Link>
        <nav className="flex items-center gap-8 h-full">
          <div className="group h-full flex items-center relative">
            <Link to="/store" onClick={() => setNextTransition('push')} className={getLinkClasses('/store')}>Store</Link>
            <div className="mega-menu invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-[72px] left-0 w-[800px] h-[400px] bg-[#FAF7F2] border-b border-r border-l border-[#3C2A21] shadow-lg flex transition-all duration-300">
              <div className="w-1/2 h-full p-8 border-r border-[#3C2A21]/15">
                <div className="w-full h-full bg-cover bg-center rounded-sm relative overflow-hidden group" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCn2d7DIcuRChwL7JHv90Xk489giFm7mkFmi7UMnknopv5kyun1AIgd1oIrQ5qFfwg6l7JAT8VeMHIuwtHYoPu-FIuvXL_NcAqq2-qlAcPpe91PDjyExlV7qPqfmCyLkepSngg4YOKeZV-omlXUUGIJGbZOrldRalluKggAi817GVkaSlCDYRKLtuZiZWFDhFmDZNyy-f7MeeQg_7k89qqolK831X8e56xZdFScT0D0NGzhYA--gYHf59Q8Hvm23q4QMR6biY6Njvh0')"}}>
                  <div className="absolute inset-0 bg-[#3C2A21]/30 group-hover:bg-[#3C2A21]/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-6 left-6 text-[#FAF7F2]">
                    <span className="text-[11px] uppercase tracking-[0.15em] font-semibold block mb-1">New Collection</span>
                    <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium">Private Suite Vol. 3</h3>
                  </div>
                </div>
              </div>
              <div className="w-1/2 h-full p-12 grid grid-cols-2 gap-8 bg-[#FAF7F2]">
                <div className="flex flex-col gap-4">
                  <h4 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8E7D72] mb-2">Apparel</h4>
                  <Link to="/store" className="text-[#3C2A21] text-sm hover:text-[#C36B42] transition-colors">Outerwear</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8E7D72] mb-2">Music</h4>
                  <Link to="/archive" className="text-[#3C2A21] text-sm hover:text-[#C36B42] transition-colors">Vinyl & Media</Link>
                </div>
              </div>
            </div>
          </div>
          <Link to="/events" onClick={() => setNextTransition('push')} className={getLinkClasses('/events')}>Events</Link>
          <Link to="/community" onClick={() => setNextTransition('push')} className={getLinkClasses('/community')}>Community</Link>
          <Link to="/rankings" onClick={() => setNextTransition('push')} className={getLinkClasses('/rankings')}>Rankings</Link>
          <Link to="/journey" onClick={() => setNextTransition('push')} className={getLinkClasses('/journey')}>Journey</Link>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <button onClick={() => setIsSearchOpen(true)} className="text-[#3C2A21] hover:text-[#C36B42] transition-colors">
          <Search size={20} />
        </button>
        <Link to="/profile" onClick={() => setNextTransition('slide-up')} className="text-[#3C2A21] hover:text-[#C36B42] transition-colors">
          <User size={20} />
        </Link>
        <button onClick={() => setIsCheckoutOpen(true)} className="text-[#3C2A21] hover:text-[#C36B42] transition-colors relative">
          <ShoppingBag size={20} />
          <span className="absolute -top-1 -right-2 bg-[#C36B42] text-[#FAF7F2] text-[10px] font-bold px-1.5 py-0.5 rounded-sm">2</span>
        </button>
      </div>
    </header>
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    <CheckoutOverlay isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  );
}
