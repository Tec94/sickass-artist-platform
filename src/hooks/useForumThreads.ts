import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuth } from './useAuth'
import type { Thread, ThreadSortBy, UserVote } from '../types/forum'

interface UseForumThreadsResult {
  threads: Thread[]
  isLoading: boolean
  isFetchingMore: boolean
  error: null
  hasMore: boolean
  fetchMore: () => void
}

interface UseForumThreadsArgs {
  categoryId: Id<'categories'> | null
  sortBy: ThreadSortBy
  limit?: number
}

const getUserVote = (currentUserId: Id<'users'> | null, upVoterIds: Id<'users'>[], downVoterIds: Id<'users'>[]): UserVote => {
  if (!currentUserId) return null
  if (upVoterIds.includes(currentUserId)) return 'up'
  if (downVoterIds.includes(currentUserId)) return 'down'
  return null
}

export function useForumThreads({ categoryId, sortBy, limit = 20 }: UseForumThreadsArgs): UseForumThreadsResult {
  const { user } = useAuth()
  const currentUserId = user?._id ?? null

  const [currentLimit, setCurrentLimit] = useState(limit)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  useEffect(() => {
    setCurrentLimit(limit)
    setIsFetchingMore(false)
  }, [categoryId, sortBy, limit])

  const data = useQuery(
    api.forum.getThreads,
    categoryId
      ? {
          categoryId,
          sort: sortBy,
          limit: currentLimit,
        }
      : 'skip'
  ) as unknown as { threads: unknown[]; nextCursor: unknown | null } | undefined

  const threads = useMemo(() => {
    const rawThreads = (data?.threads ?? []) as Array<{
      _id: Id<'threads'>
      title: string
      content: string
      authorId: Id<'users'>
      authorDisplayName: string
      authorAvatar: string
      authorTier: Thread['authorTier']
      categoryId: Id<'categories'>
      tags: string[]
      upVoterIds: Id<'users'>[]
      downVoterIds: Id<'users'>[]
      upVoteCount: number
      downVoteCount: number
      netVoteCount: number
      replyCount: number
      viewCount: number
      lastReplyAt?: number
      createdAt: number
      updatedAt: number
      isDeleted: boolean
      deletedAt?: number
    }>

    return rawThreads
      .filter((t) => !t.isDeleted)
      .map<Thread>((t) => ({
        _id: t._id,
        title: t.title,
        content: t.content,
        authorId: t.authorId,
        authorDisplayName: t.authorDisplayName,
        authorAvatar: t.authorAvatar,
        authorTier: t.authorTier,
        authorRole: null,
        categoryId: t.categoryId,
        tags: t.tags,
        upVoteCount: t.upVoteCount,
        downVoteCount: t.downVoteCount,
        netVoteCount: t.netVoteCount,
        userVote: getUserVote(currentUserId, t.upVoterIds, t.downVoterIds),
        replyCount: t.replyCount,
        viewCount: t.viewCount,
        lastReplyAt: t.lastReplyAt ?? null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        isDeleted: t.isDeleted,
        deletedAt: t.deletedAt ?? null,
      }))
  }, [currentUserId, data?.threads])

  const hasMore = data !== undefined && data.nextCursor !== null && currentLimit < 50

  const fetchMore = useCallback(() => {
    if (!hasMore) return
    if (isFetchingMore) return

    setIsFetchingMore(true)
    setCurrentLimit((prev) => {
      const next = prev + limit
      return next > 50 ? 50 : next
    })
  }, [hasMore, isFetchingMore, limit])

  useEffect(() => {
    if (isFetchingMore && data !== undefined) {
      setIsFetchingMore(false)
    }
  }, [data, isFetchingMore])

  return {
    threads,
    isLoading: categoryId !== null && data === undefined,
    isFetchingMore,
    error: null,
    hasMore,
    fetchMore,
  }
}
