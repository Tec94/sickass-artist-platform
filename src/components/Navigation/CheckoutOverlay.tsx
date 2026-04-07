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
          className="fixed inset-0 z-[120] flex items-end justify-center font-sans md:top-[var(--app-header-height)] md:items-start md:justify-end"
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
            className="absolute inset-0 bg-[color:var(--site-overlay-scrim)] backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="responsive-sheet-panel mobile-safe-nav relative mt-auto flex w-full max-h-[min(82dvh,42rem)] flex-col overflow-hidden border border-[var(--site-border-strong)] bg-[var(--site-page-bg)] shadow-[var(--site-panel-shadow)] md:mt-0 md:h-full md:w-[400px] md:max-w-[92vw] md:max-h-none md:rounded-none md:border-l md:border-t-0"
            initial={{ x: '100%' }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: '100%', y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-center pt-3 md:hidden">
              <span className="h-1.5 w-14 rounded-full bg-[color:var(--site-border-soft)]" />
            </div>
            <div className="flex items-center justify-between border-b border-[color:var(--site-border-soft)] px-6 py-6">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[var(--site-accent)]" />
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[var(--site-text)]">
                    Your Cart
                  </h2>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--site-text-muted)]">
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <ShoppingBag size={48} className="text-[var(--site-accent)] opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--site-text-muted)]">
                    Your collection is empty
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNextTransition('push')
                      onClose()
                      navigate('/store')
                    }}
                    className="mt-4 bg-[var(--site-button-solid)] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--site-button-solid-text)] transition-colors hover:bg-[var(--site-accent)]"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.lineKey} className="group flex gap-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-[color:var(--site-border-soft)] bg-[var(--site-surface)]">
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.alt}
                          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-['Cormorant_Garamond'] text-xl leading-tight text-[var(--site-text)]">
                              {item.product.name}
                            </h3>
                            {item.selectedOptions.length > 0 ? (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--site-text-muted)]">
                                {item.selectedOptions
                                  .map(
                                    (selectedOption) =>
                                      `${selectedOption.label}: ${selectedOption.selectedLabel}`,
                                  )
                                  .join(' • ')}
                              </p>
                            ) : null}
                            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--site-text-muted)]">
                              Qty {item.quantity}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.lineKey)}
                            className="text-[var(--site-text-muted)] transition-colors hover:text-[var(--site-accent)]"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="flex-1 text-sm leading-6 text-[var(--site-text-muted)]">
                          {item.product.shortDescription}
                        </p>
                        <div className="mt-3 flex items-end justify-between">
                          <span className="text-xs uppercase tracking-[0.16em] text-[var(--site-text-muted)]">
                            {formatPrototypePrice(item.unitPriceCents)} each
                          </span>
                          <span className="text-sm font-semibold text-[var(--site-text)]">
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
              <div className="border-t border-[color:var(--site-border-soft)] bg-[var(--site-surface)] px-6 py-8">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--site-text-muted)]">
                    Subtotal
                  </span>
                  <span className="text-sm font-semibold text-[var(--site-text)]">
                    {formatPrototypePrice(subtotalCents)}
                  </span>
                </div>
                <div className="mb-6 flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--site-text-muted)]">
                    Prototype note
                  </span>
                  <span className="text-xs text-[var(--site-text-muted)]">
                    {canWrite ? 'Cart synced to Convex' : 'Sign in required for cart writes'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-[480px]:flex-row">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full border border-[var(--site-border-strong)] px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--site-text)] transition-colors hover:bg-[var(--site-button-solid)] hover:text-[var(--site-button-solid-text)] min-[480px]:flex-1"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 whitespace-nowrap bg-[var(--site-button-solid)] px-4 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-button-solid-text)] transition-colors hover:bg-[var(--site-accent)] min-[480px]:flex-[1.35]"
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
