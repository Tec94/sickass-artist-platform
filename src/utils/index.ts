// Performance monitoring
export { perfMonitor } from './performanceMonitor'
export type { PerformanceMetric, MetricSummary, PerformanceReport } from './performanceMonitor'

// Image utilities
export { imageCache } from './imageCache'
export {
  generateSrcSet,
  generateLQIP,
  getOptimalFormat,
} from './imageOptimization'
export {
  getOptimizedImageUrl,
  getSrcSet,
  getWebPFallbackSrcSet,
  getLqipUrl,
  PLACEHOLDER_SVG
} from './imageOptimizer'

// Error handling
export { addErrorLog, getErrorLogs, clearErrorLogs } from './errorLogger'
export type { ErrorLog } from './errorLogger'
export { parseConvexError, logError } from './convexErrorHandler'
export type { ParsedConvexError } from './convexErrorHandler'
export {
  getUserFriendlyErrorMessage,
  shouldRetry,
  handleError,
  getRetryDelay,
  createErrorContext,
  ERROR_MESSAGES,
  RETRY_DELAYS,
} from './errorHandler'

// Analytics
export * from './analytics'

// Recommendations
export { recommendationCache } from './recommendationCache'

// Event Utilities
export * from './eventFormatters'
export {
  validateEventForm,
  validateTicketTypeForm,
  validateCheckoutForm,
  sanitizeInput,
  createFormHelpers,
  formatDateTime,
  getTimeRemaining,
  VALIDATION_CONSTANTS,
} from './eventValidation'
export type {
  ValidationResult,
  EventFormData,
  TicketTypeFormData,
  CheckoutFormData,
} from './eventValidation'

// Calendar Utilities
export { generateGoogleCalendarLink } from './googleCalendarLink'
export { generateICS } from './icsGenerator'
