import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { setNextTransition } from '../Effects/PageTransition'
import SearchOverlay, { type SearchOverlayState } from './SearchOverlay'
import CheckoutOverlay from './CheckoutOverlay'
import { usePrototypeCart } from '../../features/store/prototypeCart'

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

const mobileNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Journey', path: '/journey' },
  { label: 'Store', path: '/store' },
  { label: 'Events', path: '/events' },
  { label: 'Community', path: '/community' },
  { label: 'Rankings', path: '/rankings' },
  { label: 'Campaign', path: '/campaign' },
  { label: 'Profile', path: '/profile' },
]

const mobileNavViewportOffset = 'calc(72px + env(safe-area-inset-top, 0px))'

export default function SharedNavbar() {
  const [searchState, setSearchState] = useState<SearchOverlayState | 'closed'>('closed')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const location = useLocation()
  const { itemCount } = usePrototypeCart()
  const searchTriggerRef = useRef<HTMLButtonElement>(null)

  const isSearchActive = searchState !== 'closed'

  const closeTransientUi = () => {
    setSearchState('closed')
    setIsCheckoutOpen(false)
    setIsStoreMenuOpen(false)
    setIsMobileNavOpen(false)
  }

  const beginCloseSearch = () => {
    setIsStoreMenuOpen(false)
    setIsMobileNavOpen(false)
    setSearchState((currentState) => (currentState === 'open' ? 'closing' : currentState))
  }

  const handleSearchExited = () => {
    setSearchState('closed')
    searchTriggerRef.current?.focus()
  }

  useEffect(() => {
    closeTransientUi()
  }, [location.pathname])

  const getLinkClasses = (path: string) => {
    const baseClasses =
      'flex h-full items-center text-sm font-semibold uppercase tracking-wider transition-colors nav-link-hover'

    if (isActivePath(location.pathname, path)) {
      return `${baseClasses} border-b-2 border-[var(--site-accent)] text-[var(--site-accent)]`
    }

    return `${baseClasses} text-[var(--site-text)] hover:text-[var(--site-accent)]`
  }

  const getDrawerLinkClasses = (path: string) => {
    const baseClasses =
      'flex items-center justify-between border-b border-[color:var(--site-border-soft)] py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-colors'

    if (isActivePath(location.pathname, path)) {
      return `${baseClasses} text-[var(--site-accent)]`
    }

    return `${baseClasses} text-[var(--site-text)] hover:text-[var(--site-accent)]`
  }

  return (
    <>
      <header className="mobile-safe-header relative z-40 flex min-h-[72px] shrink-0 items-center justify-between border-b border-[var(--site-border-strong)] bg-[var(--site-page-bg)] px-4 shadow-[var(--site-navbar-shadow)] sm:px-6 lg:px-8">
        <div className="flex h-full min-w-0 items-center gap-4 lg:gap-12">
          <Link
            to="/dashboard"
            className="truncate font-['Cormorant_Garamond'] text-xl font-semibold tracking-tight text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)] sm:text-2xl"
            onClick={() => closeTransientUi()}
          >
            THE ESTATE
          </Link>

          <nav className="hidden h-full items-center gap-8 lg:flex">
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => {
                if (isSearchActive) return
                setIsStoreMenuOpen(true)
              }}
              onMouseLeave={() => {
                if (isSearchActive) return
                setIsStoreMenuOpen(false)
              }}
              onFocusCapture={() => {
                if (isSearchActive) return
                setIsStoreMenuOpen(true)
              }}
              onBlurCapture={(event) => {
                if (isSearchActive) return
                const nextFocusedElement = event.relatedTarget
                if (!event.currentTarget.contains(nextFocusedElement as Node | null)) {
                  setIsStoreMenuOpen(false)
                }
              }}
            >
              <Link
                to="/store"
                onClick={(event) => {
                  if (isSearchActive) {
                    event.preventDefault()
                    return
                  }
                  setNextTransition('push')
                  closeTransientUi()
                }}
                className={getLinkClasses('/store')}
                aria-expanded={isStoreMenuOpen && !isSearchActive}
                aria-haspopup="true"
              >
                Store
              </Link>

              <AnimatePresence>
                {isStoreMenuOpen && !isSearchActive ? (
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
                      className="w-[820px] overflow-hidden border border-[var(--site-border-strong)] bg-[var(--site-surface)] shadow-[var(--site-panel-shadow-strong)]"
                    >
                      <div className="flex">
                        <div className="h-full w-1/2 border-r border-[color:var(--site-border-soft)] p-8">
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
                            <div className="absolute inset-0 bg-[color:var(--site-overlay-scrim)] transition-colors duration-500 group-hover:opacity-80" />
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

                        <div className="grid h-full w-1/2 grid-cols-2 gap-8 bg-[var(--site-surface)] p-10">
                          <div className="flex flex-col gap-4">
                            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--site-text-muted)]">
                              Latest
                            </h4>
                            <Link
                              to="/store"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
                            >
                              Full Collection
                            </Link>
                            <Link
                              to="/store/product/midnight-sessions-vinyl"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
                            >
                              Vinyl &amp; Media
                            </Link>
                          </div>
                          <div className="flex flex-col gap-4">
                            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--site-text-muted)]">
                              Top
                            </h4>
                            <Link
                              to="/store/product/el-lobo-hoodie"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
                            >
                              Outerwear
                            </Link>
                            <Link
                              to="/store/product/obsidian-wayfinder-poster"
                              onClick={() => {
                                setNextTransition('push')
                                closeTransientUi()
                              }}
                              className="text-sm text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
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
              onClick={(event) => {
                if (isSearchActive) {
                  event.preventDefault()
                  return
                }
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/events')}
            >
              Events
            </Link>
            <Link
              to="/community"
              onClick={(event) => {
                if (isSearchActive) {
                  event.preventDefault()
                  return
                }
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/community')}
            >
              Community
            </Link>
            <Link
              to="/rankings"
              onClick={(event) => {
                if (isSearchActive) {
                  event.preventDefault()
                  return
                }
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/rankings')}
            >
              Rankings
            </Link>
            <Link
              to="/journey"
              onClick={(event) => {
                if (isSearchActive) {
                  event.preventDefault()
                  return
                }
                setNextTransition('push')
                closeTransientUi()
              }}
              className={getLinkClasses('/journey')}
            >
              Journey
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <button
            ref={searchTriggerRef}
            type="button"
            aria-label="Open search"
            onClick={() => {
              if (isSearchActive) return
              setIsCheckoutOpen(false)
              setIsStoreMenuOpen(false)
              setIsMobileNavOpen(false)
              setSearchState('open')
            }}
            className="rounded-full p-2 text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
          >
            <Search size={20} />
          </button>
          <Link
            to="/profile"
            onClick={(event) => {
              if (isSearchActive) {
                event.preventDefault()
                return
              }
              setNextTransition('slide-up')
              closeTransientUi()
            }}
            className="hidden rounded-full p-2 text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)] lg:block"
            aria-label="Open profile"
          >
            <User size={20} />
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            onClick={() => {
              if (isSearchActive) return
              setIsCheckoutOpen(true)
              setIsStoreMenuOpen(false)
              setIsMobileNavOpen(false)
            }}
            className="relative rounded-full p-2 text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)]"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 ? (
              <span className="absolute -top-1 -right-2 min-w-[18px] rounded-sm bg-[#C36B42] px-1.5 py-0.5 text-center text-[10px] font-bold text-[#FAF7F2]">
                {itemCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => {
              if (isSearchActive) return
              setIsCheckoutOpen(false)
              setIsStoreMenuOpen(false)
              setIsMobileNavOpen((currentState) => !currentState)
            }}
            className="rounded-full p-2 text-[var(--site-text)] transition-colors hover:text-[var(--site-accent)] lg:hidden"
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileNavOpen ? (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[115] lg:hidden"
            style={{ top: mobileNavViewportOffset }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[color:var(--site-overlay-scrim)] backdrop-blur-[2px]"
              aria-hidden="true"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <motion.aside
              data-testid="mobile-nav-drawer"
              className="responsive-sheet-panel mobile-safe-nav absolute inset-x-0 top-0 mx-3 overflow-hidden border border-[var(--site-border-strong)] bg-[var(--site-surface)] px-5 pb-8 pt-4 shadow-[var(--site-panel-shadow)]"
              initial={{ y: -20, opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0.92 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-[color:var(--site-border-soft)] pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--site-text-muted)]">
                    Estate navigation
                  </p>
                  <p className="mt-2 font-['Cormorant_Garamond'] text-2xl text-[var(--site-text)]">
                    Move through the live routes
                  </p>
                </div>
                <Link
                  to="/profile"
                  aria-label="Open profile"
                  className="rounded-full border border-[color:var(--site-border-soft)] p-2 text-[var(--site-text)] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                  onClick={() => {
                    setNextTransition('slide-up')
                    closeTransientUi()
                  }}
                >
                  <User size={18} />
                </Link>
              </div>

              <nav className="flex flex-col">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      setNextTransition('push')
                      closeTransientUi()
                    }}
                    className={getDrawerLinkClasses(item.path)}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--site-text-muted)]">
                      Open
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {searchState !== 'closed' ? (
        <SearchOverlay
          state={searchState}
          onRequestClose={beginCloseSearch}
          onExited={handleSearchExited}
        />
      ) : null}
      <CheckoutOverlay isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
