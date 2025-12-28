import { ReactNode } from 'react'
import { useRole } from '../../hooks/useRole'
import { UserRole } from '../../types'

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole | UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { hasRole } = useRole()

  if (!hasRole(requiredRole)) {
    return fallback || (
      <div className="p-8 text-center text-red-400">
        <p>Access denied. You do not have the required role.</p>
      </div>
    )
  }

  return <>{children}</>
}
