import { useState, useEffect } from 'react'

export const useCountdown = (targetMs: number | null) => {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!targetMs) {
      setRemaining(0)
      return
    }

    const updateCountdown = () => {
      const now = Date.now()
      const diff = Math.max(0, targetMs - now)
      setRemaining(diff)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetMs])

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  return { 
    mins, 
    secs, 
    remainingMs: remaining,
    isExpired: remaining === 0 && targetMs !== null 
  }
}
