import { useAuth } from './useAuth'
import { UserRole } from '../types'

export function useRole() {
  const { user } = useAuth()
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role as UserRole)
  }
  
  const isAdmin = () => user?.role === 'admin'
  const isMod = () => user?.role === 'mod'
  const isArtist = () => user?.role === 'artist'
  const isCrew = () => user?.role === 'crew'
  const isFan = () => user?.role === 'fan'
  
  return {
    role: user?.role,
    hasRole,
    isAdmin,
    isMod,
    isArtist,
    isCrew,
    isFan,
  }
}
