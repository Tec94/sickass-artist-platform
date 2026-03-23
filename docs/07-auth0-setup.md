# Auth0 setup

> **Status:** Current website. This file documents the current Auth0 and Convex
> wiring and also calls out the separate helper auth contract that exists in
> source, but is not routed by the current website.

## Summary

This repo already mounts Auth0 and Convex auth providers in `src/main.tsx`.
That means environment setup matters today, even though the live router in
`src/App.tsx` does not currently expose the helper auth pages that exist in
`src/pages/`.

> **Warning:** The current live router serves `/login` as a prototype screen
> from `src/pages/StitchPrototypes/Login.tsx`. The helper auth contract still
> exists separately in `src/features/auth/authRouting.ts` and companion pages
> such as `AuthEntryPage.tsx`, but those routes are not declared in
> `src/App.tsx` today.

## Current auth implementation in the repo

Auth is split across three layers:

1. `src/main.tsx` mounts `Auth0Provider`, `ConvexProvider`, and
   `ConvexAuthProvider`.
2. `convex/auth.config.js` validates the Auth0 issuer and audience used by
   Convex.
3. `src/features/auth/authRouting.ts` defines the helper entry contract for
   `/auth` and a default return path of `/community`.

The current provider-level settings in `src/main.tsx` are:

- `redirect_uri = ${window.location.origin}/sso-callback`
- `scope = openid profile email`
- `cacheLocation = localstorage`

The current helper auth files in source are:

- `src/pages/AuthEntryPage.tsx`
- `src/pages/SignInPage.tsx`
- `src/pages/SignUpPage.tsx`
- `src/pages/SSOCallback.tsx`

The current live router does not declare those routes.

## Create the Auth0 SPA

In the Auth0 dashboard, create an application of type **Single Page
Application**. Save the Auth0 domain and client ID for the local env file and
for Convex server configuration.

### Allowed callback URLs

Because `src/main.tsx` currently uses `/sso-callback` as the Auth0 redirect
URI, configure these callback URLs:

- `http://localhost:5173/sso-callback`
- `https://<your-vercel-domain>/sso-callback`

If you later change the router or provider callback behavior, update this list
to match the new redirect URI exactly.

### Allowed logout URLs

Configure these logout URLs:

- `http://localhost:5173`
- `https://<your-vercel-domain>`

### Allowed web origins

Configure these web origins:

- `http://localhost:5173`
- `https://<your-vercel-domain>`

If you enable refresh tokens for the SPA, enable refresh token rotation in
Auth0 and confirm the app is allowed to request `offline_access`.

## Frontend env vars

Create a local `.env` file with the values expected by `src/main.tsx`:

```env
VITE_CONVEX_DEPLOYMENT_URL=<your-convex-deployment-url>
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
```

`src/main.tsx` throws at startup if `VITE_AUTH0_DOMAIN` or
`VITE_AUTH0_CLIENT_ID` is missing.

## Convex env vars

`convex/auth.config.js` expects these server-side env vars:

```bash
npx convex env set AUTH0_DOMAIN your-tenant.us.auth0.com
npx convex env set AUTH0_CLIENT_ID your_auth0_client_id
```

The Auth0 domain is normalized to include:

- an `https://` scheme if missing
- a trailing slash so the issuer matches Auth0 exactly

After updating Convex env vars, restart or redeploy the Convex environment.

## Identity mapping

The repo still uses a historical field name in the schema:

- `ctx.auth.getUserIdentity()?.subject` maps to `users.clerkId`

That field name remains in `convex/schema.ts` even though the auth provider is
Auth0. Do not rename it casually without a schema and migration plan.

## Current route contract versus helper contract

These two auth stories both exist in the repo today, and the docs must keep
them separate.

| Layer | Current state |
| --- | --- |
| Live routed page | `/login` in `src/App.tsx` |
| Provider callback URI | `/sso-callback` in `src/main.tsx` |
| Helper auth entry contract | `/auth` in `src/features/auth/authRouting.ts` |
| Helper default return path | `/community` in `src/features/auth/authRouting.ts` |
| Helper page components | Present in `src/pages/`, but not routed today |

If you restore the helper auth flow to the live router later, route updates and
doc updates need to happen in the same pass.

## Next steps

If you are working on auth in this repo:

1. Confirm whether the task is provider-level setup or router-level auth UX.
2. Check `src/main.tsx`, `convex/auth.config.js`, and
   `src/features/auth/authRouting.ts` together.
3. Update `src/App.tsx` and route tests if you make helper auth pages live.
