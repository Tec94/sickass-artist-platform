import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { EventItem } from '../../types/events'
import {
  formatEventDate,
  getSaleStatusBadge,
  getTimeUntilEvent,
} from '../../utils/eventFormatters'

interface EventCardProps {
  event: EventItem
  timezone?: string
  showQuickAction?: boolean
  compact?: boolean
}

export const EventCard = memo(function EventCard({
  event,
  timezone = 'America/New_York', // Default timezone, should be passed from venue data
  showQuickAction = true,
  compact = false,
}: EventCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageVisible, setImageVisible] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    const imgElement = imgRef.current
    if (!imgElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    observer.observe(imgElement)

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement)
      }
    }
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const statusBadge = getSaleStatusBadge(event.saleStatus)
  const availablePercent = Math.round(event.availablePercent * 100)
  const isLowAvailability = availablePercent < 25 && event.saleStatus === 'on_sale'

  return (
    <Link
      to={`/events/${event._id}`}
      className={`block bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden transition-all duration-200 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 ${
        compact ? 'flex flex-row' : ''
      }`}
    >
      <div className={`relative overflow-hidden bg-gray-950 ${compact ? 'w-32 h-32' : 'aspect-video'}`}>
        {!imageVisible && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse" />
        )}
        
        <img
          ref={imgRef}
          src={imageVisible ? event.imageUrl : ''}
          alt={event.title}
          loading="lazy"
          onLoad={handleImageLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sale Status Badge */}
        <div className={`absolute top-2 left-2 ${statusBadge.bgColor} ${statusBadge.color} px-2 py-1 rounded text-xs font-bold uppercase tracking-wide backdrop-blur-sm`}>
          {statusBadge.text}
        </div>

        {/* Low Availability Warning */}
        {isLowAvailability && (
          <div className="absolute top-2 right-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
            {availablePercent}% left
          </div>
        )}
      </div>

      <div className={`p-3 ${compact ? 'flex-1' : ''}`}>
        <h3 className="text-white font-bold text-sm mb-1 truncate" title={event.title}>
          {event.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <iconify-icon icon="solar:map-point-bold" class="text-cyan-400"></iconify-icon>
            {event.city}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
          <span className="flex items-center gap-1">
            <iconify-icon icon="solar:calendar-bold" class="text-cyan-400"></iconify-icon>
            {formatEventDate(event.startAtUtc, timezone)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-cyan-400 font-medium">
            {getTimeUntilEvent(event.startAtUtc)}
          </span>
          
          {showQuickAction && event.saleStatus === 'on_sale' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                // Navigate to event detail for queue join
                window.location.href = `/events/${event._id}`
              }}
              className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-bold hover:bg-cyan-500/30 transition-colors"
            >
              View
            </button>
          )}
        </div>
      </div>
    </Link>
  )
})
