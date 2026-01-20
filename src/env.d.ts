// Type declarations for Vite environment variables
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string
  readonly VITE_AUTH0_CLIENT_ID: string
  readonly VITE_CONVEX_DEPLOYMENT_URL: string
  // Add other Vite environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': any;
  }
}
