import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import type { DashboardVisualVariant } from './dashboardVisualVariants'

type DashboardOverviewEvent = {
  _id: string
  title?: string | null
  city?: string | null
  startAtUtc?: number | null
}

type DashboardOverviewMerch = {
  _id: string
  name?: string | null
  price?: number | null
  category?: string | null
}

type DashboardOverviewAnnouncement = {
  _id: string
  content?: string | null
  authorDisplayName?: string | null
  createdAt?: number
}

type DashboardOverviewForumPost = {
  _id: string
  title?: string | null
  replyCount?: number
  createdAt?: number
}

export type DashboardOverviewFanProgression = {
  memberName: string | null
  points: {
    totalPoints: number
    availablePoints: number
    redeemedPoints: number
    currentStreak: number
    maxStreak: number
    lastInteractionDate: number | null
    lastLoginDate: string | null
  }
  activeQuests: Array<{
    progressId: unknown
    questId: string
    name: string
    description: string
    icon: string
    category: string
    progress: number
    target: number
    progressPercent: number
    isCompleted: boolean
    pointsClaimed: boolean
    rewardPoints: number
    expiresAt: number
    type: string
  }>
  questSummary: {
    activeCount: number
    claimableCount: number
    dailyCount: number
    weeklyCount: number
  }
} | null

export type DashboardOverviewSnapshot = {
  isSignedIn: boolean
  fetchedAt?: number | null
  nextEvent?: DashboardOverviewEvent | null
  topProduct?: DashboardOverviewMerch | null
  featuredAnnouncement?: DashboardOverviewAnnouncement | null
  forumPosts?: DashboardOverviewForumPost[] | null
  fanProgression?: DashboardOverviewFanProgression
}

type DashboardOverviewPanelProps = {
  snapshot?: DashboardOverviewSnapshot | null
  variant?: DashboardVisualVariant
}

const formatLastUpdated = (fetchedAt: number | null | undefined): string => {
  if (typeof fetchedAt !== 'number' || !Number.isFinite(fetchedAt)) {
    return '--'
  }

  return new Date(fetchedAt).toLocaleString()
}

const formatDate = (timestamp: number | null | undefined): string => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return '--'
  }

  return new Date(timestamp).toLocaleDateString()
}

const formatRelative = (timestamp: number | undefined): string => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return '--'
  }

  const diffMs = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${Math.max(1, minutes)}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return formatDate(timestamp)
}

const formatPoints = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--'
  }

  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return new Intl.NumberFormat().format(value)
}

const formatCurrencyCents = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--'
  }

  return `$${(value / 100).toFixed(2)}`
}

