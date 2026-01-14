import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'

interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  images: string[]
  selectedSize?: string
  selectedVariant?: string
}

interface MerchCartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemove: (id: string) => void
}

export const MerchCartDrawer = ({ isOpen, onClose, items, onRemove }: MerchCartDrawerProps) => {
  const navigate = useNavigate()
  const removeFromCart = useMutation(api.cart.removeFromCart)
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleRemove = async (variantId: string) => {
    try {
      await removeFromCart({ variantId: variantId as Id<'merchVariants'> })
    } catch {
      onRemove(variantId)
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/store/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-[101] shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide flex items-center gap-3">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Shopping Bag ({itemCount})
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <iconify-icon icon="solar:close-circle-bold" width="24" height="24"></iconify-icon>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-800">
                <iconify-icon icon="solar:bag-heart-bold" width="48" height="48"></iconify-icon>
              </div>
              <p className="text-zinc-500 font-medium">Your bag is currently empty.</p>
              <button onClick={onClose} className="text-red-500 hover:text-red-400 font-bold uppercase text-xs tracking-widest underline underline-offset-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item._id}-${idx}`} className="flex gap-4 group">
                <div className="w-24 h-32 bg-zinc-900 shrink-0 overflow-hidden relative border border-zinc-900 group-hover:border-zinc-800 transition-colors">
                  <img 
                    src={item.images[0] || '/placeholder.png'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-white font-bold uppercase text-xs leading-tight tracking-wide">{item.name}</h3>
                    <span className="text-zinc-100 font-bold text-sm shrink-0">${(item.price / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.selectedVariant && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase">{item.selectedVariant}</span>
                    )}
                    {item.selectedSize && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase">{item.selectedSize}</span>
                    )}
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase">QTY: {item.quantity}</span>
                  </div>

                  <button 
                    onClick={() => handleRemove(item._id)}
                    className="mt-auto self-start flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-600 transition-colors"
                  >
                    <iconify-icon icon="solar:trash-bin-trash-bold" width="14" height="14"></iconify-icon>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-900 bg-zinc-950">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-500 font-bold uppercase text-xs tracking-[0.2em]">Subtotal</span>
              <span className="text-white font-bold text-2xl">${(subtotal / 100).toFixed(2)}</span>
            </div>
            
            <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest text-center mb-6">
              Shipping & Taxes calculated at checkout
            </p>

            <div className="space-y-3">
              <button 
                onClick={handleCheckout}
                className="w-full bg-white hover:bg-zinc-100 text-black py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
              
              <button 
                onClick={onClose}
                className="w-full text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest py-2 transition-colors"
              >
                Or Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}</style>
    </>
  )
}
