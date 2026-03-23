# Codex bootstrap

> **Status:** Current website. This file tells you how to orient yourself
> before making changes in the current repository state.

## Read first

Read these files in order:

1. `src/App.tsx`
2. `src/main.tsx`
3. `docs/README.md`
4. `docs/codex/00-project-overview.md`
5. `docs/codex/06-current-state.md`
6. `docs/codex/07-task-queue.md`

If the task is specifically about scenic/shared-IA work, then continue with:

1. `docs/codex/01-non-negotiables.md`
2. `docs/codex/02-region-map.md`
3. `docs/codex/03-design-system.md`
4. `docs/codex/08-store-app-mode-board-spec.md`

## Repository reality

The repo is not one clean architecture right now. It contains:

- a live prototype website routed by `src/App.tsx`
- a separate scenic/shared-IA track that still exists in source, but is not
  live

If you skip this distinction, you will document or implement the wrong system.

## Current website priority

For live-site work, operate from these assumptions:

- `src/App.tsx` is the route contract
- `src/pages/StitchPrototypes/*` are the live routed screens
- `src/main.tsx` is the auth/provider contract
- `docs/README.md` is the current documentation map

The active live routes are:

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

## Planned and unrouted work

The scenic/shared-IA track is still present in files such as:

- `src/features/navigation/topLevelNav.ts`
- `src/pages/LandingPage.tsx`
- `src/pages/StoreScenePage.tsx`
- `src/features/auth/authRouting.ts`

Those files assume a different route model. Do not describe that model as live
unless you also update `src/App.tsx`.

## Important cautions

Do not do any of the following without explicit intent:

- present `/auth`, `/campaign`, `/ranking`, `/store/browse`, or
  `/store/product/:productId` as current routes
- assume the phone overlay is mounted because the code exists
- treat research docs as current operating specs
- update docs without checking whether the change belongs to the live site or
  the planned track

## Output expectations

When you make changes:

- keep current website facts grounded in `src/App.tsx`
- call out non-live architecture explicitly
- update tests when route declarations change
- keep auth, docs, and route expectations aligned
