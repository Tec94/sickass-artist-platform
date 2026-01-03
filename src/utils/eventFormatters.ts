import type { EventTicketType } from '../types/events'

/**
 * Format event date/time in venue's timezone
 */
export function formatEventTime(startAtUtc: number, timezone: string, format: 'short' | 'long' = 'long'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: format === 'short' ? 'short' : 'long',
      day: 'numeric',
      year: format === 'long' ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return formatter.format(new Date(startAtUtc))
  } catch (error) {
    console.error('Error formatting event time:', error)
    return new Date(startAtUtc).toLocaleString()
  }
}

/**
 * Format event date only in venue's timezone
 */
export function formatEventDate(startAtUtc: number, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return formatter.format(new Date(startAtUtc))
  } catch (error) {
    console.error('Error formatting event date:', error)
    return new Date(startAtUtc).toLocaleDateString()
  }
}

/**
 * Format event time only in venue's timezone
 */
export function formatEventTimeOnly(startAtUtc: number, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return formatter.format(new Date(startAtUtc))
  } catch (error) {
    console.error('Error formatting event time only:', error)
    return new Date(startAtUtc).toLocaleTimeString()
  }
}

/**
 * Format price in dollars
 */
export function formatPrice(priceInCents: number): string {
  const dollars = priceInCents / 100
  return `$${dollars.toFixed(2)}`
}

/**
 * Format price range from ticket types
 */
export function formatPriceRange(ticketTypes: EventTicketType[]): string {
  if (ticketTypes.length === 0) return 'TBA'
  
  const prices = ticketTypes.map(tt => tt.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  if (minPrice === maxPrice) {
    return formatPrice(minPrice)
  }
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
}

/**
 * Format price range as "From $XX"
 */
export function formatFromPrice(ticketTypes: EventTicketType[]): string {
  if (ticketTypes.length === 0) return 'TBA'
  
  const prices = ticketTypes.map(tt => tt.price)
  const minPrice = Math.min(...prices)
  
  return `From ${formatPrice(minPrice)}`
}

/**
 * Get remaining time until event starts
 */
export function getTimeUntilEvent(startAtUtc: number): string {
  const now = Date.now()
  const diff = startAtUtc - now
  
  if (diff <= 0) return 'Started'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 7) {
    const weeks = Math.floor(days / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

/**
 * Get availability percentage
 */
export function getAvailabilityPercentage(capacity: number, ticketsSold: number): number {
  if (capacity === 0) return 0
  return Math.round(((capacity - ticketsSold) / capacity) * 100)
}

/**
 * Get availability text
 */
export function getAvailabilityText(capacity: number, ticketsSold: number): string {
  const available = capacity - ticketsSold
  const percentage = getAvailabilityPercentage(capacity, ticketsSold)
  
  if (available === 0) return 'Sold Out'
  if (percentage < 10) return `Only ${available} left`
  if (percentage < 25) return `${available} available`
  return `${available} / ${capacity} available`
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = timestamp - now
  const absDiff = Math.abs(diff)
  
  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return diff > 0 ? `in ${days} ${days === 1 ? 'day' : 'days'}` : `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  if (hours > 0) {
    return diff > 0 ? `in ${hours} ${hours === 1 ? 'hour' : 'hours'}` : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (minutes > 0) {
    return diff > 0 ? `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  return 'just now'
}

/**
 * Get sale status badge info
 */
export function getSaleStatusBadge(saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'): {
  text: string
  color: string
  bgColor: string
} {
  switch (saleStatus) {
    case 'on_sale':
      return {
        text: 'On Sale',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
      }
    case 'sold_out':
      return {
        text: 'Sold Out',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
      }
    case 'upcoming':
      return {
        text: 'Coming Soon',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
      }
    case 'cancelled':
      return {
        text: 'Cancelled',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
      }
  }
}

/**
 * Check if event is in the past
 */
export function isEventPast(endAtUtc: number): boolean {
  return endAtUtc < Date.now()
}

/**
 * Check if event is happening now
 */
export function isEventNow(startAtUtc: number, endAtUtc: number): boolean {
  const now = Date.now()
  return startAtUtc <= now && now <= endAtUtc
}
