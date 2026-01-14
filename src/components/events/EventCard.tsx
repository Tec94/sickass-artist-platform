import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import type { EventItem } from '../../types/events'
import {
  formatEventDate,
  getSaleStatusBadge,
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
  const statusBadge = getSaleStatusBadge(event.saleStatus)

  return (
    <Link
      to={`/events/${event._id}`}
      className={`group bg-zinc-950 border border-zinc-900 hover:border-red-900/50 transition-all duration-500 overflow-hidden flex ${
        compact ? 'flex-row h-40' : 'flex-col'
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
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
            event.saleStatus === 'on_sale' ? 'border-green-900/50 text-green-500' : 'border-zinc-800 text-zinc-500'
          }`}>
            {event.saleStatus === 'on_sale' ? 'Available' : statusBadge.text}
          </span>
        </div>

        <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-6">
          <MapPin size={14} className="text-red-600" />
          <span className="font-medium">{event.city}</span>
        </div>

        <div className="mt-auto flex gap-3">
          <button className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold uppercase py-3 text-[10px] tracking-[0.2em] transition-all transform group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {event.saleStatus === 'on_sale' ? 'Get Tickets' : 'Details'}
          </button>
          <button className="px-4 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors">
            <Calendar size={18} />
          </button>
        </div>
      </div>
    </Link>
  )
})
