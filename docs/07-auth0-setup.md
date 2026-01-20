# Auth0 Setup (Frontend + Convex)

This project uses **Auth0** for authentication and passes an **Auth0 ID Token (JWT)** to **Convex**.

## 1) Create an Auth0 Application (SPA)

In the Auth0 dashboard:

- Create an **Application** of type **Single Page Application**.
- Note the **Domain** (e.g. `your-tenant.us.auth0.com`) and **Client ID**.

### Application Settings

Set these URLs for local dev and production:

- **Allowed Callback URLs**
  - `http://localhost:5173`
  - `http://localhost:5173/dashboard`
  - `https://<your-vercel-domain>`
  - `https://<your-vercel-domain>/dashboard`
- **Allowed Logout URLs**
  - `http://localhost:5173`
  - `https://<your-vercel-domain>`
- **Allowed Web Origins**
  - `http://localhost:5173`
  - `https://<your-vercel-domain>`

If you enable refresh tokens for SPAs:

- **Advanced Settings → Refresh Token Rotation**: enable rotation
- Ensure the SPA is allowed to request `offline_access` (optional; this repo currently does not request it)

## 2) Frontend env vars (Vite)

Create a local `.env`:

```env
VITE_CONVEX_DEPLOYMENT_URL=<your-convex-deployment-url>
VITE_AUTH0_DOMAIN=<your-auth0-domain>        # e.g. your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>  # from Auth0 app settings
```

## 3) Convex env vars (server-side)

Convex validates the JWT issuer (`iss`) and audience (`aud`) using `convex/auth.config.js`.

Set the Convex env vars:

```bash
npx convex env set AUTH0_DOMAIN your-tenant.us.auth0.com
npx convex env set AUTH0_CLIENT_ID your_auth0_client_id
```

Then restart/redeploy:

```bash
npx convex dev
```

## 4) How identity maps in Convex

- `ctx.auth.getUserIdentity()` returns an identity where:
  - `identity.subject` is Auth0’s `sub` (e.g. `auth0|abc123`, `google-oauth2|...`)
- This repo currently stores that value in the `users.clerkId` field (historical naming).

