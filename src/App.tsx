import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { LanguageProvider } from './contexts/LanguageContext'
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
  Store, StoreProductDetail, Salon, Dashboard, AccessTiersMobile,
  AccessTiersAlbert, ExperienceMobile, ExperienceAlbert,
  EventsMobile, Events, DashboardMobile, RankingSubmission, Login
} from './pages/StitchPrototypes'

function AppContent() {
  return (
    <div className="app-theme-root">
      <div className="relative flex-1 flex flex-col h-screen overflow-hidden bg-[#F4EFE6]" data-scroll-container>
        <Suspense fallback={<div className="text-[#3C2A21] p-8 text-center font-serif">Loading...</div>}>
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
              <Route path="/salon" element={<Salon />} />
              <Route path="/access-tiers-mobile" element={<AccessTiersMobile />} />
              <Route path="/access-tiers-albert" element={<AccessTiersAlbert />} />
              <Route path="/experience-mobile" element={<ExperienceMobile />} />
              <Route path="/experience-albert" element={<ExperienceAlbert />} />
              <Route path="/events-mobile" element={<EventsMobile />} />
              <Route path="/events" element={<Events />} />
              <Route path="/dashboard-mobile" element={<DashboardMobile />} />
              <Route path="/login" element={<Login />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatedRoutes>
        </Suspense>
      </div>
      <Toaster position="bottom-right" theme="dark" closeButton richColors />
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
              <AppVisualVariantProvider>
                <PrototypeCartProvider>
                  <GearProvider>
                    <AppContent />
                  </GearProvider>
                </PrototypeCartProvider>
              </AppVisualVariantProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </LanguageProvider>
      </CartProvider>
    </UserProvider>
  )
}

export default App
