import { useDropCountdown } from '../../hooks/useDropCountdown'
import { Clock } from 'lucide-react'

interface DropCountdownProps {
  startsAt: number
  endsAt: number
  serverTime?: number
  size?: 'sm' | 'md' | 'lg'
}

export function DropCountdown({
  startsAt,
  endsAt,
  serverTime,
  size = 'md',
}: DropCountdownProps) {
  const { hours, minutes, seconds, isActive, isEnded } = useDropCountdown(
    startsAt,
    endsAt,
    serverTime
  )

  // Format time with leading zeros
  const formatTime = (num: number) => String(num).padStart(2, '0')

  const baseClasses = 'font-mono font-bold'
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  if (isEnded) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Clock className="w-4 h-4" />
        <span>Drop ended</span>
      </div>
    )
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-2 text-green-400 font-semibold animate-pulse">
        <Clock className="w-4 h-4" />
        <span>Drop now live!</span>
      </div>
    )
  }

  if (hours === 0 && minutes === 0 && seconds < 60) {
    return (
      <div className="flex items-center gap-2 text-red-400 font-semibold animate-pulse">
        <Clock className="w-4 h-4" />
        <span>Drop in {formatTime(seconds)}s</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${baseClasses} ${sizeClasses[size]}`}>
      <div className="flex items-center gap-1">
        <span className="text-cyan-400">{formatTime(hours)}</span>
        <span className="text-gray-500">:</span>
        <span className="text-cyan-400">{formatTime(minutes)}</span>
        <span className="text-gray-500">:</span>
        <span className="text-cyan-400">{formatTime(seconds)}</span>
      </div>
      <span className="text-gray-500 text-xs ml-1">remaining</span>
    </div>
  )
}
