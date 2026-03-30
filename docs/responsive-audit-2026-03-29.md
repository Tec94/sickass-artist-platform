# Responsive audit for active prototype routes

This audit covers every route mounted by [App.tsx](/c:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/src/App.tsx)
on March 29, 2026. It focuses on the currently live prototype route set in
`src/pages/StitchPrototypes`, plus the shared shells that affect every route.
The goal is to identify where the current layouts are desktop-biased, which
elements are likely to break on smaller viewports, and what each page should
do at mobile, tablet, and desktop sizes.

## Scope and breakpoint contract

The current codebase mixes fixed-width editorial layouts, split panes, and a
few dedicated mobile-only routes. That creates drift: a page can look good on
desktop while its mobile counterpart lives on a separate route and never stays
in sync. The safest path is to move toward one responsive page per domain,
keep the dedicated mobile routes only as short-lived reference implementations,
and standardize how each breakpoint behaves.

- `Base (<640px)`: Default to a single-column flow, bottom sheets instead of
  side rails, horizontal chip scrollers for dense filters, and sticky bottom
  CTA bars for commerce and submission tasks.
- `sm (640px-767px)`: Allow two-up micro-grids, landscape phone refinements,
  and wider card actions, but keep the information hierarchy mobile-first.
- `md (768px-1023px)`: Reintroduce secondary panes, summary cards, and split
  forms, but avoid permanent fixed sidebars that consume a quarter of the
  canvas.
- `lg (1024px-1279px)`: Restore editorial split-pane layouts, sticky desktop
  rails, and dense comparison tables.
- `xl (1280px+)`: Keep the full desktop treatments, mega menus, and wide data
  ledgers.

## Shared updates

Several layout issues are repeated across the site. Fixing these shared
patterns first will remove a large part of the responsive debt before the
individual page work starts.

- `SharedNavbar`: Replace the always-visible desktop nav with a compact mobile
  shell below `lg`. The current horizontal nav, `px-8`, and 820px mega menu
  in
  [SharedNavbar.tsx](/c:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/src/components/Navigation/SharedNavbar.tsx)
  need a drawer or sheet pattern on smaller screens.
- `SearchOverlay`: Convert the three-column overlay to a one-column stack on
  `Base` and `sm`. The current `text-3xl` input, `px-8`, and `md:grid-cols-3`
  layout in
  [SearchOverlay.tsx](/c:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/src/components/Navigation/SearchOverlay.tsx)
  will feel oversized and cramped on small phones.
- `CheckoutOverlay`: Use a bottom sheet on `Base` and `sm`, then a right-side
  drawer from `md` upward. The fixed 400px side panel in
  [CheckoutOverlay.tsx](/c:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/src/components/Navigation/CheckoutOverlay.tsx)
  is still too wide for some mobile widths and creates a tunnel effect on
  landscape phones.
- Viewport height handling: Replace `h-screen`, `h-[calc(100vh-72px)]`, and
  hard `overflow-hidden` shells with `min-h-[calc(100dvh-72px)]` plus explicit
  inner scroll regions. Several pages currently lock the whole viewport and
  rely on one child pane to scroll, which breaks keyboard, address-bar, and
  safe-area behavior on mobile browsers.
- Fixed side rails: Convert hard widths like `w-[320px]`, `w-[400px]`,
  `w-[250px]`, and `w-[35%]` to `lg` or `xl` desktop-only patterns. On
  `Base`, the same content should become stacked sections, accordions, or
  bottom drawers.
- Editorial typography: Replace large one-off sizes with `clamp()` tokens on
  hero titles, page headlines, and big CTA labels. The site relies on several
  `text-5xl`, `text-6xl`, `text-7xl`, and `text-9xl` headings that are too
  brittle below tablet widths.
- Pretext findings: The probe in
  [pretext-responsive-probe.html](/c:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/scripts/pretext-responsive-probe.html)
  showed `The Royal Albert Hall` breaking to two lines at 320px and 375px, the
  `THE ROYAL ALBERT HALL EXHIBITION` heading expanding to six lines at 320px
  and 375px, and `Search the Estate Archives...` wrapping to two lines at
  320px. Those three strings alone justify moving hero and overlay text to
  `clamp()`-based scales with width-aware max sizes.
