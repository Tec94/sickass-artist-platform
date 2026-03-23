import { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { setNextTransition } from '../Effects/PageTransition';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col font-sans pointer-events-none transition-all duration-500`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#3C2A21]/40 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div 
        className={`relative w-full bg-[#F4EFE6] border-b border-[#3C2A21] shadow-[rgba(0,0,0,0.5)_0px_10px_40px] pointer-events-auto flex flex-col max-h-[80vh] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        
        {/* Search Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#3C2A21]/15">
          <div className="flex items-center gap-6 flex-1 max-w-4xl mx-auto w-full">
            <Search size={28} className="text-[#8E7D72]" />
            <input 
              type="text" 
              autoFocus
              className="flex-1 bg-transparent border-none text-3xl font-serif text-[#3C2A21] placeholder-[#8E7D72]/50 focus:ring-0 p-0"
              placeholder="Search the Estate Archives..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              onClick={onClose}
              className="text-[#3C2A21] hover:text-[#C36B42] transition-colors p-2"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Search Results / Suggestions */}
        <div className="flex-1 overflow-y-auto px-8 py-12">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Quick Links */}
            <div className="flex flex-col gap-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#8E7D72] border-b border-[#3C2A21]/10 pb-2">Frequent Inquiries</h4>
              <nav className="flex flex-col gap-4">
                <Link to="/archive" onClick={() => { setNextTransition('push'); onClose(); }} className="text-sm font-semibold text-[#3C2A21] hover:text-[#C36B42] flex items-center justify-between group">
                  <span>Current Registration</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link to="/store" onClick={() => { setNextTransition('push'); onClose(); }} className="text-sm font-semibold text-[#3C2A21] hover:text-[#C36B42] flex items-center justify-between group">
                  <span>Exclusive Artifacts</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link to="/rankings" onClick={() => { setNextTransition('push'); onClose(); }} className="text-sm font-semibold text-[#3C2A21] hover:text-[#C36B42] flex items-center justify-between group">
                  <span>Collector Rankings</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </nav>
            </div>

            {/* Featured Result */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#8E7D72] border-b border-[#3C2A21]/10 pb-2">Highlight</h4>
              <div 
                className="group relative w-full h-48 bg-cover bg-center overflow-hidden border border-[#3C2A21]/20 cursor-pointer"
                style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCn2d7DIcuRChwL7JHv90Xk489giFm7mkFmi7UMnknopv5kyun1AIgd1oIrQ5qFfwg6l7JAT8VeMHIuwtHYoPu-FIuvXL_NcAqq2-qlAcPpe91PDjyExlV7qPqfmCyLkepSngg4YOKeZV-omlXUUGIJGbZOrldRalluKggAi817GVkaSlCDYRKLtuZiZWFDhFmDZNyy-f7MeeQg_7k89qqolK831X8e56xZdFScT0D0NGzhYA--gYHf59Q8Hvm23q4QMR6biY6Njvh0')"}}
                onClick={() => { setNextTransition('push'); onClose(); window.location.href = '/salon'; }}
              >
                <div className="absolute inset-0 bg-[#3C2A21]/40 group-hover:bg-[#3C2A21]/20 transition-colors duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="text-[#FAF7F2] text-[10px] uppercase tracking-widest font-bold mb-1 block">Latest Log</span>
                    <h3 className="font-serif text-2xl text-[#FAF7F2] font-medium">The Architecture of the 'North-East' Gate</h3>
                  </div>
                  <ArrowRight className="text-[#FAF7F2] transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
