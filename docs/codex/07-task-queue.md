# Task queue

This file is the active implementation queue for the estate-navigation product.
It reflects the Store-first shared-IA roadmap that is already partially live in
code.

Work from top to bottom. Do not reopen completed path-wiring work unless a real
regression forces it.

## Phase 1 - Shared IA foundation

This phase is complete in the codebase. It established one information
architecture with two entry modes instead of two separate navigation systems.

Completed outcomes:

- shared top-level nav for Explore Estate, Store, Events, Ranking, Campaign,
  and Community
- consistent current-section highlighting across scenic and app surfaces
- `/auth` return flow shared by scenic and standard navigation
- legacy `/merch/*` compatibility redirected into the new Store route model

Do not reintroduce a split between scenic navigation and normal UI navigation.

## Phase 2 - Scenic landing and scenic Store entry

This phase is also complete enough for current product work.

Completed outcomes:

- path-driven estate landing at `/`
- debug mode and reduced-motion support for the landing scene
- scenic Store entry at `/store`
- curated scenic Store product-slot routing into product detail
- direct scenic-to-app Store handoff through `/store/browse`

Do not spend the next sprint rebuilding path geometry or restoring production
direction arrows.

## Phase 3 - Store App Mode redesign

This is the active implementation phase.

The goal is to make `/store/browse` the first polished proof of "scenic entry,
normal operation, optional scenic return."

### Task 3.1 - Lock the Store App Mode board

Create the Store App Mode v1 design board in Pencil with these required frames:

- desktop browse default
- desktop browse with filters active
- queue-active state
- mobile browse with drawer and filter access
- optional component references for product card and utility row

If Pencil remains blocked, keep the board contract explicit in repo docs until
the editor bridge is working again.

Use `/docs/codex/08-store-app-mode-board-spec.md` as the current contract for
that board, and use `designs/store-app-mode-v1-blueprint.md` for the actual
frame composition.

### Task 3.2 - Implement the approved Store board

Apply the approved Store App Mode design to `/store/browse` while preserving the
existing merch logic.

The implementation must keep:

- search
- sort
- filters
- queue state
- cart access
- recently viewed
- quick view, if retained by the approved board

### Task 3.3 - Tighten Store-local wayfinding

Finish the local Store navigation and return paths so users can move cleanly
between:

- scenic Store entry at `/store`
- browse shell at `/store/browse`
- product detail at `/store/product/:productId`
- queue and cart flows

This phase is complete when scenic entry and normal Store operation feel like
one section instead of two separate experiences.

## Phase 4 - Extend the shared pattern to other destinations

Start this phase only after the Store pattern is stable.

### Task 4.1 - Events

Create the Events scenic entry and pair it with the normal Events page using the
same two-mode model.

### Task 4.2 - Ranking

Create the Ranking scenic entry and pair it with the normal Ranking page using
the same two-mode model.

### Task 4.3 - Community

Create the Community scenic entry and pair it with the normal Community shell
using the same shared auth and return-flow behavior.

### Task 4.4 - Community-local navigation

Reinforce Gallery, Forum, Chat, Profile, and related pages as Community-local
navigation instead of top-level global navigation.

## Phase 5 - Sensory and shell polish

Start this phase only after Store proves the shared pattern.

### Task 5.1 - Scenic audio registry

Add subtle region-entry and product-entry cues behind mute and reduced-sensory
preferences.

### Task 5.2 - Shell consistency

Refine shared shell behavior across scenic and app surfaces:

- top nav behavior
- mobile drawer ordering
- auth prompt consistency
- scenic return controls

### Task 5.3 - Comfort preferences

Add shared scenic comfort preferences:

- reduced motion
- muted sound
- optional lower-fidelity scenic mode only if performance later requires it

## Phase 6 - Scene choreography

Start this phase only after the shared Store model is stable.

### Task 6.1 - Intro sequence

Build the optional establishing exterior and gate transition into the current
outer-grounds landing scene.

### Task 6.2 - Destination transitions

Add restrained route-aware transitions from scenic entry into destination pages.

### Task 6.3 - Scenic return behavior

Add route-aware return motion only where it strengthens orientation and does not
add friction.

## Acceptance criteria for the current phase

The active Store-first phase is complete when:

- `/store` is the scenic Store entry
- `/store/browse` is the normal Store shell
- scenic Store paths route directly to the correct product details
- the global nav and mobile drawer expose the same top-level IA
- Store-local navigation is stable across browse, drops, cart, and orders
- the Store App Mode redesign contract is locked and implemented

## Explicitly deferred

These items remain deferred until the Store-first phase is stable:

- destination-scene rollout for every top-level section
- final audio design
- elaborate cinematic choreography
- WebGL or heavier scene technology
- ornamental nav treatments that reduce usability

## If blocked

If the current work is blocked, do not invent a new product direction.

Check these layers in order:

1. shared route model
2. top-level current-section highlighting
3. scenic-to-app handoff
4. auth return-flow consistency
5. Pencil/editor integration for the Store board
