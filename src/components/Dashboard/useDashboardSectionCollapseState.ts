import { useEffect, useState } from 'react'

export type DashboardCollapsibleSectionId =
  | 'overview'
  | 'featureCards'
  | 'announcements'
  | 'promoRail'
  | 'mediaHighlights'
  | 'rankingDeck'

export type DashboardSectionCollapseState = Record<DashboardCollapsibleSectionId, boolean>

export const DASHBOARD_SECTION_COLLAPSE_STORAGE_KEY = 'dashboard:section-collapse:v1'

export const DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE: DashboardSectionCollapseState = {
  overview: true,
  featureCards: true,
  announcements: true,
  promoRail: true,
  mediaHighlights: true,
  rankingDeck: true,
}

const isSectionId = (value: string): value is DashboardCollapsibleSectionId =>
  value in DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE

export const parseDashboardSectionCollapseState = (value: string | null): DashboardSectionCollapseState => {
  if (!value) {
    return { ...DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE }
  }

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE }
    }

    const nextState = { ...DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE }
    for (const [key, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (!isSectionId(key) || typeof entry !== 'boolean') continue
      nextState[key] = entry
    }

    return nextState
  } catch {
    return { ...DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE }
  }
}

export const useDashboardSectionCollapseState = () => {
  const [collapseState, setCollapseState] = useState<DashboardSectionCollapseState>(() => {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE }
    }

    try {
      return parseDashboardSectionCollapseState(window.localStorage.getItem(DASHBOARD_SECTION_COLLAPSE_STORAGE_KEY))
    } catch {
      return { ...DEFAULT_DASHBOARD_SECTION_COLLAPSE_STATE }
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(DASHBOARD_SECTION_COLLAPSE_STORAGE_KEY, JSON.stringify(collapseState))
    } catch {
      // Ignore storage failures.
    }
  }, [collapseState])

  const setSectionExpanded = (sectionId: DashboardCollapsibleSectionId, expanded: boolean) => {
    setCollapseState((current) => (current[sectionId] === expanded ? current : { ...current, [sectionId]: expanded }))
  }

  const toggleSectionExpanded = (sectionId: DashboardCollapsibleSectionId) => {
    setCollapseState((current) => ({ ...current, [sectionId]: !current[sectionId] }))
  }

  return {
    collapseState,
    setSectionExpanded,
    toggleSectionExpanded,
  }
}