- Duplicate route strategy: `AccessTiersMobile`, `EventsMobile`,
  `ExperienceMobile`, and `DashboardMobile` should either stay as reference
  prototypes only, or the desktop routes should absorb their mobile behavior so
  there is a single responsive page per experience.
- Pretext adoption: Use
  [pretext-responsive-probe.html](/c:/Users/caoda/Desktop/general/code/projects/sickass-artist-platform/scripts/pretext-responsive-probe.html)
  as the start of a text-fit sanity check workflow. It is useful for validating
  hero headings, long CTA labels, and filter chips before locking font sizes.

## Page audit

This section lists the route-by-route responsive work. Each page includes the
elements that currently need attention and the expected behavior at smaller and
larger breakpoints.

### Journey

`Journey.tsx` is still desktop-first because it treats the route as a permanent
split shell with a 400px left rail and a full-screen visual scene on the
right.

- `Base (<640px)`: Collapse the two-column shell into a single flow. Show the
  route list first, then the scene canvas, or put the destination list behind a
  bottom sheet so the scene is still reachable.
- `sm` and `md`: Keep the progress meter, list, and primary CTA visible, but
  avoid locking the scene to the viewport height. The scene should become a
  normal block below the list instead of a separate full-height pane.
- `lg+`: Keep the editorial two-column treatment, but change the fixed 400px
  rail to a fluid value such as `minmax(320px, 30vw)` so midsize laptop widths
  do not feel pinched.

### Dashboard

`Dashboard.tsx` is one of the least responsive pages in the route set. The
65/35 desktop split, fixed hero typography, and nested card grids assume a
wide canvas.

- `Base (<640px)`: Stack the hero, status rail, updates, and merch modules into
  one scroll column. Remove the 65/35 split, hide the divider rule, and turn
  the right rail into ordinary cards below the hero.
- `sm` and `md`: Allow a two-column subgrid only for the lower cards. Keep the
  hero copy full width and reduce the `text-[72px]` heading to a `clamp()`
  scale.
- `lg+`: Keep the split layout, but replace width percentages with CSS grid
  columns so the main content and utility rail stay balanced.

### Archive

`Archive.tsx` combines a fixed sidebar, giant hero copy, a podium column, and a
12-column ledger. It will not translate cleanly to mobile without structural
changes.

- `Base (<640px)`: Replace the fixed left sidebar with a compact top tab strip
  or overflow scroller. Turn the ledger table into stacked cards with title,
  artist, circulation, and trend rows.
- `sm` and `md`: Keep the podium cards on top and the ledger below. Let the
  metadata strip wrap, and reduce the `text-6xl` and `text-8xl` headline scale.
- `lg+`: Restore the current editorial sidebar and 12-column ledger once there
  is enough width for all columns to stay legible.

### Rankings

`Rankings.tsx` already hides the right rail below `xl`, but the main ledger
still uses dense row layouts that need stronger mobile treatment.

- `Base (<640px)`: Convert member and song rows from four-column ledgers into
  stacked cards. Keep rank, identity, and score visible at the top of each
  card, and move secondary metadata underneath.
- `sm` and `md`: Keep the summary cards in one or two columns, but let the tab
  buttons and board summary breathe. The current `px-6` and dense uppercase
  labels are still tight on smaller tablets.
- `xl+`: Keep the current right rail, but ensure its content does not become a
  dependency for actions that must remain visible on smaller screens.

### Ranking submission

`RankingSubmission.tsx` is structurally close to responsive already, but it
still assumes too much vertical space and desktop drag-and-drop density.

- `Base (<640px)`: Keep the route as a single column, but add a sticky bottom
  submit bar so the primary action stays visible while scrolling ranked slots
  and the song pool.
- `sm` and `md`: Keep the ranked list above the pool. Avoid the two-column
  available-song grid until there is enough width for card actions and titles
  to remain readable.
- `xl+`: Keep the side context rail, but treat it as optional information. The
  release context, embed, and pool metadata should still be understandable when
  that rail is absent.

### Profile

`Profile.tsx` is effectively a desktop overlay composition with a fixed 400px
utility panel and a decorative background scene behind it.

- `Base (<640px)`: Convert the page to a full-screen panel, remove the
  background bleed and `pr-[400px]` hack, and let the tab content own the full
  width.
