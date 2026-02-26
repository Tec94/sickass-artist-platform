import { useRef, useState } from 'react'

type SwipeHandlers = {
  onSwipeUp?: () => void
  threshold?: number
}

export function usePhoneSwipeGesture({ onSwipeUp, threshold = 72 }: SwipeHandlers) {
  const startYRef = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const onPointerDown = (event: React.PointerEvent) => {
    startYRef.current = event.clientY
    setDragOffset(0)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (startYRef.current === null) return
    const delta = event.clientY - startYRef.current
    setDragOffset(Math.min(0, delta))
  }

  const finish = () => {
    if (Math.abs(dragOffset) >= threshold && dragOffset < 0) {
      onSwipeUp?.()
    }
    startYRef.current = null
    setDragOffset(0)
  }

  return {
    dragOffset,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onPointerLeave: finish,
    },
  }
}

