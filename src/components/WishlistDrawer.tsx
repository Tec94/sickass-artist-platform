import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useUser } from '../contexts/UserContext'
import { useCart } from '../contexts/CartContext'
import { parseConvexError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { Id } from '../../convex/_generated/dataModel'

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { addItem } = useCart()
  
  const wishlist = useQuery(api.merch.getWishlist, isSignedIn ? {} : 'skip')
  const toggleWishlist = useMutation(api.merch.toggleWishlist)

  const handleRemove = async (productId: Id<'merchProducts'>) => {
    try {
      await toggleWishlist({ productId })
    } catch (err) {
      showToast(parseConvexError(err).userMessage, { type: 'error' })
    }
  }

  const handleAddToCart = async (product: any) => {
    try {
      // Find first available variant
      const variant = product.variants?.find((v: any) => v.stock > 0)
      if (!variant) {
        showToast('Item out of stock', { type: 'error' })
        return
      }
      await addItem(variant._id, 1)
      showToast('Added to cart!', { type: 'success' })
    } catch (err) {
      showToast(parseConvexError(err).userMessage, { type: 'error' })
    }
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1010] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-900 z-[1020] shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide flex items-center gap-3">
            <iconify-icon icon="solar:heart-bold" width="20" height="20" class="text-red-600"></iconify-icon>
            Saved Items ({wishlist?.length || 0})
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <iconify-icon icon="solar:close-circle-bold" width="24" height="24"></iconify-icon>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!isSignedIn ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
               <p className="text-zinc-500 font-medium">Please sign in to view your wishlist.</p>
               <button onClick={() => navigate('/profile')} className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest">
                 Sign In
               </button>
             </div>
          ) : wishlist?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-800">
                <iconify-icon icon="solar:heart-broken-bold" width="48" height="48"></iconify-icon>
              </div>
              <p className="text-zinc-500 font-medium">Your wishlist is empty.</p>
              <button onClick={onClose} className="text-red-500 hover:text-red-400 font-bold uppercase text-xs tracking-widest underline underline-offset-4">
                Explore Store
              </button>
            </div>
          ) : (
            wishlist?.map((product, idx) => (
              <div key={`${product._id}-${idx}`} className="flex gap-4 group">
                <div className="w-24 h-32 bg-zinc-900 shrink-0 overflow-hidden relative border border-zinc-900 group-hover:border-zinc-800 transition-colors">
                  <img 
                    src="/src/public/assets/test-image.jpg" 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/src/public/assets/test-image.jpg' }}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-white font-bold uppercase text-xs leading-tight tracking-wide">{product.name}</h3>
                    <span className="text-zinc-100 font-bold text-sm shrink-0">${(product.price / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white py-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Add to Bag
                    </button>
                  </div>

                  <button 
                    onClick={() => handleRemove(product._id as Id<'merchProducts'>)}
                    className="mt-4 self-start flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-600 transition-colors"
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
        {isSignedIn && wishlist && wishlist.length > 0 && (
          <div className="p-6 border-t border-zinc-900 bg-zinc-950">
            <button 
              onClick={onClose}
              className="w-full bg-white hover:bg-zinc-100 text-black py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue Shopping
            </button>
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
