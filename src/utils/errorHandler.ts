import { ConvexError } from 'convex/values'

// Error message mapping for Convex error codes
export const ERROR_MESSAGES = {
  'NOT_AUTHENTICATED': 'Please sign in to continue',
  'NOT_AUTHORIZED': 'You don\'t have permission for this action',
  'STORAGE_QUOTA_EXCEEDED': 'Storage limit reached. Delete some items.',
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment.',
  'INVALID_INPUT': 'Invalid input. Please check and try again.',
  'NETWORK_ERROR': 'Network error. Check your connection.',
  'TIMEOUT': 'Request timed out. Please try again.',
  'SERVER_ERROR': 'Server error. Please try again later.',
  'STOCK_ERROR': 'This item is no longer available. Please choose another.',
  'CONFLICT_ERROR': 'This item is already in your cart.',
  'AUTH_ERROR': 'Please sign in to continue.',
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'CONVEX_ERROR': 'A server error occurred. Please try again.',
  'UNKNOWN_ERROR': 'Something went wrong. Please try again or contact support.',
}

// Exponential backoff delays
export const RETRY_DELAYS = [1000, 2000, 4000] // ms: 1s → 2s → 4s

// Error context interface
interface ErrorContext {
  level: 'page' | 'section' | 'component'
  component?: string
  timestamp: number
  stackTrace?: string
  errorCode?: string
}

// Error log interface for localStorage
interface ErrorLog {
  timestamp: number
  message: string
  code: string
  context: ErrorContext
}

// Error frequency tracking
const ERROR_FREQUENCY_WINDOW = 60000 // 60 seconds
const MAX_ERRORS_PER_WINDOW = 5
const errorTimestamps: number[] = []

// localStorage error logging
const ERROR_LOG_KEY = 'error_logs'
const MAX_ERROR_LOGS = 20

/**
 * Check if we should allow another error to be processed (frequency tracking)
 * @returns boolean - true if error should be processed, false if rate limited
 */
export function shouldProcessError(): boolean {
  const now = Date.now()

  // Remove old errors outside the 60-second window
  const recentErrors = errorTimestamps.filter(timestamp =>
    now - timestamp < ERROR_FREQUENCY_WINDOW
  )

  // Update the array
  errorTimestamps.length = 0
  errorTimestamps.push(...recentErrors)

  // Check if we've exceeded the limit
  if (errorTimestamps.length >= MAX_ERRORS_PER_WINDOW) {
    console.warn('[ErrorHandler] Error frequency limit reached. Suppressing error.')
    return false
  }

  // Add current error timestamp
  errorTimestamps.push(now)
  return true
}

/**
 * Map error to user-friendly message
 * @param error - Error object or message
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR

  let errorCode = 'UNKNOWN_ERROR'
  let errorMessage = ''

  // Handle Convex errors
  if (error instanceof ConvexError) {
    const data = error.data as { code?: string; message?: string }
    errorCode = data?.code || 'CONVEX_ERROR'
    errorMessage = data?.message || error.message
  }

  // Handle Error objects
  if (error instanceof Error) {
    if (!errorMessage) errorMessage = error.message
    // Try to extract error code from message
    if (errorMessage.includes('NOT_AUTHENTICATED')) errorCode = 'NOT_AUTHENTICATED'
    else if (errorMessage.includes('NOT_AUTHORIZED')) errorCode = 'NOT_AUTHORIZED'
    else if (errorMessage.includes('STORAGE_QUOTA_EXCEEDED')) errorCode = 'STORAGE_QUOTA_EXCEEDED'
    else if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) errorCode = 'RATE_LIMIT_EXCEEDED'
    else if (errorMessage.includes('INVALID_INPUT')) errorCode = 'INVALID_INPUT'
    else if (errorMessage.includes('network') || errorMessage.includes('fetch')) errorCode = 'NETWORK_ERROR'
    else if (errorMessage.includes('timeout')) errorCode = 'TIMEOUT'
    else if (errorMessage.includes('server')) errorCode = 'SERVER_ERROR'
  }

  // Return mapped message or fallback
  return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Check if error should be retried
 * @param error - Error to check
 * @returns boolean - true if error should be retried
 */
