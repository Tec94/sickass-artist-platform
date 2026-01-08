import { useNavigate } from 'react-router-dom'
import { LoadingSkeleton } from '../LoadingSkeleton'
import { useQueryWithTimeout } from '../../hooks/useQueryWithTimeout'

interface QueryFunction {
  (args: Record<string, unknown>): unknown
}

interface TrendingWidgetProps {
  queryFn?: QueryFunction
  queryArgs?: Record<string, unknown>
  data?: {
    items: TrendingItem[]
    hasMore: boolean
    totalCount: number
    page: number
  }
  onRetry?: () => void
  timeoutMs?: number
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

export const TrendingWidget = ({ 
  queryFn, 
  queryArgs, 
  data: initialData, 
  onRetry,
  timeoutMs = 5000
}: TrendingWidgetProps) => {
  const navigate = useNavigate()
  
  // Use timeout hook - always call hooks in the same order
  const queryResult = useQueryWithTimeout(
    queryFn || (() => undefined),
    queryArgs || {},
    { timeoutMs, enabled: !!queryFn }
  )

  const {
    data = initialData,
    isLoading = !initialData,
    error,
    timedOut
  } = queryResult

  const handleRetry = () => {
    onRetry?.()
  }

  // Show timeout error after 5s
  if (timedOut) {
    return (
      <WidgetContainer title="Trending Now" icon="solar:chart-square-linear" actionLabel="View All">
        <div className="widget-error">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" class="error-icon"></iconify-icon>
          <h3>Request timed out</h3>
          <p>Unable to load trending content. Please try again.</p>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </WidgetContainer>
    )
  }

  // Show loading skeleton if data is loading
  if (isLoading && !data) {
    return (
      <WidgetContainer title="Trending Now" icon="solar:chart-square-linear" actionLabel="View All">
        <LoadingSkeleton 
          type="gallery" 
          count={4}
          className="trending-grid"
        />
      </WidgetContainer>
    )
  }

  // Show error state if there's an error and no data
  if (error && !data?.items?.length) {
    return (
      <WidgetContainer title="Trending Now" icon="solar:chart-square-linear" actionLabel="View All">
        <div className="widget-error">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" class="error-icon"></iconify-icon>
          <h3>Unable to load trending content</h3>
          <p>Please check your connection and try again.</p>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </WidgetContainer>
    )
  }

  // Show empty state if no items
  if (data?.items?.length === 0) {
    return (
      <WidgetContainer title="Trending Now" icon="solar:chart-square-linear" actionLabel="View All">
        <div className="widget-empty">
          <iconify-icon icon="solar:chart-square-linear" width="48" height="48" class="empty-icon"></iconify-icon>
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
    <WidgetContainer title="Trending Now" icon="solar:chart-square-linear" actionLabel="View All">
      <div className="trending-grid">
        {data?.items?.slice(0, 4).map((item: TrendingItem, index: number) => (
          <TrendingItemComponent key={item.id || index} item={item} index={index} navigate={navigate} />
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
        <button className="see-all-button" onClick={() => navigate('/gallery')}>
          {actionLabel}
          <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16"></iconify-icon>
        </button>
      </div>
      {children}
    </div>
  )
}

// Trending Item Component
interface TrendingItemProps {
  item: TrendingItem
  index: number
  navigate: ReturnType<typeof useNavigate>
}

const TrendingItemComponent = ({ item, index, navigate }: TrendingItemProps) => {
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
            <iconify-icon icon="solar:chart-square-linear" width="24" height="24"></iconify-icon>
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
            <iconify-icon icon="solar:heart-linear" width="14" height="14"></iconify-icon>
            <span>{formatNumber(item.likeCount || 0)}</span>
          </div>
          <div className="stat">
            <iconify-icon icon="solar:eye-linear" width="14" height="14"></iconify-icon>
            <span>{formatNumber(item.viewCount || 0)}</span>
          </div>
          <div className="stat">
            <iconify-icon icon="solar:clock-circle-linear" width="14" height="14"></iconify-icon>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
