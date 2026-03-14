import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

describe('dashboard token contract', () => {
  it('keeps the hybrid night + crimson theme tokens in theme.css', () => {
    const css = readFileSync('src/styles/theme.css', 'utf8')
    const tokenCss = readFileSync('src/styles/theme.tokens.css', 'utf8')

    expect(css).toContain("@import './theme.tokens.css';")
    expect(tokenCss).toContain('--color-bg-app: #04070b;')
    expect(tokenCss).toContain('--color-bg-base: #0a1118;')
    expect(tokenCss).toContain('--color-bg-surface: #111a24;')
    expect(tokenCss).toContain('--color-accent-brand: #a62b3a;')
    expect(tokenCss).toContain('--color-text-primary: #e8e1d5;')
    expect(tokenCss).toContain('--color-text-secondary: #aebccc;')
    expect(tokenCss).toContain('--color-text-tertiary: #8fa1b4;')
    expect(tokenCss).toContain('--color-focus-ring: #e8e1d5;')
    expect(tokenCss).toContain('--color-secondary: var(--color-text-secondary);')
    expect(tokenCss).toContain('--color-accent: var(--color-accent-brand-soft);')
    expect(tokenCss).toContain('--transition-fast: 0.2s ease;')
    expect(tokenCss).toContain('--color-bg-charcoal: var(--color-bg-base);')
    expect(tokenCss).toContain('--color-bg-dark: var(--color-bg-app);')
    expect(tokenCss).toContain('--color-warning: var(--color-state-warning);')
    expect(tokenCss).toContain('--color-info: var(--color-state-info);')

    expect(css).toContain("--font-body: 'Manrope'")
    expect(css).toContain("--font-display: 'Cinzel'")
  })
})
