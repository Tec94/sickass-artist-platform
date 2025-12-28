// Type declarations for Vite environment variables
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CONVEX_DEPLOYMENT_URL: string
  // Add other Vite environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}