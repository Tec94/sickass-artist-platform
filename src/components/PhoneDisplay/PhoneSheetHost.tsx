import { AnimatePresence, motion } from 'framer-motion'
import { usePhoneOverlay } from './PhoneOverlayProvider'

export function PhoneSheetHost() {
  const { state, setSheet } = usePhoneOverlay()
  const sheet = state.sheet

  return (
    <AnimatePresence>
      {sheet ? (
        <>
          <motion.button
            type="button"
            className="absolute inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheet(null)}
            aria-label="Close sheet"
          />
          <motion.div
            className="absolute inset-x-2 bottom-2 z-50 rounded-3xl border border-white/10 bg-[#0A0E14]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/20" aria-hidden="true" />
            {sheet.title && <h3 className="text-sm font-semibold text-white">{sheet.title}</h3>}
            {sheet.subtitle && <p className="mt-1 text-xs text-zinc-400">{sheet.subtitle}</p>}
            {sheet.body && <div className="mt-3 text-sm text-zinc-200">{sheet.body}</div>}
            {sheet.actions && sheet.actions.length > 0 && (
              <div className="mt-4 space-y-2">
                {sheet.actions.map((action) => {
                  const className =
                    action.tone === 'danger'
                      ? 'border-red-900/70 bg-red-950/40 text-red-200'
                      : action.tone === 'accent'
                        ? 'border-sky-800/70 bg-sky-950/40 text-sky-100'
                        : 'border-white/10 bg-white/5 text-zinc-100'

                  if (action.href) {
                    return (
                      <a
                        key={action.id}
                        href={action.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`block rounded-xl border px-3 py-2 text-center text-xs font-medium ${className}`}
                        onClick={() => {
                          action.onSelect?.()
                          setSheet(null)
                        }}
                      >
                        {action.label}
                      </a>
                    )
                  }

                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-medium ${className}`}
                      onClick={() => {
                        action.onSelect?.()
                        setSheet(null)
                      }}
                    >
                      {action.label}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

