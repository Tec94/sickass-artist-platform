import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { UserProvider } from './contexts/UserContext'
import { GearPage } from './pages/GearPage'
import { Profile } from './pages/Profile'
import { ProfileEdit } from './pages/ProfileEdit'
import { ContentPage } from './pages/ContentPage'
import { Gallery } from './pages/Gallery'
import { Forum } from './pages/Forum'
import { ForumThreadDetail } from './pages/ForumThreadDetail'
import { ParallaxBackground } from './components/ParallaxBackground'
import { NavbarFallback } from './components/NavbarFallback'
import { UserHeader } from './components/Auth/UserHeader'
import { SignInButtons } from './components/Auth/SignInButtons'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import './styles/theme.css'
import './styles/animations.css'
import './styles/responsive.css'
import './index.css'

function AuthUI() {
  const { isSignedIn } = useAuth()
  return isSignedIn ? <UserHeader /> : <SignInButtons />
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <GearProvider>
          <ParallaxBackground />
          <NavbarFallback />
          <AuthUI />
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
              <Route index element={<Navigate to="/N" replace />} />
            </Route>
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
          </Routes>
        </GearProvider>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
