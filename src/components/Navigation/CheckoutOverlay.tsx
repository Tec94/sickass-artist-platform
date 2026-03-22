import { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { setNextTransition } from '../Effects/PageTransition';

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutOverlay({ isOpen, onClose }: CheckoutOverlayProps) {
  // Static cart data for demonstration as requested by the prototype
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "The Archive Collection / Obsidian Tablet",
      price: "0.12 ETH",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmYh2a1VqXp-O3e8fW5z8F9_m6Yp_3-z5mN_W_mX6_z8-v_m7_W8-m_X7_z8_v-m_7_W8-mX7_z8_v-m_7_W8-mX7_z8_v-m_7_W8-mX7_z8_v-m_7_W8-mX7",
      tier: "Tier 2+"
    },
    {
       id: 2,
       name: "Sovereign Garment (Digital)",
       price: "0.08 ETH",
       image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDW1X0nkps6fvGg-cbp7Uh42JWnoCwYIyab5QSsCDXjaN5PwfwAAGkuf-cEHBgT1bJInH6yeMPwhelgFDxAlbpKmJ_h3IdbG9FsMIKAg1w8YZkSomf1P82HTk3_W5fT-UqVW8m1S-pkfxyHIk3QcXYTEXVCMXcgR6Z54nvfUpp2obWDoCDOfGQ4R60C5Yxoaoh1Vm99_Eq49Iy8DLQpgf_g857Tcyx0VSBYe9xKa0Bf73pBKQdSimP56VDw7QuckyDvz_bLOSWxJet",
       tier: "Sovereign"
    }
  ]);

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

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end font-sans pointer-events-none transition-all duration-500`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#3C2A21]/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div 
        className={`relative w-[400px] max-w-[90vw] bg-[#F4EFE6] shadow-[rgba(0,0,0,0.5)_0px_0px_40px] pointer-events-auto flex flex-col h-full border-l border-[#3C2A21] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#3C2A21]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-[#C36B42]" />
            <h2 className="font-serif text-2xl font-semibold text-[#3C2A21]">Your Artifacts</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#3C2A21] hover:text-[#C36B42] transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <ShoppingBag size={48} className="text-[#C36B42]/20" />
              <p className="text-[#8E7D72] uppercase tracking-widest text-xs font-bold">Your collection is empty</p>
              <button 
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-[#3C2A21] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C36B42] transition-colors rounded-sm"
              >
                Explore Boutique
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-24 h-24 bg-[#FAF7F2] border border-[#3C2A21]/10 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-lg leading-tight text-[#3C2A21]">{item.name}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-[#8E7D72] hover:text-[#A62B3A] transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#C36B42] mb-auto">{item.tier}</span>
                    <div className="flex justify-between items-end mt-2">
                       <span className="text-sm font-mono font-bold text-[#3C2A21]">{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-8 border-t border-[#3C2A21]/15 bg-[#FAF7F2]/50">
            <div className="flex justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#8E7D72]">Subtotal</span>
              <span className="text-sm font-mono font-bold text-[#3C2A21]">0.20 ETH</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="text-xs uppercase tracking-widest font-bold text-[#8E7D72]">Tax / Fees</span>
              <span className="text-sm font-mono font-bold text-[#3C2A21]">0.005 ETH</span>
            </div>
            <button 
              className="w-full py-4 bg-[#3C2A21] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#C36B42] transition-colors flex items-center justify-center gap-3 group"
              onClick={() => { setNextTransition('push'); window.location.href = '/proto/store-boutique'; }}
            >
              Secure Transaction
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
