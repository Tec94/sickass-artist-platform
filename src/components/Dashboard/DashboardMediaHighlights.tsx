import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import type { DashboardVisualVariant } from './dashboardVisualVariants'
import {
  DashboardCollapsibleBody,
  DashboardSectionCollapseToggle,
  type DashboardSectionCollapseControl,
} from './DashboardSectionCollapsible'

export type MediaHighlightsTab = 'trendingGallery' | 'artistMoments'

export type DashboardMediaHighlightItem = {
  key: string
  tab: MediaHighlightsTab
  title: string
  image?: string | null
  badge: string
  caption: string
  href: string
  ctaLabel: string
  stats?: Array<{
    label: string
    value: string
  }>
}

type DashboardMediaHighlightsProps = {
  variant?: DashboardVisualVariant
  activeTab: MediaHighlightsTab
  onTabChange: (tab: MediaHighlightsTab) => void
  selectedItemKey: string | null
  onSelectItem: (key: string) => void
  itemsByTab: Record<MediaHighlightsTab, DashboardMediaHighlightItem[]>
  collapseControl?: DashboardSectionCollapseControl
}

export const DashboardMediaHighlights = ({
  variant = 'forum-ops',
  activeTab,
  onTabChange,
  selectedItemKey,
  onSelectItem,
  itemsByTab,
  collapseControl,
}: DashboardMediaHighlightsProps) => {
  const { t } = useTranslation()
  const activeItems = itemsByTab[activeTab] || []
  const selectedItem =
    activeItems.find((item) => item.key === selectedItemKey) || activeItems[0] || null

  const tabOptions: Array<{ id: MediaHighlightsTab; label: string }> = [
    { id: 'trendingGallery', label: t('dashboard.mediaHighlights.tabTrendingGallery') },
    { id: 'artistMoments', label: t('dashboard.mediaHighlights.tabArtistMoments') },
  ]

  const emptyMessage =
    activeTab === 'trendingGallery'
      ? t('dashboard.mediaHighlights.emptyTrending')
      : t('dashboard.mediaHighlights.emptyMoments')
  const isEmpty = activeItems.length === 0

  return (
    <section
      className="dashboard-media-highlights mt-16"
      data-dashboard-variant={variant}
      aria-labelledby="dashboard-media-highlights-title"
    >
      <div className="dashboard-media-highlights__shell">
        <div className="dashboard-media-highlights__header">
          <div>
            <p className="dashboard-media-highlights__eyebrow">Media</p>
            <h3 id="dashboard-media-highlights-title" className="dashboard-media-highlights__title">
              {t('dashboard.mediaHighlights.title')}
            </h3>
          </div>
          <div className="dashboard-media-highlights__header-actions">
            <div className="dashboard-media-highlights__tabs" role="tablist" aria-label={t('dashboard.mediaHighlights.title')}>
              {tabOptions.map((tab) => {
                const isActive = tab.id === activeTab
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`dashboard-media-highlights__tab ${isActive ? 'dashboard-media-highlights__tab--active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            {collapseControl ? (
              <DashboardSectionCollapseToggle
                expanded={collapseControl.expanded}
                onToggle={collapseControl.onToggle}
                contentId={collapseControl.contentId}
                sectionLabel={t('dashboard.mediaHighlights.title')}
              />
            ) : null}
          </div>
        </div>

        <DashboardCollapsibleBody expanded={collapseControl?.expanded ?? true} id={collapseControl?.contentId}>
          {isEmpty ? (
            <div className="dashboard-media-highlights__empty-stage">
              <div className="dashboard-media-highlights__empty">
                <iconify-icon icon="solar:gallery-wide-linear" width="20" height="20"></iconify-icon>
                <span>{emptyMessage}</span>
              </div>
            </div>
          ) : (
            <div className="dashboard-media-highlights__layout">
              <div className="dashboard-media-highlights__mosaic" role="list" aria-label={tabOptions.find((tab) => tab.id === activeTab)?.label}>
                {activeItems.map((item, index) => {
                const selected = item.key === selectedItem?.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="listitem"
                    className={`dashboard-media-highlights__tile ${selected ? 'dashboard-media-highlights__tile--selected' : ''}`}
                    data-size={index % 5 === 0 ? 'wide' : 'normal'}
                    onClick={() => onSelectItem(item.key)}
                    aria-pressed={selected}
                  >
                    <div className="dashboard-media-highlights__tile-media">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="dashboard-media-highlights__tile-placeholder">
                          <iconify-icon icon="solar:gallery-wide-linear" width="22" height="22"></iconify-icon>
                        </div>
                      )}
                      <div className="dashboard-media-highlights__tile-badge">{item.badge}</div>
                    </div>
                    <div className="dashboard-media-highlights__tile-content">
                      <div className="dashboard-media-highlights__tile-title">{item.title}</div>
                      <div className="dashboard-media-highlights__tile-caption">{item.caption}</div>
                    </div>
                  </button>
                )
                })}
              </div>

              <div className="dashboard-media-highlights__focus" aria-live="polite">
                {selectedItem ? (
                  <div className="dashboard-media-highlights__focus-card">
                    <div className="dashboard-media-highlights__focus-media">
                      {selectedItem.image ? (
                        <img src={selectedItem.image} alt={selectedItem.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="dashboard-media-highlights__focus-placeholder">
                          <iconify-icon icon="solar:gallery-wide-linear" width="26" height="26"></iconify-icon>
                        </div>
                      )}
                    </div>
                    <div className="dashboard-media-highlights__focus-content">
                      <div className="dashboard-media-highlights__focus-badge">{selectedItem.badge}</div>
                      <h4 className="dashboard-media-highlights__focus-title">{selectedItem.title}</h4>
                      <p className="dashboard-media-highlights__focus-caption">{selectedItem.caption}</p>

                      {selectedItem.stats && selectedItem.stats.length > 0 && (
                        <div className="dashboard-media-highlights__focus-stats">
                          {selectedItem.stats.map((stat) => (
                            <div key={`${selectedItem.key}-${stat.label}`} className="dashboard-media-highlights__focus-stat">
                              <span className="dashboard-media-highlights__focus-stat-label">{stat.label}</span>
                              <span className="dashboard-media-highlights__focus-stat-value">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="dashboard-media-highlights__focus-hint">{t('dashboard.mediaHighlights.selectItemHint')}</p>

                      <Link to={selectedItem.href} className="dashboard-media-highlights__focus-cta">
                        {selectedItem.ctaLabel}
                        <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </DashboardCollapsibleBody>
      </div>
    </section>
  )
}
