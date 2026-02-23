export type DashboardVisualVariant = 'forum-ops' | 'curated-shop' | 'ranking-nocturne'

export const DEFAULT_DASHBOARD_VISUAL_VARIANT: DashboardVisualVariant = 'ranking-nocturne'

export const DASHBOARD_DESIGN_LAB_QUERY_PARAM = 'dashboardDesignLab'
export const DASHBOARD_VARIANT_QUERY_PARAM = 'dashboardVariant'
export const DASHBOARD_VARIANT_STORAGE_KEY = 'dashboard_design_lab_variant_v1'

type DashboardVisualVariantMeta = {
  id: DashboardVisualVariant
  label: string
  shortLabel: string
  description: string
}

export const DASHBOARD_VISUAL_VARIANTS: readonly DashboardVisualVariantMeta[] = [
  {
    id: 'forum-ops',
    label: 'Forum Ops',
    shortLabel: 'Ops',
    description: 'Command-center layout with utility chips and scanable groupings',
  },
  {
    id: 'curated-shop',
    label: 'Curated Shop',
    shortLabel: 'Curated',
    description: 'Editorial showroom framing with softer capsules and gallery rhythm',
  },
  {
    id: 'ranking-nocturne',
    label: 'Ranking Nocturne',
    shortLabel: 'Nocturne',
    description: 'Luxe dark leaderboard shell with precision accents',
  },
] as const

const DASHBOARD_VISUAL_VARIANT_SET = new Set<DashboardVisualVariant>(
  DASHBOARD_VISUAL_VARIANTS.map((variant) => variant.id),
)

export const parseDashboardVisualVariant = (
  value: string | null | undefined,
): DashboardVisualVariant => {
  if (!value) {
    return DEFAULT_DASHBOARD_VISUAL_VARIANT
  }

  if (DASHBOARD_VISUAL_VARIANT_SET.has(value as DashboardVisualVariant)) {
    return value as DashboardVisualVariant
  }

  return DEFAULT_DASHBOARD_VISUAL_VARIANT
}

export const isDashboardDesignLabEnabled = (value: string | null | undefined): boolean =>
  value === '1' || value === 'true'
