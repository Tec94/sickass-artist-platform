import { useNavigate } from 'react-router-dom'
import { SignInButton, SignUpButton } from '@clerk/clerk-react'

export function SignInPrompt() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Sign In Required
        </h1>
        <p className="text-gray-400 mb-8">
          You need to sign in to access this page.
        </p>

        <div className="flex gap-4 flex-col">
          <SignInButton mode="modal">
            <button className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition">
              Create Account
            </button>
          </SignUpButton>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 font-semibold rounded-lg transition"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  )
}
