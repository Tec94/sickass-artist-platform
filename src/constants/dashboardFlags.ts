export const DASHBOARD_FEATURE_FLAG_KEYS = {
  hardeningV1: 'dashboard_cinematic_hardening_v1',
  headerCollapseV1: 'dashboard_header_cinematic_collapse_v1',
  contentHygieneV1: 'dashboard_content_hygiene_v1',
} as const

export type DashboardExperienceFlags = {
  hardeningV1: boolean
  headerCollapseV1: boolean
  contentHygieneV1: boolean
}

export const DASHBOARD_EXPERIENCE_DEFAULTS: DashboardExperienceFlags = {
  hardeningV1: false,
  headerCollapseV1: true,
  contentHygieneV1: false,
}

export const DASHBOARD_SCROLL_CONTAINER_SELECTOR = '[data-scroll-container]'
export const DASHBOARD_HERO_SELECTOR = '[data-dashboard-hero-root]'

export const withDashboardExperienceDefaults = (
  flags: Partial<DashboardExperienceFlags> | null | undefined,
): DashboardExperienceFlags => ({
  ...DASHBOARD_EXPERIENCE_DEFAULTS,
  ...(flags || {}),
})
