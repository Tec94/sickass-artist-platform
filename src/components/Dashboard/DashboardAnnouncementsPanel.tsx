import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import {
  DashboardForumActivity,
  type DashboardForumActivityThread,
} from './DashboardForumActivity'
import type { DashboardVisualVariant } from './dashboardVisualVariants'
import {
  DashboardCollapsibleBody,
  DashboardSectionCollapseToggle,
  type DashboardSectionCollapseControl,
} from './DashboardSectionCollapsible'

type DashboardAnnouncement = {
  _id: string
  content?: string | null
  authorDisplayName?: string | null
  authorAvatar?: string | null
  createdAt?: number
}

type DashboardAnnouncementsPanelProps = {
  announcements?: DashboardAnnouncement[] | null
  forumThreads?: DashboardForumActivityThread[] | null
  variant?: DashboardVisualVariant
  collapseControl?: DashboardSectionCollapseControl
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

const truncate = (value: string | null | undefined, maxLength: number, fallback: string): string => {
  const text = value?.trim() || fallback
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

type AnnouncementIdentityProps = {
  note: DashboardAnnouncement
  author: string
  timestampLabel: string
}

const AnnouncementIdentity = ({ note, author, timestampLabel }: AnnouncementIdentityProps) => {
  const initial = author.charAt(0).toUpperCase() || 'A'

  return (
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
        <div className="dashboard-announcements-panel__time">{timestampLabel}</div>
      </div>
    </div>
  )
}

export const DashboardAnnouncementsPanel = ({
  announcements,
  forumThreads,
  variant = 'forum-ops',
  collapseControl,
}: DashboardAnnouncementsPanelProps) => {
  const { t } = useTranslation()

  const items = [...(announcements || [])].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  const latestAnnouncements = items.slice(0, 4)

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
        <div className="dashboard-announcements-panel__header-actions">
          <Link to="/chat" className="dashboard-announcements-panel__header-link">
            {t('dashboard.announcements.viewChat')}
            <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
          </Link>
          {collapseControl ? (
            <DashboardSectionCollapseToggle
              expanded={collapseControl.expanded}
              onToggle={collapseControl.onToggle}
              contentId={collapseControl.contentId}
              sectionLabel={t('dashboard.announcements.title')}
            />
          ) : null}
        </div>
      </div>

      <DashboardCollapsibleBody expanded={collapseControl?.expanded ?? true} id={collapseControl?.contentId}>
        <div className="dashboard-announcements-panel__layout">
          <div className="dashboard-announcements-panel__feed-shell">
            {latestAnnouncements.length === 0 ? (
              <div className="dashboard-announcements-panel__empty">
                <iconify-icon icon="solar:chat-round-dots-linear" width="20" height="20"></iconify-icon>
                <span>{t('dashboard.announcements.empty')}</span>
              </div>
            ) : (
              <div className="dashboard-announcements-panel__feed" role="list" aria-label={t('dashboard.announcements.title')}>
                {latestAnnouncements.map((note, index) => {
                  const author = note.authorDisplayName?.trim() || t('dashboard.announcements.authorFallback')
                  const text = truncate(note.content, 140, t('dashboard.announcements.empty'))
                  const timestamp = formatRelativeAnnouncementTime(note.createdAt, t)

                  return (
                    <div key={note._id} role="listitem">
                      <Link to="/chat" className="dashboard-announcements-panel__feed-item">
                        <div className="dashboard-announcements-panel__feed-item-head">
                          <AnnouncementIdentity note={note} author={author} timestampLabel={timestamp} />
                          {index === 0 ? (
                            <span className="dashboard-announcements-panel__featured-badge">
                              {t('dashboard.announcements.latestBadge')}
                            </span>
                          ) : null}
                        </div>
                        <p className="dashboard-announcements-panel__feed-body">{text}</p>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="dashboard-announcements-panel__forum-column">
            <DashboardForumActivity
              threads={forumThreads}
              variant={variant}
              limit={8}
              stretch
              className="dashboard-announcements-panel__forum-activity"
            />
          </div>
        </div>
      </DashboardCollapsibleBody>
    </section>
  )
}
