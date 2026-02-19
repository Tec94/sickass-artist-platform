import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { motion } from 'framer-motion'
import { useTranslation } from '../../hooks/useTranslation'
import type { LeaderboardPeriod } from '../../utils/leaderboard'

interface LiveLeaderboardProps {
  period?: LeaderboardPeriod
  onPeriodChange?: (period: LeaderboardPeriod) => void
  limit?: number
  showTabs?: boolean
}

export const LiveLeaderboard = ({
  period,
  onPeriodChange,
  limit: limitProp,
  showTabs = true,
}: LiveLeaderboardProps) => {
  const [internalPeriod, setInternalPeriod] = useState<LeaderboardPeriod>('weekly')
  const activePeriod = period ?? internalPeriod
  const setPeriod = onPeriodChange ?? setInternalPeriod
  const { t } = useTranslation()
  const limit = Math.min(limitProp ?? 10, 50)
  const periodOptions: LeaderboardPeriod[] = ['weekly', 'monthly', 'allTime']
  
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { 
    period: activePeriod,
    limit
  })

  // Helper to format period display
  const getPeriodLabel = () => {
    switch(activePeriod) {
      case 'weekly': return t('events.thisWeek')
      case 'monthly': return t('events.thisMonth')
      case 'allTime': return t('ranking.allTimeLabel')
      case 'quarterly': return t('ranking.allTimeLabel')
    }
  }

  return (
    <div className="bg-[#111A24]/88 border border-[#2A3541] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[#2A3541] bg-[#0D151F]/70">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-semibold text-[#E8E1D5] uppercase flex items-center gap-2 whitespace-nowrap">
              <iconify-icon icon="solar:cup-star-bold" class="text-[#C7A97A] flex-shrink-0" width="22" height="22"></iconify-icon> 
              <span className="truncate">{t('ranking.liveRankings')}</span>
            </h3>
          </div>
          
          {showTabs && (
            <div className="flex bg-[#0A1118] border border-[#2A3541] rounded-lg p-1 w-full">
              {periodOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded-md transition-colors whitespace-nowrap ${
                    activePeriod === p 
                      ? 'bg-[#A62B3A] text-[#E8E1D5] shadow-[0_8px_18px_rgba(166,43,58,0.26)]' 
                      : 'text-[#8FA0B2] hover:text-[#E8E1D5] hover:bg-[#1A2531]'
                  }`}
                >
                  {p === 'allTime' ? t('ranking.allTime') : t(`events.${p === 'weekly' ? 'thisWeek' : 'thisMonth'}`)}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[#9AA7B5] text-sm flex items-center gap-2">
          <iconify-icon icon="solar:calendar-linear" width="14" height="14"></iconify-icon> {t('ranking.topSongsFor')} {getPeriodLabel()}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {leaderboard === undefined ? (
          // Loading State
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#1A2531]/70 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-[#7D8EA1] p-6 text-center">
            <iconify-icon icon="solar:music-library-2-bold-duotone" width="48" height="48" class="mb-4 opacity-20"></iconify-icon>
            <p className="font-semibold text-[#A8B5C3]">{t('ranking.noRankingsYet')}</p>
            <p className="text-sm mt-1">{t('ranking.beFirstToSubmit')}</p>
          </div>
        ) : (
          // List
          <div className="divide-y divide-[#25313D]">
            {leaderboard.map((song, index) => (
              <motion.div
                key={`${song.spotifyTrackId}-${period}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  index === 0 ? 'bg-gradient-to-r from-[#C7A97A]/12 to-transparent' : ''
                }`}
              >
                {/* Rank */}
                <div className={`
                  w-8 text-center font-display font-bold text-xl flex-shrink-0
                  ${index === 0 ? 'text-[#D1B281]' : 
                    index === 1 ? 'text-[#C7D2DE]' : 
                    index === 2 ? 'text-[#A88658]' : 'text-[#6D7E8F]'}
                `}>
                  {index + 1}
                </div>

                {/* Cover */}
                <div className="relative">
                  <img 
                    src={song.albumCover} 
                    alt={song.songTitle} 
                    className={`object-cover rounded shadow-lg ${
                      index === 0 ? 'w-16 h-16' : 'w-12 h-12'
                    }`}
                  />
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-[#C7A97A] text-[#111A24] p-1 rounded-full shadow-lg flex items-center justify-center">
                      <iconify-icon icon="solar:medal-ribbon-bold" width="12" height="12"></iconify-icon>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-[#E8E1D5] truncate ${index === 0 ? 'text-lg' : 'text-sm'}`}>
                    {song.songTitle}
                  </h4>
                  <p className="text-[#8EA0B3] text-xs truncate">{song.songArtist}</p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[#E8E1D5] font-semibold font-mono">
                    {song.totalScore.toFixed(1)}
                  </div>
                  <div className="text-[#6E8093] text-[10px] uppercase tracking-wider">
                    {t('ranking.score')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-[#2A3541] bg-[#0D151F]/75 text-center">
        <p className="text-xs text-[#75879A] flex items-center justify-center gap-2">
          <iconify-icon icon="solar:chart-2-linear" width="12" height="12"></iconify-icon> {t('ranking.updateHourly')}
        </p>
      </div>
    </div>
  )
}
