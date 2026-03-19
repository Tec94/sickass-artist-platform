# Current state

This file records the live implementation state of the estate-navigation
product. It reflects the code that is currently in the repo, not the older
path-wiring milestone that has already been completed.

## Product architecture

The app now follows one information architecture with two entry modes.

- **Explore mode** is the scenic estate layer. It is used on the outer-grounds
  homepage and on scenic destination-entry pages where the world adds branded
  wayfinding value.
- **App mode** is the normal working shell. It is used for routine browsing,
  shopping, and deeper task flows.

These are not separate products. They are two ways to enter the same top-level
destinations and routes.

## Locked navigation model

The canonical top-level navigation now matches the scenic estate map and is
shared across the global header, mobile drawer, search, and scenic entry
points.

- **Explore Estate** routes to `/`
- **Store** routes to `/store`
- **Events** routes to `/events`
- **Ranking** routes to `/ranking`
- **Campaign** routes to `/campaign`
- **Community** routes to `/community`

Community remains the only auth-gated primary region on the landing scene. Deep
community pages such as Gallery, Forum, Chat, Profile, and Quests now belong to
the Community top-level scope instead of behaving like separate global
destinations.

## Scenic landing status

The homepage at `/` is the live outer-grounds estate scene. It already uses the
path-driven region system and the current production interaction model.

The landing implementation includes:

- inline SVG path data as the only geometry source of truth
- shared top-level navigation in the normal app header
- hover, focus, and coarse-pointer preview behavior
- compact auth prompt behavior for locked access
- reduced-motion support
- a working debug mode for region calibration
- no visible production direction arrows

The landing scene is past the core interaction milestone. Remaining work is
polish and expansion, not basic region wiring.

## Scenic Store status

The first destination-scene proof now exists at `/store`.

This page is the scenic Store entry and currently includes:

- the store scene image from `public/nav_scenes/store-scene.png`
- inline SVG product-slot paths from the traced `public/nav_scenes/paths/`
  assets
- curated fixed SKU mapping for the eight scenic Store product hits
- direct routing from scenic product hit to `/store/product/:productId`
- an **Open Store UI** control that routes to `/store/browse`
- a **Return to Grounds** control that routes back to `/`
- the same hover, focus, touch-preview, and reduced-motion model used on the
  estate landing

This is the first working proof that scenic entry and normal app navigation can
share one IA without adding click tax.

## Store app-mode status

The normal Store shell now lives at `/store/browse`.

The existing merch experience has already been moved into that route, and the
core store flows still work inside the new structure:

- search
- sort
- filters
- queue state and queue gating
- cart access
- recently viewed
- quick view
- product detail at `/store/product/:productId`

Store-local navigation has been added for the working shell:

- **Products**
- **Drops / Queue**
- **Cart**
- **Orders**

The store shell also includes explicit scenic return controls so the user can
move between scenic entry and normal operation without losing orientation.

## Auth and routing status

Auth-gated entry now uses a shared `/auth` contract from scenic and normal
navigation.

The repo currently supports:

- compact auth prompt behavior for gated entry
- `/auth` as the canonical auth threshold
- preserved `returnTo` targets
- compatibility handling for older sign-in and sign-up entry points
- legacy `/merch/*` redirects into the new `/store/*` structure

The default auth return target is Community, not the old dashboard home path.

## Current milestone

The active milestone is the Store-first shared-IA expansion.

That means the current focus is:

1. keep the shared navigation model stable across scenic and app surfaces
2. finish the Store app-mode redesign contract
3. prove the scenic-entry-plus-working-shell pattern in Store before scaling it
   to Events, Ranking, and Community

This is no longer a "finish wiring landing paths" project phase.

## Active blocker

The only major blocker in the Store-first milestone is the Pencil editor bridge.

The Store App Mode board has not been created in Pencil yet because Pencil's
editor-backed actions still fail with "A file needs to be open in the editor,"
even after `open_document('new')` and direct file-path opens. The implementation
spec for that board must remain explicit in repo docs until the editor bridge is
working again.

## Current risks

The main risks have shifted from region wiring to system coherence.

- **Navigation drift:** Scenic entry and normal app navigation must keep sharing
  the same IA and current-section highlighting.
- **Store shell drift:** The normal Store shell can regress into a generic merch
  page if the Pencil redesign contract is not locked before more ad hoc UI
  changes land.
- **Premature scene sprawl:** Events, Ranking, and Community scenic entry pages
  should not begin until the Store pattern is stable.
- **Pencil dependency:** The Store board creation step is blocked by tooling,
  not by product uncertainty.

## Immediate next step

The immediate next step is to lock the Store App Mode redesign contract and then
implement it at `/store/browse`.

In practice, that means:

1. keep the shared IA and Store scenic entry stable
2. create or recover the Pencil Store board
3. apply the approved board to the working Store shell
4. only then extend the same two-mode pattern to Events, Ranking, and
   Community
