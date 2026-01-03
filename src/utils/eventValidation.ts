// Event form validation utilities with comprehensive error handling

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface EventFormData {
  title: string
  description: string
  imageUrl: string
  thumbnailUrl?: string
  startAtUtc: number
  endAtUtc: number
  venueId: string
  capacity: number
  saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
}

export interface TicketTypeFormData {
  type: 'general' | 'vip' | 'early_bird'
  price: number
  quantity: number
  description?: string
  saleStartsAtUtc: number
  saleEndsAtUtc: number
}

export interface CheckoutFormData {
  quantity: number
  ticketTypeId: string
}

// Validation constants
export const VALIDATION_CONSTANTS = {
  TITLE_MIN: 1,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 100000,
  PRICE_MIN: 0,
  PRICE_MAX: 999999,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 10,
  ADDRESS_MAX: 500,
}

// Event validation
export function validateEventForm(data: Partial<EventFormData>): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.title) {
    errors.title = 'Title is required'
  } else if (data.title.length < VALIDATION_CONSTANTS.TITLE_MIN) {
    errors.title = `Title must be at least ${VALIDATION_CONSTANTS.TITLE_MIN} characters`
  } else if (data.title.length > VALIDATION_CONSTANTS.TITLE_MAX) {
    errors.title = `Title must be less than ${VALIDATION_CONSTANTS.TITLE_MAX} characters`
  }

  if (!data.description) {
    errors.description = 'Description is required'
  } else if (data.description.length > VALIDATION_CONSTANTS.DESCRIPTION_MAX) {
    errors.description = `Description must be less than ${VALIDATION_CONSTANTS.DESCRIPTION_MAX} characters`
  }

  if (!data.imageUrl) {
    errors.imageUrl = 'Image URL is required'
  }

  if (!data.startAtUtc) {
    errors.startAtUtc = 'Start date is required'
  } else if (data.startAtUtc < Date.now()) {
    errors.startAtUtc = 'Start date cannot be in the past'
  }

  if (!data.endAtUtc) {
    errors.endAtUtc = 'End date is required'
  } else if (data.startAtUtc && data.endAtUtc <= data.startAtUtc) {
    errors.endAtUtc = 'End date must be after start date'
  }

  if (!data.capacity || data.capacity < VALIDATION_CONSTANTS.CAPACITY_MIN) {
    errors.capacity = `Capacity must be at least ${VALIDATION_CONSTANTS.CAPACITY_MIN}`
  } else if (data.capacity > VALIDATION_CONSTANTS.CAPACITY_MAX) {
    errors.capacity = `Capacity must be less than ${VALIDATION_CONSTANTS.CAPACITY_MAX}`
  }

  if (!data.venueId) {
    errors.venueId = 'Venue is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Ticket type validation
export function validateTicketTypeForm(data: Partial<TicketTypeFormData>, eventStartTime?: number): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.type) {
    errors.type = 'Ticket type is required'
  }

  if (data.price === undefined || data.price < VALIDATION_CONSTANTS.PRICE_MIN) {
    errors.price = `Price must be at least ${VALIDATION_CONSTANTS.PRICE_MIN}`
  } else if (data.price > VALIDATION_CONSTANTS.PRICE_MAX) {
    errors.price = `Price must be less than ${VALIDATION_CONSTANTS.PRICE_MAX}`
  }

  if (!data.quantity || data.quantity < VALIDATION_CONSTANTS.QUANTITY_MIN) {
    errors.quantity = `Quantity must be at least ${VALIDATION_CONSTANTS.QUANTITY_MIN}`
  } else if (data.quantity > VALIDATION_CONSTANTS.CAPACITY_MAX) {
    errors.quantity = `Quantity must be less than ${VALIDATION_CONSTANTS.CAPACITY_MAX}`
  }

  if (!data.saleStartsAtUtc) {
    errors.saleStartsAtUtc = 'Sale start date is required'
  } else if (data.saleStartsAtUtc < Date.now()) {
    errors.saleStartsAtUtc = 'Sale start date cannot be in the past'
  }

  if (!data.saleEndsAtUtc) {
    errors.saleEndsAtUtc = 'Sale end date is required'
  } else if (data.saleStartsAtUtc && data.saleEndsAtUtc <= data.saleStartsAtUtc) {
    errors.saleEndsAtUtc = 'Sale end date must be after start date'
  } else if (eventStartTime && data.saleEndsAtUtc > eventStartTime) {
    errors.saleEndsAtUtc = 'Sale cannot end after event starts'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Checkout validation
export function validateCheckoutForm(data: Partial<CheckoutFormData>): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.quantity || data.quantity < VALIDATION_CONSTANTS.QUANTITY_MIN) {
    errors.quantity = `Quantity must be at least ${VALIDATION_CONSTANTS.QUANTITY_MIN}`
  } else if (data.quantity > VALIDATION_CONSTANTS.QUANTITY_MAX) {
    errors.quantity = `Max ${VALIDATION_CONSTANTS.QUANTITY_MAX} tickets per transaction`
  }

  if (!data.ticketTypeId) {
    errors.ticketTypeId = 'Please select a ticket type'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Utility functions for formatting and display
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`
}

export function formatDateTime(utcMillis: number, timezone?: string): string {
  const date = new Date(utcMillis)
  
  if (timezone) {
    // Convert UTC to venue timezone for display
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }
  
  return date.toLocaleString()
}

export function getTimeRemaining(targetTime: number): string {
  const now = Date.now()
  const diff = targetTime - now
  
  if (diff <= 0) return 'Expired'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Input sanitization
export function sanitizeInput(input: string, maxLength: number): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
}

// Form helpers
export function createFormHelpers() {
  const getFieldError = (errors: Record<string, string>, field: string): string | undefined => {
    return errors[field]
  }
  
  const hasFieldError = (errors: Record<string, string>, field: string): boolean => {
    return !!errors[field]
  }
  
  const getFieldClassName = (errors: Record<string, string>, field: string): string => {
    const baseClass = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
    
    if (errors[field]) {
      return `${baseClass} ring-red-500 focus:ring-red-500`
    }
    
    return `${baseClass} focus:ring-indigo-600`
  }
  
  return {
    getFieldError,
    hasFieldError,
    getFieldClassName,
  }
}