const clampText = (value: string | null | undefined, max: number): string => {
  const text = value?.trim()
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

const questProgressLabel = (progress: number, target: number): string => `${Math.max(0, progress)} / ${Math.max(1, target)}`

export const DashboardOverviewPanel = ({
  snapshot,
  variant = 'forum-ops',
}: DashboardOverviewPanelProps) => {
  const { t } = useTranslation()
  const isSignedIn = Boolean(snapshot?.isSignedIn)
  const featuredAnnouncement = snapshot?.featuredAnnouncement ?? null
  const nextEvent = snapshot?.nextEvent ?? null
  const topProduct = snapshot?.topProduct ?? null
  const topForumPost = (snapshot?.forumPosts || [])[0] ?? null
  const fanProgression = snapshot?.fanProgression ?? null
  const questItems = fanProgression?.activeQuests?.slice(0, 3) || []

  const signalBody =
    clampText(featuredAnnouncement?.content, 200) || t('dashboard.overview.signalFallbackBody')
  const signalAuthor =
    featuredAnnouncement?.authorDisplayName?.trim() || t('dashboard.announcements.authorFallback')

  return (
    <section
      className="dashboard-overview-panel mt-16"
      data-dashboard-variant={variant}
      aria-labelledby="dashboard-overview-title"
    >
      <div className="dashboard-overview-panel__shell">
        <div className="dashboard-overview-panel__header">
          <div>
            <p className="dashboard-overview-panel__eyebrow">Overview</p>
            <h3 id="dashboard-overview-title" className="dashboard-overview-panel__title">
              {t('dashboard.overview.title')}
            </h3>
          </div>
          <div className="dashboard-overview-panel__sync">
            <span className="dashboard-overview-panel__sync-label">{t('dashboard.overview.lastUpdated')}</span>
            <span className="dashboard-overview-panel__sync-value">{formatLastUpdated(snapshot?.fetchedAt)}</span>
          </div>
        </div>

        <div className="dashboard-overview-panel__snapshot">
          <div className="dashboard-overview-panel__signal">
            <div className="dashboard-overview-panel__signal-top">
              <p className="dashboard-overview-panel__signal-kicker">{t('dashboard.overview.tonightTitle')}</p>
              <div className="dashboard-overview-panel__signal-pill">
                <iconify-icon icon="solar:bolt-circle-bold-duotone" width="14" height="14"></iconify-icon>
                {t('dashboard.overview.liveSignal')}
              </div>
            </div>
            <p className="dashboard-overview-panel__signal-body">{signalBody}</p>
            <div className="dashboard-overview-panel__signal-meta">
              <span>{signalAuthor}</span>
              <span aria-hidden="true">•</span>
              <span>{formatRelative(featuredAnnouncement?.createdAt)}</span>
            </div>
            <div className="dashboard-overview-panel__signal-actions">
              <Link to="/chat" className="dashboard-overview-panel__action">
                <iconify-icon icon="solar:chat-line-bold-duotone" width="16" height="16"></iconify-icon>
                {t('dashboard.overview.openChat')}
              </Link>
              <Link to="/gallery" className="dashboard-overview-panel__action">
                <iconify-icon icon="solar:gallery-wide-bold-duotone" width="16" height="16"></iconify-icon>
                {t('dashboard.overview.browseGallery')}
              </Link>
              <Link to="/ranking" className="dashboard-overview-panel__action">
                <iconify-icon icon="solar:cup-star-bold" width="16" height="16"></iconify-icon>
                {t('dashboard.overview.viewRankings')}
              </Link>
              <Link to={isSignedIn ? '/quests' : '/sign-in'} className="dashboard-overview-panel__action">
                <iconify-icon icon="solar:medal-ribbons-star-bold-duotone" width="16" height="16"></iconify-icon>
                {isSignedIn ? t('dashboard.overview.viewQuests') : t('dashboard.overview.signInToTrack')}
              </Link>
            </div>
          </div>

          <div className="dashboard-overview-panel__preview-column">
            <div className="dashboard-overview-panel__preview-grid" role="list" aria-label={t('dashboard.overview.previewGridLabel')}>
              <Link to="/events" className="dashboard-overview-panel__preview-card" data-tone="amber" role="listitem">
                <div className="dashboard-overview-panel__preview-head">
                  <span className="dashboard-overview-panel__preview-label">
                    <iconify-icon icon="solar:ticket-bold-duotone" width="14" height="14"></iconify-icon>
                    {t('dashboard.overview.previewEventLabel')}
                  </span>
                  <span className="dashboard-overview-panel__preview-cta">{t('dashboard.overview.previewEventCta')}</span>
                </div>
                <div className="dashboard-overview-panel__preview-title">
                  {nextEvent?.title?.trim() || t('dashboard.overview.previewEventEmpty')}
                </div>
                <div className="dashboard-overview-panel__preview-meta">
                  {nextEvent
                    ? `${formatDate(nextEvent.startAtUtc ?? undefined)} • ${nextEvent.city?.trim() || '--'}`
                    : t('dashboard.overview.previewEventMetaEmpty')}
                </div>
              </Link>

              <Link to="/store" className="dashboard-overview-panel__preview-card" data-tone="crimson" role="listitem">
                <div className="dashboard-overview-panel__preview-head">
                  <span className="dashboard-overview-panel__preview-label">
                    <iconify-icon icon="solar:fire-bold-duotone" width="14" height="14"></iconify-icon>
                    {t('dashboard.overview.previewMerchLabel')}
                  </span>
                  <span className="dashboard-overview-panel__preview-cta">{t('dashboard.overview.previewMerchCta')}</span>
                </div>
                <div className="dashboard-overview-panel__preview-title">
                  {topProduct?.name?.trim() || t('dashboard.overview.previewMerchEmpty')}
                </div>
                <div className="dashboard-overview-panel__preview-meta">
                  {topProduct
                    ? `${formatCurrencyCents(topProduct.price ?? undefined)} • ${(topProduct.category || t('dashboard.overview.categoryFallback')).toUpperCase()}`
                    : t('dashboard.overview.previewMerchMetaEmpty')}
                </div>
              </Link>

              <Link to="/forum" className="dashboard-overview-panel__preview-card" data-tone="steel" role="listitem">
                <div className="dashboard-overview-panel__preview-head">
                  <span className="dashboard-overview-panel__preview-label">
                    <iconify-icon icon="solar:chat-line-bold-duotone" width="14" height="14"></iconify-icon>
                    {t('dashboard.overview.previewForumLabel')}
                  </span>
                  <span className="dashboard-overview-panel__preview-cta">{t('dashboard.overview.previewForumCta')}</span>
                </div>
                <div className="dashboard-overview-panel__preview-title">
                  {clampText(topForumPost?.title, 60) || t('dashboard.overview.previewForumEmpty')}
                </div>
                <div className="dashboard-overview-panel__preview-meta">
                  {topForumPost
                    ? `${topForumPost.replyCount || 0} ${t('dashboard.replies')} • ${formatDate(topForumPost.createdAt)}`
                    : t('dashboard.overview.previewForumMetaEmpty')}
                </div>
              </Link>
            </div>
          </div>

          <div className="dashboard-overview-panel__progression">
            <div className="dashboard-overview-panel__progression-header">
              <div>
                <p className="dashboard-overview-panel__progression-kicker">{t('dashboard.overview.progressionTitle')}</p>
                <h4 className="dashboard-overview-panel__progression-heading">
                  {isSignedIn
                    ? (fanProgression?.memberName || t('dashboard.overview.progressionHeadingFallback'))
                    : t('dashboard.overview.progressionGuestTitle')}
                </h4>
              </div>
              {isSignedIn ? (
                <Link to="/quests" className="dashboard-overview-panel__progression-link">
                  {t('dashboard.overview.viewQuests')}
                  <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
                </Link>
              ) : (
                <Link to="/sign-in" className="dashboard-overview-panel__progression-link">
                  {t('dashboard.overview.signInToTrack')}
                  <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
                </Link>
              )}
            </div>

            {isSignedIn && fanProgression ? (
              <>
                <div className="dashboard-overview-panel__progression-stats">
                  <div className="dashboard-overview-panel__progression-stat">
                    <div className="dashboard-overview-panel__progression-stat-label">{t('dashboard.overview.availablePoints')}</div>
                    <div className="dashboard-overview-panel__progression-stat-value">{formatPoints(fanProgression.points.availablePoints)}</div>
                  </div>
                  <div className="dashboard-overview-panel__progression-stat">
                    <div className="dashboard-overview-panel__progression-stat-label">{t('dashboard.overview.totalPoints')}</div>
                    <div className="dashboard-overview-panel__progression-stat-value">{formatPoints(fanProgression.points.totalPoints)}</div>
                  </div>
                  <div className="dashboard-overview-panel__progression-stat">
                    <div className="dashboard-overview-panel__progression-stat-label">{t('dashboard.overview.currentStreak')}</div>
                    <div className="dashboard-overview-panel__progression-stat-value">{fanProgression.points.currentStreak}</div>
                    <div className="dashboard-overview-panel__progression-stat-subtle">
                      {t('dashboard.overview.bestStreak')}: {fanProgression.points.maxStreak}
                    </div>
                  </div>
                </div>

                <div className="dashboard-overview-panel__progression-summary">
                  <span>{t('dashboard.overview.activeQuests')}: {fanProgression.questSummary.activeCount}</span>
                  <span>{t('dashboard.overview.claimableQuests')}: {fanProgression.questSummary.claimableCount}</span>
                  <span>{t('dashboard.overview.dailyQuests')}: {fanProgression.questSummary.dailyCount}</span>
                </div>

                <div className="dashboard-overview-panel__quest-list">
                  {questItems.length > 0 ? (
                    questItems.map((quest) => (
                      <div key={`${quest.questId}-${quest.progressId as string}`} className="dashboard-overview-panel__quest-item">
                        <div className="dashboard-overview-panel__quest-row">
                          <div className="dashboard-overview-panel__quest-name">{quest.name}</div>
                          <div className="dashboard-overview-panel__quest-percent">{quest.progressPercent}%</div>
                        </div>
                        <div className="dashboard-overview-panel__quest-bar" aria-hidden="true">
                          <span style={{ width: `${Math.max(0, Math.min(100, quest.progressPercent))}%` }} />
                        </div>
                        <div className="dashboard-overview-panel__quest-meta">
                          <span>{questProgressLabel(quest.progress, quest.target)}</span>
                          <span>+{quest.rewardPoints} {t('dashboard.overview.pointsLabel')}</span>
                          <span>{formatRelative(quest.expiresAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-overview-panel__quest-empty">
                      {t('dashboard.overview.questEmpty')}
                    </div>
                  )}
                </div>
              </>
            ) : isSignedIn ? (
              <div className="dashboard-overview-panel__progression-empty">
                <p>{t('dashboard.overview.progressionUnavailable')}</p>
                <p className="dashboard-overview-panel__progression-empty-subtle">{t('dashboard.overview.progressionUnavailableHint')}</p>
              </div>
            ) : (
              <div className="dashboard-overview-panel__progression-empty">
                <p>{t('dashboard.overview.progressionGuestBody')}</p>
                <p className="dashboard-overview-panel__progression-empty-subtle">{t('dashboard.overview.progressionGuestHint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