- `sm` and `md`: Keep the back button and header actions pinned, but reduce the
  panel width logic. The settings and reward cards should become full-width
  stacks with more breathing room.
- `lg+`: Keep the side panel aesthetic, but make the rail width fluid instead
  of hard-coded to 400px.

### Community

`Community.tsx` is another fixed-rail desktop treatment. The 320px sidebar,
sticky header, and thread rows need a mobile-first rewrite.

- `Base (<640px)`: Replace the sidebar with a horizontal category scroller or a
  filter sheet. Stack the thread card content so reply counts move below the
  title and metadata instead of sitting on the far right.
- `sm` and `md`: Keep the search field full width on its own row. The current
  `w-64` inline search box is too rigid inside the sticky header.
- `lg+`: Restore the two-pane forum shell with the left category rail and right
  thread list.

### Campaign

`Campaign.tsx` is one of the healthier pages, but the current desktop spacing
still needs refinement below tablet widths.

- `Base (<640px)`: Stack the release metrics, CTA buttons, and the campaign
  state sidebar into one column. Make all primary actions full width.
- `sm` and `md`: Keep the campaign state card beside or below the hero based on
  content length, not a fixed layout assumption. The current iframes and social
  cards should use aspect ratio instead of fixed 380px heights where possible.
- `xl+`: Keep the split layout with the side summary and social rail.

### Store

`Store.tsx` already has separate desktop and mobile filter patterns, but the
product grid and card sizing are still too rigid.

- `Base (<640px)`: Keep the horizontal category chips, but make the product
  cards auto-height instead of fixed `h-[450px]`. Mobile cards should prioritize
  image, title, price, and a full-width add action.
- `sm` and `md`: Use an auto-fit product grid instead of manually stepping from
  one to two to three columns. The header stats should wrap below the hero copy
  instead of sitting in a rigid row.
- `lg+`: Keep the desktop filter sidebar, but allow it to collapse on smaller
  laptops so the product grid gets more useful width.

### Store product detail

`StoreProductDetail.tsx` is functional on small screens, but it still reads
like a collapsed desktop layout instead of a truly mobile-first detail page.

- `Base (<640px)`: Turn the thumbnail column into a horizontal scroller, reduce
  the image stage height, and add a sticky bottom purchase bar with price,
  quantity, and add-to-cart state.
- `sm` and `md`: Keep the side rail content stacked below the media gallery,
  but split the quantity and add-to-cart controls only when the row can stay
  tap-friendly.
- `xl+`: Keep the three-column detail shell with the large image stage,
  thumbnails, and fixed side rail.

### New post

`NewPost.tsx` mixes a desktop composer canvas with a separate fixed mobile
bottom nav. The desktop structure needs to degrade more gracefully.

- `Base (<640px)`: Turn the left tools rail into a disclosure section above the
  editor. Keep the fixed bottom navigation, but move publish and save actions
  into a sticky bottom action bar.
- `sm` and `md`: Keep the composer header and editor in one scroll flow. Avoid
  locking the editor into `h-[calc(100vh-72px)]` shells while the keyboard is
  open.
- `lg+`: Restore the split sidebar plus editor composition.

### Access tiers mobile

`AccessTiersMobile.tsx` is already mobile-first, so the work here is about
polish and edge cases rather than a structural rewrite.

- `Base (<640px)`: Add `env(safe-area-inset-bottom)` and
  `env(safe-area-inset-top)` padding to the fixed header and footer. The bottom
  nav currently risks colliding with device chrome on modern phones.
- `sm` and landscape phones`: Increase spacing between the ticket controls and
  keep quantity steppers at least 44x44.
- `md+`: Decide whether this route should stretch to tablet widths or redirect
  to the responsive desktop ticket route once that route is corrected.

### Access tiers Albert

`AccessTiersAlbert.tsx` is still a desktop ticket table with a side checkout
rail. It needs a full mobile conversion.

- `Base (<640px)`: Replace the 12-column ticket table with stacked ticket cards
  that show tier, price, and quantity controls in a vertical flow. Move the
  checkout summary into a sticky bottom drawer.
- `sm` and `md`: Keep the hero shorter, clamp the `Bebas Neue` title, and let
  the summary card follow below the ticket list instead of pinning beside it.
- `lg+`: Restore the two-column ticket list plus sticky checkout rail.

### Experience mobile

`ExperienceMobile.tsx` is also mobile-first already, but it still needs safe
area and landscape refinement.

- `Base (<640px)`: Add safe-area padding to the bottom nav and confirm that the
  hero image plus body copy do not disappear behind the fixed footer.
- `sm` and landscape phones`: Let the main hero block reduce height so the
  page does not feel top-heavy.
