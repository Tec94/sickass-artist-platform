import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface VoteState {
  upVoteCount: number
  downVoteCount: number
  userVote: 'up' | 'down' | null
}

interface OptimisticVoteResult {
  votes: VoteState
  handleVote: (direction: 'up' | 'down') => Promise<void>
}

interface UseReplyVoteProps {
  replyId: Id<'replies'>
  initialVotes: {
    upVoteCount: number
    downVoteCount: number
  }
  initialUserVote?: 'up' | 'down' | null
}

interface _CastReplyVoteResult {
  replyId: Id<'replies'>
  upVoteCount: number
  downVoteCount: number
  userVote: 'up' | 'down' | null
}

export function useReplyVote({
  replyId,
  initialVotes,
  initialUserVote = null,
}: UseReplyVoteProps): OptimisticVoteResult {
  const [votes, setVotes] = useState<VoteState>({
    upVoteCount: initialVotes.upVoteCount ?? 0,
    downVoteCount: initialVotes.downVoteCount ?? 0,
    userVote: initialUserVote,
  })

  const castVoteMutation = useMutation(api.forum.castReplyVote)

  const handleVote = useCallback(
    async (direction: 'up' | 'down') => {
      const oldVotes = { ...votes }

      let newUpVoteCount = votes.upVoteCount
      let newDownVoteCount = votes.downVoteCount
      let newUserVote: 'up' | 'down' | null = direction

      if (votes.userVote === direction) {
        if (direction === 'up') {
          newUpVoteCount = Math.max(0, votes.upVoteCount - 1)
        } else {
          newDownVoteCount = Math.max(0, votes.downVoteCount - 1)
        }
        newUserVote = null
      } else if (votes.userVote === null) {
        if (direction === 'up') {
          newUpVoteCount = votes.upVoteCount + 1
        } else {
          newDownVoteCount = votes.downVoteCount + 1
        }
      } else {
        if (direction === 'up') {
          newUpVoteCount = votes.upVoteCount + 1
          newDownVoteCount = Math.max(0, votes.downVoteCount - 1)
        } else {
          newDownVoteCount = votes.downVoteCount + 1
          newUpVoteCount = Math.max(0, votes.upVoteCount - 1)
        }
      }

      setVotes({
        upVoteCount: newUpVoteCount,
        downVoteCount: newDownVoteCount,
        userVote: newUserVote,
      })

      try {
        const result = await castVoteMutation({
          replyId,
          voteType: direction,
        })

        if (result) {
          setVotes({
            upVoteCount: result.upVoteCount ?? 0,
            downVoteCount: result.downVoteCount ?? 0,
            userVote: (result as { userVote?: 'up' | 'down' | null }).userVote ?? null,
          })
        }
      } catch (error) {
        console.error('Failed to cast vote:', error)
        setVotes(oldVotes)
      }
    },
    [replyId, votes, castVoteMutation]
  )

  return {
    votes,
    handleVote,
  }
}
