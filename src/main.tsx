import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from './components/ConvexAuthProvider'
import App from './App'
import './index.css'

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_DEPLOYMENT_URL as string)

if (!AUTH0_DOMAIN) {
  throw new Error('Missing VITE_AUTH0_DOMAIN')
}
if (!AUTH0_CLIENT_ID) {
  throw new Error('Missing VITE_AUTH0_CLIENT_ID')
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
      onRedirectCallback={(appState: unknown) => {
        const returnTo = (appState as { returnTo?: string } | undefined)?.returnTo
        const target = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard'
        // Use history.replaceState to update URL without full page reload
        // This preserves the Auth0 SDK's authentication state
        window.history.replaceState({}, document.title, target)
      }}
    >
      <ConvexProvider client={convex}>
        <ConvexAuthProvider>
          <App />
        </ConvexAuthProvider>
      </ConvexProvider>
    </Auth0Provider>
  </React.StrictMode>,
)
