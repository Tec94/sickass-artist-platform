import { Component, ReactNode } from 'react'
import { parseConvexError, logError } from '../../utils/convexErrorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MerchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    const parsed = parseConvexError(error)
    logError(parsed, {
      component: 'MerchErrorBoundary',
      action: 'render_error'
    })
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      const parsed = parseConvexError(this.state.error)

      return (
        this.props.fallback || (
          <div className="p-8 text-center bg-red-500/10 border border-red-500/30 rounded-lg">
            <h2 className="text-xl font-bold text-red-400 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-4">
              {parsed.userMessage}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
