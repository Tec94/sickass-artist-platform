# Current state

> **Status:** Current website. This file records the current live
> implementation state first, then calls out the planned or unrouted systems
> that remain in source.

## Current website

The live website is the prototype router declared in `src/App.tsx`. It renders
the screens exported from `src/pages/StitchPrototypes/index.tsx`.

The current live routes are:

- `/` and `/journey`
- `/dashboard`
- `/archive`
- `/rankings`
- `/ranking-submission`
- `/profile`
- `/community`
- `/store`
- `/salon`
- `/access-tiers-mobile`
- `/access-tiers-albert`
- `/experience-mobile`
- `/experience-albert`
- `/events-mobile`
- `/events`
- `/dashboard-mobile`
- `/login`

All unmatched routes currently redirect back to `/`.

## Current page model

The current website behaves like a prototype set for the ROA archive world:

- `Journey` acts as the landing route
- `Dashboard`, `Archive`, `Community`, `Profile`, `Store`, `Salon`, and
  `Events` are served as standalone prototype screens
- mobile-specific or alternate prototype routes remain live beside desktop
  routes
- `/login` serves the prototype archival access screen from
  `src/pages/StitchPrototypes/Login.tsx`

## Auth and backend state

Auth0 and Convex are active in the app shell:

- `src/main.tsx` mounts `Auth0Provider`, `ConvexProvider`, and
  `ConvexAuthProvider`
- `convex/auth.config.js` validates the Auth0 issuer and audience used by
  Convex
- `src/contexts/UserContext.tsx` integrates Auth0 state with Convex-backed user
  data

There is still route-contract drift in auth:

- the live router serves `/login`
- helper auth pages exist in `src/pages/AuthEntryPage.tsx`,
  `src/pages/SignInPage.tsx`, `src/pages/SignUpPage.tsx`, and
  `src/pages/SSOCallback.tsx`
- `src/features/auth/authRouting.ts` still defines `/auth` as the helper entry
  contract with `/community` as the default return path
- the current live router does not declare `/auth`, `/sign-in`, `/sign-up`, or
  `/sso-callback`

Treat those helper auth pages as present but unrouted until the router changes.

## Planned and unrouted architecture still in source

The repo still contains a scenic/shared-IA implementation track. Its main files
include:

- `src/features/navigation/topLevelNav.ts`
- `src/features/castleNavigation/sceneConfig.ts`
- `src/features/castleNavigation/storeSceneConfig.ts`
- `src/pages/LandingPage.tsx`
- `src/pages/StoreScenePage.tsx`
- `src/features/auth/authRouting.ts`

That track assumes a different route contract built around:

- `/auth`
- `/campaign`
- `/ranking`
- `/store/browse`
- `/store/product/:productId`

Those routes are reference architecture today, not live website behavior.

## Other code that exists but is not live

The phone overlay system under `src/components/PhoneDisplay/` is implemented in
source, but the current app shell does not mount `PhoneOverlayRoot` or
`PhoneOverlayProvider`. `src/App.tsx` only imports the phone-display CSS.

## Current risks

The main repository risks are now truth and contract drift:

- docs can accidentally describe the scenic/shared-IA track as if it is live
- tests can assert routes that `src/App.tsx` does not serve
- auth can look complete at the provider level while still being unrouted at
  the page level
- dormant systems such as the phone overlay can be mistaken for live features

## Immediate next step

The immediate priority is to keep the written, tested, and routed truth aligned.

In practice, that means:

1. treat `src/App.tsx` as the live source of truth
2. label scenic/shared-IA files as planned or unrouted
3. keep route smoke tests aligned with the live router
4. make any future convergence work explicit instead of implying it is already
   done
