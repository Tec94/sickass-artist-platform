# ROA interactive phone overlay

> **Status:** Planned/unrouted architecture. The phone overlay code exists in
> the repo, but it is not mounted by the current app shell in `src/App.tsx` or
> `src/main.tsx`.

## Summary

This repository contains a substantial phone overlay implementation under
`src/components/PhoneDisplay/`. It includes a provider, launcher, overlay root,
screen router, app registry, seeded content adapters, and multiple app screens.

That implementation is not part of the current routed website today.

## Current app state

The current website does not mount the phone overlay.

As of the current router state:

- `src/App.tsx` imports `./styles/phone-display.css`
- `src/App.tsx` does not mount `PhoneOverlayRoot`
- `src/App.tsx` does not mount `PhoneOverlayProvider`
- `src/main.tsx` does not mount the phone overlay either

Treat the phone system as implemented source code that is currently dormant.

## What exists in source

The codebase still includes these major pieces:

- `src/components/PhoneDisplay/PhoneOverlay.tsx`
- `src/components/PhoneDisplay/PhoneOverlayProvider.tsx`
- `src/components/PhoneDisplay/PhoneLauncher.tsx`
- `src/components/PhoneDisplay/PhoneScreenRouter.tsx`
- `src/components/PhoneDisplay/PhoneAppRegistry.ts`
- `src/components/PhoneDisplay/content/*`
- `src/components/PhoneDisplay/screens/*`

The source also includes the supporting CSS and adapter logic that earlier
plans described as an implemented MVP.

## What is not live today

The following statements should not be treated as current website behavior:

- the launcher is visible on every route
- the overlay is mounted at app root
- phone apps are part of the current user journey
- route exclusion logic is active in the live app shell

Those behaviors may still be valid for the dormant implementation, but they are
not part of the currently routed website.

## If the phone overlay is reactivated

If a future task makes this feature live again, do the following in the same
pass:

1. mount `PhoneOverlayRoot` or the equivalent provider and overlay shell
2. verify route visibility rules against the current app shell
3. run route-aware and UI verification for the live mount
4. update this document and the codex current-state docs

Do not restore the feature without updating the docs that describe its status.

## Reference value

Even though the feature is not live, this code remains useful as:

- a reusable overlay implementation
- a content-adapter reference
- a future app-shell experiment
- a source of UI components and motion patterns

Keep it documented as planned or unrouted work until the current app shell
mounts it.
