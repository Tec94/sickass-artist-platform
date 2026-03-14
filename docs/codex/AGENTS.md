# AGENTS.md

This repository contains a scenic estate-navigation music artist web app.

The repo includes canonical implementation context under `/docs/codex/`.

Before changing code, read:

1. `/docs/codex/BOOTSTRAP.md`
2. `/docs/codex/00-project-overview.md`
3. `/docs/codex/01-non-negotiables.md`
4. `/docs/codex/02-region-map.md`
5. `/docs/codex/03-design-system.md`
6. `/docs/codex/06-current-state.md`
7. `/docs/codex/07-task-queue.md`

Do not skip this.

---

## Project summary

The landing page is a scenic, slightly elevated isometric estate / outer-grounds view that acts as a primary navigation layer.

Users navigate by interacting with mapped architectural regions.

This is not a standard homepage with decorative art in the background. The scene is part of the product architecture.

---

## Locked product decisions

Do not change these without explicit instruction:

- The landing scene is the outer grounds / estate courtyard
- The camera is slightly elevated isometric
- Region mapping uses SVG path data, not rough polygons
- Community is auth-gated
- Auth uses a dedicated `/auth` route
- Profile is not a primary landing region in v1
- Mobile keeps the same scenic world
- Advanced transitions are deferred until after stable interaction

Current working primary map:
- Store = left wing
- Events = upper-left central palace block
- Ranking = top rear palace mass
- Campaign = center fountain court
- Community = right wing / tower mass

---

## Current implementation priority

The current task is to build the full multi-region estate navigation system.

Priority order:
1. full SVG region overlay
2. debug overlay mode
3. hover / active / locked states
4. auth prompt flow
5. card and anchor refinement
6. mobile touch + pan behavior
7. polish
8. transitions

Do not jump directly into polish or cinematic motion.

---

## Technical guidance

### Region mapping
Use SVG path data from traced region assets.

Do not:
- replace traced paths with guessed polygons
- hardcode scattered magic coordinates without config
- bury region definitions inside rendering components

Preferred structure:
- region config file
- one source of truth for paths and anchors
- reusable path data for hit area, hover, locked overlay, and debug rendering

### Overlay system
The landing scene should render:
- base scene image
- SVG overlay above it
- path-driven regions
- optional debug overlay
- label/arrow/card layers

### Debug mode
A debug mode is required and should show:
- region outlines
- fill overlays
- ids
- label anchors
- directional cue anchors
- lock/public state

This is not optional during path tuning.

### Auth flow
Locked region click behavior:
- show compact auth prompt
- CTA routes to `/auth`
- preserve destination intent
- restore return target after auth

Do not hard-block the whole scenic page when encountering a locked region.

### Mobile
Mobile should keep the same estate scene.

Support:
- focus/tap behavior
- horizontal pan if needed
- fallback nav access for constrained viewports

Do not replace the scenic landing with a generic mobile-only dashboard.

---

## Design guidance

The product should feel:
- nocturnal
- luxurious
- restrained
- editorial
- premium
- immersive

It should not feel:
- like a fantasy game HUD
- like a generic dashboard
- like a tech startup landing page
- like a cartoon
- like overstyled concept art

When in doubt, preserve:
- scene legibility
- premium restraint
- architectural realism
- low-noise interface hierarchy

---

## Implementation constraints

### Do not redesign the IA unless explicitly asked
The region map is currently a locked product decision.

### Do not overcomplicate technology prematurely
Avoid escalating to WebGL or more complex scene tech unless there is a strong need that cannot be solved with the existing SVG/React architecture.

### Do not over-polish early
No elaborate transitions, audio design, or major nav ornament until the path-driven region system is stable.

### Do not make silent structural changes
If you need to change:
- routing model
- region ownership
- auth gating logic
- camera assumptions
- mobile behavior model

surface the change clearly instead of quietly implementing it.

---

## Expected code style

Prefer:
- modular React components
- config-driven region data
- readable and inspectable code
- motion values and timings exposed as constants where useful
- minimal duplication
- explicit naming

Avoid:
- dumping everything into one homepage file
- spreading anchor values and path logic across many unrelated files
- hidden one-off behaviors per region unless documented

---

## Suggested file organization

A good organization pattern is something like:

- `src/features/estate-navigation/`
  - `EstateScene.tsx`
  - `EstateOverlay.tsx`
  - `EstateRegionCard.tsx`
  - `EstateRegionCue.tsx`
  - `estateRegions.ts`
  - `estateDebug.ts`
- `src/assets/estate-paths/` or `public/estate-paths/`

This is guidance, not a strict requirement.

---

## If asked to make changes

When making changes, preserve the currently locked product direction.

If a request conflicts with the docs, prefer the docs unless the new request explicitly overrides them.

If context seems incomplete, inspect the files in `/docs/codex/` before proceeding.

---

## Current success criteria

The current milestone is complete when:
- all 5 primary regions are wired from SVG path data
- debug mode exists
- hover works across all regions
- locked/public behavior works
- auth prompt flow is implemented
- mobile scenic interaction is testable

Anything beyond that is secondary right now.