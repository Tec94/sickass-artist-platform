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
    if (isSignedIn) {
      // Pass an async function that returns the token
      // IMPORTANT: Must use template: 'convex' for Convex to recognize the token
      convex.setAuth(async () => {
        try {
          const token = await getToken({ template: 'convex' })
          return token || null
        } catch (error) {
          console.error('Failed to get Convex auth token:', error)
          return null
        }
      })
    } else {
      convex.clearAuth()
    }
  }, [getToken, isSignedIn, convex])

  return <>{children}</>
}

