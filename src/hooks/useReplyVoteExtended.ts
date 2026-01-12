import { useCallback, useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { UserVote, VoteDirection } from '../types/forum'

interface VoteState {
  upVoteCount: number
  downVoteCount: number
  userVote: UserVote
}

interface UseReplyVoteExtendedResult {
  votes: VoteState
  handleVote: (direction: VoteDirection) => Promise<void>
  isLoading: boolean
  error: Error | null
}

interface UseReplyVoteExtendedArgs {
  replyId: Id<'replies'>
  initialUpCount?: number
  initialDownCount?: number
  initialUserVote?: UserVote
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

  return { upVoteCount, downVoteCount, userVote }
}

export function useReplyVoteExtended({
  replyId,
  initialUpCount,
  initialDownCount,
  initialUserVote,
}: UseReplyVoteExtendedArgs): UseReplyVoteExtendedResult {
  const castVote = useMutation(api.forum.castReplyVote)

  const [votes, setVotes] = useState<VoteState>({
    upVoteCount: initialUpCount ?? 0,
    downVoteCount: initialDownCount ?? 0,
    userVote: initialUserVote ?? null,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isLoading) return

    setVotes({
      upVoteCount: initialUpCount ?? 0,
      downVoteCount: initialDownCount ?? 0,
      userVote: initialUserVote ?? null,
    })
  }, [initialDownCount, initialUpCount, initialUserVote, isLoading, replyId])

  const handleVote = useCallback(
    async (direction: VoteDirection) => {
      setError(null)
      setIsLoading(true)

      const previous = votes
      const optimistic = applyOptimisticVote(previous, direction)
      setVotes(optimistic)

      try {
        const result = await castVote({ replyId, voteType: direction })
        if (result) {
          setVotes({
            upVoteCount: result.upVoteCount ?? 0,
            downVoteCount: result.downVoteCount ?? 0,
            userVote: (result as { userVote?: UserVote }).userVote ?? null,
          })
        }
      } catch (err) {
        setVotes(previous)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    },
    [castVote, replyId, votes]
  )

  return { votes, handleVote, isLoading, error }
}
