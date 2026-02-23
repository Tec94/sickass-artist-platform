import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import type { DashboardVisualVariant } from './dashboardVisualVariants'

type DashboardAnnouncement = {
  _id: string
  content?: string | null
  authorDisplayName?: string | null
  authorAvatar?: string | null
  createdAt?: number
}

type DashboardAnnouncementsPanelProps = {
  announcements?: DashboardAnnouncement[] | null
  variant?: DashboardVisualVariant
}

const formatRelativeAnnouncementTime = (timestamp: number | undefined, t: (key: string) => string): string => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return '--'
  }

  const diffMs = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 60) {
    return `${Math.max(1, minutes)}${t('dashboard.announcements.minutesAgo')}`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}${t('dashboard.announcements.hoursAgo')}`
  }

  return new Date(timestamp).toLocaleDateString()
}

export const DashboardAnnouncementsPanel = ({
  announcements,
  variant = 'forum-ops',
}: DashboardAnnouncementsPanelProps) => {
  const { t } = useTranslation()
  const items = (announcements || []).slice(0, 5)

  return (
    <section
      className="dashboard-announcements-panel mt-16"
      data-dashboard-variant={variant}
      aria-labelledby="dashboard-announcements-title"
    >
      <div className="dashboard-announcements-panel__header">
        <div>
          <p className="dashboard-announcements-panel__eyebrow">Announcements</p>
          <h3 id="dashboard-announcements-title" className="dashboard-announcements-panel__title">
            {t('dashboard.announcements.title')}
          </h3>
        </div>
        <Link to="/chat" className="dashboard-announcements-panel__header-link">
          {t('dashboard.announcements.viewChat')}
          <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-announcements-panel__empty">
          <iconify-icon icon="solar:chat-round-dots-linear" width="20" height="20"></iconify-icon>
          <span>{t('dashboard.announcements.empty')}</span>
        </div>
      ) : (
        <div className="dashboard-announcements-panel__grid">
          {items.map((note) => {
            const author = note.authorDisplayName?.trim() || t('dashboard.announcements.authorFallback')
            const text = note.content?.trim() || t('dashboard.announcements.empty')
            const initial = author.charAt(0).toUpperCase() || 'A'

            return (
              <Link key={note._id} to="/chat" className="dashboard-announcements-panel__card">
                <div className="dashboard-announcements-panel__card-top">
                  <div className="dashboard-announcements-panel__avatar" aria-hidden="true">
                    {note.authorAvatar ? (
                      <img src={note.authorAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="dashboard-announcements-panel__author">{author}</div>
                    <div className="dashboard-announcements-panel__time">
                      {formatRelativeAnnouncementTime(note.createdAt, t)}
                    </div>
                  </div>
                </div>

                <p className="dashboard-announcements-panel__body">
                  {text.length > 140 ? `${text.slice(0, 140)}...` : text}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
