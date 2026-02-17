import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Profile } from './pages/Profile'
import { ProfileEdit } from './pages/ProfileEdit'
import { ProfileUser } from './pages/ProfileUser'
import { Quests } from './pages/Quests'
import { Gallery } from './pages/Gallery'
import { Forum } from './pages/Forum'
import { ForumThreadDetail } from './pages/ForumThreadDetail'
import { Chat } from './pages/Chat'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { SSOCallback } from './pages/SSOCallback'
import { useTranslation } from './hooks/useTranslation'
import { ParallaxBackground } from './components/ParallaxBackground'
import Header from './components/Header'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { FlashlightEffect } from './components/Effects/FlashlightEffect'
import { EventDetailSkeleton, PurchaseLoadingState } from './components/events/Skeletons'
import { MerchErrorBoundary } from './components/Merch/ErrorBoundary'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TestErrorPage } from './pages/TestErrorPage'
import { OfflineIndicator } from './components/OfflineIndicator'
import { ConflictModal } from './components/ConflictModal'
import { ConsentBanner } from './components/ConsentBanner'
import { useOfflineQueue } from './hooks/useOfflineQueue'
import './styles/theme.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/events.css'
import './index.css'

// Lazy load dashboard and event pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })))
const EventDetail = lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })))
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage').then(m => ({ default: m.ConfirmationPage })))
const AdminEvents = lazy(() => import('./pages/AdminEvents').then(m => ({ default: m.AdminEvents })))
const AdminEventForm = lazy(() => import('./pages/AdminEventForm').then(m => ({ default: m.AdminEventForm })))
const Merch = lazy(() => import('./pages/Merch').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.Merch />
    </MerchErrorBoundary>
  )
})))
const MerchDetail = lazy(() => import('./pages/MerchDetail').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.MerchDetail />
    </MerchErrorBoundary>
  )
})))
const ShoppingCart = lazy(() => import('./pages/ShoppingCart').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.ShoppingCart />
    </MerchErrorBoundary>
  )
})))
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.Checkout />
    </MerchErrorBoundary>
  )
})))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.OrderConfirmation />
    </MerchErrorBoundary>
  )
})))
const DropsPage = lazy(() => import('./pages/DropsPage').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.DropsPage />
    </MerchErrorBoundary>
  )
})))
const OrderHistory = lazy(() => import('./pages/OrderHistory').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.OrderHistory />
    </MerchErrorBoundary>
  )
})))
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(m => ({
  default: () => (
    <MerchErrorBoundary>
      <m.OrderDetail />
    </MerchErrorBoundary>
  )
})))

const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminRedemptions = lazy(() => import('./components/Admin').then(m => ({ default: m.AdminRedemptions })))
const AdminRewards = lazy(() => import('./components/Admin').then(m => ({ default: m.AdminRewards })))
const AdminPoints = lazy(() => import('./components/Admin').then(m => ({ default: m.AdminPoints })))

const Ranking = lazy(() => import('./pages/Ranking.tsx').then(m => ({ default: m.Ranking })))
const PrivateSuite = lazy(() => import('./pages/PrivateSuite').then(m => ({ default: m.PrivateSuite })))

import Footer from './components/Footer'

