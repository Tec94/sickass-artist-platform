import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
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

function App() {
  return (
    <UserProvider>
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
    </UserProvider>
  )
}

export default App