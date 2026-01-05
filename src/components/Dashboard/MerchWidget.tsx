import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ShoppingBag, Star, Clock, ArrowRight, AlertCircle, Package } from 'lucide-react'
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
  const { data, isLoading, error } = useQuery(
    api.drops.getActiveDrops,
    {}
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
    return <MerchSkeleton />
  }

  // Show error state if timeout reached and no data or actual error
  if ((!data || data.length === 0 || error) && timeoutReached) {
    return (
      <WidgetContainer title="Featured Drops" icon={ShoppingBag} actionLabel="View All">
        <div className="widget-error">
          <AlertCircle size={48} className="error-icon" />
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
      <WidgetContainer title="Featured Drops" icon={ShoppingBag} actionLabel="View All">
        <div className="widget-empty">
          <ShoppingBag size={48} className="empty-icon" />
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
    <WidgetContainer title="Featured Drops" icon={ShoppingBag} actionLabel="View All">
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
        <button className="see-all-button" onClick={() => navigate('/2')}>
          {actionLabel}
          <ArrowRight size={16} />
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
            <Package size={24} />
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
            <Star size={14} />
            <span>Limited Edition</span>
          </div>
        </div>
        
        {drop.startsAt && (
          <div className="drop-timer">
            <Clock size={14} />
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
          <ShoppingBag size={20} />
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