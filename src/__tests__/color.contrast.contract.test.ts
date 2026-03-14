import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const tokensCss = readFileSync('src/styles/theme.tokens.css', 'utf8')

const getHexVar = (name: string): string => {
  const match = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`))
  if (!match) {
    throw new Error(`Missing token --${name}`)
  }
  return match[1]
}

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '')
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ]
}

const luminance = (channel: number): number => {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const contrastRatio = (foregroundHex: string, backgroundHex: string): number => {
  const [fr, fg, fb] = hexToRgb(foregroundHex)
  const [br, bg, bb] = hexToRgb(backgroundHex)

  const foreground = 0.2126 * luminance(fr) + 0.7152 * luminance(fg) + 0.0722 * luminance(fb)
  const background = 0.2126 * luminance(br) + 0.7152 * luminance(bg) + 0.0722 * luminance(bb)

  const lighter = Math.max(foreground, background)
  const darker = Math.min(foreground, background)
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2))
}

describe('color contrast contract', () => {
  it('passes WCAG AA for semantic text/state pairs on dark surfaces', () => {
    const pairs = [
      ['color-text-primary', 'color-bg-app'],
      ['color-text-secondary', 'color-bg-base'],
      ['color-text-tertiary', 'color-bg-base'],
      ['color-accent-brand-soft', 'color-bg-app'],
      ['color-state-danger', 'color-bg-base'],
      ['color-state-warning', 'color-bg-base'],
      ['color-state-info', 'color-bg-base'],
      ['color-state-success', 'color-bg-base'],
    ] as const

    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(getHexVar(fg), getHexVar(bg))
      expect(ratio, `${fg} on ${bg} ratio`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('meets AAA for critical tiny-text roles', () => {
    const pairs = [
      ['color-text-secondary', 'color-bg-base'],
      ['color-text-tertiary', 'color-bg-base'],
      ['color-accent-brand-soft', 'color-bg-app'],
    ] as const

    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(getHexVar(fg), getHexVar(bg))
      expect(ratio, `${fg} on ${bg} AAA ratio`).toBeGreaterThanOrEqual(7)
    }
  })
})
