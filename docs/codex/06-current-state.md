# Current State

This file describes the present implementation state and what is already decided.

---

## Current scene status

The project currently has a provisional outer-grounds estate scene that is good enough for interaction prototyping.

The scene is now at the stage where:
- the overall composition is usable
- major architectural masses are readable
- the center court is clear
- left / top / right / center destination zoning is viable

The scene is not yet the final art lock. It still contains some AI-generated micro-detail issues, but those are now secondary to interaction validation.

---

## Current implementation status

The homepage currently includes:
- the estate scene rendered on the page
- early top navigation
- at least one working highlighted region treatment
- proof that a mapped hover state can visually work on the scene

This means the project has moved beyond concept planning and into system implementation.

---

## Region mapping status

The initial guessed polygon overlays were not accurate enough.

Because of that, manual region tracing work was started.

The current path workflow is:
- colored region overlays were created manually
- those colored regions were converted into traced path shapes
- at least one region SVG path has already been exported and verified as structurally usable
- the system should now move from guessed polygons to **SVG path-driven mapping**

This is a major implementation milestone.

---

## Current intended primary region map

The current intended landing regions are:

- **Store** — left wing
- **Events** — upper-left central palace block
- **Ranking** — top rear palace mass
- **Campaign** — center fountain court
- **Community** — right wing / tower mass

Profile is still nested under Community and is not a primary landing region in v1.

This mapping should now be treated as the working IA unless explicitly changed.

---

## Current technical direction

The correct technical approach is now:

- scene image as background
- full-size SVG overlay above the image
- one SVG path per mapped region
- region data stored in config
- debug mode for inspecting paths and anchors
- hover / active / locked states driven by path data
- locked click behavior routed through auth prompt then `/auth`

Do not go back to rough polygon approximation.

---

## Current highest-priority task

The current highest-priority task is:

### Build the complete multi-region navigation system

That means:
- wire all region SVG paths
- render them in one overlay system
- support hover states for every region
- support active state
- support locked state for auth-gated regions
- support region cards / labels
- support arrow anchors / directional cues
- support debug mode

This must be finished before advanced polish.

---

## What is not done yet

The following are not yet complete:

- all region paths fully wired into the live page
- final anchor placement tuning
- full locked-state treatment
- compact auth prompt flow
- mobile touch / pan behavior
- consistent region-card behavior across all mapped zones
- debug overlay mode
- final scene polish
- final sound and shimmer effects
- cinematic transitions

---

## Current risks

### 1. Region accuracy
The main current risk is not concept direction. It is implementation precision.

The mapped regions must:
- feel intuitive
- align with the visual scene
- not overlap in confusing ways
- not swallow each other during hover

### 2. Mobile scenic interaction
The desktop concept is clearer than the mobile version right now.

The mobile version still needs:
- tap logic
- pan logic
- fallback menu logic
- touch-friendly discoverability

### 3. Locked-state usability
The locked region treatment must be visible enough to communicate gating, but not so aggressive that it feels broken or hostile.

### 4. Over-polishing too early
The project is at risk if polish is prioritized before core interaction stability.

That means:
- no advanced scene transitions yet
- no final audio polish yet
- no over-styled nav treatment yet

---

## Current implementation success criteria

The current milestone is successful when:

- all five regions render from SVG path data
- each region can be hovered or focused
- each region has a consistent card / label system
- public regions route correctly
- locked regions open the auth prompt correctly
- debug mode works
- mobile interaction is at least testable

Once that milestone is reached, then the project can move into:
- polish
- transitions
- final asset refinement

---

## Immediate next step

The immediate next step is to finish wiring the region-path system into the live page and validate the full landing navigation layer.

That is the current build focus.