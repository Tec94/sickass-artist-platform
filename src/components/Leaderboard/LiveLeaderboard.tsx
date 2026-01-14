import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { motion } from 'framer-motion'

export const LiveLeaderboard = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly')
  
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { 
    period,
    limit: 10
  })

  // Helper to format period display
  const getPeriodLabel = () => {
    switch(period) {
      case 'weekly': return 'This Week'
      case 'monthly': return 'This Month'
      case 'allTime': return 'All Time'
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-white uppercase flex items-center gap-2">
            <iconify-icon icon="solar:cup-star-bold" class="text-yellow-500" width="24" height="24"></iconify-icon> Live Rankings
          </h3>
          <div className="flex bg-zinc-800 rounded-lg p-1">
            {(['weekly', 'monthly', 'allTime'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition ${
                  period === p 
                    ? 'bg-zinc-700 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {p === 'allTime' ? 'All' : p}
              </button>
            ))}
          </div>
        </div>
        <p className="text-zinc-400 text-sm flex items-center gap-2">
          <iconify-icon icon="solar:calendar-linear" width="14" height="14"></iconify-icon> Top songs for {getPeriodLabel()}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
        {leaderboard === undefined ? (
          // Loading State
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 p-6 text-center">
            <iconify-icon icon="solar:music-library-2-bold-duotone" width="48" height="48" class="mb-4 opacity-20"></iconify-icon>
            <p className="font-bold">No rankings yet</p>
            <p className="text-sm mt-1">Be the first to submit your top songs!</p>
          </div>
        ) : (
          // List
          <div className="divide-y divide-zinc-800/50">
            {leaderboard.map((song, index) => (
              <motion.div
                key={`${song.spotifyTrackId}-${period}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition group ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                }`}
              >
                {/* Rank */}
                <div className={`
                  w-8 text-center font-display font-bold text-xl flex-shrink-0
                  ${index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-zinc-300' : 
                    index === 2 ? 'text-amber-700' : 'text-zinc-600'}
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
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1 rounded-full shadow-lg flex items-center justify-center">
                      <iconify-icon icon="solar:medal-ribbon-bold" width="12" height="12"></iconify-icon>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-white truncate ${index === 0 ? 'text-lg' : 'text-sm'}`}>
                    {song.songTitle}
                  </h4>
                  <p className="text-zinc-400 text-xs truncate">{song.songArtist}</p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold font-mono">
                    {song.totalScore.toFixed(1)}
                  </div>
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider">
                    Score
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 text-center">
        <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
          <iconify-icon icon="solar:chart-2-linear" width="12" height="12"></iconify-icon> Scores update hourly based on community votes
        </p>
      </div>
    </div>
  )
}
