import { memo, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import type { Thread } from '../../types/forum'
import { VoteButtons } from './VoteButtons'
import { useThreadVote } from '../../hooks/useThreadVote'
import { FlashlightEffect } from '../Effects/FlashlightEffect'

interface ThreadListItemProps {
  thread: Thread
  isSelected: boolean
  onClick: (threadId: Thread['_id']) => void
}

const tierStyles: Record<Thread['authorTier'], string> = {
  bronze: 'border-amber-600/30 text-amber-200',
  silver: 'border-gray-500/30 text-gray-300',
  gold: 'border-yellow-500/30 text-yellow-200',
  platinum: 'border-red-500/30 text-red-200',
}

export const ThreadListItem = memo(function ThreadListItem({
  thread,
  isSelected,
  onClick,
}: ThreadListItemProps) {
  const { votes, handleVote, isLoading } = useThreadVote({
    threadId: thread._id,
    initialUpCount: thread.upVoteCount,
    initialDownCount: thread.downVoteCount,
    initialNetCount: thread.netVoteCount,
    initialUserVote: thread.userVote,
  })

  const excerpt = useMemo(() => {
    const text = thread.content.trim().replace(/\s+/g, ' ')
    if (text.length <= 120) return text
    return `${text.slice(0, 120)}…`
  }, [thread.content])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(thread._id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(thread._id)}
      onKeyDown={handleKeyDown}
      className={`thread-card-outer ${isSelected ? 'active' : ''}`}
    >
      <FlashlightEffect className="thread-card-flashlight">
        <article className="thread-card">
          <div className="thread-main">
            <header className="thread-header">
              <div className="author-meta">
                <img src={thread.authorAvatar} alt="" className="author-avatar" />
                <div className="author-info">
                  <span className="author-name">{thread.authorDisplayName}</span>
                  <span className={`tier-badge ${tierStyles[thread.authorTier]}`}>
                    {thread.authorTier}
                  </span>
                </div>
              </div>
              <div className="thread-stats">
                <span className="stat"><iconify-icon icon="solar:chat-round-line-linear"></iconify-icon> {thread.replyCount}</span>
              </div>
            </header>

            <h3 className="thread-title">{thread.title}</h3>
            <p className="thread-excerpt">{excerpt}</p>

            {thread.tags.length > 0 && (
              <div className="thread-tags">
                {thread.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}
          </div>

          <aside className="thread-votes">
            <VoteButtons
              upCount={votes.upVoteCount}
              downCount={votes.downVoteCount}
              userVote={votes.userVote}
              onVote={handleVote}
              isLoading={isLoading}
            />
          </aside>
        </article>
      </FlashlightEffect>

      <style>{`
        .thread-card-outer {
          border-radius: 16px;
          overflow: hidden;
          background: rgba(10, 10, 10, 0.4);
          border: 1px solid var(--color-card-border);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .thread-card-outer:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .thread-card-outer.active {
          border-color: var(--color-primary);
          background: rgba(255, 0, 0, 0.05);
        }

        .thread-card {
          display: flex;
          padding: 20px;
          gap: 20px;
        }

        .thread-main {
          flex: 1;
          min-width: 0;
        }

        .thread-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .author-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--color-card-border);
          object-fit: cover;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-size: 13px;
          font-weight: 700;
          color: white;
        }

        .tier-badge {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid;
          width: fit-content;
        }

        .thread-stats {
          font-size: 12px;
          color: var(--color-text-dim);
          display: flex;
          gap: 12px;
        }

        .stat { display: flex; align-items: center; gap: 4px; }

        .thread-title {
          font-size: 17px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .thread-excerpt {
          font-size: 14px;
          color: var(--color-text-dim);
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .thread-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          font-size: 11px;
          color: var(--color-primary);
          font-weight: 600;
        }

        .thread-votes {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      `}</style>
    </div>
  )
})
