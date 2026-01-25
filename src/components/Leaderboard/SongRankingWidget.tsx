import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { SongSubmissionModal } from './SongSubmissionModal'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

import { useTranslation } from '../../hooks/useTranslation'
import type { LeaderboardPeriod } from '../../utils/leaderboard'

interface SongRankingWidgetProps {
  period: LeaderboardPeriod
}

export const SongRankingWidget = ({ period }: SongRankingWidgetProps) => {
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

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <iconify-icon icon="solar:music-library-2-bold-duotone" width="24" height="24"></iconify-icon>
        </div>
        
        <h3 className="text-[17px] font-display font-bold text-white mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {t('ranking.rankYourTop')}
        </h3>
        
        <p className="text-zinc-400 text-sm mb-6 max-w-xs">
          {hasSubmission ? 'Revise your list anytime. Edits do not count as new submissions.' : t('ranking.submitInfluence')}
        </p>

        {hasSubmission && lastEditedAt && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-zinc-800 text-xs text-zinc-300 border border-zinc-700">
            Saved {new Date(lastEditedAt).toLocaleString()}
          </div>
        )}

        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/20"
        >
          <iconify-icon icon={hasSubmission ? 'solar:pen-new-square-bold' : 'solar:add-circle-bold'} width="18" height="18"></iconify-icon>
          {hasSubmission ? 'Edit Ranking' : t('ranking.submitRanking')}
        </motion.button>

        {!user && (
          <p className="text-xs text-zinc-500 mt-3">
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
