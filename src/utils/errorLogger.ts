import { ParsedConvexError } from './convexErrorHandler'

export interface ErrorLog {
  timestamp: number
  code: string
  message: string
  context: {
    component?: string
    action?: string
    userId?: string
    [key: string]: unknown
  }
  severity: string
}

const errorLogs: ErrorLog[] = []
const MAX_LOGS = 100

export function addErrorLog(error: ParsedConvexError, context: Record<string, unknown>): void {
  const log: ErrorLog = {
    timestamp: Date.now(),
    code: error.code,
    message: error.message,
    context,
    severity: error.severity,
  }

  errorLogs.push(log)

  // Keep only last 100 errors
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.shift()
  }

  // Send to analytics if critical
  if (error.severity === 'critical') {
    sendToAnalytics(log)
  }
}

export function getErrorLogs(): ErrorLog[] {
  return [...errorLogs]
}

export function clearErrorLogs(): void {
  errorLogs.length = 0
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

async function sendToAnalytics(log: ErrorLog) {
  // Send to Statsig or other analytics
  try {
    const hasStatsig = typeof window !== 'undefined' && !!window.statsig
    const hasAnalytics = typeof window !== 'undefined' && !!window.analytics

    if (hasStatsig && window.statsig) {
      window.statsig.logEvent('merch_critical_error', undefined, { ...log })
    }
    
    if (hasAnalytics && window.analytics) {
      window.analytics.track('merch_critical_error', { ...log as unknown as Record<string, unknown> })
    }
  } catch (e) {
    console.error('Failed to send error log:', e)
  }
}
