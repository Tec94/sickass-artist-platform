import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import type { DashboardVisualVariant } from './dashboardVisualVariants'

export type DashboardForumActivityThread = {
  _id: string
  title?: string | null
  replyCount?: number
  netVoteCount?: number
  viewCount?: number
  createdAt?: number
}

type DashboardForumActivityProps = {
  threads?: DashboardForumActivityThread[] | null
  variant?: DashboardVisualVariant
  limit?: number
  stretch?: boolean
  className?: string
}

const compactNumber = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--'
  }
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return `${value}`
}

const formatDate = (timestamp: unknown): string => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return '--'
  }
  return new Date(timestamp).toLocaleDateString()
}

export const DashboardForumActivity = ({
  threads,
  variant = 'forum-ops',
  limit = 4,
  stretch = false,
  className,
}: DashboardForumActivityProps) => {
  const { t } = useTranslation()
  const rows = (threads || []).slice(0, limit)
  const rootClassName = ['dashboard-forum-activity', className].filter(Boolean).join(' ')

  return (
    <section
      className={rootClassName}
      data-dashboard-variant={variant}
      data-stretch={stretch ? 'true' : 'false'}
      aria-labelledby="dashboard-forum-activity-title"
    >
      <div className="dashboard-forum-activity__shell">
        <div className="dashboard-forum-activity__header">
          <div>
            <p className="dashboard-forum-activity__eyebrow">Forum</p>
            <h3 id="dashboard-forum-activity-title" className="dashboard-forum-activity__title">
              {t('dashboard.forumActivity.title')}
            </h3>
          </div>
          <Link to="/forum" className="dashboard-forum-activity__link">
            {t('dashboard.forumActivity.viewForum')}
            <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14"></iconify-icon>
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="dashboard-forum-activity__empty">
            <iconify-icon icon="solar:chat-line-linear" width="18" height="18"></iconify-icon>
            <span>{t('dashboard.forumActivity.empty')}</span>
          </div>
        ) : (
          <div className="dashboard-forum-activity__table" role="table" aria-label={t('dashboard.forumActivity.title')}>
            <div className="dashboard-forum-activity__head" role="row">
              <span role="columnheader">{t('dashboard.forumActivity.thread')}</span>
              <span role="columnheader">{t('dashboard.forumActivity.replies')}</span>
              <span role="columnheader">{t('dashboard.forumActivity.votes')}</span>
              <span role="columnheader">{t('dashboard.forumActivity.views')}</span>
              <span role="columnheader">{t('dashboard.forumActivity.date')}</span>
            </div>

            <div className="dashboard-forum-activity__body">
              {rows.map((thread) => (
                <Link
                  key={thread._id}
                  to={`/forum/thread/${thread._id}`}
                  className="dashboard-forum-activity__row"
                >
                  <span className="dashboard-forum-activity__thread">
                    {thread.title?.trim() || '--'}
                  </span>
                  <span>{compactNumber(thread.replyCount)}</span>
                  <span>{compactNumber(thread.netVoteCount)}</span>
                  <span>{compactNumber(thread.viewCount)}</span>
                  <span>{formatDate(thread.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
