import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('dashboard crest asset', () => {
  it('does not include the legacy black background rectangle path', () => {
    const crestPath = resolve(process.cwd(), 'public/dashboard/wolf-crest.svg')
    const svg = readFileSync(crestPath, 'utf8')

    expect(svg).not.toContain('fill="#010101"')
    expect(svg).not.toContain('transform="translate(0,0)"')
  })
})
