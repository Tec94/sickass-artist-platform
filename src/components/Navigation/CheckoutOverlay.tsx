import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ShoppingBag, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { setNextTransition } from '../Effects/PageTransition'
import { usePrototypeCart } from '../../features/store/prototypeCart'
import { formatPrototypePrice } from '../../features/store/prototypeStoreContract'

interface CheckoutOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutOverlay({ isOpen, onClose }: CheckoutOverlayProps) {
  const navigate = useNavigate()
  const { items, itemCount, subtotalCents, removeItem, clearCart, canWrite } = usePrototypeCart()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex justify-end font-sans"
          data-testid="checkout-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Prototype cart"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-[#3C2A21]/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="relative flex h-full w-[400px] max-w-[92vw] flex-col border-l border-[#3C2A21] bg-[#F4EFE6] shadow-[rgba(0,0,0,0.35)_0px_0px_40px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-[#3C2A21]/15 px-6 py-6">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#C36B42]" />
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#3C2A21]">
                    Your Cart
                  </h2>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#3C2A21] transition-colors hover:text-[#C36B42]"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <ShoppingBag size={48} className="text-[#C36B42]/20" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8E7D72]">
                    Your collection is empty
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNextTransition('push')
                      onClose()
                      navigate('/store')
                    }}
                    className="mt-4 bg-[#3C2A21] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF7F2] transition-colors hover:bg-[#C36B42]"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.lineKey} className="group flex gap-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-[#3C2A21]/10 bg-[#FAF7F2]">
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.alt}
                          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-['Cormorant_Garamond'] text-xl leading-tight text-[#3C2A21]">
                              {item.product.name}
                            </h3>
                            {item.selectedOptions.length > 0 ? (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#8E7D72]">
                                {item.selectedOptions
                                  .map(
                                    (selectedOption) =>
                                      `${selectedOption.label}: ${selectedOption.selectedLabel}`,
                                  )
                                  .join(' • ')}
                              </p>
                            ) : null}
                            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#8E7D72]">
                              Qty {item.quantity}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.lineKey)}
                            className="text-[#8E7D72] transition-colors hover:text-[#A62B3A]"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="flex-1 text-sm leading-6 text-[#3C2A21]/72">
                          {item.product.shortDescription}
                        </p>
                        <div className="mt-3 flex items-end justify-between">
                          <span className="text-xs uppercase tracking-[0.16em] text-[#8E7D72]">
                            {formatPrototypePrice(item.unitPriceCents)} each
                          </span>
                          <span className="text-sm font-semibold text-[#3C2A21]">
                            {formatPrototypePrice(item.lineTotalCents)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-[#3C2A21]/15 bg-[#FAF7F2]/60 px-6 py-8">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8E7D72]">
                    Subtotal
                  </span>
                  <span className="text-sm font-semibold text-[#3C2A21]">
                    {formatPrototypePrice(subtotalCents)}
                  </span>
                </div>
                <div className="mb-6 flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8E7D72]">
                    Prototype note
                  </span>
                  <span className="text-xs text-[#3C2A21]/75">
                    {canWrite ? 'Cart synced to Convex' : 'Sign in required for cart writes'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-[480px]:flex-row">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full border border-[#3C2A21] px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#3C2A21] transition-colors hover:bg-[#3C2A21] hover:text-[#FAF7F2] min-[480px]:flex-1"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 whitespace-nowrap bg-[#3C2A21] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FAF7F2] transition-colors hover:bg-[#C36B42] min-[480px]:flex-[1.35]"
                    onClick={() => {
                      setNextTransition('push')
                      onClose()
                      navigate('/store')
                    }}
                  >
                    <span>Continue Browsing</span>
                    <ArrowRight size={16} className="shrink-0" />
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
