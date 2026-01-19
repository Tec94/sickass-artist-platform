import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { useConvex } from 'convex/react'

interface TokenAuthContextType {
  hasValidToken: boolean
  isTokenLoading: boolean
  userId: string | null
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
  const { getToken, isLoaded, userId } = useAuth()
  const clerk = useClerk()
  const convex = useConvex()
  
  const [hasValidToken, setHasValidToken] = useState(false)
  const [isTokenLoading, setIsTokenLoading] = useState(true)
  const [tokenUserId, setTokenUserId] = useState<string | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const refreshAuth = useCallback(() => {
    setRefreshCounter(c => c + 1)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    let isMounted = true
    let retryCount = 0
    const maxRetries = 8 // Increased retries
    const retryDelay = 1000

    const checkToken = async () => {
      if (!isMounted) return

      console.group('[Clerk Debug Session]')
      console.log('isSignedIn:', clerk.session !== null)
      console.log('userId:', clerk.user?.id)
      console.log('client.sessions count:', clerk.client?.sessions?.length)
      
      // If not signed in, check if there's a session in the client that we can activate
      if (!clerk.session && clerk.client?.sessions && clerk.client.sessions.length > 0) {
        console.warn('[TokenAuth] Found sessions in client but none active. Attempting activation...')
        try {
          // Try to activate the first available session
          const firstSession = clerk.client.sessions[0]
          await clerk.setActive({ session: firstSession.id })
          console.log('[TokenAuth] ✅ Successfully activated session')
        } catch (err) {
          console.error('[TokenAuth] ❌ Failed to activate session:', err)
        }
      }
      console.groupEnd()

      try {
        const token = await getToken({ template: 'convex' })
        
        if (!isMounted) return

        if (token) {
          setHasValidToken(true)
          setTokenUserId(userId || clerk.user?.id || null)
          setIsTokenLoading(false)
          
          convex.setAuth(async () => {
            try {
              const t = await getToken({ template: 'convex' })
              return t || null
            } catch {
              return null
            }
          })
          
          console.log('[TokenAuth] ✅ Valid token found')
        } else {
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`[TokenAuth] No token, retrying (${retryCount}/${maxRetries})...`)
            setTimeout(checkToken, retryDelay)
          } else {
            setHasValidToken(false)
            setTokenUserId(null)
            setIsTokenLoading(false)
            convex.clearAuth()
            console.log('[TokenAuth] ❌ No valid token after retries')
            
            // Final exhaustive check: is there ANY session?
            if (clerk.client?.sessions && clerk.client.sessions.length > 0) {
              console.error('[TokenAuth] CRITICAL: Sessions exist in client but getToken() returned null. This usually means the JWT template "convex" is missing or configured incorrectly in Clerk Dashboard.')
            }
          }
        }
      } catch (error) {
        console.error('[TokenAuth] Error in checkToken:', error)
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(checkToken, retryDelay)
        } else {
          setIsTokenLoading(false)
        }
      }
    }

    setIsTokenLoading(true)
    checkToken()

    return () => { isMounted = false }
  }, [isLoaded, getToken, convex, userId, clerk, refreshCounter])

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
