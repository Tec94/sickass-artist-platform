import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useTranslation } from '../../hooks/useTranslation'

export function SignInPrompt() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { loginWithRedirect, isLoading } = useAuth0()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          {t('auth.signInRequired')}
        </h1>
        <p className="text-gray-400 mb-8">
          {t('auth.signInToAccess')}
        </p>

        <div className="flex gap-4 flex-col">
          <button
            disabled={isLoading}
            onClick={() => {
              loginWithRedirect({ appState: { returnTo: '/dashboard' } }).catch((err: unknown) =>
                console.error('[Auth0] loginWithRedirect failed', err)
              )
            }}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-60"
          >
            {t('auth.signIn')}
          </button>
          <button
            disabled={isLoading}
            onClick={() => {
              loginWithRedirect({
                appState: { returnTo: '/dashboard' },
                authorizationParams: { screen_hint: 'signup' },
              }).catch((err: unknown) => console.error('[Auth0] signup loginWithRedirect failed', err))
            }}
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition disabled:opacity-60"
          >
            {t('common.createAccount')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 font-semibold rounded-lg transition"
          >
            {t('auth.backHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
