import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('route a11y smoke', () => {
  it('keeps current live route declarations in App.tsx', () => {
    const appTsx = readFileSync('src/App.tsx', 'utf8')
    const requiredRoutes = [
      '/',
      '/dashboard',
      '/archive',
      '/rankings',
      '/ranking',
      '/ranking-submission',
      '/profile',
      '/community',
      '/journey',
      '/campaign',
      '/store',
      '/store/product/:productSlug',
      '/new-post',
      '/salon',
      '/access-tiers-mobile',
      '/access-tiers-albert',
      '/experience-mobile',
      '/experience-albert',
      '/events-mobile',
      '/events',
      '/dashboard-mobile',
      '/login',
    ]

    for (const route of requiredRoutes) {
      expect(appTsx).toContain(`path="${route}"`)
    }

    expect(appTsx).not.toContain('path="/auth"')
    expect(appTsx).not.toContain('path="/store/browse"')
    expect(appTsx).not.toContain('path="/sso-callback"')
    expect(appTsx).toContain('<Navigate to="/rankings" replace />')
    expect(appTsx).toContain('<Navigate to="/new-post" replace />')
  })

  it('keeps scenic helper contracts aligned with the live route model', () => {
    const authRouting = readFileSync('src/features/auth/authRouting.ts', 'utf8')
    const topLevelNav = readFileSync('src/features/navigation/topLevelNav.ts', 'utf8')
    const sceneConfig = readFileSync(
      'src/features/castleNavigation/sceneConfig.ts',
      'utf8',
    )

    expect(authRouting).toContain("AUTH_ENTRY_PATH = '/auth'")
    expect(authRouting).toContain("DEFAULT_AUTH_RETURN_PATH = '/community'")

    const scenicNavPaths = [
      '/',
      '/store',
      '/events',
      '/rankings',
      '/campaign',
      '/community',
    ]

    for (const route of scenicNavPaths) {
      expect(topLevelNav).toContain(`path: '${route}'`)
      if (route !== '/') {
        expect(sceneConfig).toContain(`route: '${route}'`)
      }
    }
  })

  it('uses status semantics for auth helper pages', () => {
    const authEntry = readFileSync('src/pages/AuthEntryPage.tsx', 'utf8')
    const signIn = readFileSync('src/pages/SignInPage.tsx', 'utf8')
    const signUp = readFileSync('src/pages/SignUpPage.tsx', 'utf8')
    const callback = readFileSync('src/pages/SSOCallback.tsx', 'utf8')

    expect(authEntry).toContain('role="status"')
    expect(signIn).toContain('role="status"')
    expect(signUp).toContain('role="status"')
    expect(callback).toContain('role="status"')
    expect(authEntry).toContain('aria-live="polite"')
    expect(signIn).toContain('aria-live="polite"')
    expect(signUp).toContain('aria-live="polite"')
    expect(callback).toContain('aria-live="polite"')
  })

  it('keeps dark app-surface shell on internal test route', () => {
    const testPage = readFileSync('src/pages/TestErrorPage.tsx', 'utf8')
    expect(testPage).toContain('app-surface-page')
    expect(testPage).not.toContain('bg-gray-50')
  })
})
