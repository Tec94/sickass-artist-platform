# Repository truth-alignment sweep

> **Status:** Current website. This file records the documentation and
> source-of-truth alignment baseline for the repository as of March 23, 2026.

## Summary

The repository currently contains two different application stories:

- the **current website**, which is routed by `src/App.tsx` and built from the
  prototype screens in `src/pages/StitchPrototypes`
- a **planned/unrouted scenic/shared-IA track**, which is still present in
  source files such as `src/pages/LandingPage.tsx`,
  `src/pages/StoreScenePage.tsx`, `src/features/navigation/topLevelNav.ts`, and
  `src/features/auth/authRouting.ts`

The purpose of this sweep is to make the docs and repo checks describe that
split honestly instead of mixing both models together.

## Current website source of truth

`src/App.tsx` is the live router contract. The current website serves:

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

The live router does not currently declare `/auth`, `/campaign`, `/ranking`,
`/store/browse`, `/store/product/:productId`, `/sign-in`, `/sign-up`, or
`/sso-callback`.

## Planned and unrouted architecture still in the repo

The scenic/shared-IA track remains relevant as reference code, but it is not
live today.

Key files include:

- `src/features/navigation/topLevelNav.ts`
- `src/pages/LandingPage.tsx`
- `src/pages/StoreScenePage.tsx`
- `src/features/castleNavigation/sceneConfig.ts`
- `src/features/castleNavigation/storeSceneConfig.ts`
- `src/features/auth/authRouting.ts`

Those files still define or assume a different route model built around:

- `/auth`
- `/campaign`
- `/ranking`
- `/store/browse`
- `/store/product/:productId`

They should remain documented, but only as planned or unrouted architecture.

## Backend and auth truths

The backend and auth stack remain live, even though some helper routes are not
currently wired:

- `src/main.tsx` mounts `Auth0Provider`, `ConvexProvider`, and
  `ConvexAuthProvider`
- `convex/auth.config.js` validates Auth0 issuer and audience for Convex
- `convex/schema.ts` remains the exhaustive schema source of truth
- `src/features/auth/authRouting.ts` still defines `/auth` as a helper contract,
  but `src/App.tsx` does not route it today

## Sweep goals

This sweep updates:

- root docs and the docs index
- codex operating docs
- database and auth setup docs
- design and phone-overlay status docs
- the route smoke test

This sweep does not:

- delete old files
- change `.gitignore`
- change runtime routes
- revive scenic/shared-IA pages

## Follow-through rules

When future work lands:

1. Update docs only after confirming whether the change affects the current
   website or planned architecture.
2. If the live router changes, update `src/__tests__/route.a11y.smoke.test.ts`
   in the same pass.
3. Do not describe scenic/shared-IA files as live unless `src/App.tsx` starts
   routing them.
