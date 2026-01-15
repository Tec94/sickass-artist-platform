import { SignInButton, SignUpButton } from '@clerk/clerk-react'

export function SignInButtons() {
  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition text-sm">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-sm">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  )
}
