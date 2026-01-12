import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'

export const StreakIndicator = () => {
  const { user } = useAuth()
  const streak = useQuery(
    api.streaks.getUserStreak,
    user ? { userId: user._id } : 'skip'
  )

  if (!streak || streak.currentStreak === 0) {
    return null
  }

  const isOnFire = streak.currentStreak >= 7

  return (
    <motion.div
      className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-sm ${
        isOnFire
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
          : 'bg-gray-700 text-gray-200'
      }`}
      whileHover={{ scale: 1.1 }}
      animate={isOnFire ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span>{isOnFire ? '🔥' : '📅'}</span>
      <span>{streak.currentStreak}d</span>
    </motion.div>
  )
}

export const StreakCountdown = ({ streak }: { streak: number }) => {
  const nextMilestone = [7, 14, 30, 60, 90, 180, 365].find(m => m > streak) || 365
  const remaining = nextMilestone - streak

  return (
    <div className="text-xs text-gray-400">
      {remaining} days until {nextMilestone}-day milestone
    </div>
  )
}
