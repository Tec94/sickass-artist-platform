# AGENTS.md

> **Status:** Current website. This file is the operating guide for agents and
> contributors working in the current repository state.

## Read first

Before you change code or docs, read these files in order:

1. `src/App.tsx`
2. `src/main.tsx`
3. `docs/README.md`
4. `docs/codex/00-project-overview.md`
5. `docs/codex/06-current-state.md`
6. `docs/codex/07-task-queue.md`

If the task explicitly touches scenic/shared-IA work, then also read:

1. `docs/codex/01-non-negotiables.md`
2. `docs/codex/02-region-map.md`
3. `docs/codex/03-design-system.md`
4. `docs/codex/08-store-app-mode-board-spec.md`

## Repository split

This repo currently contains two different truth layers:

- the **current website**, routed by `src/App.tsx`
- a **planned/unrouted architecture** track for scenic/shared-IA work

Do not treat those as the same thing.

## Current website source of truth

Use these rules when the task is about the live site:

- `src/App.tsx` is the current route contract
- `src/pages/StitchPrototypes/*` are the live routed pages
- `src/main.tsx` is the auth and provider contract
- `docs/README.md` is the current docs index

The live router currently serves:

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

Do not describe `/auth`, `/campaign`, `/ranking`, `/store/browse`,
`/store/product/:productId`, `/sign-in`, `/sign-up`, or `/sso-callback` as live
routes unless `src/App.tsx` is updated to include them.

## Planned and unrouted source of truth

Use these files only when the task is intentionally about the scenic/shared-IA
track:

- `src/features/navigation/topLevelNav.ts`
- `src/pages/LandingPage.tsx`
- `src/pages/StoreScenePage.tsx`
- `src/features/castleNavigation/sceneConfig.ts`
- `src/features/castleNavigation/storeSceneConfig.ts`
- `src/features/auth/authRouting.ts`

Those files are real code, but they are not the current website contract.

## Auth guidance

Auth0 and Convex wiring are live in the app shell, but the route contract is
split:

- `src/main.tsx` mounts `Auth0Provider` and Convex auth integration
- `src/features/auth/authRouting.ts` still defines `/auth` as a helper entry
  contract
- `src/App.tsx` currently serves `/login` instead of routing the helper auth
  pages

If you touch auth, call out clearly whether you are changing:

- provider-level auth wiring
- helper auth pages
- the live router contract

Do not assume those layers already match.

## Other dormant but present systems

The phone overlay code under `src/components/PhoneDisplay/` exists, but it is
not mounted by the current app shell. Treat it as planned or unrouted work.

## Working rules

When making changes:

- start with the live source of truth for current website tasks
- label planned or unrouted work explicitly in docs
- update route-level tests when live route declarations change
- do not silently promote scenic/shared-IA docs into live-site documentation
- do not silently describe helper auth routes as live behavior

## Current success criteria

The current repository is in a healthy state when:

- docs describe `src/App.tsx` accurately
- route smoke tests match the live router
- planned scenic/shared-IA work stays documented, but clearly labeled
- auth docs distinguish provider wiring from the current live route contract
