import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { SongSubmissionModal } from './SongSubmissionModal'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

import { useTranslation } from '../../hooks/useTranslation'
import type { LeaderboardPeriod } from '../../utils/leaderboard'
import type { DashboardVisualVariant } from '../Dashboard/dashboardVisualVariants'
import type { UiTone } from '../../types/ui-color'

interface SongRankingWidgetProps {
  period: LeaderboardPeriod
  variant?: DashboardVisualVariant
  tone?: UiTone
}

const toneButtonClasses: Record<UiTone, string> = {
  brand: 'bg-[var(--color-accent-brand)] hover:bg-[var(--color-accent-brand-hover)] text-[var(--color-accent-brand-foreground)]',
  neutral: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  info: 'bg-sky-700 hover:bg-sky-600 text-sky-50',
  success: 'bg-emerald-700 hover:bg-emerald-600 text-emerald-50',
  warning: 'bg-amber-700 hover:bg-amber-600 text-amber-50',
  danger: 'bg-rose-700 hover:bg-rose-600 text-rose-50',
}

export const SongRankingWidget = ({ period, variant = 'forum-ops', tone = 'brand' }: SongRankingWidgetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()
  const { t } = useTranslation()
  const userSubmission = useQuery(
    api.leaderboard.getUserSubmissionForPeriod,
    user ? { period } : 'skip'
  )
  const hasSubmission = Boolean(userSubmission)
  const lastEditedAt =
    userSubmission?.lastEditedAt ?? userSubmission?.updatedAt ?? userSubmission?.createdAt
  const variantRootClass =
    variant === 'curated-shop'
      ? 'dashboard-ranking-widget--curated'
      : variant === 'ranking-nocturne'
        ? 'dashboard-ranking-widget--nocturne'
        : 'dashboard-ranking-widget--ops'

  return (
    <>
      <div
        className={`dashboard-ranking-widget ${variantRootClass} rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/90 p-6 flex flex-col items-center text-center`}
        data-dashboard-variant={variant}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-brand)]/20 text-[var(--color-accent-brand-soft)]">
          <iconify-icon icon="solar:music-library-2-bold-duotone" width="24" height="24"></iconify-icon>
        </div>
        
        <h3 className="mb-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-display font-semibold text-[var(--color-text-primary)]">
          {t('ranking.rankYourTop')}
        </h3>
        
        <p className="mb-6 max-w-xs text-sm text-[var(--color-text-secondary)]">
          {hasSubmission ? 'Revise your list anytime. Edits do not count as new submissions.' : t('ranking.submitInfluence')}
        </p>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
            <iconify-icon icon="solar:cup-star-linear" width="12" height="12"></iconify-icon>
            {t('ranking.top10Signal')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
            <iconify-icon icon="solar:bolt-linear" width="12" height="12"></iconify-icon>
            {t('ranking.liveMomentum')}
          </span>
        </div>

        {hasSubmission && lastEditedAt && (
          <div className="mb-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
            Saved {new Date(lastEditedAt).toLocaleString()}
          </div>
        )}

        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileTap={{ scale: 0.98 }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold uppercase tracking-wider transition-colors ${toneButtonClasses[tone]}`}
        >
          <iconify-icon icon={hasSubmission ? 'solar:pen-new-square-bold' : 'solar:add-circle-bold'} width="18" height="18"></iconify-icon>
          {hasSubmission ? 'Edit Ranking' : t('ranking.submitRanking')}
        </motion.button>

        {!user && (
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            {t('ranking.signInToParticipate')}
          </p>
        )}
      </div>

      <SongSubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        period={period}
      />
    </>
  )
}
