import { useAuth0 } from '@auth0/auth0-react'

export function SignInButtons() {
  const { loginWithRedirect, isLoading } = useAuth0()

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      <button
        disabled={isLoading}
        onClick={() => {
          loginWithRedirect({ appState: { returnTo: '/dashboard' } }).catch((err: unknown) =>
            console.error('[Auth0] loginWithRedirect failed', err)
          )
        }}
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition text-sm disabled:opacity-60"
      >
        Sign In
      </button>
      <button
        disabled={isLoading}
        onClick={() => {
          loginWithRedirect({
            appState: { returnTo: '/dashboard' },
            authorizationParams: { screen_hint: 'signup' },
          }).catch((err: unknown) => console.error('[Auth0] signup loginWithRedirect failed', err))
        }}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-sm disabled:opacity-60"
      >
        Sign Up
      </button>
    </div>
  )
}
