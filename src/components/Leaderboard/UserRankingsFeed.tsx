import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useAuth } from '../../hooks/useAuth'
import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../../hooks/useTranslation'
import { getCurrentLeaderboardId, type LeaderboardPeriod } from '../../utils/leaderboard'

function normalizeFanTier(tier?: string): 'bronze' | 'silver' | 'gold' | 'platinum' {
  switch (tier) {
    case 'silver':
    case 'gold':
    case 'platinum':
      return tier
    default:
      return 'bronze'
  }
}

interface UserRankingsFeedProps {
  period: LeaderboardPeriod
}

export const UserRankingsFeed = ({ period }: UserRankingsFeedProps) => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const leaderboardId = useMemo(() => getCurrentLeaderboardId(period), [period])
  const trendingSubmissions = useQuery(api.leaderboard.getTrendingSubmissions, {
    limit: 6,
    leaderboardId,
  })
  const voteMutation = useMutation(api.leaderboard.voteOnSubmission)
  const [votingId, setVotingId] = useState<string | null>(null)

  const handleVote = async (submissionId: Id<'songSubmissions'>) => {
    if (!user) return
    setVotingId(submissionId)
    try {
      await voteMutation({
        submissionId,
        voteType: 'upvote',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setVotingId(null)
    }
  }

  if (!trendingSubmissions) {
    return <div className="animate-pulse h-40 bg-zinc-900 rounded-xl" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-display font-bold text-white flex items-center gap-2 whitespace-nowrap min-w-0">
          <iconify-icon
            icon="solar:chart-2-bold-duotone"
            width="24"
            height="24"
            class="text-purple-500 flex-shrink-0"
          ></iconify-icon>
          <span className="truncate">{t('ranking.communityRankings')}</span>
        </h3>
        <span className="text-xs text-zinc-500 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          {t('ranking.top6Trending')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trendingSubmissions.map((sub) => {
          const avatarUser = sub.user
            ? {
                username: sub.user.username ?? 'fan',
                displayName: sub.user.displayName ?? sub.user.username ?? 'Fan',
                avatar: sub.user.avatar ?? '',
                fanTier: normalizeFanTier(sub.user.fanTier),
              }
            : null

          const displayName = sub.user?.displayName ?? sub.user?.username ?? t('common.unknownUser')

          return (
            <motion.div
              key={sub._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {avatarUser ? (
                    <div className="scale-90 origin-left">
                      <ProfileAvatar user={avatarUser} size="sm" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                      <iconify-icon icon="solar:user-circle-linear" class="text-zinc-600"></iconify-icon>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-white line-clamp-1">{displayName}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                  <iconify-icon icon="solar:like-bold" width="14" height="14"></iconify-icon>
                  <span className="text-xs font-bold">{sub.upvoteCount}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {sub.rankedSongs.slice(0, 3).map((song, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 text-center text-xs font-bold text-zinc-600">#{song.rank}</div>
                    <img src={song.albumCover} alt="" className="w-8 h-8 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate">{song.title}</div>
                      <div className="text-xs text-zinc-500 truncate">{song.artist}</div>
                    </div>
                  </div>
                ))}
                {(sub.submissionType === 'top10' ||
                  sub.submissionType === 'top15' ||
                  sub.submissionType === 'top25') && (
                  <div className="text-xs text-center text-zinc-600 italic pt-1">
                    + {sub.rankedSongs.length - 3} {t('common.moreSongs')}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleVote(sub._id)}
                disabled={!user || sub.hasUpvoted || votingId === sub._id}
                className={`w-full py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                  sub.hasUpvoted
                    ? 'bg-green-600/20 text-green-500 cursor-default'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-purple-600 hover:text-white'
                }`}
              >
                {sub.hasUpvoted ? (
                  <>
                    <iconify-icon icon="solar:check-circle-bold" width="16" height="16"></iconify-icon>{' '}
                    {t('ranking.voted')}
                  </>
                ) : (
                  <>
                    <iconify-icon icon="solar:like-linear" width="16" height="16"></iconify-icon>{' '}
                    {t('ranking.upvoteRanking')}
                  </>
                )}
              </button>
            </motion.div>
          )
        })}

        {trendingSubmissions.length === 0 && (
          <div className="col-span-full text-center py-10 text-zinc-500 flex flex-col items-center gap-3">
            <iconify-icon icon="solar:upload-track-linear" width="48" height="48" class="opacity-50"></iconify-icon>
            <p>{t('ranking.noSubmissionsYet')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
