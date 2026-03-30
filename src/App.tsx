import { Suspense } from 'react'
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

// Pages
import {
  Archive, Rankings, Profile, Community, Journey, Campaign,
  Store, StoreProductDetail, NewPost, Dashboard,
  AccessTiersAlbert, ExperienceAlbert,
  Events, RankingSubmission, Login, NotFound
} from './pages/StitchPrototypes'

function AppContent() {
  const { appearance } = useAppAppearance()

  return (
    <div className="app-theme-root" data-appearance={appearance}>
      <div
        className="relative flex min-h-[100dvh] flex-1 flex-col overflow-x-hidden bg-[var(--site-page-bg)] text-[var(--site-text)] lg:h-screen"
        data-scroll-container
      >
        <Suspense
          fallback={
            <div className="p-8 text-center font-serif text-[var(--site-text)]">Loading...</div>
          }
        >
          <AnimatedRoutes>
            <Routes>
              {/* Landing page is Journey */}
              <Route path="/" element={<Journey />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/ranking" element={<Navigate to="/rankings" replace />} />
              <Route path="/ranking-submission" element={<RankingSubmission />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/community" element={<Community />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/campaign" element={<Campaign />} />
              <Route path="/store" element={<Store />} />
              <Route path="/store/product/:productSlug" element={<StoreProductDetail />} />
              <Route path="/new-post" element={<NewPost />} />
              <Route path="/salon" element={<Navigate to="/new-post" replace />} />
              <Route path="/access-tiers-albert" element={<AccessTiersAlbert />} />
              <Route path="/experience-albert" element={<ExperienceAlbert />} />
              <Route path="/events" element={<Events />} />
              <Route path="/login" element={<Login />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatedRoutes>
        </Suspense>
      </div>
      <Toaster position="bottom-right" theme={appearance} closeButton richColors />
    </div>
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
