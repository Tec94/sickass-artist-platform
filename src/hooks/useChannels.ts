import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Channel } from '../types/chat'

interface UseChannelsResult {
  channels: Channel[]
  isLoading: boolean
  error: null
}

export function useChannels(): UseChannelsResult {
  const channels = useQuery(api.chat.getChannels)

  const typedChannels: Channel[] = channels?.map((channel) => ({
    _id: channel._id,
    name: channel.name,
    slug: channel.slug,
    description: channel.description,
    requiredRole: channel.requiredRole ?? null,
    requiredFanTier: channel.requiredFanTier ?? null,
    category: channel.category,
    pinnedMessageId: channel.pinnedMessageId ?? null,
    messageCount: channel.messageCount,
    lastMessageAt: channel.lastMessageAt ?? null,
    createdAt: channel.createdAt,
  })) ?? []

  return {
    channels: typedChannels,
    isLoading: channels === undefined,
    error: null,
  }
}
