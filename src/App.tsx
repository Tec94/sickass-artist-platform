import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AppVisualVariantProvider } from './contexts/AppVisualVariantContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import './styles/theme.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/events.css'
import './styles/phone-display.css'
import './index.css'

// Framer Motion Page Transition Wrapper
import { AnimatedRoutes } from './components/Effects/PageTransition'

// Stitch Prototype Screens
import {
  Archive, Rankings, Identity, Community, Journey,
  StoreBoutique, Salon, Directory, AccessTiersMobile,
  AccessTiersAlbert, ExperienceMobile, ExperienceAlbert,
  EventsMobile, EventsExhibitions, DashboardMobile, RankingSubmission, Login
} from './pages/StitchPrototypes'

function AppContent() {
  return (
    <div className="app-theme-root">
      <div className="relative flex-1 flex flex-col h-screen overflow-hidden bg-[#F4EFE6]" data-scroll-container>
        <Suspense fallback={<div className="text-[#3C2A21] p-8 text-center font-serif">Loading Protocol...</div>}>
          <AnimatedRoutes>
            <Routes>
              {/* Redirect root to the directory */}
              <Route path="/" element={<Navigate to="/proto/directory" replace />} />
              
              <Route path="/proto/directory" element={<Directory />} />
              <Route path="/proto/archive" element={<Archive />} />
              <Route path="/proto/rankings" element={<Rankings />} />
              <Route path="/proto/ranking-submission" element={<RankingSubmission />} />
              <Route path="/proto/identity" element={<Identity />} />
              <Route path="/proto/community" element={<Community />} />
              <Route path="/proto/journey" element={<Journey />} />
              <Route path="/proto/store-boutique" element={<StoreBoutique />} />
              <Route path="/proto/salon" element={<Salon />} />
              <Route path="/proto/access-tiers-mobile" element={<AccessTiersMobile />} />
              <Route path="/proto/access-tiers-albert" element={<AccessTiersAlbert />} />
              <Route path="/proto/experience-mobile" element={<ExperienceMobile />} />
              <Route path="/proto/experience-albert" element={<ExperienceAlbert />} />
              <Route path="/proto/events-mobile" element={<EventsMobile />} />
              <Route path="/proto/events-exhibitions" element={<EventsExhibitions />} />
              <Route path="/proto/dashboard-mobile" element={<DashboardMobile />} />
              <Route path="/proto/login" element={<Login />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/proto/directory" replace />} />
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
                <GearProvider>
                  <AppContent />
                </GearProvider>
              </AppVisualVariantProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </LanguageProvider>
      </CartProvider>
    </UserProvider>
  )
}

export default App
