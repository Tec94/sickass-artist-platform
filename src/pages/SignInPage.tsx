import { useEffect, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const DASHBOARD_RETURN_PATH = '/dashboard'

export const sanitizeReturnTo = (returnToRaw: string | null | undefined): string => {
  if (!returnToRaw) return DASHBOARD_RETURN_PATH

  let value = returnToRaw
  try {
    value = decodeURIComponent(returnToRaw)
  } catch {
    value = returnToRaw
  }

  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return DASHBOARD_RETURN_PATH
  if (trimmed.startsWith('//')) return DASHBOARD_RETURN_PATH
  if (trimmed.includes('://')) return DASHBOARD_RETURN_PATH
  if (/[\r\n]/.test(trimmed)) return DASHBOARD_RETURN_PATH

  return trimmed
}

export function SignInPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return sanitizeReturnTo(params.get('returnTo'))
  }, [])

  useEffect(() => {
    if (isLoading || isAuthenticated) return
    loginWithRedirect({
      appState: { returnTo },
    }).catch((err) => console.error('[Auth0] loginWithRedirect failed', err))
  }, [isLoading, isAuthenticated, loginWithRedirect, returnTo])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to sign in...</p>
      </div>
    </div>
  )
}
