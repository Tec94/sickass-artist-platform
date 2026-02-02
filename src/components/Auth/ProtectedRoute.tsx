import { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTokenAuth } from '../ConvexAuthProvider'
import { useRole } from '../../hooks/useRole'
import { UserRole } from '../../types'
import { SignInPrompt } from './SignInPrompt'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  requireConvexAuth?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  requireConvexAuth = false,
}: ProtectedRouteProps) {
  const { isSignedIn, isLoading } = useAuth()
  const { hasRole } = useRole()
  const { hasValidToken, isTokenLoading } = useTokenAuth()

  if (isLoading || (requireConvexAuth && isTokenLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <SignInPrompt />
  }

  if (requireConvexAuth && !hasValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session not ready</h1>
          <p className="text-gray-400">Please refresh or sign out and back in to access this page.</p>
        </div>
      </div>
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
