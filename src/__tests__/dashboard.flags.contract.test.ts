import { describe, expect, it } from 'vitest'
import {
  DASHBOARD_EXPERIENCE_DEFAULTS,
  DASHBOARD_FEATURE_FLAG_KEYS,
  withDashboardExperienceDefaults,
} from '../constants/dashboardFlags'

describe('dashboard feature flag contract', () => {
  it('keeps canonical dashboard flag keys stable', () => {
    expect(DASHBOARD_FEATURE_FLAG_KEYS.hardeningV1).toBe('dashboard_cinematic_hardening_v1')
    expect(DASHBOARD_FEATURE_FLAG_KEYS.headerCollapseV1).toBe('dashboard_header_cinematic_collapse_v1')
    expect(DASHBOARD_FEATURE_FLAG_KEYS.contentHygieneV1).toBe('dashboard_content_hygiene_v1')
  })

  it('applies safe defaults when flags are missing', () => {
    expect(withDashboardExperienceDefaults(undefined)).toEqual(DASHBOARD_EXPERIENCE_DEFAULTS)
    expect(withDashboardExperienceDefaults(null)).toEqual(DASHBOARD_EXPERIENCE_DEFAULTS)
  })

  it('merges partial flag payloads without dropping defaults', () => {
    expect(withDashboardExperienceDefaults({ hardeningV1: true })).toEqual({
      hardeningV1: true,
      headerCollapseV1: true,
      contentHygieneV1: false,
    })
  })
})
