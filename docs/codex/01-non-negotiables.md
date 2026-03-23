# Non-Negotiables

> **Status:** Planned/unrouted architecture. This document describes the
> scenic/shared-IA track that still exists in source, but is not routed by the
> current website in `src/App.tsx`.

This file defines the decisions that are already locked.

Do not change these without explicit approval.

---

## 1. Camera and scene structure

- The main landing navigation scene uses a **slightly elevated isometric** camera.
- The interactive landing scene is the **outer grounds / estate courtyard**.
- The experience should not revert to a flat front-facing castle shot for the main interactive state.
- Wider establishing shots can exist for intros, but the navigable scene is the outer grounds.

---

## 2. Scenic navigation is core UX

- The scenic world is not decorative wallpaper.
- The estate scene is a primary navigation layer.
- Architectural regions correspond to application destinations.
- Region mapping must remain legible and intentional.

---

## 3. Region implementation must use SVG paths

- Region hit areas should use **SVG paths**, not rough guessed polygons.
- Paths should follow manually traced architectural silhouettes.
- The region path data must be reusable for:
  - hit detection
  - hover states
  - lock overlays
  - shimmer clipping
  - focus treatment

---

## 4. Locked/public distinction

- Some regions are public.
- Some regions are auth-gated.
- Locked regions must still be visible in the scene.
- Locked regions must not break public navigation flow.

Current auth-gated primary region:
- Community

Profile remains nested under Community in v1.

---

## 5. Auth flow

- Auth uses a **dedicated `/auth` route**.
- Clicking a locked region should open a compact auth prompt first.
- The auth prompt CTA should route to `/auth`.
- Successful auth should preserve or restore the user's intended destination.

---

## 6. Profile is not a primary landing region in v1

- Do not add Profile as a top-level mapped landing destination in the outer-grounds scene.
- Keep Profile nested inside Community until explicitly changed.

---

## 7. Mobile keeps the same world

- Mobile should keep the same scenic world.
- Do not replace the estate scene with a totally separate mobile homepage.
- Mobile may use horizontal pan / swipe.
- Mobile must have a clear fallback navigation control for constrained viewports.

---

## 8. A debug overlay mode is required

- There must be a debug mode that reveals:
  - region outlines
  - region ids
  - label anchors
  - arrow anchors
  - locked/public states

Without this, path tuning becomes unreliable.

---

## 9. Visual style constraints

The app should feel:
- luxurious
- nocturnal
- restrained
- editorial
- premium
- realistic
- immersive

The app should not feel:
- like a fantasy game HUD
- like a cartoon
- like a theme park
- like a generic SaaS dashboard
- like a cluttered concept-art screen
- like an over-glowing neon interface

---

## 10. Architectural realism over fantasy spectacle

Allowed:
- realistic palatial / estate architecture
- atmospheric lighting
- subtle grandeur
- restrained heraldic / old-world cues
- subtle modern luxury cues

Avoid:
- dragons
- giant magical effects
- exaggerated fantasy props
- busy medieval clutter
- ornamental overload that hurts readability

---

## 11. Restrained modern artist-coded details only

Modern luxury cues are allowed only when they feel diegetic and controlled.

Examples of acceptable modern cues:
- subtle premium vehicle presence
- restrained contemporary gate lighting
- high-end material language
- curated luxury object logic in later interior scenes

Not acceptable:
- random watches, chains, cars, and props everywhere
- obvious social-media flex clutter
- turning the estate into an Instagram collage

---

## 12. Interaction comes before polish

Do not prioritize:
- advanced transitions
- intro cinematics
- elaborate nav ornament
- sound polish
- hover sparkle polish

before:
- all regions are wired
- hover and locked states work
- auth flow works
- mobile behavior is validated

---

## 13. Region map must be stable

The current landing IA must be treated as locked unless explicitly revised.

Current intended map:
- Store = left wing
- Events = upper-left central palace block
- Ranking = top rear mass
- Campaign = center fountain court
- Community = right wing / tower mass

Do not casually remap these.

---

## 14. Back navigation must stay consistent

- The app needs a consistent easy-access back button across multiple pages.
- Back behavior must be route-aware, not naive browser-history-only behavior.
- Auth redirects and deep linking must not break the return experience.

---

## 15. Avoid premature tech escalation

- Do not default to WebGL for the core region interaction system.
- Do not overcomplicate with scene-tech that hurts maintainability before the core UX works.
- SVG path overlays are the baseline implementation.

---

## 16. Implementation should be configurable

Region data, anchor data, and visual-state data should be driven by config objects or clear constants.

Avoid:
- scattered hardcoded coordinates everywhere
- logic hidden in multiple components
- duplicated state behavior per region

---

## 17. Scene usability matters more than image perfection

The current estate scene is a provisional base image.

It is good enough for:
- interaction prototype
- path mapping
- navigation testing

It is not yet assumed to be the final shipping art.

Do not block navigation implementation waiting for perfect final art.
