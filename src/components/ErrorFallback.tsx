import React from 'react'

interface ErrorFallbackProps {
  level: 'page' | 'section' | 'component'
  error?: Error
  errorInfo?: React.ErrorInfo
  onRetry?: () => void
  onReset?: () => void
  retryCount?: number
  maxRetries?: number
  showDetails: boolean
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  level,
  error,
  errorInfo,
  onRetry,
  onReset,
  retryCount = 0,
  maxRetries = 3,
  showDetails = false
}) => {
  // In development, always show details
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const effectiveShowDetails = showDetails || isDevelopment
  const isMaxRetriesReached = retryCount >= maxRetries
  const showRetryButton = !isMaxRetriesReached && onRetry
  
  // Page-level fallback - full page error
  if (level === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
            
            <p className="mt-2 text-sm text-gray-600">
              {error ? error.message : 'An unexpected error occurred. Please try again.'}
            </p>
            
            <div className="mt-6 space-y-3">
              {showRetryButton && (
                <button
                  onClick={onRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              )}
              
              {onReset && (
                <button
                  onClick={onReset}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Application
                </button>
              )}
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Home
              </button>
            </div>
            
            {effectiveShowDetails && error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {error.message}
                  {errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Section-level fallback - widget/section error
  if (level === 'section') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">Failed to load this section</h4>
            <p className="text-sm text-red-600 mt-1">
              {error ? error.message : 'An error occurred while loading this section.'}
            </p>
            
            {isMaxRetriesReached ? (
              <p className="text-xs text-red-500 mt-2">
                Maximum retry attempts reached. Please try again later or contact support.
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-2">
                {showRetryButton ? 'You can try again below.' : 'This section will automatically retry.'}
              </p>
            )}
            
            {showRetryButton && (
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            )}
          </div>
        </div>
        
        {effectiveShowDetails && error && (
          <details className="mt-3 text-xs text-red-400">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-1 bg-red-50 p-2 rounded overflow-auto max-h-24">
              {error.message}
              {errorInfo?.componentStack}
            </pre>
          </details>
        )}
      </div>
    )
  }
  
  // Component-level fallback - minimal error state
  return (
    <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error loading component</span>
      </div>
      
      {effectiveShowDetails && error && (
        <details className="mt-1 text-xs text-red-400">
          <summary className="cursor-pointer">Details</summary>
          <pre className="mt-1 bg-red-50 p-1 rounded overflow-auto max-h-16">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  )
}

// Widget-specific error fallback
interface WidgetErrorFallbackProps {
  error?: Error
  onRetry?: () => void
  retryCount?: number
  maxRetries?: number
}

export const WidgetErrorFallback: React.FC<WidgetErrorFallbackProps> = ({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3
}) => {
  const isMaxRetriesReached = retryCount >= maxRetries
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
      <div className="w-8 h-8 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h4 className="text-sm font-medium text-gray-300 mb-1">Failed to load</h4>
      <p className="text-xs text-gray-400 mb-3">
        {error ? error.message : 'Could not load this widget'}
      </p>
      
      {isMaxRetriesReached ? (
        <p className="text-xs text-gray-500 mb-3">
          Maximum retry attempts reached
        </p>
      ) : onRetry ? (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
        >
          Retry
        </button>
      ) : (
        <p className="text-xs text-gray-500">
          Will retry automatically...
        </p>
      )}
    </div>
  )
}