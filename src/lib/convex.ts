// Convex client initialization
import { ConvexReactClient } from 'convex/react'

// Convex deployment URL from environment variables
// Note: import.meta.env is available at runtime in Vite, but not during TypeScript compilation
// We'll handle the validation at runtime

// Create Convex client - URL will be provided at runtime
export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_DEPLOYMENT_URL as string)

export default convex