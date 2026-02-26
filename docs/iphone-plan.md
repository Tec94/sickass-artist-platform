# ROA Interactive Phone Overlay (Implemented MVP Plan)

## Status

This document is the corrected version of the earlier pre-plan and now reflects the implemented MVP in the codebase.

Implemented in this pass:
- Persistent floating phone launcher + interactive iPhone-style overlay
- Lock screen + home screen + shared nav/sheet/modal hosts
- Priority apps: Music, Gallery, Notes, Messages, Calendar, Maps, Phone (with Voicemail), Cards
- Utility apps: Calculator, Clock, Camera, Voice/Translate, Branded Intro
- ROA data adapter from `public/data/artist-scraped-data.json`
- Route visibility policy + overlay collision-aware launcher docking
- Solar icon usage for UI iconography

## Corrections Applied (from pre-plan)

### UI Iconography
- Replaced generic emoji UI icon references with Solar icon strategy (`iconify-icon` + `solar:*`)
- Source-content emojis are allowed only when they come from real ROA caption/message content

### Data Schema Corrections
- `artist` is a string in `public/data/artist-scraped-data.json`
- Instagram posts are under `instagram.posts`
- `instagram.profilePictureUrl` is the stable avatar field
- Calendar cannot be fully derived from IG post timestamps (timestamps not reliably present)

### App Priority Corrections
Priority apps in this project:
- Music
- Gallery
- Notes
- Messages (thread list + thread detail)
- Calendar
- Maps
- Phone (includes Voicemail)
- Cards

Utility/demo parity apps:
- Calculator
- Clock / Alarms
- Camera
- Voice / Translate
- Branded Intro surface (optional visual parity module)

### Language / Localization Correction
- No primary `LanguageApp` controls phone locale in V1
- Phone locale mirrors site language (`en`/`es`) by default
- The Voice/Translate app is a separate utility and does not control global locale

## Implemented Architecture (MVP)

### Root integration
Mounted at app root in `src/App.tsx` so it persists across routes and can detect overlays/layout conflicts.

### Key files (implemented)
- `src/components/PhoneDisplay/PhoneOverlayProvider.tsx`
- `src/components/PhoneDisplay/phoneStore.ts`
- `src/components/PhoneDisplay/PhoneLauncher.tsx`
- `src/components/PhoneDisplay/PhoneOverlay.tsx`
- `src/components/PhoneDisplay/PhoneFrame.tsx`
- `src/components/PhoneDisplay/PhoneSystemChrome.tsx`
- `src/components/PhoneDisplay/PhoneScreenRouter.tsx`
- `src/components/PhoneDisplay/PhoneSheetHost.tsx`
- `src/components/PhoneDisplay/PhoneModalHost.tsx`
- `src/components/PhoneDisplay/PhoneAppRegistry.ts`
- `src/components/PhoneDisplay/PhoneIconRegistry.tsx`
- `src/components/PhoneDisplay/usePhoneOverlayDock.ts`
- `src/components/PhoneDisplay/usePhoneVisibilityPolicy.ts`
- `src/components/PhoneDisplay/usePhoneGestures.ts`
- `src/components/PhoneDisplay/content/phoneContentAdapter.ts`
- `src/components/PhoneDisplay/content/phoneSeedContent.ts`
- `src/components/PhoneDisplay/content/phoneContentTypes.ts`
- `src/components/PhoneDisplay/screens/LockScreen.tsx`
- `src/components/PhoneDisplay/screens/HomeScreen.tsx`
- `src/components/PhoneDisplay/screens/apps/*`
- `src/styles/phone-display.css`

## Overlay Visibility + Collision Policy (Repo-specific)

The launcher is not a naive fixed bottom-right button.

### Existing conflicts handled in plan/implementation
- Bottom-left admin quick access in `src/App.tsx`
- Bottom-right Sonner toaster in `src/App.tsx`
- Bottom-right dashboard design lab switcher (`[data-dashboard-design-lab-switcher="true"]`)

### Launcher behavior
- Default anchor: bottom-right
- Auto-adjusts upward if known right-corner overlays occupy space
- Hidden when phone is open
- Hidden on excluded routes and some fullscreen/modal conflict states

### Route exclusions (default)
- `/sign-in`
- `/sign-up`
- `/sso-callback`
- `/admin*`
- `/store/checkout`
- `/store/confirmation`
- `/test-errors`

## ROA Data Sources

Primary sources:
- `public/data/artist-scraped-data.json`
- `public/images/roa profile.jpg`

Adapter behavior:
- Normalizes Spotify popular tracks and discography
- Normalizes Instagram post thumbnails/captions
- Builds seeded Notes/Messages/Voicemail content from scraped metadata
- Falls back safely if remote thumbnails fail or JSON is unavailable

## Solar Icon Strategy (Implemented)

Phase 1 (current):
- `iconify-icon` custom element
- Solar icons for launcher, lock quick actions, app grid, and app UI affordances

Phase 2 (planned):
- Add custom iOS-like icon assets behind an icon registry skin toggle
- Planned path: `public/phone-icons/<appId>.png`

## Visual / Interaction Notes (MVP)

Implemented interaction patterns:
- Launcher open/close overlay animation
- Lock screen swipe-up unlock (plus tap fallback)
- Home screen app grid + dock
- App navigation with transitions
- Shared sheet host (music, calendar, maps, etc.)
- Shared modal host (cards, camera, clock actions)
- Maps simulated pan/zoom + style toggle + list sheet
- Cards wallet/pass surfaces + detail modal
- Phone app tabs with Voicemail
- Gallery grid -> detail + swipe navigation
- Camera `getUserMedia` with fallback if unavailable/denied

## Known Gaps / Next Iterations

These are intentionally deferred or simplified in MVP:
- App launch origin animation from exact icon rect (currently generalized transition)
- Pixel-perfect iOS motion parity across all transitions
- Live map SDK integration (current maps are simulated visuals)
- Full voice transcription / translation backend (current demo flow is simulated)
- Camera capture persistence into Gallery Recents (current modal confirms session capture)
- Branded splash/interstitial parity modules beyond the included intro surface
- Additional demo parity apps (social feed / code utility) if desired later

## Validation Completed

- `npm run type-check` ✅
- `npm run build` ✅

## Wallpaper / Content Notes

Current placeholder wallpaper:
- `public/images/roa profile.jpg`

Future wallpaper options can include:
- Additional project ROA portraits
- Approved Instagram-derived imagery
- Generated cinematic lockscreen artwork (with ROA face reference for likeness)
