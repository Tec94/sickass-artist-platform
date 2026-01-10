import { useState, useEffect, useCallback } from 'react'

interface UseOnlineStatusResult {
  isOnline: boolean
}

export function useOnlineStatus(): UseOnlineStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine)

  // Smart detection: navigator.onLine + test fetch
  const checkOnlineStatus = useCallback(async () => {
    try {
      // Try a lightweight HEAD request to check connectivity
      // Using a common CDN endpoint as fallback since /ping might not exist
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors',
      })
      setIsOnline(true)
    } catch {
      setIsOnline(false)
    }
  }, [])

  const handleOnline = useCallback(() => {
    checkOnlineStatus()
  }, [checkOnlineStatus])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check status periodically when offline
    let checkInterval: ReturnType<typeof setInterval> | undefined
    if (!isOnline) {
      checkInterval = setInterval(checkOnlineStatus, 5000)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [handleOnline, handleOffline, isOnline, checkOnlineStatus])

  return { isOnline }
}
