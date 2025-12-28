/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'

interface UserContextType {
  // Clerk auth state
  clerkUser: ReturnType<typeof useUser>['user'] | null | undefined
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
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [userProfile, setUserProfile] = useState<Doc<'users'> | null>(null)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  
  // Convex mutations & queries
  const createUserMutation = useMutation(api.users.create)
  const getUserQuery = useQuery(
    api.users.getByClerkId,
    isSignedIn && user?.id ? { clerkId: user.id } : 'skip'
  )
  
  // On sign-in, create user profile if doesn't exist
  useEffect(() => {
    if (!isSignedIn || !user || !isLoaded || getUserQuery === undefined) return
    
    const initializeUser = async () => {
      try {
        // Check if user exists in Convex
        if (getUserQuery === null) {
          // First sign-in: create user in Convex
          const username = user.username || user.emailAddresses[0].emailAddress.split('@')[0]
          await createUserMutation({
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            username: username,
            displayName: user.firstName || '',
            avatar: user.imageUrl || '',
          })
        }
        
        setIsProfileLoaded(true)
      } catch (error) {
        console.error('Failed to initialize user:', error)
        setIsProfileLoaded(true)
      }
    }
    
    initializeUser()
  }, [isSignedIn, user, isLoaded, createUserMutation, getUserQuery])
  
  // Set userProfile from query
  useEffect(() => {
    if (getUserQuery !== undefined) {
      setUserProfile(getUserQuery)
    }
  }, [getUserQuery])
  
  const signOut = async () => {
    await clerkSignOut()
    setUserProfile(null)
  }
  
  const refreshUserProfile = () => {
    // Trigger query refetch (Convex handles this)
    setIsProfileLoaded(false)
  }
  
  const value: UserContextType = {
    clerkUser: user,
    isSignedIn: isSignedIn ?? false,
    isLoading: !isLoaded,
    userProfile,
    isProfileLoaded,
    signOut,
    refreshUserProfile,
  }
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