function AppContent() {
  const { t } = useTranslation()
  const { conflicts, resolveConflict } = useOfflineQueue()
  const location = useLocation()
  const showFooter = location.pathname === '/dashboard'

  return (
    <>
      <FlashlightEffect className="app-root">
        <ParallaxBackground />
        <Header />
                <style>{`
                  .app-root {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                  }
                `}</style>
                <div className="flex-1 flex flex-col overflow-auto" data-scroll-container>
                <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Auth Routes */}
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/sso-callback" element={<SSOCallback />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole={['admin', 'mod', 'artist']} requireConvexAuth>
                      <Suspense fallback={<div className="text-white p-8 text-center">Loading Admin...</div>}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Main Dashboard */}
                <Route path="/dashboard" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading Dashboard...</div>}>
                    <ErrorBoundary level="section">
                      <Dashboard />
                    </ErrorBoundary>
                  </Suspense>
                } />

                {/* Store Routes */}
                <Route path="/store" element={<Merch />} />
                <Route path="/store/product/:productId" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading product...</div>}>
                    <MerchDetail />
                  </Suspense>
                } />
                <Route path="/store/cart" element={<ShoppingCart />} />
                <Route path="/store/checkout" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <Checkout />
                  </Suspense>
                } />
                <Route path="/store/confirmation" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <OrderConfirmation />
                  </Suspense>
                } />
                <Route path="/store/orders" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <OrderHistory />
                  </Suspense>
                } />
                <Route path="/store/orders/:orderNumber" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <OrderDetail />
                  </Suspense>
                } />
                <Route path="/store/drops" element={<DropsPage />} />

                {/* Events Routes */}
                <Route path="/events" element={<ErrorBoundary level="section"><Events /></ErrorBoundary>} />
                <Route path="/events/:eventId" element={
                  <Suspense fallback={<EventDetailSkeleton />}>
                    <EventDetail />
                  </Suspense>
                } />
                <Route path="/events/confirmation" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PurchaseLoadingState />}>
                      <ConfirmationPage />
                    </Suspense>
                  </ProtectedRoute>
                } />

                {/* Other Main Sections */}
                <Route path="/gallery" element={<ErrorBoundary level="section"><Gallery /></ErrorBoundary>} />
                <Route path="/forum" element={
                  <ProtectedRoute>
                    <Forum />
                  </ProtectedRoute>
                } />
                <Route path="/forum/thread/:threadId" element={
                  <ProtectedRoute>
                    <ForumThreadDetail />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/ranking" element={
                   <Ranking />
                } />

                {/* Profile Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/profile/edit" element={
                  <ProtectedRoute>
                    <ProfileEdit />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:userId" element={
                  <ProtectedRoute>
                    <ProfileUser />
                  </ProtectedRoute>
                } />
                <Route path="/quests" element={
                  <ProtectedRoute>
                    <Quests />
                  </ProtectedRoute>
                } />

                {/* Admin Sub-routes */}
                <Route path="/admin/events" element={
                  <ProtectedRoute requiredRole={['admin', 'mod', 'artist']} requireConvexAuth>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events/new" element={
                  <ProtectedRoute requiredRole={['admin', 'mod', 'artist']} requireConvexAuth>
                    <AdminEventForm />
                  </ProtectedRoute>
                } />
                <Route path="/admin/redemptions" element={
                  <ProtectedRoute requiredRole="admin" requireConvexAuth>
                    <AdminRedemptions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/rewards" element={
                  <ProtectedRoute requiredRole="admin" requireConvexAuth>
                    <AdminRewards />
                  </ProtectedRoute>
                } />
                <Route path="/admin/points" element={
                  <ProtectedRoute requiredRole="admin" requireConvexAuth>
                    <AdminPoints />
                  </ProtectedRoute>
                } />

                <Route path="/test-errors" element={<TestErrorPage />} />
                <Route path="/private-suite" element={
                   <Suspense fallback={<div className="bg-[#050505] min-h-screen text-white flex items-center justify-center">Loading Suite...</div>}>
                      <PrivateSuite />
                   </Suspense>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
            {showFooter && <Footer />}
            </div>
          </FlashlightEffect>
 
        {/* Admin Quick Access Button */}
        <Link 
          to="/admin" 
          className="fixed bottom-6 left-6 z-[100] group flex items-center gap-2 bg-black/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-900/50 p-1 rounded-lg transition-all duration-300 backdrop-blur-md"
          title={t('store.adminManagement')}
        >
          <div className="w-7 h-7 flex items-center justify-center bg-zinc-900 group-hover:bg-red-950 rounded transition-colors">
            <iconify-icon icon="solar:shield-user-linear" width="20" height="20" class="block text-zinc-400 group-hover:text-red-500 transition-colors"></iconify-icon>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-white pr-0 max-w-0 opacity-0 scale-x-0 origin-left group-hover:opacity-100 group-hover:scale-x-100 group-hover:max-w-[200px] group-hover:pr-2 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out">
            {t('store.adminManagement')}
          </span>
        </Link>

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Conflict Modals */}
        {conflicts.map((conflict) => (
          <ConflictModal key={conflict.id} item={conflict} onResolve={(choice) => resolveConflict(conflict.id, choice)} />
        ))}

        {/* Consent Banner */}
        <ConsentBanner />
      </>
    )
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <LanguageProvider>
          <ErrorBoundary level="page">
            <BrowserRouter>
              <GearProvider>
                <AppContent />
              </GearProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </LanguageProvider>
      </CartProvider>
    </UserProvider>
  )
}

export default App
