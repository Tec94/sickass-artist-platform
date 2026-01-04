import { ConvexError } from 'convex/values'

export interface ParsedConvexError {
  code: string
  message: string
  originalMessage: string
  isRecoverable: boolean
  retryable: boolean
  userMessage: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

interface ConvexErrorData {
  code?: string
  message?: string
}

export function parseConvexError(error: unknown): ParsedConvexError {
  const originalMessage = error instanceof Error ? error.message : String(error)
  
  // Network errors
  if (originalMessage.includes('fetch') || originalMessage.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: originalMessage,
      originalMessage,
      isRecoverable: true,
      retryable: true,
      userMessage: 'Connection lost. Please check your internet and try again.',
      severity: 'warning'
    }
  }
  
  // Inventory errors
  if (originalMessage.includes('out of stock') || originalMessage.includes('stock')) {
    return {
      code: 'STOCK_ERROR',
      message: originalMessage,
      originalMessage,
      isRecoverable: true,
      retryable: false,
      userMessage: 'This item is no longer available. Please choose another.',
      severity: 'warning'
    }
  }
  
  // Duplicate/conflict errors
  if (originalMessage.includes('duplicate') || originalMessage.includes('already exists')) {
    return {
      code: 'CONFLICT_ERROR',
      message: originalMessage,
      originalMessage,
      isRecoverable: true,
      retryable: false,
      userMessage: 'This item is already in your cart.',
      severity: 'info'
    }
  }
  
  // Auth errors
  if (originalMessage.includes('not signed in') || originalMessage.includes('unauthorized')) {
    return {
      code: 'AUTH_ERROR',
      message: originalMessage,
      originalMessage,
      isRecoverable: true,
      retryable: false,
      userMessage: 'Please sign in to continue.',
      severity: 'warning'
    }
  }
  
  // Validation errors
  if (originalMessage.includes('validation') || originalMessage.includes('invalid')) {
    return {
      code: 'VALIDATION_ERROR',
      message: originalMessage,
      originalMessage,
      isRecoverable: true,
      retryable: false,
      userMessage: 'Please check your input and try again.',
      severity: 'warning'
    }
  }
  
  // Check for ConvexError specifically (for custom errors thrown from the server)
  if (error instanceof ConvexError) {
    const data = error.data as ConvexErrorData
    return {
      code: data?.code || 'CONVEX_ERROR',
      message: data?.message || originalMessage,
      originalMessage,
      isRecoverable: true,
      retryable: false,
      userMessage: data?.message || 'A server error occurred. Please try again.',
      severity: 'error'
    }
  }
  
  // Default: unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: originalMessage,
    originalMessage,
    isRecoverable: false,
    retryable: false,
    userMessage: 'Something went wrong. Please try again or contact support.',
    severity: 'error'
  }
}

interface AnalyticsAPI {
  track: (event: string, properties?: Record<string, unknown>) => void
  logEvent: (eventName: string, value?: string | number, metadata?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    statsig?: AnalyticsAPI
    analytics?: AnalyticsAPI
  }
}

// Log errors to analytics
export async function logError(error: ParsedConvexError, context: {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}) {
  // Send to analytics (Statsig)
  try {
    const hasStatsig = typeof window !== 'undefined' && !!window.statsig
    const hasAnalytics = typeof window !== 'undefined' && !!window.analytics

    if (hasStatsig && window.statsig) {
      window.statsig.logEvent('merch_error', undefined, { ...error, ...context })
    }
    
    if (hasAnalytics && window.analytics) {
      window.analytics.track('merch_error', { ...error, ...context })
    }

    if (!hasStatsig && !hasAnalytics) {
      console.error('[Merch Error]', error, context)
    }
  } catch (e) {
    // Fail silently
    console.error('Failed to log error:', e)
  }
}
