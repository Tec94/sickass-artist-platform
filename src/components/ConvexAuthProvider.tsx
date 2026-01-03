import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useConvex } from 'convex/react'

interface ConvexAuthProviderProps {
  children: React.ReactNode
}

export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  const { getToken, isSignedIn } = useAuth()
  const convex = useConvex()

  useEffect(() => {
    const setAuth = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken()
          if (token) {
            await convex.setAuth(token)
          }
        } catch (error) {
          console.error('Failed to set Convex auth:', error)
        }
      } else {
        await convex.clearAuth()
      }
    }

    setAuth()

    // Refresh token periodically
    const interval = setInterval(setAuth, 55 * 60 * 1000)
    return () => clearInterval(interval)
  }, [getToken, isSignedIn, convex])

  return <>{children}</>
}

