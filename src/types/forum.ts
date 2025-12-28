import type { Id } from '../../convex/_generated/dataModel'
import type { FanTier } from './index'

export interface Thread {
  _id: Id<'threads'>
  title: string
  content: string
  authorId: Id<'users'>
  authorDisplayName: string
  authorAvatar: string
  authorTier: FanTier
  categoryId: Id<'categories'>
  tags: string[]
  upVoteCount: number
  downVoteCount: number
  netVoteCount: number
  replyCount: number
  createdAt: number
  isDeleted: boolean
}

export interface Reply {
  _id: Id<'replies'>
  threadId: Id<'threads'>
  authorId: Id<'users'>
  authorDisplayName: string
  content: string
  upVoteCount: number
  downVoteCount: number
  isDeleted: boolean
  createdAt: number
  editedAt: number | null
}

export interface Category {
  _id: Id<'categories'>
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order: number
  threadCount: number
}
