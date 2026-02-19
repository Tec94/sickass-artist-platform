import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCart } from '../contexts/CartContext'
import { useUser } from '../contexts/UserContext'
import { useTranslation } from '../hooks/useTranslation'
import { useSearchModal } from '../hooks/useSearchModal'
import { withDashboardExperienceDefaults } from '../constants/dashboardFlags'
import { useDashboardHeroPresence } from '../hooks/useDashboardHeroPresence'
import { CartDrawer } from './CartDrawer'
import { WishlistDrawer } from './WishlistDrawer'
import { SearchModal } from './Search/SearchModal'
import { SearchTrigger } from './Search/SearchTrigger'
import { ProfilePopover } from './Navigation/ProfilePopover'

type HeaderCollapseAuthState = 'in' | 'out'

type HeaderCollapseSessionState = {
  loginEpoch: number
  lastAuthState: HeaderCollapseAuthState
  collapseSeenEpoch: number
}

const HEADER_COLLAPSE_SESSION_KEY = 'dashboard_header_cinematic_session_v1'

const DEFAULT_HEADER_COLLAPSE_SESSION_STATE: HeaderCollapseSessionState = {
  loginEpoch: 0,
  lastAuthState: 'out',
  collapseSeenEpoch: 0,
}

let inMemoryHeaderCollapseSessionState: HeaderCollapseSessionState = {
  ...DEFAULT_HEADER_COLLAPSE_SESSION_STATE,
}

const normalizeHeaderCollapseSessionState = (value: unknown): HeaderCollapseSessionState => {
  if (!value || typeof value !== 'object') {
    return { ...inMemoryHeaderCollapseSessionState }
  }

  const draft = value as Partial<HeaderCollapseSessionState>
  const normalized: HeaderCollapseSessionState = {
    loginEpoch:
      typeof draft.loginEpoch === 'number' && Number.isFinite(draft.loginEpoch)
        ? Math.max(0, Number(draft.loginEpoch))
        : inMemoryHeaderCollapseSessionState.loginEpoch,
    collapseSeenEpoch:
      typeof draft.collapseSeenEpoch === 'number' && Number.isFinite(draft.collapseSeenEpoch)
      ? Math.max(0, Number(draft.collapseSeenEpoch))
      : inMemoryHeaderCollapseSessionState.collapseSeenEpoch,
    lastAuthState: draft.lastAuthState === 'in' ? 'in' : 'out',
  }

  return normalized
}

const readHeaderCollapseSessionState = (): HeaderCollapseSessionState => {
  if (typeof window === 'undefined') {
    return { ...inMemoryHeaderCollapseSessionState }
  }

  try {
    const raw = window.sessionStorage.getItem(HEADER_COLLAPSE_SESSION_KEY)
    if (!raw) {
      inMemoryHeaderCollapseSessionState = { ...DEFAULT_HEADER_COLLAPSE_SESSION_STATE }
      return { ...inMemoryHeaderCollapseSessionState }
    }
    const parsed = JSON.parse(raw)
    const normalized = normalizeHeaderCollapseSessionState(parsed)
    inMemoryHeaderCollapseSessionState = normalized
    return { ...normalized }
  } catch {
    return { ...inMemoryHeaderCollapseSessionState }
  }
}

const writeHeaderCollapseSessionState = (nextState: HeaderCollapseSessionState) => {
  inMemoryHeaderCollapseSessionState = { ...nextState }

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(HEADER_COLLAPSE_SESSION_KEY, JSON.stringify(nextState))
  } catch {
    // Keep in-memory fallback when sessionStorage is unavailable.
  }
}

