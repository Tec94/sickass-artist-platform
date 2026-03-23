import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuth } from './useAuth'
import type { Reply, Thread, UserVote } from '../types/forum'

interface UseForumThreadDetailResult {
  thread: Thread | null
  replies: Reply[]
  replyCount: number
  isLoading: boolean
  error: null
}

export function useForumThreadDetail(threadId: Id<'threads'> | null): UseForumThreadDetailResult {
  useAuth()

  const data = useQuery(
    api.forum.subscribeToThread,
    threadId ? { threadId } : 'skip'
  ) as unknown as { thread: unknown; replies: unknown[] } | null | undefined

  const mapped = useMemo(() => {
    if (!data) {
      return { thread: null, replies: [] as Reply[] }
    }

    const rawThread = data.thread as {
      _id: Id<'threads'>
      title: string
      content: string
      authorId: Id<'users'>
      authorDisplayName: string
      authorAvatar: string
      authorTier: Thread['authorTier']
      categoryId: Id<'categories'>
      tags: string[]
      upVoteCount: number
      downVoteCount: number
      netVoteCount: number
      userVote?: UserVote
      replyCount: number
      viewCount: number
      lastReplyAt?: number
      createdAt: number
      updatedAt: number
      isDeleted: boolean
      deletedAt?: number
    }

    const thread: Thread = {
      _id: rawThread._id,
      title: rawThread.title,
      content: rawThread.content,
      authorId: rawThread.authorId,
      authorDisplayName: rawThread.authorDisplayName,
      authorAvatar: rawThread.authorAvatar,
      authorTier: rawThread.authorTier,
      authorRole: null,
      categoryId: rawThread.categoryId,
      tags: rawThread.tags,
      upVoteCount: rawThread.upVoteCount,
      downVoteCount: rawThread.downVoteCount,
      netVoteCount: rawThread.netVoteCount,
      userVote: rawThread.userVote ?? null,
      replyCount: rawThread.replyCount,
      viewCount: rawThread.viewCount,
      lastReplyAt: rawThread.lastReplyAt ?? null,
      createdAt: rawThread.createdAt,
      updatedAt: rawThread.updatedAt,
      isDeleted: rawThread.isDeleted,
      deletedAt: rawThread.deletedAt ?? null,
    }

    const replies = (data.replies as Array<{
      _id: Id<'replies'>
      threadId: Id<'threads'>
      authorId: Id<'users'>
      authorDisplayName: string
      authorAvatar: string
      authorTier: Reply['authorTier']
      content: string
      upVoteCount: number
      downVoteCount: number
      userVote?: UserVote
      createdAt: number
      editedAt?: number
      isDeleted: boolean
      deletedAt?: number
    }>).
      filter((r) => !r.isDeleted)
      .map<Reply>((r) => ({
        _id: r._id,
        threadId: r.threadId,
        authorId: r.authorId,
        authorDisplayName: r.authorDisplayName,
        authorAvatar: r.authorAvatar,
        authorTier: r.authorTier,
        authorRole: null,
        content: r.content,
        upVoteCount: r.upVoteCount,
        downVoteCount: r.downVoteCount,
        userVote: r.userVote ?? null,
        createdAt: r.createdAt,
        editedAt: r.editedAt ?? null,
        isDeleted: r.isDeleted,
        deletedAt: r.deletedAt ?? null,
      }))

    return { thread, replies }
  }, [data])

  return {
    thread: mapped.thread,
    replies: mapped.replies,
    replyCount: mapped.replies.length,
    isLoading: threadId !== null && data === undefined,
    error: null,
  }
}
