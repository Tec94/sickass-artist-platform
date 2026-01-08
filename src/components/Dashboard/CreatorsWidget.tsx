import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

interface CreatorsWidgetProps {
  onRetry?: () => void
}

interface CreatorItem {
  _id: string
  displayName: string
  username?: string
  avatar?: string
  fanTier?: string
  level?: number
  xp?: number
}

export const CreatorsWidget = ({ onRetry }: CreatorsWidgetProps) => {
  const navigate = useNavigate()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Fetch recommended creators
  const { data, isLoading, error } = useQuery(
    api.recommendations.getRecommendedCreators,
    { limit: 6 }
  )

  // Set timeout for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading skeleton if data is undefined and timeout not reached
  if ((!data && !timeoutReached) || isLoading) {
    return <CreatorsSkeleton />
  }

  // Show error state if timeout reached and no data or actual error
  if ((!data || data.length === 0 || error) && timeoutReached) {
    return (
      <WidgetContainer title="Featured Creators" icon="solar:users-group-rounded-linear" actionLabel="View All">
        <div className="widget-error">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" class="error-icon"></iconify-icon>
          <h3>Unable to load creators</h3>
          <p>Please check your connection and try again.</p>
          <button className="retry-button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </WidgetContainer>
    )
  }

  // Show empty state if no items
  if (data?.length === 0) {
    return (
      <WidgetContainer title="Featured Creators" icon="solar:users-group-rounded-linear" actionLabel="View All">
        <div className="widget-empty">
          <iconify-icon icon="solar:users-group-rounded-linear" width="48" height="48" class="empty-icon"></iconify-icon>
          <h3>No creators available</h3>
          <p>Discover amazing creators in our community!</p>
          <button className="explore-button" onClick={() => navigate('/3')}>
            Explore Gallery
          </button>
        </div>
      </WidgetContainer>
    )
  }

  return (
    <WidgetContainer title="Featured Creators" icon="solar:users-group-rounded-linear" actionLabel="View All">
      <div className="creators-grid">
        {data?.map((creator: any, index: number) => (
          <CreatorItem key={creator._id || index} creator={creator} index={index} navigate={navigate} />
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
        <button className="see-all-button" onClick={() => navigate('/3')}>
          {actionLabel}
          <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16"></iconify-icon>
        </button>
      </div>
      {children}
    </div>
  )
}

// Creator Item Component
interface CreatorItemProps {
  creator: any
  index: number
  navigate: any
}

const CreatorItem = ({ creator, index, navigate }: CreatorItemProps) => {
  const getTierIcon = (tier?: string): string | null => {
    switch (tier) {
      case 'platinum': return 'solar:cup-first-linear'
      case 'gold': return 'solar:star-linear'
      case 'silver': return 'solar:star-linear'
      default: return null
    }
  }

  const getTierColor = (tier?: string): string => {
    switch (tier) {
      case 'platinum': return '#E5E7EB'
      case 'gold': return '#FFD700'
      case 'silver': return '#C0C0C0'
      default: return '#6B7280'
    }
  }

  const handleClick = (): void => {
    navigate(`/profile/${creator._id}`)
  }

  const handleFollowClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    console.log('Follow creator:', creator.displayName)
  }

  const tierIcon = getTierIcon(creator.fanTier)

  return (
    <div className="creator-item" onClick={handleClick} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="creator-avatar">
        {creator.avatar ? (
          <img src={creator.avatar} alt={creator.displayName} />
        ) : (
          <div className="creator-avatar-placeholder">
            {creator.displayName?.charAt(0) || 'C'}
          </div>
        )}
        {creator.fanTier && creator.fanTier !== 'bronze' && tierIcon && (
          <div 
            className="creator-tier-badge"
            style={{ color: getTierColor(creator.fanTier) }}
          >
            <iconify-icon icon={tierIcon} width="14" height="14"></iconify-icon>
          </div>
        )}
      </div>
      
      <div className="creator-info">
        <h4 className="creator-name">{creator.displayName}</h4>
        {creator.username && (
          <p className="creator-username">@{creator.username}</p>
        )}
        
        <div className="creator-stats">
          <div className="stat">
            <span className="stat-value">{creator.level || 1}</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat">
            <span className="stat-value">{creator.xp || 0}</span>
            <span className="stat-label">XP</span>
          </div>
        </div>
        
        <button 
          className="follow-button"
          onClick={handleFollowClick}
        >
          <iconify-icon icon="solar:user-plus-linear" width="14" height="14"></iconify-icon>
          Follow
        </button>
      </div>
    </div>
  )
}

// Loading Skeleton Component
const CreatorsSkeleton = () => {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <iconify-icon icon="solar:users-group-rounded-linear" width="20" height="20"></iconify-icon>
          <h3>Featured Creators</h3>
        </div>
      </div>
      <div className="creators-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="creator-item-skeleton">
            <div className="skeleton-avatar" />
            <div className="skeleton-content">
              <div className="skeleton-name" />
              <div className="skeleton-username" />
              <div className="skeleton-stats" />
              <div className="skeleton-button" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
