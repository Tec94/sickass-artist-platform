import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

describe('dashboard token contract', () => {
  it('keeps the hybrid night + crimson theme tokens in theme.css', () => {
    const css = readFileSync('src/styles/theme.css', 'utf8')

    expect(css).toContain('--color-bg: #04070B;')
    expect(css).toContain('--color-bg-base: #0A1118;')
    expect(css).toContain('--color-card-bg: #111A24;')
    expect(css).toContain('--color-card-border: #2A3541;')
    expect(css).toContain('--color-primary: #A62B3A;')
    expect(css).toContain("--font-body: 'Manrope'")
    expect(css).toContain("--font-display: 'Cinzel'")
  })
})
