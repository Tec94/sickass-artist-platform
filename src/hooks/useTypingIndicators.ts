import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface TypingUser {
  userId: Id<'users'>
  displayName: string
  expiresAt: number
  createdAt: number
}

interface UseTypingIndicatorsResult {
  typingUsers: TypingUser[]
  isLoading: boolean
}

export function useTypingIndicators(
  channelId: Id<'channels'>
): UseTypingIndicatorsResult {
  const typingIndicators = useQuery(api.chat.subscribeToTyping, { channelId })

  return {
    typingUsers: typingIndicators ?? [],
    isLoading: typingIndicators === undefined,
  }
}