- `md+`: Decide whether the route remains a phone-only preview or becomes part
  of a unified responsive exhibition page.

### Experience Albert

`ExperienceAlbert.tsx` contains one of the heaviest editorial layouts in the
app: a 600px hero, multi-column content grid, ticket form, and rules list.

- `Base (<640px)`: Reduce the hero height, clamp the `text-6xl` and `text-9xl`
  headline scale, and stack the entire content grid into one column.
- `sm` and `md`: Keep the map, ticket form, and protocol sections in sequence
  rather than a multi-column matrix. The ticket CTA should stay sticky or
  visually prominent while the form scrolls.
- `lg+`: Restore the current grid, but allow side modules to grow and shrink
  with `minmax()` instead of hard proportion assumptions.

### Events mobile

`EventsMobile.tsx` is mostly aligned with its viewport, but it still needs the
same mobile polish as the other mobile-specific routes.

- `Base (<640px)`: Add safe-area padding to the fixed header and footer, and
  confirm the card stack has enough bottom padding for the final item to clear
  the nav.
- `sm` and landscape phones`: Let the hero and card spacing tighten slightly so
  more than one event card is visible above the fold.
- `md+`: Decide whether this route still needs to exist once `Events.tsx`
  becomes fully responsive.

### Events

`Events.tsx` is a clean desktop editorial list, but its 80px event rows are too
compressed for smaller widths once text and CTAs start wrapping.

- `Base (<640px)`: Convert each event row into a stacked event card with date,
  venue, location, and RSVP action laid out vertically.
- `sm` and `md`: Keep the year grouping, but allow the date, venue, and CTA
  columns to reflow into two lines instead of forcing a strict three-part row.
- `lg+`: Keep the current centered list treatment.

### Dashboard mobile

`DashboardMobile.tsx` is close to ready, but it still needs shared mobile
polish to behave reliably on real devices.

- `Base (<640px)`: Add safe-area padding to the fixed bottom nav and verify the
  hero text plus progress UI do not collide with the device home indicator.
- `sm` and landscape phones`: Tighten the hero aspect ratio and let lower cards
  move into a two-up grid.
- `md+`: Decide whether the route remains a standalone mobile prototype or is
  replaced by a single responsive dashboard page.

### Login

`Login.tsx` is mostly centered-card responsive, but it still needs keyboard and
small-height handling.

- `Base (<640px)`: Reduce outer padding, keep the card edges visible, and allow
  the shell to scroll when the software keyboard opens.
- `sm` and `md`: Keep the form centered, but let the footer metadata wrap into
  two lines if horizontal space tightens.
- `lg+`: Keep the current centered institutional card treatment.

### Not found

`NotFound.tsx` is visually strong, but it still assumes a full-height desktop
hero with generous padding.

- `Base (<640px)`: Replace `h-screen` with a `min-height` flow, reduce the card
  padding, and let the CTA buttons stack vertically.
- `sm` and `md`: Keep the glass card centered, but clamp the hero headline so
  the single-word title does not dominate smaller screens.
- `lg+`: Keep the current cinematic full-height treatment.

## Next steps

This audit is most useful if it turns into an implementation sequence instead
of a one-time note. The recommended order is shared shell fixes first, then the
largest desktop-only pages, then the mobile-only routes that should be unified
or retired.

1. Update `SharedNavbar`, `SearchOverlay`, and `CheckoutOverlay`.
2. Refactor the largest desktop-only pages first: `Dashboard`, `Journey`,
   `Archive`, `Community`, `AccessTiersAlbert`, and `ExperienceAlbert`.
3. Normalize commerce flows next: `Store`, `StoreProductDetail`,
   `RankingSubmission`, and `Events`.
4. Decide whether the mobile-only routes stay as references or get absorbed
   into a single responsive route per experience.
