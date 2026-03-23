# Task queue

> **Status:** Current website. This queue is organized around the current live
> router first and the planned or unrouted architecture second.

## Phase 1 - Truth alignment foundation

This phase keeps the repository honest about what is live today.

Required outcomes:

- docs describe `src/App.tsx` accurately
- route tests match the live router
- scenic/shared-IA files remain documented, but clearly labeled as non-live
- auth docs distinguish provider wiring from the live route contract

Do not treat this phase as optional. If the docs and tests drift from
`src/App.tsx`, the repo becomes harder to work in.

## Phase 2 - Live prototype website maintenance

Once truth alignment is stable, maintain the current routed website as its own
product surface.

Focus areas:

- `src/pages/StitchPrototypes/*`
- current route transitions
- current design language from `docs/DESIGN.md`
- current Auth0 and Convex shell wiring in `src/main.tsx`

Do not silently rewrite the live prototype website into the scenic/shared-IA
model during ordinary maintenance work.

## Phase 3 - Architecture convergence decisions

This phase starts only when the team explicitly wants to reconcile the live
router with the planned scenic/shared-IA work.

### Task 3.1 - Decide the primary route model

Choose whether the repo will continue serving the prototype route set from
`src/App.tsx` or promote the scenic/shared-IA track into the live router.

Until that decision is made, keep both documented as separate layers.

### Task 3.2 - Unify auth entry behavior

If auth UX work resumes, align these layers deliberately:

- the live `/login` route
- helper auth pages in `src/pages/`
- `/auth` in `src/features/auth/authRouting.ts`
- the callback contract configured in `src/main.tsx`

Do not present those layers as already unified.

### Task 3.3 - Decide the fate of the phone overlay

The phone overlay code exists, but is not mounted. Either:

- mount it intentionally and document it as live, or
- keep it documented as planned or unrouted work

Do not leave the docs ambiguous.

## Phase 4 - Scenic/shared-IA reactivation

Start this phase only if the scenic/shared-IA track is intentionally promoted
back into the live router.

Potential reactivation areas:

- scenic landing at `/`
- scenic Store entry and Store browse shell
- shared top-level nav from `src/features/navigation/topLevelNav.ts`
- helper auth flow from `src/features/auth/authRouting.ts`

If this phase starts, update `src/App.tsx`, docs, and route tests together.

## Explicitly deferred

These items stay deferred until the architecture decision is explicit:

- presenting scenic/shared-IA routes as live behavior
- documenting the phone overlay as mounted
- assuming `/auth`, `/campaign`, `/ranking`, `/store/browse`, or
  `/store/product/:productId` are active routes
- collapsing current prototype routes and planned scenic routes into one story

## Acceptance criteria

The current queue is healthy when:

- `src/App.tsx` remains the live route source of truth
- docs distinguish current website from planned or unrouted architecture
- route smoke tests protect the live router contract
- future convergence work is surfaced as an explicit decision, not implied
