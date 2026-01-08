import { useNavigate } from 'react-router-dom'

// ==================== TOP MERCH WIDGET ====================

interface TopMerchWidgetProps {
  data?: {
    _id: string
    name: string
    price: number
    image: string
    category: string
  }[]
}

export const TopMerchWidget = ({ data }: TopMerchWidgetProps) => {
  const navigate = useNavigate()

  return (
    <div className="mini-widget">
      <div className="mini-widget-header">
        <div className="mini-widget-title">
          <iconify-icon icon="solar:bag-linear" width="18" height="18"></iconify-icon>
          <h3>Top Merch</h3>
        </div>
        <button className="mini-widget-action" onClick={() => navigate('/store')}>
          View All <iconify-icon icon="solar:arrow-right-linear" width="14" height="14"></iconify-icon>
        </button>
      </div>
      
      <div className="mini-widget-content">
        {!data || data.length === 0 ? (
          <div className="mini-widget-empty">
            <iconify-icon icon="solar:bag-linear" width="24" height="24"></iconify-icon>
            <p>No products yet</p>
          </div>
        ) : (
          <div className="merch-grid">
            {data.slice(0, 4).map((item) => (
              <div 
                key={item._id} 
                className="merch-item"
                onClick={() => navigate(`/store`)}
              >
                <div className="merch-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="merch-placeholder">
                      <iconify-icon icon="solar:bag-linear" width="20" height="20"></iconify-icon>
                    </div>
                  )}
                </div>
                <div className="merch-info">
                  <span className="merch-name">{item.name}</span>
                  <span className="merch-price">${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== TRENDING FORUM WIDGET ====================

interface TrendingForumWidgetProps {
  data?: {
    _id: string
    title: string
    authorDisplayName: string
    authorAvatar: string
    replyCount: number
    netVoteCount: number
    viewCount: number
    createdAt: number
  }[]
}

export const TrendingForumWidget = ({ data }: TrendingForumWidgetProps) => {
  const navigate = useNavigate()

  return (
    <div className="mini-widget">
      <div className="mini-widget-header">
        <div className="mini-widget-title">
          <iconify-icon icon="solar:chat-square-dots-linear" width="18" height="18"></iconify-icon>
          <h3>Hot Discussions</h3>
        </div>
        <button className="mini-widget-action" onClick={() => navigate('/forum')}>
          View All <iconify-icon icon="solar:arrow-right-linear" width="14" height="14"></iconify-icon>
        </button>
      </div>
      
      <div className="mini-widget-content">
        {!data || data.length === 0 ? (
          <div className="mini-widget-empty">
            <iconify-icon icon="solar:chat-square-dots-linear" width="24" height="24"></iconify-icon>
            <p>No discussions yet</p>
          </div>
        ) : (
          <div className="forum-list">
            {data.slice(0, 4).map((thread) => (
              <div 
                key={thread._id} 
                className="forum-item"
                onClick={() => navigate(`/forum/thread/${thread._id}`)}
              >
                <div className="forum-content">
                  <span className="forum-title">{thread.title}</span>
                  <div className="forum-meta">
                    <span className="forum-author">{thread.authorDisplayName}</span>
                    <span className="forum-stats">
                      <iconify-icon icon="solar:like-linear" width="12" height="12"></iconify-icon> {thread.netVoteCount}
                      <iconify-icon icon="solar:chat-round-dots-linear" width="12" height="12"></iconify-icon> {thread.replyCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== ANNOUNCEMENTS WIDGET ====================

interface AnnouncementsWidgetProps {
  data?: {
    _id: string
    content: string
    authorDisplayName: string
    authorAvatar: string
    createdAt: number
  }[]
}

export const AnnouncementsWidget = ({ data }: AnnouncementsWidgetProps) => {
  const navigate = useNavigate()

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="mini-widget">
      <div className="mini-widget-header">
        <div className="mini-widget-title">
          <iconify-icon icon="solar:chat-round-dots-linear" width="18" height="18"></iconify-icon>
          <h3>Announcements</h3>
        </div>
        <button className="mini-widget-action" onClick={() => navigate('/chat')}>
          View Chat <iconify-icon icon="solar:arrow-right-linear" width="14" height="14"></iconify-icon>
        </button>
      </div>
      
      <div className="mini-widget-content">
        {!data || data.length === 0 ? (
          <div className="mini-widget-empty">
            <iconify-icon icon="solar:chat-round-dots-linear" width="24" height="24"></iconify-icon>
            <p>No announcements</p>
          </div>
        ) : (
          <div className="announcement-list">
            {data.slice(0, 3).map((msg) => (
              <div key={msg._id} className="announcement-item">
                <div className="announcement-avatar">
                  {msg.authorAvatar ? (
                    <img src={msg.authorAvatar} alt={msg.authorDisplayName} />
                  ) : (
                    <span>{msg.authorDisplayName[0]}</span>
                  )}
                </div>
                <div className="announcement-content">
                  <span className="announcement-text">{msg.content.slice(0, 80)}...</span>
                  <span className="announcement-time">
                    <iconify-icon icon="solar:clock-circle-linear" width="10" height="10"></iconify-icon> {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== TRENDING GALLERY WIDGET ====================

interface TrendingGalleryWidgetProps {
  data?: {
    _id: string
    contentId: string
    title: string
    thumbnailUrl: string
    type: string
    likeCount: number
    viewCount: number
  }[]
}

export const TrendingGalleryWidget = ({ data }: TrendingGalleryWidgetProps) => {
  const navigate = useNavigate()

  return (
    <div className="mini-widget">
      <div className="mini-widget-header">
        <div className="mini-widget-title">
          <iconify-icon icon="solar:gallery-linear" width="18" height="18"></iconify-icon>
          <h3>Trending Gallery</h3>
        </div>
        <button className="mini-widget-action" onClick={() => navigate('/gallery')}>
          View All <iconify-icon icon="solar:arrow-right-linear" width="14" height="14"></iconify-icon>
        </button>
      </div>
      
      <div className="mini-widget-content">
        {!data || data.length === 0 ? (
          <div className="mini-widget-empty">
            <iconify-icon icon="solar:gallery-linear" width="24" height="24"></iconify-icon>
            <p>No gallery content</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {data.slice(0, 4).map((item) => (
              <div 
                key={item._id} 
                className="gallery-item"
                onClick={() => navigate('/gallery')}
              >
                <div className="gallery-thumb">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} />
                  ) : (
                    <div className="gallery-placeholder">
                      <iconify-icon icon="solar:gallery-linear" width="20" height="20"></iconify-icon>
                    </div>
                  )}
                  <div className="gallery-overlay">
                    <span><iconify-icon icon="solar:heart-linear" width="12" height="12"></iconify-icon> {item.likeCount}</span>
                    <span><iconify-icon icon="solar:eye-linear" width="12" height="12"></iconify-icon> {item.viewCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== ARTIST MOMENTS WIDGET ====================

interface ArtistMomentsWidgetProps {
  data?: {
    _id: string
    contentId: string
    title: string
    thumbnailUrl: string
    type: string
    createdAt: number
  }[]
}

export const ArtistMomentsWidget = ({ data }: ArtistMomentsWidgetProps) => {
  const navigate = useNavigate()

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bts': return 'BTS'
      case 'edit': return 'Edit'
      case 'photoshoot': return 'Photo'
      default: return 'Moment'
    }
  }

  return (
    <div className="mini-widget featured">
      <div className="mini-widget-header">
        <div className="mini-widget-title">
          <iconify-icon icon="solar:magic-stick-linear" width="18" height="18"></iconify-icon>
          <h3>Artist Moments</h3>
        </div>
        <button className="mini-widget-action" onClick={() => navigate('/gallery?type=bts')}>
          View All <iconify-icon icon="solar:arrow-right-linear" width="14" height="14"></iconify-icon>
        </button>
      </div>
      
      <div className="mini-widget-content">
        {!data || data.length === 0 ? (
          <div className="mini-widget-empty">
            <iconify-icon icon="solar:magic-stick-linear" width="24" height="24"></iconify-icon>
            <p>No moments yet</p>
          </div>
        ) : (
          <div className="moments-grid">
            {data.slice(0, 4).map((item) => (
              <div 
                key={item._id} 
                className="moment-item"
                onClick={() => navigate('/gallery')}
              >
                <div className="moment-thumb">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} />
                  ) : (
                    <div className="moment-placeholder">
                      <iconify-icon icon="solar:magic-stick-linear" width="20" height="20"></iconify-icon>
                    </div>
                  )}
                  <div className="moment-badge">{getTypeLabel(item.type)}</div>
                </div>
                <span className="moment-title">{item.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== UPCOMING EVENTS WIDGET ====================

interface UpcomingEventsWidgetProps {
  data?: {
    _id: string
    title: string
    startAtUtc: number
    imageUrl: string
    city: string
    ticketsSold: number
    capacity: number
  }[]
}

export const UpcomingEventsWidget = ({ data }: UpcomingEventsWidgetProps) => {
  const navigate = useNavigate()

  return (
    <div className="mini-widget">
      <div className="mini-widget-header">
        <div className="mini-widget-title">
          <iconify-icon icon="solar:calendar-linear" width="18" height="18"></iconify-icon>
          <h3>Upcoming Events</h3>
        </div>
        <button className="mini-widget-action" onClick={() => navigate('/events')}>
          View All <iconify-icon icon="solar:arrow-right-linear" width="14" height="14"></iconify-icon>
        </button>
      </div>
      
      <div className="mini-widget-content">
        {!data || data.length === 0 ? (
          <div className="mini-widget-empty">
            <iconify-icon icon="solar:calendar-linear" width="24" height="24"></iconify-icon>
            <p>No upcoming events</p>
          </div>
        ) : (
          <div className="events-list">
            {data.slice(0, 3).map((event) => (
              <div 
                key={event._id} 
                className="event-item"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                <div className="event-date">
                  <span className="event-day">{new Date(event.startAtUtc).getDate()}</span>
                  <span className="event-month">{new Date(event.startAtUtc).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div className="event-info">
                  <span className="event-title">{event.title}</span>
                  <span className="event-location">
                    <iconify-icon icon="solar:map-point-linear" width="12" height="12"></iconify-icon> {event.city}
                  </span>
                </div>
                <div className="event-tickets">
                  {Math.round((event.ticketsSold / event.capacity) * 100)}% sold
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

