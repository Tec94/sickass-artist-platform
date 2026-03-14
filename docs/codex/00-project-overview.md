# Project Overview

## Summary

This project is a music artist web application built around a scenic, navigable estate world.

The landing page is not a conventional hero section with cards layered on top. It is an interactive architectural scene that acts as the user's primary navigation entrypoint.

Users should feel like they are entering a private estate that reflects the artist's world:
- luxury
- privacy
- night energy
- prestige
- intimacy
- ritual
- exclusivity
- editorial cool

The product combines:
- public artist discovery
- campaign / album promotion
- store / merch
- events
- rankings / charts
- authenticated community features

---

## Core concept

The app uses an estate / castle environment as the visual navigation layer.

The user lands on an outer-grounds scene rendered from a slightly elevated isometric angle. Distinct architectural regions are interactive and route users to different sections of the application.

This is inspired by scenic spatial navigation rather than flat menu-only navigation.

The landing image should function as:
- worldbuilding
- mood setting
- wayfinding
- page routing
- campaign showcase

It should not become a puzzle. The system must remain readable and intuitive.

---

## Core user experience

### Public users
Public users can:
- view the scenic landing world
- navigate public regions
- see auth-only regions visually
- click locked regions and be prompted to sign in / sign up

### Authenticated users
Authenticated users can:
- access community features
- move from scenic navigation into deeper app destinations
- access private or gated sections
- return back to the scenic hub

---

## Current scenic navigation map

The current landing scene is the outer grounds of the estate.

The currently intended primary mapped destinations are:

- **Store** — left estate wing
- **Events** — upper-left central palace block
- **Ranking** — top rear palace mass
- **Campaign** — center fountain court
- **Community** — right private wing / tower mass

Profile is not a primary landing destination in v1 and should remain nested under Community.

---

## World design direction

The visual identity should feel like a collision of:
- aristocratic architecture
- nocturnal luxury
- cinematic editorial framing
- artist-world exclusivity
- subtle modern status cues

The environment should be realistic enough to feel inhabitable and premium, but stylized enough to support brand mood and scenic navigation.

Key mood words:
- midnight
- private
- expensive
- cold air
- torchlight
- stone
- glass
- shadow
- polished metal
- ritual
- prestige
- silence
- anticipation

---

## What makes this different

This is not just a themed skin over a normal website.

The spatial world is part of the product architecture.

The scene must:
- help users navigate
- clarify what is public vs locked
- support hover/tap discoverability
- communicate hierarchy
- support campaign storytelling

That means scenic beauty alone is not enough. The image must be structurally usable.

---

## Product sections

### Public-facing
- landing scene / estate navigation
- campaign / current release
- store
- events
- ranking

### Auth-required
- community
- nested profile / member-specific destinations
- deeper community utilities

---

## Technical model

The landing navigation should be driven by:
- a base scene image
- SVG path overlays for mapped regions
- region config objects
- hover / active / locked visual states
- anchor positions for labels and directional cues
- auth-gated click behavior
- mobile adaptations for touch and pan

This means the scene is not hardcoded by pixel-magic everywhere. It should be data-driven enough to maintain.

---

## Implementation philosophy

The correct implementation sequence is:
1. get the region interaction system working
2. validate usability
3. refine path accuracy and anchors
4. add polish effects
5. add transitions and cinematic enhancements

Not the other way around.

A polished but unstable interaction model is failure.

A simpler but robust navigation layer is the correct foundation.

---

## Long-term vision

The estate scene is the beginning of a broader spatial brand system.

Possible later extensions:
- establishing intro shot
- gate-opening transition
- room-specific scenes for destinations
- animated environmental cues
- richer campaign staging
- seasonal / era-based scene swaps

These are future layers. They should not destabilize the core scenic navigation system.