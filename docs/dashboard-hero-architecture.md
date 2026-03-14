# Dashboard Hero Architecture

## Canonical Runtime Path
1. `src/pages/Dashboard.tsx` assembles hero copy, dashboard data, and feature flags.
2. `src/components/Dashboard/CinematicHero.tsx` owns cinematic scene orchestration.
3. `src/components/Dashboard/HeroCopyBeats.tsx` renders narrative beats + CTA.
4. `src/components/Dashboard/HeroLightRays.tsx` renders beam and haze overlays.
5. `src/components/Dashboard/heroTimeline.ts` defines baseline and hardened choreography timelines.

## Feature-Flag Surface
- `dashboard_cinematic_hardening_v1`
- `dashboard_header_cinematic_collapse_v1`
- `dashboard_content_hygiene_v1`

Flags are read by `convex/dashboard.ts#getDashboardExperienceFlags` and default to safe-off behavior.

## Runtime Guarantees
- Missing flags never break the dashboard; defaults keep baseline behavior.
- Reduced-motion branch in hero remains static and CTA-accessible.
- Signed-out hero CTA routes to `/sign-in?returnTo=/chat`, sanitized at sign-in boundary.
- Header collapse only applies on dashboard while hero is intersecting the app scroll container.

## Deprecated Assets
- Deprecated hero implementations are archived under `src/components/Dashboard/legacy`.
- New dashboard work must not import from legacy paths.
