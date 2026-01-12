import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

interface MerchWidgetProps {
  onRetry?: () => void
}

interface DropItem {
  _id: string
  name?: string
  title?: string
  imageUrl?: string
  price?: number
  startsAt?: number
  endTime?: number
}

export const MerchWidget = ({ onRetry }: MerchWidgetProps) => {
  const navigate = useNavigate()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Fetch active merch drops
  const queryResult = useQuery(
    api.drops.getActiveDrops,
    {}
  )
  
  // Convex useQuery returns data directly, undefined while loading
  const data = queryResult
  const isLoading = queryResult === undefined
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
    return <MerchSkeleton />
  }

  // Show error state if timeout reached and no data or actual error
  if ((!data || data.length === 0 || error) && timeoutReached) {
    return (
      <WidgetContainer title="Featured Drops" icon="solar:bag-linear" actionLabel="View All">
        <div className="widget-error">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" class="error-icon"></iconify-icon>
          <h3>Unable to load merchandise</h3>
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
      <WidgetContainer title="Featured Drops" icon="solar:bag-linear" actionLabel="View All">
        <div className="widget-empty">
          <iconify-icon icon="solar:bag-linear" width="48" height="48" class="empty-icon"></iconify-icon>
          <h3>No drops available</h3>
          <p>Check back soon for exclusive merchandise!</p>
          <button className="explore-button" onClick={() => navigate('/2')}>
            Browse Store
          </button>
        </div>
      </WidgetContainer>
    )
  }

  return (
    <WidgetContainer title="Featured Drops" icon="solar:bag-linear" actionLabel="View All">
      <div className="merch-grid">
        {data?.slice(0, 4).map((drop: any, index: number) => (
          <DropItem key={drop._id || index} drop={drop} index={index} navigate={navigate} />
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
        <button className="see-all-button" onClick={() => navigate('/2')}>
          {actionLabel}
          <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16"></iconify-icon>
        </button>
      </div>
      {children}
    </div>
  )
}

// Drop Item Component
interface DropItemProps {
  drop: any
  index: number
  navigate: any
}

const DropItem = ({ drop, index, navigate }: DropItemProps) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDropStatus = (dropData: DropItem): { status: string; label: string } => {
    const now = Date.now()
    const startsAt = dropData.startsAt || dropData.endTime

    if (startsAt && now < startsAt) return { status: 'upcoming', label: 'Starts Soon' }
    if (startsAt && now > startsAt) return { status: 'ended', label: 'Ended' }
    return { status: 'active', label: 'Live Now' }
  }

  const { status, label } = getDropStatus(drop)
  
  const handleClick = (): void => {
    navigate(`/merch/drops`)
  }

  return (
    <div className="drop-item" onClick={handleClick} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="drop-image">
        {drop.imageUrl ? (
          <img src={drop.imageUrl} alt={drop.name} />
        ) : (
          <div className="drop-image-placeholder">
            <iconify-icon icon="solar:box-linear" width="24" height="24"></iconify-icon>
          </div>
        )}
        <div className={`drop-status status-${status}`}>
          {label}
        </div>
      </div>
      
      <div className="drop-content">
        <h4 className="drop-title">{drop.name || drop.title}</h4>
        
        <div className="drop-details">
          <div className="drop-price">
            {drop.price ? `$${(drop.price / 100).toFixed(2)}` : 'TBD'}
          </div>
          <div className="drop-availability">
            <iconify-icon icon="solar:star-linear" width="14" height="14"></iconify-icon>
            <span>Limited Edition</span>
          </div>
        </div>
        
        {drop.startsAt && (
          <div className="drop-timer">
            <iconify-icon icon="solar:clock-circle-linear" width="14" height="14"></iconify-icon>
            <span>Starts {formatDate(drop.startsAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading Skeleton Component
const MerchSkeleton = () => {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <iconify-icon icon="solar:bag-linear" width="20" height="20"></iconify-icon>
          <h3>Featured Drops</h3>
        </div>
      </div>
      <div className="merch-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="drop-item-skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-price" />
              <div className="skeleton-timer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
