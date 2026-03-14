import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  buildAuthEntryHref,
  sanitizeReturnTo,
} from '../features/auth/authRouting'

export function SignUpPage() {
  const navigate = useNavigate()
  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return sanitizeReturnTo(params.get('returnTo'))
  }, [])

  useEffect(() => {
    navigate(buildAuthEntryHref('signup', returnTo), { replace: true })
  }, [navigate, returnTo])

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
