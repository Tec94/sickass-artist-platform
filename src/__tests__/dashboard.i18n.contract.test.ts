import { describe, expect, it } from 'vitest'
import { en } from '../locales/en'
import { es } from '../locales/es'

const flattenKeys = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, next)
    }
    return [next]
  })

describe('dashboard i18n contract', () => {
  it('keeps EN and ES hero/dashboard keys aligned', () => {
    const enKeys = flattenKeys(en.dashboard as unknown as Record<string, unknown>).sort()
    const esKeys = flattenKeys(es.dashboard as unknown as Record<string, unknown>).sort()
    expect(esKeys).toEqual(enKeys)
  })
})
