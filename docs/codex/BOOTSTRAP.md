# Codex Bootstrap

## Read first
Read these files in this order before making changes:

1. `/docs/codex/00-project-overview.md`
2. `/docs/codex/01-non-negotiables.md`
3. `/docs/codex/06-current-state.md`
4. `/docs/codex/07-task-queue.md`

Do not start redesigning or refactoring before reading them.

---

## Project intent

This project is a music artist web app built around a navigable estate / castle world.

The landing experience is not a generic homepage. It is a scenic navigation layer. Users explore an outer-grounds estate scene and interact with mapped architectural regions that route them into parts of the application.

The experience should feel:
- nocturnal
- luxurious
- editorial
- immersive
- premium
- realistic
- atmospheric

It should not feel:
- like a fantasy game HUD
- like a generic SaaS dashboard
- like a medieval amusement-park website
- like a cluttered concept-art collage
- like a highly saturated gamer interface

---

## Locked decisions

These are already decided. Do not change them unless explicitly told to.

### World / camera
- The landing navigation scene uses a **slightly elevated isometric** camera.
- The landing scene is the **outer grounds / estate courtyard**, not a frontal flat castle shot.
- A wider establishing shot may exist for intro/transition use, but the main interactive landing scene is the outer-grounds view.

### Navigation model
- The landing scene contains mapped interactive regions.
- The current primary region set is:
  - Store
  - Events
  - Ranking
  - Campaign
  - Community
- Profile is **not** a primary landing region in v1.
- Profile should be nested inside Community after entry.

### Auth model
- Auth uses a **dedicated `/auth` route**.
- Locked regions do not hard-block the whole experience.
- Clicking a locked region should open a compact auth prompt, then route to `/auth`.
- After successful auth, the user should be able to return to the intended destination.

### Desktop + mobile
- Mobile keeps the **same scenic world**, not a totally different mobile-only redesign.
- Mobile should support horizontal pan / swipe behavior where appropriate.
- Mobile must have a clear fallback navigation control when scenic exploration becomes too constrained.

### Interaction model
- Region mapping uses **SVG paths**, not rough guessed polygons.
- A debug overlay mode is required during implementation.
- Advanced transitions should come after the core region interaction system is stable.

### Visual tone
- Realistic architecture
- Restrained modern luxury cues
- No excessive fantasy effects
- No game-like glowing loot markers everywhere
- No cluttered UI stacked on top of the scene

---

## Current implementation goal

The current goal is to build the estate navigation system on top of the approved provisional scene.

That means:
- render all region SVG paths
- wire hover / active / locked states
- place labels and anchor cards
- place directional cues
- support auth-gated regions
- support debug mode
- test mobile interaction model

Do not jump ahead to final polish or cinematic transitions before this works.

---

## Current implementation priority

Work in this order:

1. full multi-region SVG overlay
2. debug overlay mode
3. hover / active / locked interaction states
4. auth prompt flow
5. region card / anchor positioning
6. mobile tap + pan behavior
7. visual polish and effects
8. transitions and intro animation

---

## Avoid

Do not do the following without explicit instruction:

- do not redesign the information architecture
- do not move regions around casually
- do not replace SVG paths with simple polygons
- do not introduce WebGL as the default solution
- do not add advanced intro transitions before region interactions work
- do not over-style the navbar before core navigation is stable
- do not convert the site into a generic dashboard-first experience
- do not flood the scene with decorative modern props
- do not change the camera away from slightly elevated isometric

---

## Output style for implementation

When making changes:
- keep code modular
- preserve debuggability
- expose constants/config for region paths and anchors
- prefer clean, inspectable React code
- do not bury region logic inside magic numbers scattered across files
- keep motion and styling configurable

If a decision is unclear, prefer preserving the already locked direction rather than inventing a new one.