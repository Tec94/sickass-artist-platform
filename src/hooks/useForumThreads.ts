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
  refresh: () => void
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
  )

  const threads = useMemo(() => {
    // getThreads returns an array directly, not { threads, nextCursor }
    const rawThreads = (data ?? []) as Array<{
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
        upVoteCount: t.upVoteCount ?? 0,
        downVoteCount: t.downVoteCount ?? 0,
        netVoteCount: t.netVoteCount ?? 0,
        userVote: getUserVote(currentUserId, t.upVoterIds ?? [], t.downVoterIds ?? []),
        replyCount: t.replyCount ?? 0,
        viewCount: t.viewCount ?? 0,
        lastReplyAt: t.lastReplyAt ?? null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        isDeleted: t.isDeleted,
        deletedAt: t.deletedAt ?? null,
      }))
  }, [currentUserId, data])

  // Since getThreads returns a simple array, we check if we got the full limit
  const hasMore = data !== undefined && (data as unknown[]).length >= currentLimit && currentLimit < 50

  const fetchMore = useCallback(() => {
    if (!hasMore) return
    if (isFetchingMore) return

    setIsFetchingMore(true)
    setCurrentLimit((prev) => {
      const next = prev + limit
      return next > 50 ? 50 : next
    })
  }, [hasMore, isFetchingMore, limit])

  const refresh = useCallback(() => {
    setCurrentLimit(limit)
    setIsFetchingMore(false)
  }, [limit])

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
    refresh,
  }
}
