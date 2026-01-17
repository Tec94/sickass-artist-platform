import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useConvex } from 'convex/react'

interface TokenAuthContextType {
  // Token-based auth state (works even when cookies are blocked)
  hasValidToken: boolean
  isTokenLoading: boolean
  userId: string | null
  // Force refresh auth state
  refreshAuth: () => void
}

const TokenAuthContext = createContext<TokenAuthContextType | null>(null)

export function useTokenAuth() {
  const context = useContext(TokenAuthContext)
  if (!context) {
    throw new Error('useTokenAuth must be used within ConvexAuthProvider')
  }
  return context
}

interface ConvexAuthProviderProps {
  children: ReactNode
}

export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  const { getToken, isSignedIn, isLoaded, userId } = useAuth()
  const convex = useConvex()
  
  // Token-based auth state - works around third-party cookie blocking
  const [hasValidToken, setHasValidToken] = useState(false)
  const [isTokenLoading, setIsTokenLoading] = useState(true)
  const [tokenUserId, setTokenUserId] = useState<string | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const refreshAuth = useCallback(() => {
    setRefreshCounter(c => c + 1)
  }, [])

  // Check for valid token - this works even when cookies are blocked
  // because Clerk stores session info in localStorage after OAuth
  useEffect(() => {
    if (!isLoaded) return

    let isMounted = true
    let retryCount = 0
    const maxRetries = 5
    const retryDelay = 1000 // 1 second

    const checkToken = async () => {
      try {
        // Try to get a token - this will work if session exists in localStorage
        const token = await getToken({ template: 'convex' })
        
        if (!isMounted) return

        if (token) {
          // Token is valid - user is authenticated!
          setHasValidToken(true)
          setTokenUserId(userId || null)
          setIsTokenLoading(false)
          
          // Also set up Convex auth
          convex.setAuth(async () => {
            try {
              const t = await getToken({ template: 'convex' })
              return t || null
            } catch {
              return null
            }
          })
          
          console.log('[TokenAuth] ✅ Valid token found, user authenticated')
        } else {
          // No token - either not signed in or session hasn't propagated yet
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`[TokenAuth] No token yet, retrying (${retryCount}/${maxRetries})...`)
            setTimeout(checkToken, retryDelay)
          } else {
            // Give up - user is not authenticated
            setHasValidToken(false)
            setTokenUserId(null)
            setIsTokenLoading(false)
            convex.clearAuth()
            console.log('[TokenAuth] ❌ No valid token after retries')
          }
        }
      } catch (error) {
        console.error('[TokenAuth] Error checking token:', error)
        if (!isMounted) return
        
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(checkToken, retryDelay)
        } else {
          setHasValidToken(false)
          setTokenUserId(null)
          setIsTokenLoading(false)
          convex.clearAuth()
        }
      }
    }

    // Start checking for token
    setIsTokenLoading(true)
    checkToken()

    return () => {
      isMounted = false
    }
  }, [isLoaded, getToken, convex, userId, refreshCounter])

  // Also handle the case where cookie-based auth works (local dev)
  useEffect(() => {
    if (isSignedIn && userId && !hasValidToken) {
      // Cookie-based auth is working, sync token-based state
      setHasValidToken(true)
      setTokenUserId(userId)
      setIsTokenLoading(false)
    }
  }, [isSignedIn, userId, hasValidToken])

  // Handle sign out
  useEffect(() => {
    if (isLoaded && !isSignedIn && !hasValidToken) {
      convex.clearAuth()
    }
  }, [isLoaded, isSignedIn, hasValidToken, convex])

  const contextValue: TokenAuthContextType = {
    hasValidToken,
    isTokenLoading,
    userId: tokenUserId,
    refreshAuth,
  }

  return (
    <TokenAuthContext.Provider value={contextValue}>
      {children}
    </TokenAuthContext.Provider>
  )
}
