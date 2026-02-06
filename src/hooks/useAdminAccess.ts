import { useAuth } from './useAuth'
import { useTokenAuth } from '../components/ConvexAuthProvider'

const ADMIN_ROLES = ['admin', 'mod', 'artist'] as const
type AdminRole = (typeof ADMIN_ROLES)[number]

export function useAdminAccess() {
  const { user, isSignedIn, isLoading } = useAuth()
  const { hasValidToken, isTokenLoading, userId: tokenUserId } = useTokenAuth()

  const role = user?.role ?? null
  const hasAdminAccess = Boolean(role && ADMIN_ROLES.includes(role as AdminRole))
  const isAdmin = role === 'admin'
  const isReady = !isLoading && !isTokenLoading
  const tokenMatchesUser = !!tokenUserId && !!user?.clerkId && user.clerkId === tokenUserId
  const canUseAdminQueries = isReady && hasValidToken && hasAdminAccess && tokenMatchesUser

  return {
    user,
    role,
    isSignedIn,
    isLoading,
    isTokenLoading,
    isReady,
    hasValidToken,
    tokenUserId,
    tokenMatchesUser,
    hasAdminAccess,
    isAdmin,
    canUseAdminQueries,
    canUseAdminActions: canUseAdminQueries,
  }
}
