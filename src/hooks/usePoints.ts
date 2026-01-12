import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from './useAuth'
import type { Id } from '../../convex/_generated/dataModel'

export interface PointBalance {
  availablePoints: number
  totalPoints: number
  redeemedPoints: number
}

export const usePoints = () => {
  const { user } = useAuth()
  const userId = user?._id

  // Get current balance
  const balance = useQuery(
    api.points.getUserBalance,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  ) as PointBalance | undefined

  // Get transaction history
  const transactions = useQuery(
    api.points.getUserTransactionHistory,
    userId ? { userId: userId as Id<'users'>, limit: 50 } : 'skip'
  )

  // Get leaderboard
  const leaderboard = useQuery(api.points.getPointsLeaderboard)

  return {
    balance: balance || { availablePoints: 0, totalPoints: 0, redeemedPoints: 0 },
    transactions: transactions || [],
    leaderboard: leaderboard || [],
    isLoading: balance === undefined,
  }
}

/**
 * Hook for awarding points (use when user performs action)
 */
export const useAwardPoints = () => {
  const { user } = useAuth()
  const userId = user?._id
  const awardPointsMutation = useMutation(api.points.awardPoints)

  const award = async (
    type: 'thread_post' | 'forum_reply' | 'chat_message' | 'gallery_like' | 'ugc_like' | 
          'event_checkin' | 'ticket_purchase' | 'livestream_join' | 'quest_complete' | 
          'daily_bonus' | 'streak_bonus' | 'admin_adjust' | 'refund',
    amount: number,
    description: string,
    metadata?: {
      streakMultiplier?: number
      questId?: Id<'quests'>
      eventId?: Id<'events'>
      ticketPrice?: number
    }
  ) => {
    if (!userId) throw new Error('Not authenticated')

    const idempotencyKey = `${userId}-${type}-${Date.now()}-${Math.random()}`

    return await awardPointsMutation({
      userId: userId as Id<'users'>,
      type,
      amount,
      description,
      idempotencyKey,
      metadata,
    })
  }

  return { award }
}
