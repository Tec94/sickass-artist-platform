# Design system

> **Status:** Current website. This file describes the live design language
> first and then points to the scenic/shared-IA design track as planned or
> unrouted work.

## Summary

The current website uses an editorial ROA archive language built from the live
prototype screens under `src/pages/StitchPrototypes`. It is best described as
`Parchment and Ink`: tactile surfaces, sharp rules, serif headlines, quiet
utility typography, and terracotta accent cues.

The scenic/shared-IA design system still exists in `docs/codex/03-design-system.md`,
but that file does not describe the current live route contract.

## Current website design language

The live website centers on these ideas:

- collected, archival, and editorial rather than glossy SaaS
- vellum and parchment surfaces instead of flat grayscale panels
- ink-based framing instead of soft gray borders
- restrained terracotta for emphasis, not full-page saturation
- sharp architectural edges instead of rounded card systems

This language is visible across the live routes in `src/App.tsx`, especially in
the prototype screens under `src/pages/StitchPrototypes`.

## Core palette

The current website relies on a small, deliberate palette:

- **Terracotta:** `#C36B42`
- **Parchment:** `#F4EFE6`
- **Vellum:** `#FAF7F2`
- **Ink:** `#3C2A21`
- **Muted ink:** `#8E7D72`
- **Structural depth:** `#D1C7BC`

Use these colors to create hierarchy. Do not replace them with generic gray
UI kit colors unless the design direction changes intentionally.

## Typography

The current website pairs expressive serif headlines with disciplined sans
utility text.

- Serif display and headline text carries the brand voice.
- Sans body and label text keeps interfaces readable.
- Wide uppercase labels and metadata are part of the core identity.

Typography should feel editorial and deliberate, not technical or toy-like.

## Layout and surfaces

The live screens use an editorial layout model rather than a dashboard card
grid.

- Surfaces are layered through tone shifts between parchment and vellum.
- Heavy ink rules are used for framing and section structure.
- Components stay sharp-cornered.
- White space and alignment do more work than shadows.

The main visual rule is restraint. The interface should feel designed, not
decorated.

## Interaction language

The current website uses understated interaction patterns:

- hover and focus states are quiet and clear
- terracotta is used for emphasis and action
- motion supports transitions, not spectacle
- borders, rules, and spacing carry hierarchy before shadows do

Avoid:

- large-radius generic cards
- purple-on-white defaults
- neon glow or game-like ornament
- overuse of glassmorphism

## Current page families

The live routed app currently includes three broad visual families.

### Archive and editorial screens

These are the main prototype pages under `src/pages/StitchPrototypes`. They
carry the current ROA archive identity most clearly.

### Mobile and alternate-view screens

Routes such as `/events-mobile`, `/dashboard-mobile`, and
`/access-tiers-mobile` remain part of the live router and should stay visually
related to the main archive system.

### Access screen

`/login` is part of the current routed experience and follows the same archive
language rather than using a plain utility auth shell.

## Planned and unrouted scenic track

The repo still contains a scenic/shared-IA design track. Use these files only
when a task explicitly targets that work:

- `docs/codex/01-non-negotiables.md`
- `docs/codex/02-region-map.md`
- `docs/codex/03-design-system.md`
- `docs/codex/08-store-app-mode-board-spec.md`

That track is still valuable, but it is not the current website contract.

## Working rules

When you design or restyle live routes:

1. start from the archive/editorial system described here
2. preserve the parchment, vellum, ink, and terracotta hierarchy
3. keep typography sharp and intentional
4. treat scenic/shared-IA docs as planned work unless the router changes
