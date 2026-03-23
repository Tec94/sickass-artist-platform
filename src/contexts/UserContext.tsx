/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'
import { useTokenAuth } from '../components/ConvexAuthProvider'

const USER_CACHE_KEY = 'user_profile_cache_v2'
const USER_CACHE_TTL_MS = 24 * 60 * 60 * 1000

type CachedUserProfile = {
  authSubject: string
  profile: Doc<'users'>
  cachedAt: number
}

const getProfileAuthSubject = (profile: Doc<'users'> | null): string | null => {
  if (!profile) return null
  return profile.authSubject ?? null
}

const readCachedProfile = (authSubject: string | null) => {
  if (!authSubject || typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedUserProfile
    if (parsed.authSubject !== authSubject) return null
    if (Date.now() - parsed.cachedAt > USER_CACHE_TTL_MS) return null
    return parsed.profile
  } catch {
    return null
  }
}

const writeCachedProfile = (profile: Doc<'users'>) => {
  const authSubject = getProfileAuthSubject(profile)
  if (!authSubject || typeof localStorage === 'undefined') return

  const payload: CachedUserProfile = {
    authSubject,
    profile,
    cachedAt: Date.now(),
  }
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload))
}

const clearCachedProfile = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(USER_CACHE_KEY)
}

interface UserContextType {
  authUser: Record<string, unknown> | null
  isSignedIn: boolean
  isLoading: boolean
  userProfile: Doc<'users'> | null
  isProfileLoaded: boolean
  signOut: () => Promise<void>
  refreshUserProfile: () => void
}

export const UserContext = createContext<UserContextType | null>(null)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, isAuthenticated, isLoading: auth0Loading, logout } = useAuth0()
  const { hasValidToken, isTokenLoading, userId: tokenUserId, refreshAuth } = useTokenAuth()

  const isSignedIn = isAuthenticated || hasValidToken
  const isLoading = auth0Loading || isTokenLoading
  const effectiveUserId = tokenUserId || user?.sub || null
  const canUseConvexAuth = hasValidToken && !isTokenLoading

  const [userProfile, setUserProfile] = useState<Doc<'users'> | null>(null)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const hasRecordedLoginRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const lastAvatarRef = useRef<string | null>(null)

  useEffect(() => {
    if (!effectiveUserId) return
    if (getProfileAuthSubject(userProfile) === effectiveUserId) return
    const cachedProfile = readCachedProfile(effectiveUserId)
    if (cachedProfile) {
      setUserProfile(cachedProfile)
      setIsProfileLoaded(true)
    }
  }, [effectiveUserId, userProfile])

  const syncCurrentUserMutation = useMutation(api.users.upsertCurrentUser)
  const recordLoginMutation = useMutation(api.users.recordLogin)
  const updateUserMutation = useMutation(api.users.update)
  const getUserQuery = useQuery(api.users.getCurrentUser, canUseConvexAuth ? {} : 'skip')

  useEffect(() => {
    if (!canUseConvexAuth || !effectiveUserId || isLoading || getUserQuery !== null) return
    if (hasInitializedRef.current) return

    hasInitializedRef.current = true
    syncCurrentUserMutation()
      .catch((error) => {
        console.error('[UserContext] Failed to upsert current user:', error)
        hasInitializedRef.current = false
      })
      .finally(() => {
        setIsProfileLoaded(true)
      })
  }, [canUseConvexAuth, effectiveUserId, getUserQuery, isLoading, syncCurrentUserMutation])

  useEffect(() => {
    if (getUserQuery !== undefined && getUserQuery !== null) {
      setUserProfile(getUserQuery)
      writeCachedProfile(getUserQuery)

      if (!hasRecordedLoginRef.current) {
        hasRecordedLoginRef.current = true
        recordLoginMutation({ userId: getUserQuery._id }).catch((err) =>
          console.error('[UserContext] Failed to record login:', err),
        )
      }

      setIsProfileLoaded(true)
      return
    }

    if (getUserQuery === null) {
      setUserProfile(null)
      hasRecordedLoginRef.current = false
    }
  }, [getUserQuery, recordLoginMutation])

  useEffect(() => {
    if (!userProfile || !user?.picture) return
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
  }, [updateUserMutation, user?.picture, userProfile])

  useEffect(() => {
    if (!isSignedIn && !isLoading) {
      setUserProfile(null)
      setIsProfileLoaded(false)
      hasRecordedLoginRef.current = false
      hasInitializedRef.current = false
      lastAvatarRef.current = null
      clearCachedProfile()
    }
  }, [isSignedIn, isLoading])

  const signOut = async () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
    setUserProfile(null)
    setIsProfileLoaded(false)
    hasRecordedLoginRef.current = false
    hasInitializedRef.current = false
    clearCachedProfile()
  }

  const refreshUserProfile = () => {
    setIsProfileLoaded(false)
    hasInitializedRef.current = false
    hasRecordedLoginRef.current = false
    clearCachedProfile()
    refreshAuth()
  }

  const value: UserContextType = {
    authUser: (user as unknown as Record<string, unknown>) ?? null,
    isSignedIn,
    isLoading,
    userProfile,
    isProfileLoaded,
    signOut,
    refreshUserProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