export function shouldRetry(error: unknown): boolean {
  if (!error) return false

  const errorMessage = String(error)

  // Don't retry auth/permission errors
  if (errorMessage.includes('NOT_AUTHENTICATED') ||
    errorMessage.includes('NOT_AUTHORIZED') ||
    errorMessage.includes('AUTH_ERROR')) {
    return false
  }

  // Don't retry validation/input errors
  if (errorMessage.includes('INVALID_INPUT') ||
    errorMessage.includes('VALIDATION_ERROR') ||
    errorMessage.includes('already exists') ||
    errorMessage.includes('duplicate')) {
    return false
  }

  // Don't retry stock/conflict errors
  if (errorMessage.includes('STOCK_ERROR') ||
    errorMessage.includes('CONFLICT_ERROR') ||
    errorMessage.includes('out of stock')) {
    return false
  }

  // Retry network, timeout, and server errors
  if (errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('server') ||
    errorMessage.includes('connection')) {
    return true
  }

  // Default: don't retry unknown errors
  return false
}

/**
 * Log error to localStorage for debugging
 * @param error - Error to log
 * @param context - Error context
 */
export function logErrorToStorage(error: unknown, context: ErrorContext): void {
  try {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      message: String(error),
      code: context.errorCode || 'UNKNOWN_ERROR',
      context: context
    }

    // Get existing logs
    const existingLogs = getErrorLogsFromStorage()

    // Add new log
    existingLogs.push(errorLog)

    // Keep only last 20 errors
    if (existingLogs.length > MAX_ERROR_LOGS) {
      existingLogs.shift()
    }

    // Save to localStorage
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(existingLogs))

  } catch (e) {
    console.error('[ErrorHandler] Failed to log error to storage:', e)
  }
}

/**
 * Get error logs from localStorage
 * @returns Array of error logs
 */
export function getErrorLogsFromStorage(): ErrorLog[] {
  try {
    const logs = localStorage.getItem(ERROR_LOG_KEY)
    return logs ? JSON.parse(logs) : []
  } catch (e) {
    console.error('[ErrorHandler] Failed to read error logs from storage:', e)
    return []
  }
}

/**
 * Clear error logs from localStorage
 */
export function clearErrorLogsFromStorage(): void {
  try {
    localStorage.removeItem(ERROR_LOG_KEY)
  } catch (e) {
    console.error('[ErrorHandler] Failed to clear error logs from storage:', e)
  }
}

/**
 * Get exponential backoff delay for retry attempt
 * @param retryCount - Current retry count (0-based)
 * @returns Delay in milliseconds, or null if max retries reached
 */
export function getRetryDelay(retryCount: number): number | null {
  if (retryCount < 0) return RETRY_DELAYS[0]
  if (retryCount >= RETRY_DELAYS.length) return null

  return RETRY_DELAYS[retryCount]
}

/**
 * Create error context for logging
 * @param level - Error boundary level
 * @param component - Component name
 * @param error - Error object
 * @returns Error context object
 */
export function createErrorContext(
  level: 'page' | 'section' | 'component',
  component?: string,
  error?: unknown
): ErrorContext {
  return {
    level,
    component,
    timestamp: Date.now(),
    stackTrace: error instanceof Error ? error.stack : undefined,
    errorCode: error instanceof Error ?
      Object.keys(ERROR_MESSAGES).find(code =>
        error.message.includes(code)
      ) || 'UNKNOWN_ERROR' : 'UNKNOWN_ERROR'
  }
}

/**
 * Comprehensive error handler that combines all error handling logic
 * @param error - Error to handle
 * @param context - Error context
 * @returns Object with error handling information
 */
export function handleError(
  error: unknown,
  context: ErrorContext
): {
  shouldProcess: boolean
  shouldRetry: boolean
  retryDelay: number | null
  userMessage: string
  errorContext: ErrorContext
} {
  // Check if we should process this error (frequency tracking)
  const shouldProcess = shouldProcessError()

  if (!shouldProcess) {
    return {
      shouldProcess: false,
      shouldRetry: false,
      retryDelay: null,
      userMessage: 'Too many errors occurred. Please wait a moment before trying again.',
      errorContext: context
    }
  }

  // Get user-friendly message
  const userMessage = getUserFriendlyErrorMessage(error)

  // Check if error should be retried
  const shouldRetryError = shouldRetry(error)

  // Get retry delay
  const retryDelay = shouldRetryError ? RETRY_DELAYS[0] : null // Start with first delay

  // Log error to storage
  logErrorToStorage(error, context)

  return {
    shouldProcess: true,
    shouldRetry: shouldRetryError,
    retryDelay,
    userMessage,
    errorContext: context
  }
}