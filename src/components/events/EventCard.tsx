import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { EventItem } from '../../types/events'
import {
  formatEventDate,
} from '../../utils/eventFormatters'

interface EventCardProps {
  event: EventItem
  timezone?: string
  showQuickAction?: boolean
  compact?: boolean
}

export const EventCard = memo(function EventCard({
  event,
  timezone = 'America/New_York',
  compact = false,
}: EventCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageVisible, setImageVisible] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

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
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(imgElement)
    return () => { if (imgElement) observer.unobserve(imgElement) }
  }, [])

  const handleImageLoad = useCallback(() => setImageLoaded(true), [])

  return (
    <Link
      to={`/events/${event._id}`}
      className={`group bg-zinc-900/50 border border-zinc-800/50 hover:border-red-900/50 hover:bg-zinc-900 transition-all duration-500 overflow-hidden flex shadow-lg hover:shadow-red-900/10 ${
        compact ? 'flex-row h-48' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-zinc-900 ${compact ? 'w-48 h-full' : 'w-full aspect-video'}`}>
        {!imageVisible && <div className="absolute inset-0 bg-zinc-900 animate-pulse" />}
        <img
          ref={imgRef}
          src={imageVisible ? event.imageUrl : ''}
          alt={event.title}
          loading="lazy"
          onLoad={handleImageLoad}
          className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110 ${
             imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-2xl z-10">
          {event.saleStatus.replace('_', ' ')}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
            {formatEventDate(event.startAtUtc, timezone)}
          </div>
        </div>
        
        {/* Ticket Progress Bar */}
        {event.saleStatus === 'on_sale' && (
          <div className="mb-4">
             <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1.5">
               <span className="text-zinc-500">Tickets Available</span>
               <span className={event.availablePercent < 20 ? 'text-red-500' : 'text-zinc-400'}>
                 {event.availablePercent}%
               </span>
             </div>
             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full ${event.availablePercent < 20 ? 'bg-red-600' : 'bg-zinc-600'}`} 
                 style={{ width: `${event.availablePercent}%` }}
               ></div>
             </div>
          </div>
        )}

        <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-red-500 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-6">
          <iconify-icon icon="solar:map-point-linear" width="14" height="14" class="text-red-600"></iconify-icon>
          <span className="font-medium">{event.city}</span>
        </div>

        <div className="mt-auto flex gap-3">
          <button className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold uppercase py-3 text-[10px] tracking-[0.2em] transition-all transform group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {event.saleStatus === 'on_sale' ? 'Get Tickets' : 'Details'}
          </button>
          <button className="px-4 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors">
            <iconify-icon icon="solar:calendar-linear" width="18" height="18"></iconify-icon>
          </button>
        </div>
      </div>
    </Link>
  )
})
