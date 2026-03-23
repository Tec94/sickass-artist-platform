# Documentation

This directory tracks the current state of the repository. The most important
rule is simple: treat `src/App.tsx` as the source of truth for the current
website, and label any other architecture explicitly.

## Status taxonomy

These labels are used across the docs:

- **Current website**: behavior currently served by `src/App.tsx`
- **Planned/unrouted architecture**: code that exists in the repo, but is not
  routed by the current website
- **Research reference**: background inspiration or brand research

## Current website docs

These docs describe the current routed app and backend contracts:

| File | Status | Purpose |
| --- | --- | --- |
| [`../README.md`](../README.md) | Current website | Repo overview and live route summary |
| [`README.md`](./README.md) | Current website | Documentation index |
| [`02-database-schema.md`](./02-database-schema.md) | Current website | Domain-organized guide to `convex/schema.ts` |
| [`07-auth0-setup.md`](./07-auth0-setup.md) | Current website | Auth0, Convex auth, and current router notes |
| [`DESIGN.md`](./DESIGN.md) | Current website | Current design language plus planned scenic notes |
| [`repo_sweep_plan.md`](./repo_sweep_plan.md) | Current website | Truth-alignment audit baseline |

## Codex operating docs

These files help agents and contributors understand what is live today:

| File | Status | Purpose |
| --- | --- | --- |
| [`codex/00-project-overview.md`](./codex/00-project-overview.md) | Current website | High-level repository split and product summary |
| [`codex/AGENTS.md`](./codex/AGENTS.md) | Current website | Working rules for agents and contributors |
| [`codex/BOOTSTRAP.md`](./codex/BOOTSTRAP.md) | Current website | Read-first bootstrap guidance |
| [`codex/06-current-state.md`](./codex/06-current-state.md) | Current website | Live implementation state |
| [`codex/07-task-queue.md`](./codex/07-task-queue.md) | Current website | Active queue and deferred convergence work |

## Planned and unrouted architecture docs

These files remain useful, but they do not describe the current routed site:

| File | Status | Purpose |
| --- | --- | --- |
| [`codex/01-non-negotiables.md`](./codex/01-non-negotiables.md) | Planned/unrouted architecture | Scenic/shared-IA constraints |
| [`codex/02-region-map.md`](./codex/02-region-map.md) | Planned/unrouted architecture | Estate-scene region mapping |
| [`codex/03-design-system.md`](./codex/03-design-system.md) | Planned/unrouted architecture | Scenic/shared-IA design system |
| [`codex/08-store-app-mode-board-spec.md`](./codex/08-store-app-mode-board-spec.md) | Planned/unrouted architecture | Scenic Store shell handoff spec |
| [`iphone-plan.md`](./iphone-plan.md) | Planned/unrouted architecture | Phone overlay implementation notes for code that is not mounted |

## Research reference docs

These files are inspiration and reference material:

| File | Status | Purpose |
| --- | --- | --- |
| [`codex/Brand Identity Research.md`](./codex/Brand%20Identity%20Research.md) | Research reference | Brand direction notes |
| [`codex/Drake Website Research.md`](./codex/Drake%20Website%20Research.md) | Research reference | Comparative research |
| [`codex/ROA_Design_Identity.md`](./codex/ROA_Design_Identity.md) | Research reference | ROA identity notes |
| [`codex/Style and Visual Anchor Research.md`](./codex/Style%20and%20Visual%20Anchor%20Research.md) | Research reference | Style and visual anchor study |

## Supporting files

These files support development or doc work, but are not primary product docs:

| File | Purpose |
| --- | --- |
| [`_seed-data.ts`](./_seed-data.ts) | Local development seed data reference |

## Working rules

When you update docs:

1. Start by checking `src/App.tsx` for current routes.
2. Confirm backend facts in `convex/schema.ts` and auth facts in `src/main.tsx`
   and `convex/auth.config.js`.
3. Label planned or unrouted work explicitly instead of presenting it as live.
4. Keep links inside this index aligned with the actual files in `docs/`.
