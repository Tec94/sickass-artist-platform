import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
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
  const { isAuthenticated, isLoading, user, getIdTokenClaims } = useAuth0()
  const convex = useConvex()
  
  const [hasValidToken, setHasValidToken] = useState(false)
  const [isTokenLoading, setIsTokenLoading] = useState(true)
  const [tokenUserId, setTokenUserId] = useState<string | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const refreshAuth = useCallback(() => {
    setRefreshCounter(c => c + 1)
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      setHasValidToken(false)
      setTokenUserId(null)
      setIsTokenLoading(false)
      convex.clearAuth()
      return
    }

    let isMounted = true
    let retryCount = 0
    const maxRetries = 8 // Increased retries
    const retryDelay = 1000

    const checkToken = async () => {
      if (!isMounted) return

      try {
        // We use the Auth0 ID token (JWT). Convex will validate `iss` and `aud`.
        const claims = await getIdTokenClaims()
        const token = claims?.__raw ?? null
        
        if (!isMounted) return

        if (token) {
          setHasValidToken(true)
          setTokenUserId(user?.sub ?? null)
          setIsTokenLoading(false)
          
          convex.setAuth(async () => {
            try {
              const c = await getIdTokenClaims()
              const raw = c?.__raw ?? null
              if (!raw && isMounted) {
                setHasValidToken(false)
                setTokenUserId(null)
                setIsTokenLoading(false)
                convex.clearAuth()
              }
              return raw
            } catch {
              if (isMounted) {
                setHasValidToken(false)
                setTokenUserId(null)
                setIsTokenLoading(false)
                convex.clearAuth()
              }
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
  }, [isAuthenticated, isLoading, getIdTokenClaims, convex, user?.sub, refreshCounter])

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
