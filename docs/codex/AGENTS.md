# AGENTS.md

This repository contains a scenic estate-navigation artist platform with one
information architecture and two entry modes.

The repo includes canonical implementation context under `/docs/codex/`.

Before changing code, read:

1. `/docs/codex/BOOTSTRAP.md`
2. `/docs/codex/00-project-overview.md`
3. `/docs/codex/01-non-negotiables.md`
4. `/docs/codex/02-region-map.md`
5. `/docs/codex/03-design-system.md`
6. `/docs/codex/06-current-state.md`
7. `/docs/codex/07-task-queue.md`
8. `/docs/codex/08-store-app-mode-board-spec.md` when the task touches the
   Store browse shell or Pencil redesign work
9. `designs/store-app-mode-v1-blueprint.md` when the task needs the concrete
   Store frame composition

Do not skip this.

## Project summary

The product does not treat scenic navigation and standard UI navigation as two
separate systems.

- **Explore mode** is the scenic estate layer used on the homepage and on
  scenic destination-entry pages where the world adds branded wayfinding value.
- **App mode** is the standard working shell used for routine browsing,
  shopping, and deep task flows.

Both modes must route into the same destinations without adding extra click
tax.

## Locked product decisions

Do not change these without explicit instruction.

- The homepage remains the outer-grounds estate courtyard at `/`
- The camera remains slightly elevated isometric
- Region mapping uses traced SVG path data, not guessed polygons
- The landing scene remains a real navigation layer, not decorative art
- The top-level IA is shared across scenic and app navigation
- Community remains auth-gated
- Auth uses a dedicated `/auth` route
- Mobile keeps the same scenic world and the same top-level destination order
- Visible production direction arrows remain removed unless explicitly restored

The current canonical top-level IA is:

- **Explore Estate** = `/`
- **Store** = `/store`
- **Events** = `/events`
- **Ranking** = `/ranking`
- **Campaign** = `/campaign`
- **Community** = `/community`

The current scenic landing region map is:

- Store = left wing
- Events = upper-left central palace block
- Ranking = top rear palace mass
- Campaign = center fountain court
- Community = right wing / tower mass

Profile remains nested under Community and is not a primary landing region in
v1.

## Current implementation priority

The current priority is the Store-first shared-IA expansion.

The current sequence is:

1. keep the shared top-level IA stable
2. use `/store` as scenic Store entry
3. use `/store/browse` as the normal Store shell
4. lock and implement the Store App Mode redesign
5. only then extend the same pattern to Events, Ranking, and Community

Do not revert the repo back to a "finish the landing path system" milestone.

## Technical guidance

### Shared IA

Treat scenic and standard navigation as two entry modes into the same section
tree.

That means:

- every major destination must be directly reachable from the global nav
- scenic entry must route directly into a destination page
- users must not be forced to re-enter the estate for routine movement
- current-section highlighting must resolve the same way in scenic and app mode

### Route model

Preserve this route structure unless explicitly asked to change it:

- `/` = scenic estate homepage
- `/store` = scenic Store entry
- `/store/browse` = normal Store shell
- `/store/product/:productId` = product detail
- `/merch/*` = compatibility redirects into `/store/*`

Deep community pages can stay addressable, but they belong to the Community
top-level scope.

### Scenic config

Use config-driven scene data.

Do not:

- fetch traced SVG paths at runtime
- scatter scene anchors or path ownership across unrelated files
- duplicate IA definitions between scenic and app code

Prefer:

- one config source for scenic region or slot geometry
- one shared source for top-level navigation
- explicit auth return behavior

### Auth flow

Locked access must behave consistently across scenic and app surfaces.

Required behavior:

- show a compact auth prompt
- route auth CTAs to `/auth`
- preserve `returnTo`
- restore the intended destination after auth

### Store-first scenic expansion

The Store is the first destination-scene proof of the shared-IA model.

Keep these rules:

- `/store` is a premium scenic entry, not a catalog replacement
- scenic product hits route directly into real product detail
- `/store/browse` is the workhorse shell
- Store-local navigation handles routine movement within Store scope

## Design guidance

The product should feel:

- nocturnal
- luxurious
- restrained
- editorial
- immersive

It should not feel:

- like a fantasy game HUD
- like a generic dashboard
- like a startup landing page
- like disconnected concept art

Preserve scene legibility and premium restraint over novelty.

## Implementation constraints

### Do not split the IA

Do not create one navigation system for scenic pages and another for app pages.

If a change affects routing, current-location cues, or auth behavior, verify
that the behavior stays consistent in both modes.

### Do not overcomplicate scene tech

Avoid WebGL or heavier scene rendering unless the current React and SVG
architecture becomes insufficient.

### Do not expand scenes before Store proves the pattern

Do not fan out to scenic Events, Ranking, or Community work until the Store
scenic entry and Store shell relationship is stable.

### Do not make silent structural changes

If you need to change:

- top-level route ownership
- auth gating behavior
- current-section highlighting
- scenic-to-app handoff rules
- mobile navigation model

surface the change clearly instead of quietly implementing it.

## Expected code style

Prefer:

- modular React components
- config-driven scenic data
- explicit route ownership
- minimal duplication
- readable state models

Avoid:

- burying route contracts inside view components
- duplicating navigation definitions across files
- letting scenic-only assumptions leak into app-mode code

## Suggested file organization

A good organization pattern looks like this:

- `src/features/navigation/`
  - `topLevelNav.ts`
- `src/features/castleNavigation/`
  - `sceneConfig.ts`
  - `storeSceneConfig.ts`
- `src/pages/`
  - `LandingPage.tsx`
  - `StoreScenePage.tsx`
  - `Merch.tsx`
  - `MerchDetail.tsx`

This is guidance, not a strict requirement.

## If asked to make changes

When making changes, preserve the locked shared-IA direction.

If a request conflicts with the docs, prefer the docs unless the new request
explicitly overrides them.

If context seems incomplete, inspect the files in `/docs/codex/` before
proceeding.

## Current success criteria

The current milestone is complete when:

- the shared top-level IA is stable across scenic and app pages
- `/store` works as scenic entry
- `/store/browse` works as the normal Store shell
- scenic Store hits route into real product detail
- auth and return behavior stay consistent
- the Store App Mode redesign contract is locked and implemented

Anything beyond that is secondary right now.
