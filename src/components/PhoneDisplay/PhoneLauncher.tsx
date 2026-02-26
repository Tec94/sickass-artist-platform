import { motion } from 'framer-motion'
import { usePhoneOverlay } from './PhoneOverlayProvider'
import { usePhoneOverlayDock } from './usePhoneOverlayDock'

export function PhoneLauncher() {
  const { isOpen, openPhone, visibilityPolicy } = usePhoneOverlay()
  const dock = usePhoneOverlayDock(visibilityPolicy.enabled, isOpen)

  if (dock.hidden) return null

  return (
    <motion.button
      type="button"
      className="fixed z-[130] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#090d14]/92 text-zinc-100 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors hover:bg-[#0c121b]"
      style={dock.style}
      onClick={openPhone}
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      title="Open ROA phone"
      aria-label="Open ROA phone"
      data-phone-launcher="true"
    >
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_28%_24%,rgba(96,165,250,0.18),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.18),transparent_55%)]" />
      <iconify-icon icon="solar:smartphone-2-bold-duotone" width="24" height="24" class="relative z-[1]" />
    </motion.button>
  )
}

