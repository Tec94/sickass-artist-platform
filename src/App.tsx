import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
import { CartProvider } from './contexts/CartContext'
import { GearPage } from './pages/GearPage'
import { Explore } from './pages/Explore'
import { Profile } from './pages/Profile'
import { ProfileEdit } from './pages/ProfileEdit'
import { ProfileUser } from './pages/ProfileUser'
import { Gallery } from './pages/Gallery'
import { Forum } from './pages/Forum'
import { ForumThreadDetail } from './pages/ForumThreadDetail'
import { Chat } from './pages/Chat'
import { ParallaxBackground } from './components/ParallaxBackground'
import { NavbarFallback } from './components/NavbarFallback'
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
const RewardShop = lazy(() => import('./pages/RewardShop').then(m => ({ default: m.RewardShop })))
const AdminRedemptions = lazy(() => import('./pages/AdminRedemptions').then(m => ({ default: m.AdminRedemptions })))
const AdminRewards = lazy(() => import('./pages/AdminRewards').then(m => ({ default: m.AdminRewards })))
const AdminPoints = lazy(() => import('./pages/AdminPoints').then(m => ({ default: m.AdminPoints })))

function AppContent() {
  const { conflicts, resolveConflict } = useOfflineQueue()

  return (
    <>
      <FlashlightEffect className="app-root">
        <ParallaxBackground />
        <NavbarFallback />
                <style>{`
                  .app-root {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                  }
                `}</style>
                <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<GearPage />}>
                  <Route path="R" element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="text-white p-8 text-center">Loading Admin...</div>}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard" element={
                    <Suspense fallback={<div className="text-white p-8 text-center">Loading Dashboard...</div>}>
                      <ErrorBoundary level="section">
                        <Dashboard />
                      </ErrorBoundary>
                    </Suspense>
                  } />
                  <Route path="events" element={<ErrorBoundary level="section"><Events /></ErrorBoundary>} />
                  <Route path="store" element={<Merch />} />
                  <Route path="gallery" element={<ErrorBoundary level="section"><Gallery /></ErrorBoundary>} />
                  <Route path="forum" element={
                    <ProtectedRoute>
                      <Forum />
                    </ProtectedRoute>
                  } />
                  <Route path="forum/thread/:threadId" element={
                    <ProtectedRoute>
                      <ForumThreadDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="rewards" element={
                    <ProtectedRoute>
                      <RewardShop />
                    </ProtectedRoute>
                  } />
                  <Route index element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="/explore" element={<Explore />} />
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
                <Route path="/events" element={<Events />} />
                <Route path="/merch" element={<Merch />} />
                <Route path="/merch/drops" element={<DropsPage />} />
                <Route path="/merch/orders" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <OrderHistory />
                  </Suspense>
                } />
                <Route path="/merch/orders/:orderNumber" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <OrderDetail />
                  </Suspense>
                } />
                <Route path="/merch/cart" element={<ShoppingCart />} />
                <Route path="/merch/checkout" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <Checkout />
                  </Suspense>
                } />
                <Route path="/merch/confirmation" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
                    <OrderConfirmation />
                  </Suspense>
                } />
                <Route path="/merch/:productId" element={
                  <Suspense fallback={<div className="text-white p-8 text-center">Loading product...</div>}>
                    <MerchDetail />
                  </Suspense>
                } />
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
                <Route path="/admin/events" element={
                  <ProtectedRoute>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events/new" element={
                  <ProtectedRoute>
                    <AdminEventForm />
                  </ProtectedRoute>
                } />
                <Route path="/admin/redemptions" element={
                  <ProtectedRoute>
                    <AdminRedemptions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/rewards" element={
                  <ProtectedRoute>
                    <AdminRewards />
                  </ProtectedRoute>
                } />
                <Route path="/admin/points" element={
                  <ProtectedRoute>
                    <AdminPoints />
                  </ProtectedRoute>
                } />
                <Route path="/test-errors" element={<TestErrorPage />} />
              </Routes>
            </Suspense>
          </FlashlightEffect>

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
        <ErrorBoundary level="page">
          <BrowserRouter>
            <GearProvider>
              <AppContent />
            </GearProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </CartProvider>
    </UserProvider>
  )
}

export default App