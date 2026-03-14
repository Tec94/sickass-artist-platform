# Task Queue

This file is the active implementation queue.

Work top to bottom.

Do not skip ahead unless explicitly instructed.

---

## Phase 1 — Core region system

### Task 1.1 — Collect final SVG path data
- gather all exported region SVGs
- confirm they all share the same viewBox
- extract the `d` path strings
- store them in one region config file

### Task 1.2 — Build region config
Create a single source of truth for:
- id
- label
- route
- authRequired
- SVG path string
- label anchor
- arrow anchor
- hover accent
- lock style
- hit priority

### Task 1.3 — Render full SVG overlay
- render the estate image
- render an SVG overlay on top
- render one `<path>` per region
- wire pointer interactions

### Task 1.4 — Add debug overlay mode
Debug mode should show:
- path fills
- path outlines
- region ids
- label anchors
- arrow anchors
- lock/public state

### Task 1.5 — Add hit priority handling
- prevent larger regions from swallowing smaller ones
- keep center / focal interactions reliable

---

## Phase 2 — Region interaction behavior

### Task 2.1 — Hover state
For every region:
- add hover entry
- add hover exit
- add consistent visual feedback
- prevent noisy visual mismatch across regions

### Task 2.2 — Active / selected state
- define selected region behavior
- define whether selection persists after hover exit
- support clicked or keyboard-focused state

### Task 2.3 — Region card system
Implement a consistent region card for all mapped areas.

The card system should define:
- eyebrow / sublabel
- title
- optional supporting line
- lock messaging where relevant
- positioning rules relative to region anchors

### Task 2.4 — Directional cues
- render directional arrows or directional hints
- anchor them consistently
- support hover / active state changes

---

## Phase 3 — Auth lock behavior

### Task 3.1 — Locked visual state
For auth-gated regions:
- subdued base state
- lock messaging
- optional chain overlay
- reduced or altered hover behavior when logged out

### Task 3.2 — Auth prompt
- clicking a locked region opens compact auth prompt
- auth prompt does not destroy public navigation flow
- prompt CTA routes to `/auth`

### Task 3.3 — Return-to handling
- preserve intended destination
- restore user to intended destination after auth

---

## Phase 4 — Mobile behavior

### Task 4.1 — Touch interaction model
Decide and implement:
- single tap = focus
- second tap = enter
or
- single tap = enter after card reveal

This must be deliberate and consistent.

### Task 4.2 — Scenic pan model
- support horizontal pan where needed
- keep the same estate world on mobile
- avoid making touch interaction frustrating

### Task 4.3 — Mobile fallback nav
- add clear fallback menu access
- preserve major destination discoverability
- do not depend entirely on scenic precision taps

---

## Phase 5 — Visual polish

Only start these after Phases 1–4 are working.

### Task 5.1 — Hover sheen / shimmer
- clipped to SVG paths
- subtle and premium
- not game-loot style

### Task 5.2 — Lock overlay polish
- chains or equivalent restrained lock treatment
- region-specific clipping
- no broken-looking overlay behavior

### Task 5.3 — Card polish
- improve card lighting
- improve spacing
- refine typography hierarchy
- align with design-system rules

### Task 5.4 — Nav polish
- refine top nav
- optionally introduce parchment / scroll-inspired treatment later
- do not let ornament reduce usability

### Task 5.5 — Sound polish
- add region hover / pop feedback
- keep subtle
- do not overwhelm interaction

---

## Phase 6 — Transitions and scene choreography

Only start after the navigation system is stable.

### Task 6.1 — Establishing shot to outer-grounds transition
- optional intro
- gate opening
- camera move inward

### Task 6.2 — Destination transitions
- leaving landing scene into destination pages
- keeping the world coherent
- avoiding slow or gimmicky motion

### Task 6.3 — Back-navigation choreography
- return motion if appropriate
- route-aware back behavior
- no broken history logic

---

## Acceptance criteria for current milestone

The current milestone is complete when:

- all 5 primary regions are wired from SVG path data
- debug overlay mode exists
- region hover works on all regions
- cards / labels render consistently
- locked Community flow works
- `/auth` route is integrated into locked access flow
- mobile interaction is testable
- no rough polygon fallback remains in the main implementation

---

## Explicitly deferred

These are not current priority items:

- perfect final scene art
- final cinematic intro
- elaborate sound design
- full room-scene generation for all pages
- advanced ornamentation on nav components
- deeper community interior page polish

Those come later.

---

## If blocked

If implementation gets blocked, do not invent a new design direction.

First check:
1. is the region path data correct
2. is the anchor config correct
3. is the interaction state model correct
4. is the locked/public logic correct

Most current blockers should be solved in those layers, not by redesigning the product.