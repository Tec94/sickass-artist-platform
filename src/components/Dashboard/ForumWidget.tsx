import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

interface ForumWidgetProps {
  onRetry?: () => void
}

export const ForumWidget = ({ onRetry }: ForumWidgetProps) => {
  const navigate = useNavigate()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Get categories first to find a default category
  const categories = useQuery(api.forum.getCategories)
  const firstCategoryId = categories?.[0]?._id

  // Fetch recent threads with timeout handling
  const queryResult = useQuery(
    api.forum.getThreads,
    firstCategoryId
      ? { categoryId: firstCategoryId, limit: 5, sort: 'newest' as const }
      : 'skip'
  )
  
  // Convex useQuery returns data directly (array), undefined while loading
  const data = queryResult
  const isLoading = queryResult === undefined || !firstCategoryId
  const error = null // Convex throws on error instead

  // Set timeout for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading skeleton if data is undefined and timeout not reached
  if ((!data && !timeoutReached) || isLoading) {
    return <ForumSkeleton />
  }

  // Show error state if timeout reached and no data or actual error
  if ((!data || (Array.isArray(data) && data.length === 0) || error) && timeoutReached) {
    return (
      <WidgetContainer title="Latest Discussions" icon="solar:chat-square-dots-linear" actionLabel="View All">
        <div className="widget-error">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" class="error-icon"></iconify-icon>
          <h3>Unable to load forum discussions</h3>
          <p>Please check your connection and try again.</p>
          <button className="retry-button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </WidgetContainer>
    )
  }

  // Show empty state if no items
  if (Array.isArray(data) && data.length === 0) {
    return (
      <WidgetContainer title="Latest Discussions" icon="solar:chat-square-dots-linear" actionLabel="View All">
        <div className="widget-empty">
          <iconify-icon icon="solar:chat-square-dots-linear" width="48" height="48" class="empty-icon"></iconify-icon>
          <h3>No discussions yet</h3>
          <p>Start the conversation in our community forum!</p>
          <button className="explore-button" onClick={() => navigate('/4')}>
            Join Forum
          </button>
        </div>
      </WidgetContainer>
    )
  }

  return (
    <WidgetContainer title="Latest Discussions" icon="solar:chat-square-dots-linear" actionLabel="View All">
      <div className="forum-list">
        {Array.isArray(data) && data.slice(0, 3).map((thread: any, index: number) => (
          <ThreadItem key={thread._id || index} thread={thread} index={index} navigate={navigate} />
        ))}
      </div>
    </WidgetContainer>
  )
}

// Widget Container Component
interface WidgetContainerProps {
  title: string
  icon: string
  actionLabel: string
  children: React.ReactNode
}

const WidgetContainer = ({ title, icon, actionLabel, children }: WidgetContainerProps) => {
  const navigate = useNavigate()

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <iconify-icon icon={icon} width="20" height="20"></iconify-icon>
          <h3>{title}</h3>
        </div>
        <button className="see-all-button" onClick={() => navigate('/4')}>
          {actionLabel}
          <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16"></iconify-icon>
        </button>
      </div>
      {children}
    </div>
  )
}

// Thread Item Component
interface ThreadItemProps {
  thread: any
  index: number
  navigate: any
}

const ThreadItem = ({ thread, index, navigate }: ThreadItemProps) => {
  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleClick = (): void => {
    navigate(`/4/thread/${thread._id}`)
  }

  return (
    <div className="thread-item" onClick={handleClick} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="thread-header">
        <div className="thread-category">
          <iconify-icon icon="solar:hashtag-linear" width="12" height="12"></iconify-icon>
          <span>{thread.category || 'General'}</span>
        </div>
        <div className="thread-time">
          <iconify-icon icon="solar:clock-circle-linear" width="12" height="12"></iconify-icon>
          <span>{formatTime(thread.createdAt)}</span>
        </div>
      </div>
      
      <h4 className="thread-title">{thread.title}</h4>
      
      {thread.content && (
        <p className="thread-preview">
          {thread.content.substring(0, 100)}
          {thread.content.length > 100 ? '...' : ''}
        </p>
      )}
      
      <div className="thread-footer">
        <div className="thread-author">
          <div className="author-avatar">
            {thread.authorAvatar ? (
              <img src={thread.authorAvatar} alt={thread.authorDisplayName} />
            ) : (
              <div className="author-avatar-placeholder">U</div>
            )}
          </div>
          <div className="author-info">
            <span className="author-name">{thread.authorDisplayName}</span>
            <span className="author-role">{thread.authorRole || 'Member'}</span>
          </div>
        </div>
        
        <div className="thread-stats">
          <div className="stat">
            <iconify-icon icon="solar:chat-square-dots-linear" width="12" height="12"></iconify-icon>
            <span>{thread.replyCount || 0}</span>
          </div>
          <div className="stat">
            <iconify-icon icon="solar:user-circle-linear" width="12" height="12"></iconify-icon>
            <span>{thread.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton Component
const ForumSkeleton = () => {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <iconify-icon icon="solar:chat-square-dots-linear" width="20" height="20"></iconify-icon>
          <h3>Latest Discussions</h3>
        </div>
      </div>
      <div className="forum-list">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="thread-item-skeleton">
            <div className="skeleton-header" />
            <div className="skeleton-title" />
            <div className="skeleton-preview" />
            <div className="skeleton-footer" />
          </div>
        ))}
      </div>
    </div>
  )
}
