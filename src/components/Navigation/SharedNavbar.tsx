import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { setNextTransition } from '../Effects/PageTransition'
import { Search, User, ShoppingBag } from 'lucide-react'
import SearchOverlay from './SearchOverlay'
import CheckoutOverlay from './CheckoutOverlay'
import { usePrototypeCart } from '../../features/store/prototypeCart'

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

export default function SharedNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false)
  const location = useLocation()
  const { itemCount } = usePrototypeCart()

  const closeTransientUi = () => {
    setIsSearchOpen(false)
    setIsCheckoutOpen(false)
    setIsStoreMenuOpen(false)
  }

  useEffect(() => {
    setIsSearchOpen(false)
    setIsCheckoutOpen(false)
    setIsStoreMenuOpen(false)
  }, [location.pathname])

  const getLinkClasses = (path: string) => {
    const baseClasses =
      'text-sm font-semibold uppercase tracking-wider transition-colors nav-link-hover flex items-center h-full'

    if (isActivePath(location.pathname, path)) {
      return `${baseClasses} text-[#C36B42] border-b-2 border-[#C36B42]`
    }

    return `${baseClasses} text-[#3C2A21] hover:text-[#C36B42]`
  }

  return (
    <>
      <header className="h-[72px] border-b border-[#3C2A21] bg-[#F4EFE6] flex items-center justify-between px-8 relative z-40 shadow-[0_4px_10px_rgba(60,42,33,0.12)]">
        <div className="flex items-center gap-12 h-full">
          <Link
            to="/dashboard"
            className="font-['Cormorant_Garamond'] text-2xl font-semibold tracking-tight text-[#3C2A21] hover:text-[#C36B42] transition-colors"
          >
            THE ESTATE
          </Link>

          <nav className="flex items-center gap-8 h-full">
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsStoreMenuOpen(true)}
              onMouseLeave={() => setIsStoreMenuOpen(false)}
              onFocusCapture={() => setIsStoreMenuOpen(true)}
              onBlurCapture={(event) => {
                const nextFocusedElement = event.relatedTarget
                if (!event.currentTarget.contains(nextFocusedElement as Node | null)) {
                  setIsStoreMenuOpen(false)
                }
              }}
            >
              <Link
                to="/store"
                onClick={() => {
                  setNextTransition('push')
                  closeTransientUi()
                }}
                className={getLinkClasses('/store')}
                aria-expanded={isStoreMenuOpen}
                aria-haspopup="true"
              >
                Store
              </Link>

              <AnimatePresence>
                {isStoreMenuOpen ? (
                  <motion.div
                    className="absolute left-0 top-full z-[110]"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      aria-hidden="true"
                      data-testid="store-menu-bridge"
                      className="absolute left-0 top-0 h-5 w-[840px]"
                    />
                    <div
                      data-testid="store-mega-menu"
                      className="w-[820px] overflow-hidden border border-[#3C2A21] bg-[#FAF7F2] shadow-[0_30px_60px_rgba(28,27,26,0.16)]"
                    >
                      <div className="flex">
                        <div className="h-full w-1/2 border-r border-[#3C2A21]/15 p-8">
                          <Link
                            to="/store/product/private-suite-tee"
                            onClick={() => {
                              setNextTransition('push')
                              closeTransientUi()
                            }}
                            className="group relative block h-full w-full overflow-hidden bg-cover bg-center"
                            style={{
                              backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCn2d7DIcuRChwL7JHv90Xk489giFm7mkFmi7UMnknopv5kyun1AIgd1oIrQ5qFfwg6l7JAT8VeMHIuwtHYoPu-FIuvXL_NcAqq2-qlAcPpe91PDjyExlV7qPqfmCyLkepSngg4YOKeZV-omlXUUGIJGbZOrldRalluKggAi817GVkaSlCDYRKLtuZiZWFDhFmDZNyy-f7MeeQg_7k89qqolK831X8e56xZdFScT0D0NGzhYA--gYHf59Q8Hvm23q4QMR6biY6Njvh0')",
                            }}
                          >
                            <div className="absolute inset-0 bg-[#3C2A21]/30 transition-colors duration-500 group-hover:bg-[#3C2A21]/18" />
                            <div className="absolute bottom-6 left-6 text-[#FAF7F2]">
                              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em]">
                                New Collection
                              </span>
                              <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium">
                                Private Suite Vol. 3
                              </h3>
                            </div>
                          </Link>
                        </div>

                        <div className="grid h-full w-1/2 grid-cols-2 gap-8 bg-[#FAF7F2] p-10">
                          <div className="flex flex-col gap-4">
                            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8E7D72]">
                              Latest
                            </h4>
                            <Link
                              to="/store"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[#3C2A21] transition-colors hover:text-[#C36B42]"
                            >
                              Full Collection
                            </Link>
                            <Link
                              to="/store/product/midnight-sessions-vinyl"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[#3C2A21] transition-colors hover:text-[#C36B42]"
                            >
                              Vinyl & Media
                            </Link>
                          </div>
                          <div className="flex flex-col gap-4">
                            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8E7D72]">
                              Top
                            </h4>
                            <Link
                              to="/store/product/el-lobo-hoodie"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[#3C2A21] transition-colors hover:text-[#C36B42]"
                            >
                              Outerwear
                            </Link>
                            <Link
                              to="/store/product/obsidian-wayfinder-poster"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[#3C2A21] transition-colors hover:text-[#C36B42]"
                            >
                              Collectibles
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <Link
              to="/events"
              onClick={() => {
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/events')}
            >
              Events
            </Link>
            <Link
              to="/community"
              onClick={() => {
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/community')}
            >
              Community
            </Link>
            <Link
              to="/rankings"
              onClick={() => {
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/rankings')}
            >
              Rankings
            </Link>
            <Link
              to="/journey"
              onClick={() => {
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/journey')}
            >
              Journey
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => {
              setIsSearchOpen(true)
              setIsCheckoutOpen(false)
              setIsStoreMenuOpen(false)
            }}
            className="text-[#3C2A21] hover:text-[#C36B42] transition-colors"
          >
            <Search size={20} />
          </button>
          <Link
            to="/profile"
            onClick={() => {
              setNextTransition('slide-up')
              closeTransientUi()
            }}
            className="text-[#3C2A21] hover:text-[#C36B42] transition-colors"
            aria-label="Open profile"
          >
            <User size={20} />
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            onClick={() => {
              setIsCheckoutOpen(true)
              setIsSearchOpen(false)
              setIsStoreMenuOpen(false)
            }}
            className="text-[#3C2A21] hover:text-[#C36B42] transition-colors relative"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 ? (
              <span className="absolute -top-1 -right-2 bg-[#C36B42] text-[#FAF7F2] text-[10px] font-bold px-1.5 py-0.5 rounded-sm min-w-[18px] text-center">
                {itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen ? <SearchOverlay onClose={() => setIsSearchOpen(false)} /> : null}
      </AnimatePresence>
      <CheckoutOverlay isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
