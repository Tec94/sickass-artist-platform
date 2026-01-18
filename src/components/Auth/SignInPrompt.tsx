import { useNavigate } from 'react-router-dom'
import { SignInButton, SignUpButton } from '@clerk/clerk-react'
import { useTranslation } from '../../hooks/useTranslation'

export function SignInPrompt() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  // Get the current origin for absolute redirect URL
  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/dashboard` 
    : '/dashboard'

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
          <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
            <button className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
              {t('auth.signIn')}
            </button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl={redirectUrl}>
            <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition">
              {t('common.createAccount')}
            </button>
          </SignUpButton>
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
