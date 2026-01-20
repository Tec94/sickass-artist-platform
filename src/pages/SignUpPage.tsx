import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export function SignUpPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()

  useEffect(() => {
    if (isLoading || isAuthenticated) return
    loginWithRedirect({
      appState: { returnTo: '/dashboard' },
      authorizationParams: {
        screen_hint: 'signup',
      },
    }).catch((err) => console.error('[Auth0] signup loginWithRedirect failed', err))
  }, [isLoading, isAuthenticated, loginWithRedirect])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to sign up...</p>
      </div>
    </div>
  )
}
