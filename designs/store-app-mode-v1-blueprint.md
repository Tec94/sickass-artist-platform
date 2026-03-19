# Store App Mode v1 blueprint

This file is the practical handoff for the Store App Mode v1 board while the
Pencil editor bridge is blocked. It translates the board spec into exact frame
structure, layout regions, and a step-by-step build order that can be recreated
in Pencil as soon as a `.pen` document can stay open.

Use this blueprint with `/docs/codex/08-store-app-mode-board-spec.md`. The
board spec defines the product contract. This blueprint defines the visual and
structural composition.

## Design intent

The Store shell must prove the shared estate-navigation model.

- Scenic Store entry at `/store` is the atmospheric branded entry.
- Store App Mode at `/store/browse` is the faster operational shell.
- The shell must feel like it belongs to the estate world, but it must prioritize
  browsing, filtering, queue comprehension, and purchase flow over spectacle.

The visual target is premium editorial commerce with a nocturnal, architectural
tone.

## Board frames

Create these frames in the board in this order.

1. `Store / Desktop / Browse Default`
2. `Store / Desktop / Filters Active`
3. `Store / Desktop / Queue Active`
4. `Store / Mobile / Browse`

Use a wide canvas with at least 160 pixels between frames.

## Frame sizes

Use these starting sizes for the first board pass.

- `Store / Desktop / Browse Default` = `1440 x 1600`
- `Store / Desktop / Filters Active` = `1440 x 1600`
- `Store / Desktop / Queue Active` = `1440 x 1660`
- `Store / Mobile / Browse` = `390 x 1200`

These heights are not final art locks. They are working sizes for the board.

## Shared desktop structure

All three desktop frames should use the same macro structure.

1. Global shell
2. Store-local navigation row
3. Hero and drop context region
4. Utility row
5. Main content split:
   - filter rail on the left
   - browse content on the right
6. Optional lower section for recently viewed or related browsing support

The screen must have one dominant region: the browse content column.

## Desktop browse default layout

Use this layout as the primary frame and the source for later variants.

### Region A - Global shell row

Place a restrained top shell row at the top of the frame.

- Height: `72`
- Width: full frame
- Content:
  - global nav placeholder on the left
  - utility actions on the right
- Tone:
  - quiet
  - low ornament
  - stable

This row should visually connect to the real app header, not compete with it.

### Region B - Store-local navigation and return controls

Place this directly below the top shell row.

- Height: `48`
- Content:
  - `Products`
  - `Drops / Queue`
  - `Cart`
  - `Orders`
  - secondary actions on the right:
    - `View Store Scene`
    - `Return to Grounds`

Treat this as a section rail, not a primary hero element.

### Region C - Hero and drop context

This is the first branded region inside the Store shell.

- Height: `240` to `280`
- Layout: two-column desktop split
  - left = editorial title and section intro
  - right = compact drop or reminder module

Visual direction:

- scenic framing from the Store scene image
- darkened overlays
- subtle warm and cool light accents
- no full scenic takeover

Content:

- eyebrow
- section title
- supporting copy
- upcoming drop status
- reminder CTA
- secondary queue or drop CTA

The hero should set mood and orientation, then get out of the way.

### Region D - Utility row

Place a sticky utility row below the hero.

- Height: `64` to `76`
- Content priority from left to right:
  - mobile filter trigger, when needed
  - search
  - sort
  - result count
  - cart summary or queue summary as compact status

This row must feel operational, not decorative.

### Region E - Main content split

Use a two-column layout.

- Left rail width: `252`
- Gap: `24`
- Right content: fill remaining width

#### Left rail

This is the filter column.

Stack these sections:

1. Category
2. Availability
3. Collection
4. Price

Use sectional cards or grouped panels, not loose controls.

#### Right column

Stack these zones:

1. active filter chips
2. optional queue or gating strip
3. product grid
4. recently viewed or support shelf

The product grid must carry the dominant weight.

### Region F - Product card language

Product cards should feel sharper and more editorial than generic ecommerce
tiles.

Required content hierarchy:

1. image
2. title
3. category or collection cue
4. price
5. stock or queue cue when relevant
6. quick action area

Use one consistent product card family across the board.

## Desktop filters-active variant

Duplicate the default frame and tune only what changes under active filtering.

The key differences must be:

- multiple active filter chips visible
- filter rail visually alive, but not louder than the product grid
- slightly denser product state under real browsing conditions
- search and sort still easy to scan

This frame is a stress test for hierarchy and spacing, not a separate design
language.

## Desktop queue-active variant

Duplicate the default frame and increase the weight of queue context without
letting it swallow the screen.

Changes to show:

- queue module in an active or admitted state
- gated product messaging where relevant
- clearer primary action in the queue module
- product area still usable and visible

The queue module should feel ceremonial and important, but the dominant region
must still be the Store browsing area.

## Mobile browse layout

The mobile frame must preserve the same hierarchy with one dominant column.

Use this order:

1. compact global shell
2. Store-local navigation treatment
3. hero and drop context
4. utility row
5. filter drawer trigger
6. active chips
7. product grid
8. recently viewed or support shelf

Key mobile rules:

- do not hide top-level destinations behind extra scenic-only layers
- make filter access obvious
- keep scenic return present but secondary
- avoid horizontal scrolling in the shell itself

## Visual system

Use these tone rules in the board.

### Palette direction

- base backgrounds: deep charcoal and black-blue
- panels: smoked slate glass or dark stone surfaces
- warm accent: muted amber or bronze
- cool accent: pale steel or moonlit cyan
- danger or queue urgency: restrained ember, not bright red

### Typography direction

- titles: high-contrast editorial serif or ceremonial display treatment
- controls and utility labels: cleaner supporting sans
- body copy: restrained, quiet, and legible

The contrast between editorial display and practical control text is important.

### Surface language

- sharp or softly chamfered corners
- layered glass, lacquer, or stone-like panels
- subtle inner glow or rim light
- no generic purple gradients
- no game-shop chrome

## Build order in Pencil

When Pencil is available again, build the board in this order.

1. Create the four board frames.
2. Build the desktop default frame completely.
3. Duplicate desktop default into filters-active and queue-active variants.
4. Adjust only the regions that materially change.
5. Build the mobile frame from the same hierarchy, not from a separate concept.
6. Add optional component references for:
   - local nav rail
   - utility row
   - product card
   - queue module

## Implementation mapping

Once the board is approved, these files are the main implementation targets.

- `src/pages/Merch.tsx`
- `src/components/Merch/StoreSectionNav.tsx`
- `src/components/Merch/MerchProductCard.tsx`
- `src/components/Merch/StoreReminderModal.tsx`
- any Store utility-row support already used by the browse shell

Do not rewrite store data, queue logic, or route ownership to satisfy the board.
The board must adapt the shell around the existing working logic.
