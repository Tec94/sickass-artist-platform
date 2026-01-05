import { useState, useEffect } from 'react'
import { TrendingUp, Eye, Heart, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TrendingWidgetProps {
  data?: {
    items: TrendingItem[]
    hasMore: boolean
    totalCount: number
    page: number
  }
  onRetry?: () => void
}

interface TrendingItem {
  id: string
  contentId: string
  title: string
  thumbnailUrl: string
  type: 'gallery' | 'ugc'
  subType: string
  creatorId: string
  creatorDisplayName: string
  creatorAvatar: string
  creatorTier: string
  likeCount: number
  viewCount: number
  createdAt: number
  trendingScore: number
}

export const TrendingWidget = ({ data, onRetry }: TrendingWidgetProps) => {
  const navigate = useNavigate()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Set timeout for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Show loading skeleton if data is undefined and timeout not reached
  if (!data && !timeoutReached) {
    return <TrendingSkeleton />
  }

  // Show error state if timeout reached and no data
  if ((!data || data.items?.length === 0) && timeoutReached) {
    return (
      <WidgetContainer title="Trending Now" icon={TrendingUp} actionLabel="View All">
        <div className="widget-error">
          <AlertCircle size={48} className="error-icon" />
          <h3>Unable to load trending content</h3>
          <p>Please check your connection and try again.</p>
          <button className="retry-button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </WidgetContainer>
    )
  }

  // Show empty state if no items
  if (data?.items?.length === 0) {
    return (
      <WidgetContainer title="Trending Now" icon={TrendingUp} actionLabel="View All">
        <div className="widget-empty">
          <TrendingUp size={48} className="empty-icon" />
          <h3>No trending content yet</h3>
          <p>Be the first to create some amazing content!</p>
          <button className="explore-button" onClick={() => navigate('/gallery')}>
            Explore Gallery
          </button>
        </div>
      </WidgetContainer>
    )
  }

  return (
    <WidgetContainer title="Trending Now" icon={TrendingUp} actionLabel="View All">
      <div className="trending-grid">
        {data?.items?.slice(0, 4).map((item: any, index: number) => (
          <TrendingItem key={item.id || index} item={item} index={index} navigate={navigate} />
        ))}
      </div>
    </WidgetContainer>
  )
}

// Widget Container Component
interface WidgetContainerProps {
  title: string
  icon: any
  actionLabel: string
  children: React.ReactNode
}

const WidgetContainer = ({ title, icon: Icon, actionLabel, children }: WidgetContainerProps) => {
  const navigate = useNavigate()

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <Icon size={20} />
          <h3>{title}</h3>
        </div>
        <button className="see-all-button" onClick={() => navigate('/gallery')}>
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}

// Trending Item Component
interface TrendingItemProps {
  item: any
  index: number
  navigate: any
}

const TrendingItem = ({ item, index, navigate }: TrendingItemProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handleClick = (): void => {
    if (item.type === 'gallery') {
      navigate(`/content/${item.contentId}`)
    } else if (item.type === 'ugc') {
      navigate(`/ugc/${item.contentId}`)
    }
  }

  return (
    <div className="trending-item" onClick={handleClick} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="trending-thumbnail">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} />
        ) : (
          <div className="thumbnail-placeholder">
            <TrendingUp size={24} />
          </div>
        )}
        <div className="trending-rank">#{index + 1}</div>
      </div>
      
      <div className="trending-content">
        <h4 className="trending-title">{item.title}</h4>
        
        <div className="trending-creator">
          <div className="creator-avatar">
            {item.creatorAvatar ? (
              <img src={item.creatorAvatar} alt={item.creatorDisplayName} />
            ) : (
              <div className="creator-avatar-placeholder">C</div>
            )}
          </div>
          <span className="creator-name">{item.creatorDisplayName}</span>
        </div>
        
        <div className="trending-stats">
          <div className="stat">
            <Heart size={14} />
            <span>{formatNumber(item.likeCount || 0)}</span>
          </div>
          <div className="stat">
            <Eye size={14} />
            <span>{formatNumber(item.viewCount || 0)}</span>
          </div>
          <div className="stat">
            <Clock size={14} />
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton Component
const TrendingSkeleton = () => {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <TrendingUp size={20} />
          <h3>Trending Now</h3>
        </div>
      </div>
      <div className="trending-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="trending-item-skeleton">
            <div className="skeleton-thumbnail" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-creator" />
              <div className="skeleton-stats" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}