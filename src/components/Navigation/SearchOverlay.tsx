import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { setNextTransition } from '../Effects/PageTransition'
import { usePretextResponsiveFit } from '../../hooks/usePretextResponsiveFit'

export type SearchOverlayState = 'open' | 'closing'

interface SearchOverlayProps {
  state: SearchOverlayState
  onExited: () => void
  onRequestClose: () => void
}

const overlayTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
}

const panelTransition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1] as const,
}

const placeholderCopy = 'Search the Estate Archives...'

export default function SearchOverlay({ state, onExited, onRequestClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const hasCompletedExitRef = useRef(false)
  const { containerRef, isCompact } = usePretextResponsiveFit({
    text: placeholderCopy,
    font: '30px Georgia',
    lineHeight: 40,
    maxLines: 1,
    compactBelow: 768,
  })

  useEffect(() => {
    if (state === 'open') {
      hasCompletedExitRef.current = false
      inputRef.current?.focus()
    }
  }, [state])

  useEffect(() => {
    if (state !== 'open') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onRequestClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRequestClose, state])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex flex-col overflow-hidden font-sans pointer-events-none"
      data-testid="prototype-search-overlay"
    >
      <motion.div
        data-testid="prototype-search-overlay-backdrop"
        className="absolute inset-0 bg-[#3C2A21]/38 backdrop-blur-[1px] pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: state === 'open' ? 1 : 0 }}
        transition={overlayTransition}
        aria-hidden="true"
        onClick={() => {
          if (state === 'open') {
            onRequestClose()
          }
        }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search the Estate Archives"
        data-state={state}
        className={`relative flex max-h-[88dvh] w-full transform-gpu flex-col overflow-hidden border-b border-[#3C2A21] bg-[#F4EFE6] shadow-[0_18px_48px_rgba(28,27,26,0.22)] will-change-transform ${
          state === 'open' ? 'pointer-events-auto' : 'pointer-events-none'
        } md:max-h-[80vh]`}
        style={{ willChange: 'transform, opacity' }}
        initial={{ y: -44, opacity: 0.92 }}
        animate={state === 'open' ? { y: 0, opacity: 1 } : { y: -44, opacity: 0.92 }}
        transition={panelTransition}
        onAnimationComplete={() => {
          if (state === 'closing' && !hasCompletedExitRef.current) {
            hasCompletedExitRef.current = true
            onExited()
          }
        }}
      >
        <div className="border-b border-[#3C2A21]/15 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
          <div
            ref={(node) => {
              containerRef.current = node
            }}
            className="mx-auto flex w-full max-w-4xl items-center gap-3 sm:gap-4 md:gap-6"
          >
            <Search size={24} className="shrink-0 text-[#8E7D72] sm:size-7" />
            <input
              ref={inputRef}
              type="text"
              className={`min-w-0 flex-1 bg-transparent border-none p-0 font-serif text-[#3C2A21] placeholder-[#8E7D72]/50 focus:ring-0 ${
                isCompact ? 'text-[1.7rem] sm:text-[2rem] md:text-3xl' : 'text-[2rem] sm:text-[2.35rem] md:text-3xl'
              }`}
              placeholder={placeholderCopy}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              type="button"
              aria-label="Close search overlay"
              onClick={() => {
                if (state === 'open') {
                  onRequestClose()
                }
              }}
              className="rounded-full p-2 text-[#3C2A21] transition-colors hover:text-[#C36B42]"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            <div className="flex flex-col gap-5 md:gap-6">
              <h4 className="border-b border-[#3C2A21]/10 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8E7D72]">
                Frequent inquiries
              </h4>
              <nav className="flex flex-col gap-4">
                <Link
                  to="/archive"
                  onClick={() => {
                    setNextTransition('push')
                    onRequestClose()
                  }}
                  className="group flex items-center justify-between text-sm font-semibold text-[#3C2A21] hover:text-[#C36B42]"
                >
                  <span>Current Registration</span>
                  <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  to="/store"
                  onClick={() => {
                    setNextTransition('push')
                    onRequestClose()
                  }}
                  className="group flex items-center justify-between text-sm font-semibold text-[#3C2A21] hover:text-[#C36B42]"
                >
                  <span>Exclusive Artifacts</span>
                  <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  to="/rankings"
                  onClick={() => {
                    setNextTransition('push')
                    onRequestClose()
                  }}
                  className="group flex items-center justify-between text-sm font-semibold text-[#3C2A21] hover:text-[#C36B42]"
                >
                  <span>Collector Rankings</span>
                  <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </nav>
            </div>

            <div className="flex flex-col gap-6 md:col-span-2">
              <h4 className="border-b border-[#3C2A21]/10 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8E7D72]">
                Highlight
              </h4>
              <div
                className="group relative h-56 w-full cursor-pointer overflow-hidden border border-[#3C2A21]/20 bg-cover bg-center md:h-48"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCn2d7DIcuRChwL7JHv90Xk489giFm7mkFmi7UMnknopv5kyun1AIgd1oIrQ5qFfwg6l7JAT8VeMHIuwtHYoPu-FIuvXL_NcAqq2-qlAcPpe91PDjyExlV7qPqfmCyLkepSngg4YOKeZV-omlXUUGIJGbZOrldRalluKggAi817GVkaSlCDYRKLtuZiZWFDhFmDZNyy-f7MeeQg_7k89qqolK831X8e56xZdFScT0D0NGzhYA--gYHf59Q8Hvm23q4QMR6biY6Njvh0')",
                }}
                onClick={() => {
                  setNextTransition('push')
                  onRequestClose()
                  window.location.href = '/new-post'
                }}
              >
                <div className="absolute inset-0 bg-[#3C2A21]/40 transition-colors duration-500 group-hover:bg-[#3C2A21]/20" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#FAF7F2]">
                      Latest Log
                    </span>
                    <h3 className="max-w-xl font-serif text-xl font-medium text-[#FAF7F2] sm:text-2xl">
                      The Architecture of the &apos;North-East&apos; Gate
                    </h3>
                  </div>
                  <ArrowRight className="shrink-0 text-[#FAF7F2] transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
