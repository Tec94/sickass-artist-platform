import { AnimatePresence, motion } from 'framer-motion'
import { PhoneOverlayProvider, usePhoneOverlay } from './PhoneOverlayProvider'
import { PhoneFrame } from './PhoneFrame'
import { PhoneLauncher } from './PhoneLauncher'
import { PhoneModalHost } from './PhoneModalHost'
import { PhoneScreenRouter } from './PhoneScreenRouter'
import { PhoneSheetHost } from './PhoneSheetHost'
import { PhoneSystemChrome } from './PhoneSystemChrome'

function PhoneOverlayInner() {
  const { isOpen, closePhone, visibilityPolicy, touch } = usePhoneOverlay()

  if (!visibilityPolicy.enabled && !isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[1400] flex items-end justify-end p-4 sm:p-6"
          data-phone-overlay-root="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={touch}
          onTouchStart={touch}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={closePhone}
            aria-label="Close phone overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-[1] h-[min(86vh,760px)] w-[min(92vw,360px)] sm:w-[min(78vw,360px)]"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 290, damping: 28, mass: 0.9 }}
          >
            <PhoneFrame>
              <div className="relative h-full w-full overflow-hidden bg-[#070B10]">
                <PhoneScreenRouter />
                <PhoneSystemChrome />
                <PhoneSheetHost />
                <PhoneModalHost />
              </div>
            </PhoneFrame>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

type PhoneOverlayRootProps = {
  defaultOpen?: boolean
  defaultLocked?: boolean
}

export function PhoneOverlayRoot({ defaultOpen, defaultLocked }: PhoneOverlayRootProps) {
  return (
    <PhoneOverlayProvider defaultOpen={defaultOpen} defaultLocked={defaultLocked}>
      <PhoneLauncher />
      <PhoneOverlayInner />
    </PhoneOverlayProvider>
  )
}
