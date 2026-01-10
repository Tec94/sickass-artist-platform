import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0a0a0a] border-l border-neutral-800 z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#0a0a0a]">
          <h2 className="text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Shopping Bag ({items.length})
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
              <p className="font-mono text-sm">Signal Lost: Bag is empty.</p>
              <button onClick={onClose} className="text-red-500 hover:text-red-400 underline text-sm uppercase tracking-wider">Initialize Shopping</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 animate-fade-in group">
                <div className="w-20 h-24 bg-neutral-900 border border-neutral-800 flex-shrink-0 overflow-hidden">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold uppercase text-gray-200 pr-4">{item.name}</h3>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-neutral-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-red-500 font-mono mt-1">${item.price.toFixed(2)}</p>
                  
                  <div className="mt-auto flex gap-3 text-xs text-gray-500 font-mono">
                    {item.selectedSize && <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">SIZE: {item.selectedSize}</span>}
                    {item.selectedFormat && <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">{item.selectedFormat.toUpperCase()}</span>}
                    <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">QTY: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-[#0a0a0a]">
            <div className="flex justify-between mb-4 text-sm font-medium text-white">
              <span className="text-gray-400 uppercase tracking-wider text-xs">Subtotal</span>
              <span className="font-mono text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-gray-600 mb-6 text-center uppercase tracking-widest">Shipping & taxes calculated at checkout.</p>
            <button className="w-full bg-red-600 text-white font-bold uppercase py-4 hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              Proceed to Checkout
            </button>
            <button 
              onClick={onClose} 
              className="w-full mt-4 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};