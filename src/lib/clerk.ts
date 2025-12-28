// Clerk client initialization
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'

// Clerk publishable key from environment variables
// Note: import.meta.env is available at runtime in Vite, but not during TypeScript compilation
// We'll handle the validation at runtime
export { ClerkProvider, useAuth, useUser }