import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AppAppearanceProvider, useAppAppearance } from './contexts/AppAppearanceContext'
import { AppVisualVariantProvider } from './contexts/AppVisualVariantContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import { PrototypeCartProvider } from './features/store/prototypeCart'
import './styles/theme.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/events.css'
import './styles/phone-display.css'
import './index.css'

// Framer Motion Page Transition Wrapper
import { AnimatedRoutes } from './components/Effects/PageTransition'
import {
  DevSkeletonModeToggle,
  RouteSkeletonBoundary,
  SkeletonModeProvider,
  getRouteSkeletonTarget,
} from './features/skeletonMode'

// Pages
import {
  Archive, Rankings, Profile, Community, Journey, Campaign,
  Store, StoreProductDetail, NewPost, Dashboard,
  AccessTiersAlbert, ExperienceAlbert,
  Events, RankingSubmission, Login, NotFound
} from './pages/StitchPrototypes'

const withRouteSkeleton = (path: string, element: ReactNode) => {
  const target = getRouteSkeletonTarget(path)

  if (!target) {
    return element
  }

  return <RouteSkeletonBoundary target={target}>{element}</RouteSkeletonBoundary>
}

function AppContent() {
  const { appearance } = useAppAppearance()

  return (
    <SkeletonModeProvider>
      <div className="app-theme-root" data-appearance={appearance}>
        <div
          className="relative flex min-h-[100dvh] flex-1 flex-col overflow-x-hidden bg-[var(--site-page-bg)] text-[var(--site-text)] lg:h-screen"
          data-scroll-container
        >
          <DevSkeletonModeToggle />
          <Suspense
            fallback={
              <div className="p-8 text-center font-serif text-[var(--site-text)]">Loading...</div>
            }
          >
            <AnimatedRoutes>
              <Routes>
                {/* Landing page is Journey */}
                <Route path="/" element={withRouteSkeleton('/', <Journey />)} />

                <Route path="/dashboard" element={withRouteSkeleton('/dashboard', <Dashboard />)} />
                <Route path="/archive" element={withRouteSkeleton('/archive', <Archive />)} />
                <Route path="/rankings" element={withRouteSkeleton('/rankings', <Rankings />)} />
                <Route path="/ranking" element={<Navigate to="/rankings" replace />} />
                <Route
                  path="/ranking-submission"
                  element={withRouteSkeleton('/ranking-submission', <RankingSubmission />)}
                />
                <Route path="/profile" element={withRouteSkeleton('/profile', <Profile />)} />
                <Route
                  path="/community"
                  element={withRouteSkeleton('/community', <Community />)}
                />
                <Route path="/journey" element={withRouteSkeleton('/journey', <Journey />)} />
                <Route path="/campaign" element={withRouteSkeleton('/campaign', <Campaign />)} />
                <Route path="/store" element={withRouteSkeleton('/store', <Store />)} />
                <Route
                  path="/store/product/:productSlug"
                  element={withRouteSkeleton('/store/product/:productSlug', <StoreProductDetail />)}
                />
                <Route path="/new-post" element={withRouteSkeleton('/new-post', <NewPost />)} />
                <Route path="/salon" element={<Navigate to="/new-post" replace />} />
                <Route
                  path="/access-tiers-albert"
                  element={withRouteSkeleton('/access-tiers-albert', <AccessTiersAlbert />)}
                />
                <Route
                  path="/experience-albert"
                  element={withRouteSkeleton('/experience-albert', <ExperienceAlbert />)}
                />
                <Route path="/events" element={withRouteSkeleton('/events', <Events />)} />
                <Route path="/login" element={withRouteSkeleton('/login', <Login />)} />

                {/* Catch all */}
                <Route path="*" element={withRouteSkeleton('*', <NotFound />)} />
              </Routes>
            </AnimatedRoutes>
          </Suspense>
        </div>
        <Toaster position="bottom-right" theme={appearance} closeButton richColors />
      </div>
    </SkeletonModeProvider>
  )
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <LanguageProvider>
          <ErrorBoundary level="page">
            <BrowserRouter>
              <AppAppearanceProvider>
                <AppVisualVariantProvider>
                  <PrototypeCartProvider>
                    <GearProvider>
                      <AppContent />
                    </GearProvider>
                  </PrototypeCartProvider>
                </AppVisualVariantProvider>
              </AppAppearanceProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </LanguageProvider>
      </CartProvider>
    </UserProvider>
  )
}

export default App
