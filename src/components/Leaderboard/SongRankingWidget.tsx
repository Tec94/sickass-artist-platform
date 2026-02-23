import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { SongSubmissionModal } from './SongSubmissionModal'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

import { useTranslation } from '../../hooks/useTranslation'
import type { LeaderboardPeriod } from '../../utils/leaderboard'
import type { DashboardVisualVariant } from '../Dashboard/dashboardVisualVariants'

interface SongRankingWidgetProps {
  period: LeaderboardPeriod
  variant?: DashboardVisualVariant
}

export const SongRankingWidget = ({ period, variant = 'forum-ops' }: SongRankingWidgetProps) => {
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
        className={`dashboard-ranking-widget ${variantRootClass} bg-[#111A24]/88 border border-[#2A3541] rounded-xl p-6 flex flex-col items-center text-center`}
        data-dashboard-variant={variant}
      >
        <div className="w-12 h-12 bg-[#A62B3A]/20 text-[#C97C88] rounded-full flex items-center justify-center mb-4">
          <iconify-icon icon="solar:music-library-2-bold-duotone" width="24" height="24"></iconify-icon>
        </div>
        
        <h3 className="text-[17px] font-display font-semibold text-[#E8E1D5] mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {t('ranking.rankYourTop')}
        </h3>
        
        <p className="text-[#9AA7B5] text-sm mb-6 max-w-xs">
          {hasSubmission ? 'Revise your list anytime. Edits do not count as new submissions.' : t('ranking.submitInfluence')}
        </p>

        {hasSubmission && lastEditedAt && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[#0A1118] text-xs text-[#9AA7B5] border border-[#2A3541]">
            Saved {new Date(lastEditedAt).toLocaleString()}
          </div>
        )}

        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-[#A62B3A] hover:bg-[#B43849] active:bg-[#7F1F2C] text-[#F5EFE4] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#20080d]/35"
        >
          <iconify-icon icon={hasSubmission ? 'solar:pen-new-square-bold' : 'solar:add-circle-bold'} width="18" height="18"></iconify-icon>
          {hasSubmission ? 'Edit Ranking' : t('ranking.submitRanking')}
        </motion.button>

        {!user && (
          <p className="text-xs text-[#6F7E8E] mt-3">
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
