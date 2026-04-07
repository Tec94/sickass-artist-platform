import { AnimatePresence, motion } from 'framer-motion'
import { cloneElement, isValidElement, ReactElement, ReactNode, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  resolvePageTransition,
  type TransitionType,
} from './pageTransitionRouting'

// We can store a global state to track the transition direction
export const globalTransitionState = {
  type: null as TransitionType | null,
}

export const setNextTransition = (type: TransitionType) => {
  globalTransitionState.type = type
}

const variants = {
  push: {
    initial: { x: '18%', opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 0, opacity: 1 },
  },
  'push-back': {
    initial: { x: '-18%', opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 0, opacity: 1 },
  },
  'slide-up': {
    initial: { y: '12%', opacity: 1 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 0, opacity: 1 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  },
}

interface AnimatedRoutesProps {
  children: ReactNode
}

export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation()
  const previousPathnameRef = useRef(location.pathname)
  const transitionRef = useRef<TransitionType>('fade')

  if (previousPathnameRef.current !== location.pathname) {
    transitionRef.current = resolvePageTransition(
      previousPathnameRef.current,
      location.pathname,
      globalTransitionState.type,
    )
    previousPathnameRef.current = location.pathname
    globalTransitionState.type = null
  }

  const activeVariants = variants[transitionRef.current]
  const renderedChildren = isValidElement(children)
    ? cloneElement(children as ReactElement<{ location?: typeof location }>, { location })
    : children

  return (
    <AnimatePresence initial={false} mode='sync'>
      <motion.div
        key={location.pathname}
        initial='initial'
        animate='animate'
        exit='exit'
        variants={activeVariants}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className='absolute top-0 left-0 h-full w-full bg-[#F4EFE6]'
        style={{ willChange: 'transform, opacity' }}
      >
        {renderedChildren}
      </motion.div>
    </AnimatePresence>
  )
}
