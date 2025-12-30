import { useCallback, useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { UserVote, VoteDirection } from '../types/forum'

interface VoteState {
  upVoteCount: number
  downVoteCount: number
  netVoteCount: number
  userVote: UserVote
}

interface UseThreadVoteResult {
  votes: VoteState
  handleVote: (direction: VoteDirection) => Promise<void>
  isLoading: boolean
  error: Error | null
}

interface UseThreadVoteArgs {
  threadId: Id<'threads'>
  initialUpCount: number
  initialDownCount: number
  initialNetCount: number
  initialUserVote: UserVote
}

const applyOptimisticVote = (votes: VoteState, direction: VoteDirection): VoteState => {
  let upVoteCount = votes.upVoteCount
  let downVoteCount = votes.downVoteCount
  let userVote: UserVote = direction

  if (votes.userVote === direction) {
    if (direction === 'up') upVoteCount = Math.max(0, upVoteCount - 1)
    if (direction === 'down') downVoteCount = Math.max(0, downVoteCount - 1)
    userVote = null
  } else if (votes.userVote === null) {
    if (direction === 'up') upVoteCount += 1
    if (direction === 'down') downVoteCount += 1
  } else {
    if (direction === 'up') {
      upVoteCount += 1
      downVoteCount = Math.max(0, downVoteCount - 1)
    } else {
      downVoteCount += 1
      upVoteCount = Math.max(0, upVoteCount - 1)
    }
  }

  return {
    upVoteCount,
    downVoteCount,
    netVoteCount: upVoteCount - downVoteCount,
    userVote,
  }
}

export function useThreadVote({
  threadId,
  initialUpCount,
  initialDownCount,
  initialNetCount,
  initialUserVote,
}: UseThreadVoteArgs): UseThreadVoteResult {
  const castVote = useMutation(api.forum.castThreadVote)

  const [votes, setVotes] = useState<VoteState>({
    upVoteCount: initialUpCount,
    downVoteCount: initialDownCount,
    netVoteCount: initialNetCount,
    userVote: initialUserVote,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isLoading) return

    setVotes({
      upVoteCount: initialUpCount,
      downVoteCount: initialDownCount,
      netVoteCount: initialNetCount,
      userVote: initialUserVote,
    })
  }, [isLoading, initialDownCount, initialNetCount, initialUpCount, initialUserVote, threadId])

  const handleVote = useCallback(
    async (direction: VoteDirection) => {
      setError(null)
      setIsLoading(true)

      const previous = votes
      const optimistic = applyOptimisticVote(previous, direction)
      setVotes(optimistic)

      try {
        const result = await castVote({ threadId, direction })
        setVotes({
          upVoteCount: result.upVoteCount,
          downVoteCount: result.downVoteCount,
          netVoteCount: result.netVoteCount,
          userVote: result.userVote,
        })
      } catch (err) {
        setVotes(previous)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    },
    [castVote, threadId, votes]
  )

  return {
    votes,
    handleVote,
    isLoading,
    error,
  }
}
