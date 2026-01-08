import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface EventsWidgetProps {
  data?: {
    items: EventItem[]
    hasMore: boolean
    totalCount: number
    page: number
  }
  onRetry?: () => void
}

interface EventItem {
  _id: string
  title: string
  imageUrl?: string
  startAtUtc: number
  endAtUtc: number
  city: string
  saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
  capacity: number
  ticketsSold: number
  availablePercent: number
  creator?: {
    _id: string
    displayName: string
    avatar: string
  }
  createdAt: number
}

export const EventsWidget = ({ data, onRetry }: EventsWidgetProps) => {
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
    return <EventsSkeleton />
  }

  // Show error state if timeout reached and no data
  if ((!data || data.items?.length === 0) && timeoutReached) {
    return (
      <WidgetContainer title="Upcoming Events" icon="solar:calendar-linear" actionLabel="View All">
        <div className="widget-error">
          <iconify-icon icon="solar:danger-circle-linear" width="48" height="48" class="error-icon"></iconify-icon>
          <h3>Unable to load events</h3>
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
      <WidgetContainer title="Upcoming Events" icon="solar:calendar-linear" actionLabel="View All">
        <div className="widget-empty">
          <iconify-icon icon="solar:calendar-linear" width="48" height="48" class="empty-icon"></iconify-icon>
          <h3>No upcoming events</h3>
          <p>Check back soon for exciting events near you!</p>
          <button className="explore-button" onClick={() => navigate('/1')}>
            Browse Events
          </button>
        </div>
      </WidgetContainer>
    )
  }

  return (
    <WidgetContainer title="Upcoming Events" icon="solar:calendar-linear" actionLabel="View All">
      <div className="events-list">
        {data?.items?.map((event: any, index: number) => (
          <EventItem key={event._id || index} event={event} index={index} navigate={navigate} />
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
        <button className="see-all-button" onClick={() => navigate('/1')}>
          {actionLabel}
          <iconify-icon icon="solar:alt-arrow-right-linear" width="16" height="16"></iconify-icon>
        </button>
      </div>
      {children}
    </div>
  )
}

// Event Item Component
interface EventItemProps {
  event: any
  index: number
  navigate: any
}

const EventItem = ({ event, index, navigate }: EventItemProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_sale': return '#10B981'
      case 'upcoming': return '#8B0FFF'
      case 'sold_out': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_sale': return 'On Sale'
      case 'upcoming': return 'Upcoming'
      case 'sold_out': return 'Sold Out'
      default: return status
    }
  }

  const handleClick = () => {
    navigate(`/events/${event._id}`)
  }

  return (
    <div className="event-item" onClick={handleClick} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="event-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <div className="event-image-placeholder">
            <iconify-icon icon="solar:calendar-linear" width="24" height="24"></iconify-icon>
          </div>
        )}
        <div className="event-status" style={{ backgroundColor: getStatusColor(event.saleStatus) }}>
          {getStatusLabel(event.saleStatus)}
        </div>
      </div>
      
      <div className="event-content">
        <h4 className="event-title">{event.title}</h4>
        
        <div className="event-details">
          <div className="event-detail">
            <iconify-icon icon="solar:clock-circle-linear" width="14" height="14"></iconify-icon>
            <span>{formatDate(event.startAtUtc)}</span>
          </div>
          <div className="event-detail">
            <iconify-icon icon="solar:map-point-linear" width="14" height="14"></iconify-icon>
            <span>{event.city}</span>
          </div>
        </div>
        
        <div className="event-creator">
          <div className="creator-avatar">
            {event.creator?.avatar ? (
              <img src={event.creator.avatar} alt={event.creator.displayName} />
            ) : (
              <div className="creator-avatar-placeholder">A</div>
            )}
          </div>
          <span className="creator-name">{event.creator?.displayName}</span>
        </div>
        
        <div className="event-footer">
          <div className="availability">
            <iconify-icon icon="solar:ticket-linear" width="14" height="14"></iconify-icon>
            <span>{event.availablePercent}% available</span>
          </div>
          <div className="tickets-sold">
            {event.ticketsSold} sold
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton Component
const EventsSkeleton = () => {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <div className="widget-title">
          <iconify-icon icon="solar:calendar-linear" width="20" height="20"></iconify-icon>
          <h3>Upcoming Events</h3>
        </div>
      </div>
      <div className="events-list">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="event-item-skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-details" />
              <div className="skeleton-creator" />
              <div className="skeleton-footer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
