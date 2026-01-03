import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

// Network Error Boundary specifically for Convex subscriptions
export class NetworkErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private retryCount = 0
  private maxRetries = 5

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NetworkErrorBoundary] Caught error:', error, errorInfo)
    
    // Log error for debugging
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Check if this is a network-related error
    if (this.isNetworkError(error)) {
      this.scheduleRetry()
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'network',
      'fetch',
      'connection',
      'timeout',
      'offline',
      'socket',
      'ECONNRESET',
      'ECONNREFUSED',
    ]
    
    return networkErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    )
  }

  private scheduleRetry() {
    if (this.retryCount >= this.maxRetries) {
      console.warn('[NetworkErrorBoundary] Max retries reached, giving up')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 16000) // Max 16s delay
    
    this.retryTimeoutId = setTimeout(() => {
      this.retryCount++
      console.log(`[NetworkErrorBoundary] Retrying connection (attempt ${this.retryCount}/${this.maxRetries})...`)
      
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }, delay)
  }

  private handleManualRetry = () => {
    this.retryCount = 0
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isNetworkError = this.state.error && this.isNetworkError(this.state.error!)
      const canRetry = isNetworkError && this.retryCount < this.maxRetries

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
              </h3>
              
              <p className="mt-2 text-sm text-gray-600">
                {isNetworkError 
                  ? 'We\'re having trouble connecting to our servers. This might be due to a network issue.'
                  : 'An unexpected error occurred. Please try again.'
                }
              </p>

              {isNetworkError && (
                <div className="mt-3 text-xs text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span>{navigator.onLine ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                {canRetry && (
                  <button
                    onClick={this.handleManualRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh Page
                </button>
              </div>

              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Reconnecting Banner Component
export function ReconnectingBanner() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)

  React.useEffect(() => {
    const handleOnline = () => {
      setIsVisible(false)
      setRetryCount(0)
    }

    const handleOffline = () => {
      setIsVisible(true)
    }

    const handleConvexError = () => {
      setIsVisible(true)
      setRetryCount(prev => prev + 1)
      
      // Auto-hide after successful connection
      setTimeout(() => {
        if (navigator.onLine) {
          setIsVisible(false)
        }
      }, 3000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('convex-error', handleConvexError)

    // Check initial state
    if (!navigator.onLine) {
      setIsVisible(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('convex-error', handleConvexError as EventListener)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {navigator.onLine ? 'Reconnecting...' : 'No internet connection'}
            </p>
            <p className="text-xs text-yellow-700">
              {retryCount > 0 && `Attempt ${retryCount}`}
              {navigator.onLine ? 'Please wait while we restore the connection.' : 'Check your network settings and try again.'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Error Toast Component for user feedback
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