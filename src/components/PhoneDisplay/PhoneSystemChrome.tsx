import { useEffect, useMemo, useState } from 'react'
import { usePhoneOverlay } from './PhoneOverlayProvider'

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

export function PhoneSystemChrome() {
  const { currentRoute, goHome, popRoute, lockPhone, state } = usePhoneOverlay()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const showBack = useMemo(() => currentRoute.kind === 'app' || state.navStack.length > 1, [currentRoute.kind, state.navStack.length])

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-[14px] text-[11px] font-semibold text-white/90">
        <div className="tracking-[0.08em] pointer-events-auto cursor-pointer" onClick={lockPhone}>{formatTime(now)}</div>
        <div className="pointer-events-auto flex items-center gap-[5px] mt-0.5">
          {/* Cellular Signal */}
          <div className="flex items-end gap-[1.5px] h-[10px]">
            <div className="w-[3px] h-[3.5px] bg-white rounded-sm" />
            <div className="w-[3px] h-[5.5px] bg-white rounded-sm" />
            <div className="w-[3px] h-[7.5px] bg-white rounded-sm" />
            <div className="w-[3px] h-[10px] bg-white rounded-sm" />
          </div>
          
          {/* Wi-Fi */}
          <svg width="15" height="11" viewBox="0 0 16 12" fill="none" className="opacity-90">
            <path d="M14.9 3.5C11.1 -0.3 4.9 -0.3 1.1 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M11.6 6.8C9.6 4.8 6.4 4.8 4.4 6.8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 11.5C8.8284 11.5 9.5 10.8284 9.5 10C9.5 9.1716 8.8284 8.5 8 8.5C7.1716 8.5 6.5 9.1716 6.5 10C6.5 10.8284 7.1716 11.5 8 11.5Z" fill="white" />
          </svg>
          
          {/* Battery */}
          <div className="relative flex items-center">
            <div className="h-[12px] w-[23px] rounded-[4px] border-[1px] border-white/60 p-[1.5px]">
              <div className="h-full w-[80%] rounded-sm bg-white" />
            </div>
            <div className="absolute -right-[2px] top-1/2 h-[4px] w-[1.5px] -translate-y-1/2 rounded-r-[1px] bg-white/60" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[10px] z-20 h-[34px] w-[115px] -translate-x-1/2 rounded-full bg-black/85 shadow-[0_4px_14px_rgba(0,0,0,0.45)]" />

      {showBack && (
        <button
          type="button"
          className="absolute left-2 top-10 z-20 flex h-8 items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 text-[11px] text-white/90 backdrop-blur"
          onClick={popRoute}
        >
          <iconify-icon icon="solar:alt-arrow-left-linear" width="14" height="14" />
          Back
        </button>
      )}

      {currentRoute.kind !== 'home' && !state.isLocked && (
        <button
          type="button"
          className="absolute right-2 top-10 z-20 flex h-8 items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 text-[11px] text-white/90 backdrop-blur"
          onClick={goHome}
        >
          <iconify-icon icon="solar:home-angle-linear" width="14" height="14" />
          Home
        </button>
      )}

      {!state.isLocked && currentRoute.kind !== 'home' && (
        <button
          type="button"
          className="absolute inset-x-0 bottom-0 z-20 flex h-11 items-center justify-center"
          onClick={() => {
            if (!state.isLocked && currentRoute.kind === 'app') {
              goHome()
            }
          }}
          aria-label="Home indicator"
        >
          <span className="h-1.5 w-32 rounded-full bg-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]" />
        </button>
      )}
    </>
  )
}

