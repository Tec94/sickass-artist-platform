import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Doc } from '../../convex/_generated/dataModel'

type LeaderboardEntry = Doc<'songLeaderboard'> & { rank: number }

export const SongLeaderboard = ({
  period = 'monthly',
}: {
  period?: 'monthly' | 'quarterly' | 'allTime'
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'allTime'>(period)
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    period: selectedPeriod,
    limit: 50,
  })

  if (!leaderboard) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">
          Community Song Rankings
        </h1>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['monthly', 'quarterly', 'allTime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedPeriod === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {p === 'allTime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No rankings yet. Be the first to submit!
            </p>
          </div>
        ) : (
          leaderboard.map((entry: LeaderboardEntry, index: number) => (
            <motion.div
              key={entry._id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition flex items-center gap-4"
              whileHover={{ x: 8 }}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Rank */}
              <div className="text-right w-12">
                <div
                  className={`text-2xl font-bold ${
                    index === 0
                      ? 'text-yellow-400'
                      : index === 1
                      ? 'text-gray-400'
                      : index === 2
                      ? 'text-orange-400'
                      : 'text-gray-500'
                  }`}
                >
                  #{entry.rank}
                </div>
              </div>

              {/* Album Cover */}
              {entry.albumCover && (
                <img
                  src={entry.albumCover}
                  alt={entry.songTitle}
                  className="w-16 h-16 rounded object-cover"
                />
              )}

              {/* Song Info */}
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{entry.songTitle}</h3>
                <p className="text-sm text-gray-400">{entry.songArtist}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-400">{entry.totalScore}</p>
                  <p className="text-xs text-gray-400">Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">{entry.uniqueVoters}</p>
                  <p className="text-xs text-gray-400">Voters</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
