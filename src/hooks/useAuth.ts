import { useContext } from 'react'
import { UserContext } from '../contexts/UserContext'

export function useAuth() {
  const context = useContext(UserContext)
  
  if (!context) {
    throw new Error('useAuth must be used within UserProvider')
  }
  
  return {
    user: context.userProfile,
    isSignedIn: context.isSignedIn,
    isLoading: context.isLoading || (context.isSignedIn && !context.isProfileLoaded),
    signOut: context.signOut,
  }
}
