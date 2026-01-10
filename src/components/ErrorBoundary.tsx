import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import {
  shouldProcessError,
  shouldRetry,
  getRetryDelay,
  createErrorContext,
  logErrorToStorage,
  RETRY_DELAYS
} from '../utils/errorHandler'
import { trackError } from '../utils/analytics'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodeJSTimeout = any

interface ErrorBoundaryProps {
  children: ReactNode
  level?: 'page' | 'section' | 'component'
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  componentName?: string
  maxRetries?: number
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
  isRetrying: boolean
}

 

/**
 * Comprehensive Error Boundary with exponential backoff retry and error tracking
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJSTimeout | null = null
  private errorContext: ReturnType<typeof createErrorContext> | null = null
  
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false
    }
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      retryCount: 0,
      isRetrying: false
    }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] Caught error in ${this.props.level || 'component'} level:`, error, errorInfo)
    
    // Create error context
    this.errorContext = createErrorContext(
      this.props.level || 'component',
      this.props.componentName,
      error
    )
    
    // Check if we should process this error (frequency tracking)
    const shouldProcess = shouldProcessError()
    
    if (!shouldProcess) {
      console.warn('[ErrorBoundary] Error frequency limit reached, suppressing error')
      return
    }
    
    // Set error state
    this.setState({
      error,
      errorInfo,
      hasError: true
    })
    
    // Log error to localStorage
    logErrorToStorage(error, this.errorContext)
    
    // Track error in analytics
    trackError(
      error.name || 'UnknownError',
      error.message || 'An unknown error occurred'
    )
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
    
    // Check if we should retry
    const shouldRetryError = shouldRetry(error)
    if (shouldRetryError) {
      this.scheduleRetry()
    }
  }
  
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }
  
  private scheduleRetry() {
    const { retryCount } = this.state
    const maxRetries = this.props.maxRetries || RETRY_DELAYS.length
    
    if (retryCount >= maxRetries) {
      console.warn(`[ErrorBoundary] Max retries (${maxRetries}) reached, giving up`)
      return
    }
    
    const delay = getRetryDelay(retryCount)
    if (!delay) {
      console.warn('[ErrorBoundary] No retry delay available')
      return
    }
    
    console.log(`[ErrorBoundary] Scheduling retry ${retryCount + 1}/${maxRetries} in ${delay}ms`)
    
    this.setState({ isRetrying: true })
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }))
    }, delay) as unknown as NodeJSTimeout
  }
  
  private handleManualRetry = () => {
    // Clear any pending retry
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    
    // Reset state
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      isRetrying: false
    })
  }
  
  private handleReset = () => {
    // Full reset - reload the page
    window.location.reload()
  }
  
  render() {
    if (this.state.hasError) {
      const level = this.props.level || 'component'
      const error = this.state.error
      const retryCount = this.state.retryCount
      const maxRetries = this.props.maxRetries || RETRY_DELAYS.length
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // Use appropriate fallback based on level
      if (level === 'page') {
        return (
          <ErrorFallback
            level="page"
            error={error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleManualRetry}
            onReset={this.handleReset}
            retryCount={retryCount}
            maxRetries={maxRetries}
            showDetails={true}
          />
        )
      }
      
      if (level === 'section') {
        return (
          <ErrorFallback
            level="section"
            error={error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleManualRetry}
            retryCount={retryCount}
            maxRetries={maxRetries}
            showDetails={true}
          />
        )
      }
      
      // Component level - minimal fallback
      return (
        <ErrorFallback
          level="component"
          error={error}
          errorInfo={this.state.errorInfo}
          retryCount={retryCount}
          maxRetries={maxRetries}
          showDetails={true}
        />
      )
    }
    
    return this.props.children
  }
}

// Widget-specific error boundary with simpler interface
interface WidgetErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  componentName?: string
  maxRetries?: number
}

export class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps> {
  render() {
    return (
      <ErrorBoundary
        level="section"
        componentName={this.props.componentName}
        onError={this.props.onError}
        maxRetries={this.props.maxRetries}
      >
        {this.props.children}
      </ErrorBoundary>
    )
  }
}

// Network Error Boundary (backward compatibility)
interface NetworkErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class NetworkErrorBoundary extends Component<NetworkErrorBoundaryProps> {
  render() {
    return (
      <ErrorBoundary
        level="section"
        fallback={this.props.fallback}
        onError={this.props.onError}
        componentName="NetworkErrorBoundary"
        maxRetries={3}
      >
        {this.props.children}
      </ErrorBoundary>
    )
  }
}

// Re-export ErrorToast for backward compatibility
interface ErrorToastProps {
  error: {
    message: string
    type?: string
    retryAfter?: number
  }
  onDismiss: () => void
  onRetry?: () => void
}

export function ErrorToast({ error, onDismiss, onRetry }: ErrorToastProps) {
  const [countdown, setCountdown] = React.useState(error.retryAfter || 0)
  
  React.useEffect(() => {
    if (error.retryAfter && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, error.retryAfter])
  
  const getToastStyles = () => {
    switch (error.type) {
      case 'oversell':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'queue':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'network':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'validation':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }
  
  const getIcon = () => {
    switch (error.type) {
      case 'oversell':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'queue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'network':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }
  
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg ${getToastStyles()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{error.message}</p>
          {countdown > 0 && (
            <p className="text-xs mt-1 opacity-75">
              Retry in {countdown}s
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0 flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium underline hover:no-underline"
            >
              Retry
            </button>
          )}
          
          <button
            onClick={onDismiss}
            className="text-sm font-medium hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}