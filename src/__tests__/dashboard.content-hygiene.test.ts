import { describe, expect, it } from 'vitest'
import {
  isLowQualityDisplayText,
  normalizeDisplayText,
  sanitizeDisplayText,
} from '../utils/contentHygiene'

describe('dashboard content hygiene', () => {
  it('normalizes whitespace and strips zero-width characters', () => {
    const text = '  Wolf\u200Bpack   signal   '
    expect(normalizeDisplayText(text)).toBe('Wolfpack signal')
  })

  it('flags low-quality strings that should fallback', () => {
    expect(isLowQualityDisplayText('a')).toBe(true)
    expect(isLowQualityDisplayText('---')).toBe(true)
    expect(isLowQualityDisplayText('12')).toBe(true)
    expect(isLowQualityDisplayText('Moonlit Chamber')).toBe(false)
  })

  it('returns fallback with a mitigation marker when quality is low', () => {
    const result = sanitizeDisplayText('a', 'Wolfpack signal dispatch')
    expect(result.value).toBe('Wolfpack signal dispatch')
    expect(result.usedFallback).toBe(true)
  })

  it('keeps high-quality content untouched', () => {
    const result = sanitizeDisplayText('Knightfall Announcement', 'Fallback')
    expect(result.value).toBe('Knightfall Announcement')
    expect(result.usedFallback).toBe(false)
  })
})
