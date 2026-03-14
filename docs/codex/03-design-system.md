# Design System

This file defines the current design-system direction for the estate navigation experience and surrounding application UI.

This is not just a visual mood board. It is the operational design language for the product.

The goal is a coherent system that merges:
- scenic estate immersion
- artist-world luxury
- editorial restraint
- usable UI hierarchy
- premium interaction design

---

## Core design intent

The product should feel like a private estate interface for a music artist's world.

It should feel:
- dark
- premium
- restrained
- editorial
- cinematic
- quiet
- expensive
- nocturnal
- spatial
- immersive

It should not feel:
- generic SaaS
- fantasy MMO
- cyberpunk neon
- loud gaming UI
- flat merch template
- over-designed concept art

---

## Design influences

The current design direction is informed by several strands of research:

### 1. Scenic navigation patterns
The scenic spatial navigation concept is inspired by artist-world navigation where architecture becomes interface. The scene itself should guide exploration.

### 2. Editorial luxury interfaces
The interface should feel closer to editorial art direction, premium e-commerce, and cinematic landing experiences than to dashboard-heavy app UI.

### 3. Nocturnal estate / palatial architecture
The current scene and UI vocabulary are rooted in:
- estate architecture
- stone, plaster, carved facades
- warm practical lighting
- dark sky / black void surroundings
- restrained grandeur

### 4. Artist-world identity
The world should still reflect the artist through:
- exclusivity
- prestige
- private-access tone
- subtle luxury cues
- campaign-center storytelling

Not through obvious clutter or gimmicks.

---

## Primary visual principles

### 1. The scene is the star
The landing scene must remain visually dominant.

UI should support the scene, not suffocate it.

### 2. UI is restrained and premium
The interface should feel like fine hardware overlaying a cinematic environment.

### 3. Motion should be deliberate
No random bounce, no arcade effects, no noisy hover spam.

### 4. Contrast should be controlled
Readable, but never flatly sterile.

### 5. Public vs locked should be legible
Users should understand what is accessible and what is private without the site feeling broken.

---

## Color system

### Base palette character
The larger system already established a dark, premium palette language with deep blues, blacks, estate tones, restrained teals, cold lights, and select warm danger / campaign accents.

For the estate navigation layer, the most important color behavior is semantic, not decorative.

### Primary background behavior
The scene itself carries most of the visual atmosphere:
- black void perimeter
- warm window/entry lighting
- dim stone surfaces
- subtle garden color
- deep shadow zones

The UI should not introduce unnecessary extra color noise.

### Accent color rules by interaction type

#### Store
- cool teal / estate teal
- public
- premium commerce
- calm but active

#### Events
- warm amber / orange
- social
- gathering
- movement and arrival

#### Ranking
- cold pale / silver / icy tone
- distant
- aspirational
- prestige-oriented

#### Campaign
- restrained red / crimson
- central focus
- current release energy
- ceremonial intensity

#### Community
- cooler blue-violet / private blue
- gated
- protected
- interior/private tone

### Important rule
Accent colors should identify interaction state and destination identity, not flood the whole page.

The scene itself remains mostly architecturally neutral and warm-lit. Region accents appear through:
- path overlay
- card treatment
- cue highlights
- selective hover FX

Not through full-scene recoloring.

---

## Typography

### Overall principle
Typography should feel:
- crisp
- premium
- intentional
- editorial
- architectural

It should not feel:
- techy startup
- fantasy tavern
- medieval novelty font spam
- gamer HUD

### Hierarchy

#### Brand / wordmark
Use a high-contrast, refined display treatment for the artist name and key marquee moments.

This should feel:
- elegant
- sharp
- restrained
- timeless

#### Navigation
Top nav typography should be:
- compact
- uppercase or small caps leaning
- spaced with discipline
- visually quiet but premium

#### Region cards
Region cards should use:
- strong title hierarchy
- small eyebrow metadata
- minimal supporting text

#### Body / utility
Application utility text should remain clean and modern.

Do not let the estate theme degrade readability.

---

## Layout philosophy

### Landing page
The landing page is primarily scenic.
UI layers should be limited to:
- top nav
- optional utility controls
- region cards / cues
- auth prompt when needed
- back or view controls where appropriate

