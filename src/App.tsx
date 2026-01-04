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
import { ContentPage } from './pages/ContentPage'
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
import './styles/theme.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/events.css'
import './index.css'

// Lazy load event pages for code splitting
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

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <BrowserRouter>
          <GearProvider>
            <FlashlightEffect className="app-root">
            <ParallaxBackground />
            <NavbarFallback />
            <Suspense fallback={<div className="text-white p-8 text-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<GearPage />}>
                  <Route path="R" element={<ContentPage />} />
                  <Route path="N" element={<ContentPage />} />
                  <Route path="1" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="2" element={
                    <ProtectedRoute>
                      <Forum />
                    </ProtectedRoute>
                  } />
                  <Route path="2/thread/:threadId" element={
                    <ProtectedRoute>
                      <ForumThreadDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="3" element={<Gallery />} />
                  <Route path="4" element={<ContentPage />} />
                  <Route path="5" element={<ContentPage />} />
                  <Route path="6" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route index element={<Navigate to="/N" replace />} />
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
              </Routes>
            </Suspense>
          </FlashlightEffect>
        </GearProvider>
      </BrowserRouter>
      </CartProvider>
    </UserProvider>
  )
}

export default App