const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { userProfile, isSignedIn } = useUser()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileTriggerRef = useRef<HTMLButtonElement>(null)
  const [avatarError, setAvatarError] = useState(false)
  const [collapseSessionEpoch, setCollapseSessionEpoch] = useState(() => readHeaderCollapseSessionState().loginEpoch)
  const [collapseSeenEpoch, setCollapseSeenEpoch] = useState(() => readHeaderCollapseSessionState().collapseSeenEpoch)
  const heroSeenInCurrentCollapseCycle = useRef(false)
  const { isSearchOpen, openSearch, closeSearch } = useSearchModal()
  const { t } = useTranslation()

  const experienceFlags = withDashboardExperienceDefaults(
    useQuery(api.dashboard.getDashboardExperienceFlags, location.pathname === '/dashboard' ? {} : 'skip'),
  )
  const collapseFeatureEnabled = experienceFlags.headerCollapseV1 !== false
  const collapseRouteEnabled = location.pathname === '/dashboard' && collapseFeatureEnabled
  const isHeroVisible = useDashboardHeroPresence({ enabled: collapseRouteEnabled })
  const collapseSessionEligible = isSignedIn && collapseSessionEpoch > 0 && collapseSeenEpoch !== collapseSessionEpoch
  const isCinematicCollapsed = collapseRouteEnabled && collapseSessionEligible && isHeroVisible

  const wishlist = useQuery(api.merch.getWishlist, isSignedIn && userProfile ? {} : 'skip')
  const wishlistCount = wishlist?.length || 0
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    isSignedIn && userProfile ? { userId: userProfile._id, limit: 12 } : 'skip',
  )
  const unreadCount = notifications?.filter((note) => !note.isRead).length || 0

  const markAllRead = useMutation(api.notifications.markAllRead)
  const markNotificationRead = useMutation(api.notifications.markNotificationRead)

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', keywords: ['home'] },
    { name: t('nav.store'), path: '/store', keywords: ['shop', 'merch', 'products'] },
    { name: t('nav.events'), path: '/events', keywords: ['tour', 'tickets'] },
    { name: t('nav.gallery'), path: '/gallery', keywords: ['media', 'photos', 'videos'] },
    { name: t('nav.forum'), path: '/forum', keywords: ['threads', 'community'] },
    { name: t('nav.chat'), path: '/chat', keywords: ['messages', 'channels'] },
    { name: t('nav.ranking'), path: '/ranking', keywords: ['leaderboard', 'songs'] },
  ]
  const iconButtonClass = 'relative inline-flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors'

  useEffect(() => {
    setAvatarError(false)
  }, [userProfile?.avatar])

  useEffect(() => {
    const sessionState = readHeaderCollapseSessionState()
    const nextAuthState: HeaderCollapseAuthState = isSignedIn ? 'in' : 'out'
    const didLogIn = nextAuthState === 'in' && sessionState.lastAuthState !== 'in'
    const nextState: HeaderCollapseSessionState = {
      loginEpoch: didLogIn ? sessionState.loginEpoch + 1 : sessionState.loginEpoch,
      collapseSeenEpoch: didLogIn ? 0 : sessionState.collapseSeenEpoch,
      lastAuthState: nextAuthState,
    }

    writeHeaderCollapseSessionState(nextState)
    heroSeenInCurrentCollapseCycle.current = false
    setCollapseSessionEpoch(nextState.loginEpoch)
    setCollapseSeenEpoch(nextState.collapseSeenEpoch)
  }, [isSignedIn])

  useEffect(() => {
    if (!collapseRouteEnabled || !collapseSessionEligible) {
      heroSeenInCurrentCollapseCycle.current = false
      return
    }

    if (isHeroVisible) {
      heroSeenInCurrentCollapseCycle.current = true
      return
    }

    if (!heroSeenInCurrentCollapseCycle.current) {
      return
    }

    heroSeenInCurrentCollapseCycle.current = false
    const nextState = {
      ...readHeaderCollapseSessionState(),
      collapseSeenEpoch: collapseSessionEpoch,
    }
    writeHeaderCollapseSessionState(nextState)
    setCollapseSeenEpoch(collapseSessionEpoch)
  }, [collapseRouteEnabled, collapseSessionEligible, isHeroVisible, collapseSessionEpoch])

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userProfile) return
    try {
      await markAllRead({ userId: userProfile._id })
    } catch (error) {
      console.error('Failed to mark notifications read:', error)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead({ notificationId: notification._id })
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (error) {
      console.error('Failed to open notification:', error)
    } finally {
      setIsNotificationsOpen(false)
    }
  }

  const searchTriggerClass = isCinematicCollapsed
    ? 'hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800/80 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-red-600/60 transition-colors leading-none [&_kbd]:hidden [&_span]:hidden px-0'
    : 'hidden md:flex h-8 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-0 text-zinc-400 hover:text-white hover:border-red-600/60 transition-colors leading-none [&_kbd]:hidden [&_span]:text-xs'

  return (
    <>
      <header
        className={`sticky top-0 z-[1000] border-b transition-all duration-300 ${
          isCinematicCollapsed
            ? 'bg-zinc-950/65 backdrop-blur-sm border-zinc-900/80'
            : 'bg-zinc-950/90 backdrop-blur-md border-zinc-800'
        }`}
        data-cinematic-collapse={isCinematicCollapsed ? 'true' : 'false'}
        onClick={() => {
          if (isCartOpen) setIsCartOpen(false)
          if (isWishlistOpen) setIsWishlistOpen(false)
          if (isNotificationsOpen) setIsNotificationsOpen(false)
          if (isProfileOpen) setIsProfileOpen(false)
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1020]">
          <div className={`flex items-center justify-between transition-all duration-300 ${isCinematicCollapsed ? 'h-14' : 'h-16'}`}>
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="hidden sm:block">
                <h1 className={`font-display font-bold tracking-wider transition-all duration-300 ${isCinematicCollapsed ? 'text-lg text-zinc-100' : 'text-xl text-white'}`}>
                  ROA
                </h1>
              </div>
              <div className={`sm:hidden font-display font-bold tracking-wider transition-all duration-300 ${isCinematicCollapsed ? 'text-lg text-zinc-100' : 'text-xl text-white'}`}>
                ROA
              </div>
            </Link>

            <nav className={`hidden lg:flex items-center transition-all duration-300 ${isCinematicCollapsed ? 'gap-4' : 'gap-6'}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-display uppercase tracking-wider transition-colors hover:text-red-500 ${
                    isCinematicCollapsed ? 'text-[11px]' : 'text-xs'
                  } ${location.pathname.startsWith(link.path) ? 'text-white border-b-2 border-red-600' : 'text-zinc-400'}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className={`flex items-center transition-all duration-300 ${isCinematicCollapsed ? 'gap-3' : 'gap-4'}`}>
              <SearchTrigger onClick={openSearch} className={searchTriggerClass} />

              <div className="relative">
                <button
                  className={`${iconButtonClass} hover:text-white`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsNotificationsOpen((prev) => !prev)
                  }}
                  aria-label="Open notifications"
                >
                  <iconify-icon icon="solar:bell-linear" width="20" height="20"></iconify-icon>
                  {!isCinematicCollapsed && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div
                    className="absolute right-0 mt-3 w-[320px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/70 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                      <div>
                        <p className="text-sm font-bold text-white">Notifications</p>
                        <p className="text-[11px] text-zinc-500">Latest updates and rewards</p>
                      </div>
                      <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications && notifications.length === 0 && (
                        <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications yet.</div>
                      )}
                      {notifications?.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 border-b border-zinc-900/60 transition-colors ${
                            notification.isRead ? 'bg-transparent' : 'bg-red-600/10'
                          } hover:bg-zinc-900/60`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full ${notification.isRead ? 'bg-zinc-700' : 'bg-red-500'}`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">{notification.title}</p>
                              <p className="text-xs text-zinc-400 mt-1">{notification.message}</p>
                              <p className="text-[10px] text-zinc-600 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsWishlistOpen(true)
                }}
                className={`${iconButtonClass} hover:text-red-500`}
                aria-label="Open wishlist"
              >
                <iconify-icon icon="solar:heart-linear" width="20" height="20"></iconify-icon>
                {!isCinematicCollapsed && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsCartOpen(true)
                }}
                className={`${iconButtonClass} hover:text-red-500`}
                aria-label="Open cart"
              >
                <iconify-icon icon="solar:bag-3-linear" width="20" height="20"></iconify-icon>
                {!isCinematicCollapsed && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              <div className="relative pl-2 border-l border-zinc-800">
                <button
                  ref={profileTriggerRef}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsProfileOpen(!isProfileOpen)
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 hover:border-red-500 transition-colors"
                  aria-label="Open profile menu"
                >
                  {userProfile?.avatar && !avatarError ? (
                    <img
                      src={userProfile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs text-bold">
                      {isSignedIn ? userProfile?.username?.charAt(0).toUpperCase() || 'U' : '?'}
                    </div>
                  )}
                </button>
                <ProfilePopover
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  triggerRef={profileTriggerRef}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`lg:hidden flex justify-between px-4 border-t border-zinc-800 overflow-x-auto bg-zinc-950 no-scrollbar relative z-[1020] transition-all duration-300 ${
            isCinematicCollapsed ? 'py-1' : 'py-2'
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-display uppercase tracking-wider px-3 py-1 whitespace-nowrap ${
                isCinematicCollapsed ? 'text-[10px]' : 'text-xs'
              } ${location.pathname.startsWith(link.path) ? 'text-white' : 'text-zinc-500'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} navLinks={navLinks} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  )
}

export default Header
