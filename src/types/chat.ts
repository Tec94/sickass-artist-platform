import type { UserRole, FanTier } from './index'
import type { Id } from '../../convex/_generated/dataModel'

export { Id }

export interface Channel {
  _id: Id<'channels'>
  name: string
  slug: string
  description: string
  requiredRole: UserRole | null
  requiredFanTier: FanTier | null
  category: 'general' | 'mod' | 'fan-only' | 'announcements'
  pinnedMessageId: Id<'messages'> | null
  messageCount: number
  lastMessageAt: number | null
  createdAt: number
}

export interface Message {
  _id: Id<'messages'>
  channelId: Id<'channels'>
  authorId: Id<'users'>
  authorDisplayName: string
  authorAvatar: string
  authorTier: FanTier
  content: string
  isDeleted: boolean
  createdAt: number
  editedAt: number | null
  isPinned: boolean
  reactionEmojis: string[]
  reactionCount: number
}

export interface Reaction {
  _id: Id<'reactions'>
  messageId: Id<'messages'>
  emoji: string
  userId: Id<'users'>
  createdAt: number
}

export interface TypingUser {
  userId: Id<'users'>
  displayName: string
  expiresAt: number
  createdAt: number
}

export interface OptimisticMessage {
  _id: string
  content: string
  authorDisplayName: string
  authorAvatar: string
  createdAt: number
  status: 'sending' | 'sent' | 'failed'
  idempotencyKey: string
}
