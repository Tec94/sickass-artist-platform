/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useEffect, useRef, useState, useContext } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'
import { useTokenAuth } from '../components/ConvexAuthProvider'

interface UserContextType {
  // Auth0 auth state
  authUser: Record<string, unknown> | null
  isSignedIn: boolean
  isLoading: boolean
  
  // Convex user profile
  userProfile: Doc<'users'> | null
  isProfileLoaded: boolean
  
  // Methods
  signOut: () => Promise<void>
  refreshUserProfile: () => void
}

export const UserContext = createContext<UserContextType | null>(null)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, isAuthenticated, isLoading: auth0Loading, logout, getIdTokenClaims } = useAuth0()
  
  // Token-based auth (kept as the source of truth for Convex auth readiness)
  const { hasValidToken, isTokenLoading, userId: tokenUserId, refreshAuth } = useTokenAuth()
  
  // Treat "signed in" as: Auth0 says authenticated OR we have a valid Convex token.
  const isSignedIn = isAuthenticated || hasValidToken
  const isLoading = auth0Loading || isTokenLoading
  const effectiveUserId = tokenUserId || user?.sub || null
  
  const [userProfile, setUserProfile] = useState<Doc<'users'> | null>(null)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const hasRecordedLoginRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const lastAvatarRef = useRef<string | null>(null)
  
  // Convex mutations & queries
  const createUserMutation = useMutation(api.users.create)
  const recordLoginMutation = useMutation(api.users.recordLogin)
  const updateUserMutation = useMutation(api.users.update)
  const getUserQuery = useQuery(
    api.users.getByClerkId,
    isSignedIn && effectiveUserId ? { clerkId: effectiveUserId } : 'skip'
  )
  
  // On sign-in, create user profile if doesn't exist
  useEffect(() => {
    if (!isSignedIn || !effectiveUserId || isLoading || getUserQuery === undefined) return
    if (hasInitializedRef.current) return
    
    const initializeUser = async () => {
      try {
        // Check if user exists in Convex
        if (getUserQuery === null) {
          hasInitializedRef.current = true
          
          // Try to get user info from Auth0 user object or ID token claims
          let email = ''
          let username = ''
          let displayName = ''
          let avatar = ''

          const sanitizeUsername = (raw: string): string => {
            const s = raw
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9_]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_+|_+$/g, '')
              .slice(0, 20)
            return s.length >= 3 ? s : ''
          }

          const fallbackUsername = `user_${effectiveUserId.substring(0, 8)}` // <= 13 chars, valid
          
          if (user) {
            email = user.email || ''
            const candidates = [
              sanitizeUsername(user.nickname || ''),
              sanitizeUsername(user.name || ''),
              sanitizeUsername(email ? email.split('@')[0] : ''),
              sanitizeUsername(fallbackUsername),
            ].filter(Boolean)
            username = candidates[0] || fallbackUsername
            displayName = user.given_name || user.name || username
            avatar = user.picture || ''
          } else {
            try {
              const claims = await getIdTokenClaims()
              if (claims) {
                email = claims.email || ''
                const candidates = [
                  sanitizeUsername((claims as unknown as { nickname?: string }).nickname || ''),
                  sanitizeUsername(claims.name || ''),
                  sanitizeUsername(email ? email.split('@')[0] : ''),
                  sanitizeUsername(fallbackUsername),
                ].filter(Boolean)
                username = candidates[0] || fallbackUsername
                displayName = (claims as unknown as { given_name?: string }).given_name || claims.name || username
                avatar = claims.picture || ''
                
                console.log('[UserContext] Extracted user info from Auth0 ID token:', { email, username, displayName })
              }
            } catch (e) {
              console.error('[UserContext] Failed to extract user info from token:', e)
              // Use fallback values
              username = fallbackUsername
            }
          }
          
          // First sign-in: create user in Convex
          // Retry with fallback usernames if we hit validation/uniqueness issues.
          const candidateUsernames = [
            sanitizeUsername(username),
            sanitizeUsername(email ? email.split('@')[0] : ''),
            sanitizeUsername(fallbackUsername),
          ].filter(Boolean)

          let lastError: unknown = null
          let created = false
          for (const candidate of candidateUsernames) {
            try {
              await createUserMutation({
                clerkId: effectiveUserId,
                email,
                username: candidate,
                displayName: displayName || candidate,
                avatar,
              })
              created = true
              break
            } catch (err) {
              lastError = err
              const msg = (err as { message?: string } | null)?.message ?? String(err)
              const retryable =
                msg.includes('Username already taken') ||
                msg.includes('Invalid username') ||
                msg.includes('Invalid username:')
              if (!retryable) throw err
            }
          }

          if (!created) throw lastError
          
          console.log('[UserContext] ✅ Created new user in Convex')
        }
        
        setIsProfileLoaded(true)
      } catch (error) {
        console.error('[UserContext] Failed to initialize user:', error)
        setIsProfileLoaded(true)
        hasInitializedRef.current = false // Allow retry
      }
    }
    
    initializeUser()
  }, [isSignedIn, effectiveUserId, isLoading, createUserMutation, getUserQuery, user, getIdTokenClaims])
  
  // Set userProfile from query and record login (once per session)
  useEffect(() => {
    if (getUserQuery !== undefined && getUserQuery !== null) {
      setUserProfile(getUserQuery)

      if (!hasRecordedLoginRef.current) {
        hasRecordedLoginRef.current = true
        recordLoginMutation({ userId: getUserQuery._id }).catch((err) =>
          console.error('[UserContext] Failed to record login:', err)
        )
      }
    } else if (getUserQuery === null) {
      setUserProfile(null)
      hasRecordedLoginRef.current = false
    }
  }, [getUserQuery, recordLoginMutation])

  useEffect(() => {
    if (!userProfile || !user || !user.picture) return
    if (userProfile.avatar === user.picture) return
    if (lastAvatarRef.current === user.picture) return

    lastAvatarRef.current = user.picture
    updateUserMutation({
      userId: userProfile._id,
      updates: {
        avatar: user.picture,
      },
    }).catch((error) => {
      console.error('[UserContext] Failed to refresh avatar:', error)
    })
  }, [user, userProfile, updateUserMutation])
  
  // Reset state on sign out
  useEffect(() => {
    if (!isSignedIn && !isLoading) {
      setUserProfile(null)
      setIsProfileLoaded(false)
      hasRecordedLoginRef.current = false
      hasInitializedRef.current = false
      lastAvatarRef.current = null
    }
  }, [isSignedIn, isLoading])
  
  const signOut = async () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
    setUserProfile(null)
    setIsProfileLoaded(false)
    hasRecordedLoginRef.current = false
    hasInitializedRef.current = false
  }
  
  const refreshUserProfile = () => {
    setIsProfileLoaded(false)
    refreshAuth()
  }
  
  const value: UserContextType = {
    authUser: (user as unknown as Record<string, unknown>) ?? null,
    isSignedIn, // Now uses token-based auth primarily
    isLoading,
    userProfile,
    isProfileLoaded,
    signOut,
    refreshUserProfile,
  }
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
