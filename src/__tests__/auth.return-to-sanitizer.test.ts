import { describe, expect, it } from 'vitest'
import { sanitizeReturnTo } from '../pages/SignInPage'

describe('sign-in returnTo sanitizer', () => {
  it('accepts safe internal absolute paths', () => {
    expect(sanitizeReturnTo('/chat')).toBe('/chat')
    expect(sanitizeReturnTo('/chat?channel=wolves')).toBe('/chat?channel=wolves')
  })

  it('rejects external, protocol, and malformed values', () => {
    expect(sanitizeReturnTo('https://evil.example')).toBe('/dashboard')
    expect(sanitizeReturnTo('//evil.example')).toBe('/dashboard')
    expect(sanitizeReturnTo('javascript:alert(1)')).toBe('/dashboard')
    expect(sanitizeReturnTo('%2F%2Fevil.example')).toBe('/dashboard')
    expect(sanitizeReturnTo('/chat\nhttps://evil.example')).toBe('/dashboard')
  })

  it('falls back to dashboard when returnTo is missing', () => {
    expect(sanitizeReturnTo(null)).toBe('/dashboard')
    expect(sanitizeReturnTo(undefined)).toBe('/dashboard')
  })
})
