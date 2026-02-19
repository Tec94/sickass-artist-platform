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
      className={`group relative p-4 rounded-xl border transition-all duration-300 overflow-hidden ${
        isCompleted
          ? 'border-emerald-500/50 bg-emerald-950/20 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-amber-500/30 hover:bg-zinc-900/80'
      }`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="font-bold text-white">{name}</h3>
            <p className="text-xs text-zinc-500 capitalize">{type}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-amber-400 drop-shadow-sm">+{rewardPoints}</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">points</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-4">{description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            {progress}/{target}
          </span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            {daysRemaining}d left
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full relative ${
              isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-shimmer" />
          </motion.div>
        </div>
      </div>

      {/* Actions */}
      {isCompleted && !pointsClaimed ? (
        <motion.button
          onClick={handleClaim}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-lg hover:shadow-emerald-500/20 relative overflow-hidden group/btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10">Claim Reward</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
        </motion.button>
      ) : pointsClaimed ? (
        <div className="w-full py-2.5 bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 text-center text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2">
          <iconify-icon icon="solar:check-circle-bold" width="14"></iconify-icon> Claimed
        </div>
      ) : (
        <div className="w-full py-2.5 text-xs text-zinc-500 text-center border border-zinc-800 bg-zinc-900/50 rounded-lg uppercase tracking-wider">
          {progressPercent >= 100 ? 'Complete to claim!' : 'In Progress'}
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-zinc-900/50 border border-zinc-800 rounded-xl"></div>
        ))}
      </div>
    )
  }

  const daily = quests.filter(q => q.type === 'daily')
  const weekly = quests.filter(q => q.type === 'weekly')
  const milestones = quests.filter(q => q.type === 'milestone')

  return (
    <div className="space-y-8">
      {daily.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <iconify-icon icon="solar:calendar-date-bold" width="16"></iconify-icon> Daily Quests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daily.map(q => (
              <QuestCard key={q.progressId} {...q} />
            ))}
          </div>
        </div>
      )}

      {weekly.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <iconify-icon icon="solar:calendar-mark-bold" width="16"></iconify-icon> Weekly Quests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekly.map(q => (
              <QuestCard key={q.progressId} {...q} />
            ))}
          </div>
        </div>
      )}

      {milestones.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <iconify-icon icon="solar:medal-star-bold" width="16"></iconify-icon> Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map(q => (
              <QuestCard key={q.progressId} {...q} />
            ))}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
          <iconify-icon icon="solar:clipboard-check-linear" width="48" class="text-zinc-600 mb-4"></iconify-icon>
          <p className="text-zinc-500">No active quests. Check back later!</p>
        </div>
      )}
    </div>
  )
}
