import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from './components/ConvexAuthProvider'
import App from './App'
import './index.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_DEPLOYMENT_URL as string)

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <ConvexAuthProvider>
          <App />
        </ConvexAuthProvider>
      </ConvexProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
