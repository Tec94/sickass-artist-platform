import type { Id } from '../../convex/_generated/dataModel'
import type { FanTier, UserRole } from './index'

export { Id }

export type VoteDirection = 'up' | 'down'
export type UserVote = VoteDirection | null

export type ThreadSortBy = 'newest' | 'top' | 'mostReplies'

export interface Category {
  _id: Id<'categories'>
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order: number
  requiredRole: UserRole | null
  requiredFanTier: FanTier | null
  threadCount: number
  lastThreadAt: number | null
  createdAt: number
}

export interface Thread {
  _id: Id<'threads'>
  title: string
  content: string
  authorId: Id<'users'>
  authorDisplayName: string
  authorAvatar: string
  authorTier: FanTier
  authorRole?: UserRole | null
  categoryId: Id<'categories'>
  tags: string[]

  upVoteCount?: number
  downVoteCount?: number
  netVoteCount?: number
  userVote?: UserVote

  replyCount: number
  viewCount: number
  lastReplyAt: number | null

  createdAt: number
  updatedAt: number

  isDeleted: boolean
  deletedAt: number | null

  isPinned?: boolean
}

export interface Reply {
  _id: Id<'replies'>
  threadId: Id<'threads'>
  authorId: Id<'users'>
  authorDisplayName: string
  authorAvatar: string
  authorTier: FanTier
  authorRole?: UserRole | null
  content: string

  upVoteCount?: number
  downVoteCount?: number
  userVote?: UserVote

  createdAt: number
  editedAt: number | null

  isDeleted: boolean
  deletedAt: number | null
}

export interface ThreadDetailData {
  thread: Thread
  replies: Reply[]
  replyCount: number
}
