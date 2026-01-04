import { useState, useCallback } from 'react'

interface RetryConfig {
  maxRetries?: number        // Default: 3
  initialDelay?: number      // Default: 500ms
  maxDelay?: number          // Default: 10000ms
  backoffMultiplier?: number // Default: 2
}

export function useAutoRetry(config: RetryConfig = {}) {
  const {
    maxRetries = 3,
    initialDelay = 500,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = config

  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const retryWithBackoff = useCallback(async <T,>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> => {
    setRetryCount(0)
    setLastError(null)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0)
        const result = await fn()
        setIsRetrying(false)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setLastError(err)
        setRetryCount(attempt + 1)

        if (attempt === maxRetries) {
          setIsRetrying(false)
          throw err
        }

        // Calculate exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        )

        onRetry?.(attempt + 1, err)

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error('Retry loop failed')
  }, [maxRetries, initialDelay, maxDelay, backoffMultiplier])

  const reset = useCallback(() => {
    setRetryCount(0)
    setLastError(null)
    setIsRetrying(false)
  }, [])

  return {
    retryWithBackoff,
    retryCount,
    lastError,
    isRetrying,
    reset,
  }
}
