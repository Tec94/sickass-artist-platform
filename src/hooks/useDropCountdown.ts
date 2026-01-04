import { useState, useEffect, useRef } from 'react'

interface UseDropCountdownReturn {
  timeLeft: number
  hours: number
  minutes: number
  seconds: number
  isActive: boolean
  hasStarted: boolean
  isEnded: boolean
}

export function useDropCountdown(
  startsAt: number,
  endsAt: number,
  serverTime?: number
): UseDropCountdownReturn {
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeDiff, setTimeDiff] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync with server time on mount
  useEffect(() => {
    if (serverTime) {
      setTimeDiff(serverTime - Date.now())
    }
  }, [serverTime])

  useEffect(() => {
    const updateCountdown = () => {
      // Use server time if available
      const now = Date.now() + timeDiff
      const startTime = startsAt
      const endTime = endsAt

      const currentTimeLeft = Math.max(0, startTime - now)
      const isEnded = now >= endTime

      setTimeLeft(currentTimeLeft)

      // Stop interval if drop has ended
      if (isEnded && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    updateCountdown()

    // Update every 100ms for smooth countdown
    intervalRef.current = setInterval(updateCountdown, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startsAt, endsAt, timeDiff])

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  const now = Date.now() + timeDiff
  const isActive = now >= startsAt && now < endsAt
  const hasStarted = now >= startsAt
  const isEnded = now >= endsAt

  return {
    timeLeft,
    hours,
    minutes,
    seconds,
    isActive,
    hasStarted,
    isEnded,
  }
}