### Interior pages
Interior application pages can be more structured, but should still inherit the estate-world discipline:
- clean spacing
- strong hierarchy
- restrained surface design
- controlled use of accent colors

---

## Surface language

### Scenic layer
The scenic image is the environmental base.

### UI layer
The UI should use:
- dark glass / smoky panels where needed
- soft-edged premium containers
- subtle borders
- restrained depth
- clean shadow behavior

Avoid:
- frosted-glass overload
- too many stacked translucent cards
- over-rounded playful UI
- generic component-library feel

### Card philosophy
Cards should feel like:
- inset control panels
- plaques
- labels
- premium overlays

Not like generic app cards pasted over an image.

---

## Interaction language

### Region hover
Region hover should feel:
- guided
- premium
- readable
- slightly ceremonial

It should not feel:
- like a strategy game highlight
- like an item pickup glow
- like a cartoon flash

### Region active state
Selected/active state should feel slightly more committed than hover:
- stronger outline
- stronger fill
- card lock-in
- cue emphasis

### Locked state
Locked state should be:
- visible
- calm
- legible
- controlled

Possible treatments:
- chain overlay clipped to path
- lower luminance
- reduced interaction sheen
- label shift to indicate lock

Do not make locked regions look broken or dead.

---

## Motion rules

### Motion characteristics
All motion should be:
- smooth
- medium-slow
- premium
- physically plausible
- context-aware

### Motion to avoid
- harsh springiness everywhere
- hyperactive glow flicker
- game-loot shimmer
- overly elastic UI cards
- noisy particle effects

### Good motion types
- soft fade
- gentle lift
- controlled highlight sweep
- subtle directional cue pulse
- quiet card reveal
- careful camera transitions later

---

## Navigation card behavior

Each region card should:
- appear anchored to the region
- feel like part of the estate UI language
- use consistent size logic
- avoid covering the focal architecture too aggressively

Suggested structure:
- eyebrow / zone name
- destination title
- optional short supporting text

The card should not become a full panel unless the design explicitly needs that.

---

## Top navigation direction

The top navigation currently exists in early form and should remain restrained during this phase.

It should support:
- artist branding
- major routes
- search or utility entry if appropriate
- account / auth access
- optional estate-explore CTA

It should not dominate the scene.

Longer-term experiments like parchment-scroll-inspired nav treatment are allowed later, but only if they remain refined and do not become theatrical gimmicks.

---

## Audio direction

Audio is deferred until after core interaction works.

When added, it should feel:
- tactile
- quiet
- premium
- subtle

The region-hover pop should be more like elegant tactile feedback than cartoon UI noise.

---

## Scenic polish direction

After the region system is stable, polish may include:
- clipped shimmer or sheen for hover
- soft light-response treatment
- lock overlays
- card refinement
- scene transition choreography

These should be layered on top of a stable interaction base.

---

## Mobile design rules

Mobile should preserve:
- same world
- same architectural scene
- same destination meaning

But adapt through:
- focus/tap behavior
- pan/swipe behavior
- simpler cue presentation
- stronger fallback navigation affordances

Do not create a separate generic mobile dashboard that abandons the scenic system.

---

## Accessibility / usability rules

Even though the design is atmospheric, it must remain usable.

Requirements:
- clear interactive affordance
- readable text contrast
- visible focus states
- touch-friendly target behavior on mobile
- no hidden essential navigation behind purely decorative cues

Atmosphere is not an excuse for ambiguity.

---

## Design anti-patterns

Do not introduce these:
- over-glowing fantasy UI
- excessive gold everywhere
- generic Tailwind-demo look
- too many floating rounded cards
- cluttered modern luxury props
- obvious AI-art gimmicks
- noisy screen overlays
- fake medieval fonts for utility text
- excessive saturated accent competition

---

## Current design priority

The current priority is not final polish.

The current design priority is:
1. stable region interaction system
2. coherent card and cue language
3. locked/public clarity
4. mobile scenic usability
5. only then advanced polish

This order should not be reversed.

---

## Design-system acceptance for current milestone

The current design-system milestone is successful when:
- all region interactions feel consistent
- cards feel like one family
- accent colors clearly distinguish destination states
- top nav does not overpower the scene
- locked Community reads clearly but not harshly
- mobile scenic UX is testable
- the page feels premium and coherent even before final polish