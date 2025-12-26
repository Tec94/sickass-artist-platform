import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GearProvider } from './contexts/GearContext'
import { GearPage } from './pages/GearPage'
import { ContentPage } from './pages/ContentPage'
import { ParallaxBackground } from './components/ParallaxBackground'
import { NavbarFallback } from './components/NavbarFallback'
import './styles/theme.css'
import './styles/animations.css'
import './styles/responsive.css'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <GearProvider>
        <ParallaxBackground />
        <NavbarFallback />
        <Routes>
          <Route path="/" element={<GearPage />}>
            <Route path="R" element={<ContentPage />} />
            <Route path="N" element={<ContentPage />} />
            <Route path="1" element={<ContentPage />} />
            <Route path="2" element={<ContentPage />} />
            <Route path="3" element={<ContentPage />} />
            <Route path="4" element={<ContentPage />} />
            <Route path="5" element={<ContentPage />} />
            <Route index element={<Navigate to="/N" replace />} />
          </Route>
        </Routes>
      </GearProvider>
    </BrowserRouter>
  )
}

export default App
