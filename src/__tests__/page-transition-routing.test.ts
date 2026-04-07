import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { resolvePageTransition } from '../components/Effects/pageTransitionRouting'
import { resolveSharedNavbarDirectionalTransition } from '../features/navigation/sharedNavbarRouteOrder'

describe('resolveSharedNavbarDirectionalTransition', () => {
  it('returns push-back when navigating left across the shared navbar order', () => {
    expect(resolveSharedNavbarDirectionalTransition('/events', '/store')).toBe('push-back')
  })

  it('returns push when navigating right across the shared navbar order', () => {
    expect(resolveSharedNavbarDirectionalTransition('/store', '/events')).toBe('push')
    expect(resolveSharedNavbarDirectionalTransition('/community', '/journey')).toBe('push')
  })

  it('does not force a lateral direction for routes inside the same grouped section', () => {
    expect(resolveSharedNavbarDirectionalTransition('/store', '/store/product/private-suite-tee')).toBeNull()
  })
})

describe('resolvePageTransition', () => {
  it('uses navbar-relative direction over a generic push request', () => {
    expect(resolvePageTransition('/events', '/store', 'push')).toBe('push-back')
    expect(resolvePageTransition('/store', '/events', 'push')).toBe('push')
  })

  it('preserves explicit slide-up transitions over inferred route direction', () => {
    expect(resolvePageTransition('/events', '/store', 'slide-up')).toBe('slide-up')
  })

  it('preserves explicit push-back transitions for intentional back flows', () => {
    expect(resolvePageTransition('/store/product/private-suite-tee', '/store', 'push-back')).toBe(
      'push-back',
    )
  })

  it('falls back to fade for same-group and directionless transitions', () => {
    expect(resolvePageTransition('/store', '/store/product/private-suite-tee', 'push')).toBe('fade')
    expect(resolvePageTransition('/dashboard', '/archive', 'push')).toBe('fade')
    expect(resolvePageTransition('/dashboard', '/archive', null)).toBe('fade')
  })
})
