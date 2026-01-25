import type { UserRole, FanTier } from './index'
import type { Doc, Id } from '../../convex/_generated/dataModel'

export { Id }

export type ChatAttachment = {
  type: 'image' | 'video'
  storageId: Id<'_storage'>
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  durationMs?: number
  sizeBytes: number
  contentType: string
}

export type ChatServerSettings = Doc<'chatServerSettings'>
export type ChatUserSettings = Doc<'userChatSettings'>
export type ChatSticker = Doc<'chatStickers'>
export type ChatStickerPack = Doc<'chatStickerPacks'> & { stickers: ChatSticker[] }
export type ChatMessage = Doc<'messages'> & { status?: 'sending' | 'sent' | 'failed'; errorMessage?: string }

export type OptimisticMessage = Omit<ChatMessage, '_id' | '_creationTime'> & {
  _id: string
  _creationTime?: number
  idempotencyKey: string
  status: 'sending' | 'sent' | 'failed'
}

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
