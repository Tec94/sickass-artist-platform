import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePhoneOverlay } from '../PhoneOverlayProvider'
import { usePhoneSwipeGesture } from '../usePhoneGestures'

const formatLockTime = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

const formatLockDate = (date: Date, locale: 'en' | 'es') =>
  date.toLocaleDateString(locale === 'es' ? 'es-PR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

export function LockScreen() {
  const { content, locale, unlockPhone, touch } = usePhoneOverlay()
  const now = useMemo(() => new Date(), [])
  const wallpaper = content.wallpaperCandidates[0]?.src || '/images/roa profile.jpg'
  const swipe = usePhoneSwipeGesture({ onSwipeUp: unlockPhone, threshold: 64 })

  return (
    <div className="relative h-full w-full select-none overflow-hidden" {...swipe.bind} onPointerDown={(e) => { swipe.bind.onPointerDown?.(e); touch(); }}>
      <img src={wallpaper} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.2),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(244,63,94,0.14),transparent_50%)]" />

      <motion.div className="absolute inset-x-0 top-20 text-center pointer-events-none" style={{ opacity: Math.max(0, 1 + swipe.dragOffset / 64) }}>
        <div className="text-[72px] font-bold tracking-tight text-white drop-shadow-md">{formatLockTime(now)}</div>
        <div className="mt-1 text-xs capitalize tracking-wide text-white/80">{formatLockDate(now, locale)}</div>
      </motion.div>

      <motion.div className="absolute inset-x-0 bottom-6 z-10 flex flex-col gap-1.5 items-center justify-center pointer-events-none" style={{ opacity: Math.max(0, 1 + swipe.dragOffset / 64) }}>
        <iconify-icon icon="solar:lock-keyhole-minimalistic-linear" width="20" class="text-white drop-shadow-md" />
        <span
          className="px-5 py-2 text-[14px] font-medium tracking-wide text-white/90 drop-shadow-md"
        >
          {locale === 'es' ? 'Desliza para desbloquear' : 'Swipe to unlock'}
        </span>
      </motion.div>
    </div>
  )
}

