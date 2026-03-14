# Region Map

This file defines the current estate-scene region map for the landing navigation system.

This is the canonical source for:
- region ownership
- page routing
- lock/public state
- label naming
- anchor intent
- interaction meaning

Do not change this mapping casually. If the scene composition changes, update this file deliberately.

---

## Scene basis

The current landing scene is the **outer grounds / estate courtyard** shown from a **slightly elevated isometric** angle.

The scene is not just background art. It is the scenic navigation layer for the app.

Users should understand that different architectural masses correspond to different product destinations.

---

## Primary landing regions

The current v1 landing region map is:

- **Store** — left estate wing
- **Events** — upper-left central palace block
- **Ranking** — top rear palace mass
- **Campaign** — center fountain court
- **Community** — right private wing / tower mass

Profile is not a primary landing region in v1.

---

## Region meanings

### Store
The left estate wing represents commerce, drops, merch, and physical goods.

It should feel:
- accessible
- visible
- product-forward
- public

Visual reading:
- strong, self-contained building mass
- easy to target
- clearly separate from the center court

Routes:
- `/store`

Access:
- public

---

### Events
The upper-left central palace block represents live dates, appearances, and event-driven gathering.

It should feel:
- social
- active
- arrival-oriented
- event-focused

Visual reading:
- prominent palace mass
- tied to steps and movement
- more elevated than Store, but not as distant as Ranking

Routes:
- `/events`

Access:
- public

Important note:
This mapping was intentionally revised from an earlier “bottom arrival axis = events” idea. The current working map puts Events on the upper-left central palace block. Treat this as the active v1 decision unless explicitly changed.

---

### Ranking
The top rear palace mass represents charts, hierarchy, standings, and competitive prestige.

It should feel:
- elevated
- aspirational
- colder
- more distant
- more ceremonial than social

Visual reading:
- uppermost mass
- visually prestigious
- reads as “above” the rest of the estate

Routes:
- `/ranking`

Access:
- public

---

### Campaign
The center fountain court represents the current featured release, campaign, or artist spotlight.

It should feel:
- central
- current
- ceremonial
- high-attention
- campaign-driven

Visual reading:
- fountain as focal anchor
- stairs and surrounding court as central stage
- visually most legible focal zone in the composition

Routes:
- `/campaign`
- or a campaign-specific destination if campaign routing is dynamic

Access:
- public

Important note:
Campaign is the only region that may need to change routing target over time without changing its place in the scene. The **spatial role stays the same**, but the destination may point to the current release, rollout, project, or featured editorial moment.

---

### Community
The right wing / tower mass represents the private member / fan community layer.

It should feel:
- private
- gated
- exclusive
- inward-facing
- more restricted than the rest of the estate

Visual reading:
- tower / private wing
- more fortress-like
- separate from the public zones
- visually appropriate for auth gating

Routes:
- `/community`

Access:
- auth required

Important note:
Community is the primary auth-gated landing destination in v1.

---

## Nested destinations

These are not primary outer-grounds landing regions in v1.

### Profile
Profile should remain nested inside Community.

Possible nested routes:
- `/community/profile`
- `/community/me`
- `/profile` only if architecture later requires it

But visually, Profile does **not** get its own primary estate region in v1.

Reason:
- the scene is already dense
- adding another top-level landing hit area would reduce clarity
- Community is the correct umbrella destination for gated member features

---

## Region interaction model

Each primary region needs:

- SVG path hit area
- hover state
- active / selected state
- label card
- directional cue
- click behavior
- optional locked-state treatment

The path data should follow manually traced architectural silhouettes, not guessed polygons.

---

## Public vs locked state

### Public regions
These should navigate immediately when activated:
- Store
- Events
- Ranking
- Campaign

### Locked region
This should require auth:
- Community

Locked-state behavior:
- region remains visible
- region still participates in scenic navigation
- click opens compact auth prompt
- auth CTA routes to `/auth`
- successful auth should preserve return intent

---

## Desktop interaction behavior

On desktop, each region should support:

- hover highlight
- label card reveal
- directional cue emphasis
- click / enter navigation
- debug overlay visualization when enabled

Hover should feel:
- premium
- restrained
- controlled
- not game-like
- not overly flashy

The interaction should reinforce that the user is exploring a world, not clicking random boxes.

---

## Mobile interaction behavior

On mobile, the same scene stays in use.

Mobile should support:
- touch focus
- tap-to-reveal or tap-to-focus state
- follow-up tap to enter if necessary
- horizontal pan / swipe if needed
- fallback navigation access for constrained views

The scenic world should not be discarded on mobile. The interaction model must adapt without abandoning the concept.

---

## Label naming

Current working labels:

- Store
- Events
- Ranking
- Current Release
- Community

Optional eyebrow/sub-labels:

### Store
- Merch Wing
- Drop Room
- Estate Shop

### Events
- Lower Court
- Gathering Hall
- Arrival Court

### Ranking
- Upper Hall
- Honors Wing
- Ranking Chamber

### Campaign
- Current Release
- Featured Rollout
- Center Court

### Community
- Members Wing
- Private Wing
- Community

Keep labels short. Do not turn them into verbose UI copy.

---

## Region card content rules

Each region card may contain:
- eyebrow
- title
- short supporting descriptor

Example pattern:
- eyebrow: `LOWER COURT`
- title: `EVENTS`
- support: `ArrivalCourt`

This should remain compact and atmospheric.

Do not make region cards feel like generic dashboard tooltips.

---

## Anchor logic

Each region requires:
- label anchor
- directional cue anchor
- optional card offset rules

Anchor placement should:
- stay readable
- avoid covering key architecture
- avoid piling all cards in the center
- preserve scene legibility

Anchor tuning is expected after live implementation.

---

## Hit area rules

The region hit areas should follow these principles:

### Store
Should mainly own:
- left main building mass
- left lower facade
- enough adjacent volume to feel coherent

Should not spill too aggressively into the center court.

### Events
Should mainly own:
- upper-left central palace mass
- facade and main steps tied to that destination
- enough terrace logic to feel self-contained

Should not absorb Ranking or the center Campaign court.

### Ranking
Should mainly own:
- top rear palace mass
- elevated rear facade and roof mass

Should not absorb too much of the right-side private wing.

### Campaign
Should mainly own:
- fountain court
- immediate surrounding paving
- immediate stage-like center geometry

This will likely be the most irregular path.

### Community
Should mainly own:
- right tower
- right private wing
- adjacent private facade mass

Should not dominate too much of the center court.

---

## Path implementation rules

- Store, Events, Ranking, Campaign, and Community should be driven by SVG path data
- do not revert to rough polygons
- use one path or multiple grouped paths if needed
- maintain a shared coordinate system / viewBox
- keep debug mode available while tuning

---

## Current open tuning areas

These are implementation tuning areas, not mapping changes:

- exact label anchor positions
- exact arrow anchor positions
- whether Campaign needs one complex path or multiple grouped subpaths
- whether Community needs one path or two grouped path segments
- exact mobile tap behavior

These should be solved without changing the main region-to-page map.

---

## If the scene changes later

If the base scene art changes:
1. keep this mapping unless there is a deliberate IA decision
2. retrace paths if necessary
3. update path assets
4. retune anchors
5. do not silently change destination ownership

The spatial map is product architecture, not just visual decoration.