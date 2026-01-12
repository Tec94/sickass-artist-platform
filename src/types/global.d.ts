/**
 * Global type declarations for Window extensions
 */

interface AnalyticsAPI {
    track: (event: string, properties?: Record<string, unknown>) => void
    logEvent: (eventName: string, value?: string | number, metadata?: Record<string, unknown>) => void
}

declare global {
    interface Window {
        gtag?: (command: string, eventName: string, options?: Record<string, unknown>) => void
        statsig?: AnalyticsAPI
        analytics?: AnalyticsAPI
    }
}

export { }
