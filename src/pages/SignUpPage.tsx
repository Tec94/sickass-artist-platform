import { SignUp } from '@clerk/clerk-react'

export function SignUpPage() {
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <SignUp 
        routing="path" 
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-900 border border-gray-800',
          }
        }}
      />
    </div>
  )
}
