import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('route a11y smoke', () => {
  it('keeps core route declarations in App.tsx', () => {
    const appTsx = readFileSync('src/App.tsx', 'utf8')
    const requiredRoutes = [
      '/',
      '/dashboard',
      '/community',
      '/campaign',
      '/store',
      '/events',
      '/gallery',
      '/forum',
      '/chat',
      '/ranking',
      '/profile',
      '/quests',
      '/sign-in',
      '/sign-up',
      '/sso-callback',
    ]

    for (const route of requiredRoutes) {
      expect(appTsx).toContain(`path="${route}"`)
    }
  })

  it('uses status semantics for auth redirect routes', () => {
    const signIn = readFileSync('src/pages/SignInPage.tsx', 'utf8')
    const signUp = readFileSync('src/pages/SignUpPage.tsx', 'utf8')
    const callback = readFileSync('src/pages/SSOCallback.tsx', 'utf8')

    expect(signIn).toContain('role="status"')
    expect(signUp).toContain('role="status"')
    expect(callback).toContain('role="status"')
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
