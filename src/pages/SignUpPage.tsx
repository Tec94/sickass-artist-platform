import { useEffect, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { sanitizeReturnTo } from './SignInPage'

export function SignUpPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return sanitizeReturnTo(params.get('returnTo'))
  }, [])

  useEffect(() => {
    if (isLoading || isAuthenticated) return
    loginWithRedirect({
      appState: { returnTo },
      authorizationParams: {
        screen_hint: 'signup',
      },
    }).catch((err) => console.error('[Auth0] signup loginWithRedirect failed', err))
  }, [isLoading, isAuthenticated, loginWithRedirect, returnTo])

  return (
    <div className="app-surface-page min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="app-surface-shell w-full rounded-2xl p-8 text-center">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-accent-brand-soft)] border-t-transparent"></div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
              Redirecting to sign up...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
