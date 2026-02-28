import { describe, expect, it } from 'vitest'
import { en } from '../locales/en'
import { es } from '../locales/es'

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[segment]
  }, obj)

const REQUIRED_KEYS = [
  'auth.signOut',
  'nav.profile',
  'nav.quests',
  'events.allDates',
  'store.orders',
  'store.tryAdjustingFilters',
] as const

describe('ui i18n required keys', () => {
  it('keeps required keys present in English and Spanish locales', () => {
    REQUIRED_KEYS.forEach((key) => {
      expect(getNestedValue(en as unknown as Record<string, unknown>, key)).toBeTypeOf('string')
      expect(getNestedValue(es as unknown as Record<string, unknown>, key)).toBeTypeOf('string')
    })
  })
})
