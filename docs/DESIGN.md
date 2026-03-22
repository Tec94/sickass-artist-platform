# Design System: Parchment & Ink

### 1. Overview & Creative North Star
**Creative North Star: The Curated Archive**
The "Parchment & Ink" system is designed as a digital tribute to physical ephemera. It rejects the hyper-glossy, sterile nature of modern SaaS interfaces in favor of a "High-End Editorial" aesthetic that feels collected, tactile, and permanent. The design leverages intentional asymmetry, sharp architectural lines (0px roundedness), and a deep respect for white space (Spacing: 3). It breaks the "template" look by treating the screen like a broadsheet newspaper or a museum exhibition catalog, where information density is high but clearly articulated through tonal shifts.

### 2. Colors
The palette is rooted in organic, earthy tones that mimic physical materials:
- **Primary (#C36B42):** A "Terracotta" used sparingly for high-impact calls to action and navigational cues.
- **The Surface Hierarchy:** Grounded in `#F4EFE6` (Parchment), the system uses `#FAF7F2` (Vellum) for lighter nested containers and `#D1C7BC` for structural depth.
- **The "No-Line" Rule:** Visual separation is primarily achieved through background color shifts. When borders are essential, they are either heavy "Ink" lines (#3C2A21) used for architectural framing or "Soft Ink" (15% opacity) for subtle internal division. Never use generic gray borders.
- **Surface Hierarchy & Nesting:** Use `surface_container_low` for the primary work area and `surface_container` for persistent sidebars.
- **The "Ink" Rule:** Text and primary icons must always use the Ink (#3C2A21) or Muted Ink (#8E7D72) values to maintain the "printed" feel.

### 3. Typography
The system uses a sophisticated pairing of an expressive serif and a high-legibility sans-serif.
- **Headline (Cormorant Garamond/Newsreader):** Used for Display and Headline roles. It conveys authority and heritage.
  - *Display L:* 72px (Leading: None)
  - *Headline L:* 2.25rem (36px)
  - *Headline M:* 1.875rem (30px)
- **Body & Label (Manrope):** A modern sans-serif that provides a clean contrast to the serif headings.
  - *Body M:* 1rem (16px)
  - *Body S:* 0.875rem (14px)
- **The "Wide Label":** A signature style for metadata—11px, uppercase, 0.15em letter-spacing, font-weight 600.
- **Micro-type:** 10px bold uppercase labels are used for status indicators and progress metrics to maintain an "instrumental" feel.

### 4. Elevation & Depth
Depth is conveyed through stacking and tonal layering rather than traditional drop shadows.
- **The Layering Principle:** Use the contrast between "Parchment" (#F4EFE6) and "Vellum" (#FAF7F2) to create hierarchy.
- **Shadows:** Only two levels of elevation are permitted:
  - `shadow-md`: Used for primary hero imagery to give it a "mounted" feel.
  - `shadow-lg`: Reserved strictly for floating navigational elements like the Mega Menu.
- **Interaction Depth:** Hover states on list items (`index-link`) should use a subtle background shift (Terracotta at 3% opacity) and a horizontal padding shift (12px) rather than a shadow.

### 5. Components
- **Buttons:** Sharp 0px corners. Primary buttons use a border-only approach with the `Ink` or `Parchment` color, filling on hover to create a tactile "stamping" effect.
- **Progress Bars:** Minimalist 2px tracks. Use Primary (#C36B42) for the fill to draw the eye to status changes.
- **Cards:** No shadows by default. Use 1px `border-ink-soft` or a shift to `surface_container_low`.
- **Mega Menu:** Full-width architectural overlays with 50/50 split layouts (Image vs. Nav Grid) to maintain editorial balance.

### 6. Do's and Don'ts
- **Do** use horizontal and vertical lines of varying thickness to create "columns" like a newspaper.
- **Do** allow typography to breathe with generous padding (Spacing level 3).
- **Don't** use rounded corners. Every element should feel like a cut piece of paper or a carved block.
- **Don't** use pure black (#000) or pure white (#FFF). Always use the themed Parchment and Ink values to maintain the "analog" warmth.
- **Do** use `italic` serif text for quotes or "editorial asides" to add personality to the data.