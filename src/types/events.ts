import { Id } from '../../convex/_generated/dataModel'

// Event types
export type SaleStatus = 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
export type TicketType = 'general' | 'vip' | 'early_bird'
export type TicketStatus = 'valid' | 'used' | 'cancelled'
export type QueueStatus = 'waiting' | 'admitted' | 'expired' | 'left'

// Event filters
export interface EventFilters {
  city?: string
  startDate?: number
  endDate?: number
  saleStatus?: SaleStatus
  priceMin?: number
  priceMax?: number
  sortBy?: 'asc' | 'desc'
}

// Event list item (matches EventWithCreator from convex)
export interface EventItem {
  _id: Id<'events'>
  title: string
  imageUrl: string
  startAtUtc: number
  endAtUtc: number
  city: string
  saleStatus: SaleStatus
  capacity: number
  ticketsSold: number
  availablePercent: number
  creator: {
    _id: Id<'users'>
    displayName: string
    avatar: string
  }
  createdAt: number
}

// Event detail
export interface EventDetail {
  _id: Id<'events'>
  title: string
  description: string
  imageUrl: string
  startAtUtc: number
  endAtUtc: number
  city: string
  address: string
  timezone: string
  capacity: number
  ticketsSold: number
  saleStatus: SaleStatus
  createdAt: number
}

// Ticket type
export interface EventTicketType {
  _id: Id<'eventTickets'>
  type: TicketType
  price: number
  quantity: number
  quantitySold: number
  availableQuantity: number
  saleStartsAtUtc: number
  saleEndsAtUtc: number
  description?: string
}

// Creator info
export interface EventCreator {
  _id: Id<'users'>
  displayName: string
  avatar: string
  username: string
}

// Queue entry
export interface QueueEntry {
  seq: number
  status: QueueStatus
  position: number
  expiresAtUtc: number
  joinedAtUtc: number
}

// Checkout session
export interface CheckoutSession {
  _id: Id<'checkoutSessions'>
  expiresAtUtc: number
  createdAtUtc: number
}

// User context for event detail
export interface EventUserContext {
  queueEntry?: QueueEntry
  checkoutSession?: CheckoutSession
  tickets?: UserTicket[]
}

// Full event detail with context
export interface EventDetailWithContext {
  event: EventDetail
  creator: EventCreator
  ticketTypes: EventTicketType[]
  userContext?: EventUserContext
}

// User ticket
export interface UserTicket {
  _id: Id<'userTickets'>
  event: {
    _id: Id<'events'>
    title: string
    imageUrl: string
    startAtUtc: number
    endAtUtc: number
    city: string
  }
  ticketType: TicketType
  quantity: number
  ticketNumber: string
  confirmationCode: string
  status: TicketStatus
  purchasedAtUtc: number
}

// Search result item (currently same as EventItem, may extend in future)
export type EventSearchResult = EventItem
