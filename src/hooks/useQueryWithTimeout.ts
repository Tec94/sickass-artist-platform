import { useState, useEffect, useRef } from 'react'
import { useQuery } from '../convex/useQuery'

interface UseQueryWithTimeoutOptions {
  timeoutMs?: number
  enabled?: boolean
}

interface UseQueryWithTimeoutResult<TData> {
  data: TData | undefined
  isLoading: boolean
  isError: boolean
  timedOut: boolean
  error: Error | null
}

interface QueryFunction {
  (args: Record<string, unknown>): unknown
}

/**
 * Hook that wraps Convex useQuery with timeout handling
 * Shows error state after timeoutMs (default: 5000ms)
 */
export function useQueryWithTimeout<TArgs extends Record<string, unknown>, TData>(
  queryFn: QueryFunction,
  args: TArgs,
  options: UseQueryWithTimeoutOptions = {}
): UseQueryWithTimeoutResult<TData> {
  const { timeoutMs = 5000, enabled = true } = options
  
  const data = useQuery(queryFn, enabled ? args : {} as TArgs)
  const [timedOut, setTimedOut] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasResolvedRef = useRef(false)
  const argsString = JSON.stringify(args)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Set up timeout
  useEffect(() => {
    // If data is available or query is disabled, no timeout needed
    if (data !== undefined || !enabled) {
      hasResolvedRef.current = true
      setTimedOut(false)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    // If already resolved, don't set up timeout
    if (hasResolvedRef.current) {
      return
    }

    // Set up timeout timer
    timerRef.current = setTimeout(() => {
      hasResolvedRef.current = true
      setTimedOut(true)
      
      const timeoutError = new Error(
        `Query timeout: ${timeoutMs}ms for ${queryFn.name || 'anonymous query'}`
      )
      setError(timeoutError)
      
      // Log error for debugging
      console.error('Query timeout:', {
        query: queryFn.name || 'anonymous',
        timeout: timeoutMs,
        args
      })
    }, timeoutMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [data, timeoutMs, enabled, queryFn, argsString])

  const isLoading = data === undefined && !timedOut && enabled
  const isError = timedOut || error !== null

  return {
    data,
    isLoading,
    isError,
    timedOut,
    error
  }
}