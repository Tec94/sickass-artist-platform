# Store App Mode board spec

This file defines the Store App Mode v1 board that still needs to be created in
Pencil. It exists because the current Pencil editor bridge cannot keep an open
file handle long enough to execute `get_editor_state` or `batch_design`.

Use this document as the design contract until the board can be created in
Pencil.

For the concrete frame structure and layout blueprint, use
`designs/store-app-mode-v1-blueprint.md`.

## Objective

The board must redesign `/store/browse` as the first polished proof of the
shared estate-navigation model.

The Store shell must feel like part of the same world as the scenic Store scene,
but it must remain the faster and more practical interface for routine shopping.

This is not a generic merch grid reskin. It is the normal operating mode of the
Store section.

## Required frames

The board must include these frames before implementation work is considered
locked.

1. Desktop browse default
2. Desktop browse with filters active
3. Queue-active state
4. Mobile browse with drawer and filter access
5. Optional component references for product card and utility row

## Shared navigation requirements

The board must reflect the one-IA, two-entry-modes model.

- The global nav remains present and uses the canonical order:
  Explore Estate, Store, Events, Ranking, Campaign, Community.
- The Store shell must expose a clear return to scenic entry at `/store`.
- The Store shell must expose a clear return to the outer grounds at `/`.
- Store-local navigation must remain visible near the top of the section.

The Store-local scope is:

- Products
- Drops / Queue
- Cart
- Orders

## Required product modules

The board must preserve the working Store features that already exist in code.

- search
- sort
- filters
- filter chips
- queue state
- cart access
- recently viewed
- quick view, if retained
- upcoming drop and reminder entry

Do not design a board that requires removing working commerce behaviors unless
there is a deliberate product decision to do so.

## Desktop browse default frame

This frame is the main operational layout for `/store/browse`.

It must include:

- a restrained Store hero with scenic framing, not a full scenic takeover
- Store-local navigation
- a utility row with search, sort, filter access, and result context
- a persistent filter column or a clearly bounded filter panel
- a strong product-grid hierarchy
- visible queue or drop context without overwhelming the browse task

The visual hierarchy must prioritize browsing products quickly.

## Desktop filters-active frame

This frame shows how the shell behaves when filtering is in active use.

It must clarify:

- active filter chips
- filter section affordances
- price-range behavior
- density and spacing under a realistic filtered state

The goal is to ensure the design remains calm and readable when the page is not
in its clean default state.

## Queue-active frame

This frame shows the Store shell when the queue matters.

It must clarify:

- the queue state module
- the primary queue call to action
- the relationship between queue status and product browsing
- how locked or gated products read inside the grid or quick-view flows

The queue should feel important, but it must not collapse the rest of the Store
into a single promo panel.

## Mobile browse frame

This frame defines the handheld version of `/store/browse`.

It must show:

- the same top-level destination order in the mobile nav drawer
- a mobile-safe Store-local navigation treatment
- drawer or sheet access for filters
- a compact but readable utility row
- clear scenic return entry that does not dominate the screen

The mobile layout must simplify the shell without flattening its identity.

## Visual direction

The Store shell should feel like premium editorial commerce inside the ROA
estate world.

The design should feel:

- nocturnal
- restrained
- luxurious
- architectural
- tactile

The design should not feel:

- like a generic SaaS dashboard
- like a generic streetwear template
- like a fantasy game shop
- like a scenic wallpaper pasted behind ordinary cards

## Content and spacing guidance

The board must treat the shell as a layered system, not a single
undifferentiated page.

Recommended visual layers:

1. global app shell
2. Store-local navigation and section controls
3. utility row
4. queue or drop context
5. product browsing content

Use calmer, editorial surfaces for controls so the scenic identity supports the
commerce flow instead of competing with it.

## Implementation handoff

When the Pencil board is approved, implementation will primarily touch these
files:

- `src/pages/Merch.tsx`
- `src/components/Merch/StoreSectionNav.tsx`
- `src/components/Merch/MerchProductCard.tsx`
- related Store support components already used by the browse shell

Do not rebuild store data or queue logic for the redesign. The board is a shell
and hierarchy contract, not a backend rewrite.

## Current blocker

The current blocker is Pencil editor integration.

As of March 18, 2026, the following Pencil calls still fail after opening a new
document and after opening an explicit `.pen` file path:

- `get_editor_state`
- `batch_design`
- `get_style_guide_tags`

Each failure reports that a file needs to be open in the editor, even after a
document open call succeeds. Once that bridge is working, convert this spec into
the real `.pen` board and treat the board as the canonical design artifact.
