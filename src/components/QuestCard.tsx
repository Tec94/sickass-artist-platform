import { motion } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import { useTokenAuth } from './ConvexAuthProvider'
import type { Id } from '../../convex/_generated/dataModel'

interface QuestCardProps {
  progressId: Id<'questProgress'>
  questId: string
  name: string
  description: string
  icon: string
  category: string
  progress: number
  target: number
  isCompleted: boolean
  pointsClaimed: boolean
  rewardPoints: number
  expiresAt: number
  type: 'daily' | 'weekly' | 'milestone' | 'seasonal' | 'challenge'
  onRewardClaimed?: () => void
}

export const QuestCard = ({
  progressId,
  name,
  description,
  icon,
  progress,
  target,
  isCompleted,
  pointsClaimed,
  rewardPoints,
  expiresAt,
  type,
  onRewardClaimed,
}: QuestCardProps) => {
  const { user } = useAuth()
  const claimReward = useMutation(api.quests.claimQuestReward)
  const progressPercent = Math.round((progress / target) * 100)

  const daysRemaining = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24))

  const handleClaim = async () => {
    if (!user) return

    try {
      await claimReward({
        progressId: progressId,
      })
      onRewardClaimed?.()
    } catch (error) {
      console.error('Failed to claim reward:', error)
    }
  }

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${
        isCompleted
          ? 'border-green-500 bg-green-900/20'
          : 'border-gray-600 bg-gray-800/50'
      }`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="font-bold text-white">{name}</h3>
            <p className="text-xs text-gray-400 capitalize">{type}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-400">+{rewardPoints}</div>
          <div className="text-xs text-gray-400">points</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3">{description}</p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">
            {progress}/{target}
          </span>
          <span className="text-xs text-gray-400">
            {daysRemaining}d remaining
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Actions */}
      {isCompleted && !pointsClaimed ? (
        <motion.button
          onClick={handleClaim}
          className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded hover:shadow-lg hover:shadow-green-500/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Claim Reward
        </motion.button>
      ) : pointsClaimed ? (
        <div className="w-full py-2 bg-green-900/50 text-green-300 text-center font-bold rounded">
          ✓ Claimed
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center py-2">
          {progressPercent === 100 ? 'Complete to claim!' : 'In Progress'}
        </div>
      )}
    </motion.div>
  )
}

interface QuestListProps {
  userId: Id<'users'>
}

/**
 * Quest list for dashboard/page
 */
export const QuestList = ({ userId }: QuestListProps) => {
  const { hasValidToken, isTokenLoading } = useTokenAuth()
  const quests = useQuery(
    api.quests.getUserQuests,
    hasValidToken ? { userId: userId } : 'skip'
  )

  if (isTokenLoading || !hasValidToken || !quests) {
    return <div className="animate-pulse">Loading quests...</div>
  }

  const daily = quests.filter(q => q.type === 'daily')
  const weekly = quests.filter(q => q.type === 'weekly')
  const milestones = quests.filter(q => q.type === 'milestone')

  return (
    <div className="space-y-6">
      {daily.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Daily Quests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daily.map(q => (
              <QuestCard key={q.progressId} {...q} />
            ))}
          </div>
        </div>
      )}

      {weekly.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Weekly Quests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekly.map(q => (
              <QuestCard key={q.progressId} {...q} />
            ))}
          </div>
        </div>
      )}

      {milestones.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map(q => (
              <QuestCard key={q.progressId} {...q} />
            ))}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No active quests. Check back later!
        </div>
      )}
    </div>
  )
}
