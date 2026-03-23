# Sickass Artist Platform

This repository currently serves a prototype-driven ROA website from
`src/App.tsx`. It also contains a larger scenic/shared-IA implementation track
that still exists in source, but is not routed by the current website.

## Status taxonomy

Use these labels throughout the docs:

- **Current website**: behavior currently served by `src/App.tsx`
- **Planned/unrouted architecture**: code that exists in the repo, but is not
  part of the live router
- **Research reference**: background material that informs direction, but does
  not describe current behavior

## Current website at a glance

- React 18, TypeScript, Vite, and Tailwind CSS frontend
- Convex backend and schema in `convex/schema.ts`
- Auth0 provider wiring in `src/main.tsx`
- Prototype screens under `src/pages/StitchPrototypes`
- Shared app providers for user, cart, language, gear, and visual variants

## Live routes

`src/App.tsx` currently serves these routes:

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

All other paths currently redirect back to `/`.

## Planned but unrouted architecture

The repo also contains a scenic/shared-IA track that is not live today. The
main source files for that work are:

- `src/features/navigation/topLevelNav.ts`
- `src/pages/LandingPage.tsx`
- `src/pages/StoreScenePage.tsx`
- `src/features/auth/authRouting.ts`

Those files describe routes such as `/auth`, `/campaign`, `/ranking`,
`/store/browse`, and `/store/product/:productId`, but those routes are not
declared in the current live router.

The phone overlay implementation under `src/components/PhoneDisplay/` also
exists in source, but it is not mounted in the current app shell.

## Development

```bash
npm install
npm run dev
npm run build
```

## Documentation

Start with these docs:

- [`docs/README.md`](./docs/README.md): full documentation index
- [`docs/02-database-schema.md`](./docs/02-database-schema.md): current schema
  guide
- [`docs/07-auth0-setup.md`](./docs/07-auth0-setup.md): Auth0 and Convex auth
  setup
- [`docs/codex/AGENTS.md`](./docs/codex/AGENTS.md): current operating guidance
  for agents and contributors
- [`docs/repo_sweep_plan.md`](./docs/repo_sweep_plan.md): repository
  truth-alignment baseline

## License

MIT
