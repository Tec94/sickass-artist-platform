import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type PhoneAnimationHostProps = {
  routeKey: string
  children: ReactNode
}

export function PhoneAnimationHost({ routeKey, children }: PhoneAnimationHostProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, x: 12, scale: 0.995 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -12, scale: 0.995 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

