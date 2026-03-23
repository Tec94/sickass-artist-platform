# Project overview

> **Status:** Current website. This file describes the current routed app first
> and then calls out the planned or unrouted architecture that still exists in
> source.

## Summary

This repository currently ships a prototype-driven ROA website. The live app is
defined by `src/App.tsx` and built from the screens in
`src/pages/StitchPrototypes`.

The repo also contains a separate scenic/shared-IA implementation track that is
still present in source, but is not routed by the current website.

## Current website

The live site uses:

- `src/App.tsx` for the route contract
- `src/pages/StitchPrototypes/*` for the served screens
- `src/main.tsx` for Auth0 and Convex provider wiring
- `src/components/Effects/PageTransition.tsx` for route transitions
- shared contexts for user, cart, language, gear, and visual variants

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

All unknown routes currently redirect back to `/`.

## Current product character

The current website feels closer to an editorial prototype set than to the
older scenic navigation concept. The live screens use the ROA archive language:

- parchment and vellum surfaces
- ink-based typography and borders
- terracotta accent cues
- mobile and alternate-view prototypes living beside desktop screens

That design language is documented in `docs/DESIGN.md`.

## Auth and backend state

Auth0 and Convex are live dependencies in the app shell:

- `src/main.tsx` mounts `Auth0Provider`, `ConvexProvider`, and
  `ConvexAuthProvider`
- `convex/auth.config.js` validates Auth0 issuer and audience
- `src/contexts/UserContext.tsx` reads Auth0 state and Convex-backed identity

There is an important split to keep in mind:

- the current live router serves `/login` as a prototype login screen
- the repo also contains helper auth pages and an `/auth` contract, but those
  routes are not declared in `src/App.tsx`

Do not assume the helper auth pages are live until the router is updated.

## Planned and unrouted architecture

The scenic/shared-IA track is still in the repo and may be resumed later. The
main source files for it are:

- `src/features/navigation/topLevelNav.ts`
- `src/features/castleNavigation/sceneConfig.ts`
- `src/features/castleNavigation/storeSceneConfig.ts`
- `src/pages/LandingPage.tsx`
- `src/pages/StoreScenePage.tsx`
- `src/features/auth/authRouting.ts`

That track assumes a different route model, including `/auth`, `/campaign`,
`/ranking`, `/store/browse`, and `/store/product/:productId`. Those routes are
reference architecture today, not live website behavior.

## Other code that exists but is not live

The phone overlay system under `src/components/PhoneDisplay/` is implemented in
source, but the current app shell does not mount it. Treat it as planned or
unrouted work until `src/App.tsx` or `src/main.tsx` mounts the overlay root.

## How to use the codex docs

Use these docs in order:

1. `docs/codex/AGENTS.md`
2. `docs/codex/BOOTSTRAP.md`
3. `docs/codex/06-current-state.md`
4. `docs/codex/07-task-queue.md`

Read the scenic/shared-IA docs only when the task explicitly touches that
architecture.
