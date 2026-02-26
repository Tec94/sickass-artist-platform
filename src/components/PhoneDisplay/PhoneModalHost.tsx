import { AnimatePresence, motion } from 'framer-motion'
import { usePhoneOverlay } from './PhoneOverlayProvider'

export function PhoneModalHost() {
  const { state, setModal } = usePhoneOverlay()
  const modal = state.modal

  return (
    <AnimatePresence>
      {modal ? (
        <motion.div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#0B111A]/95 p-4 text-center shadow-xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {modal.title && <h3 className="text-sm font-semibold text-white">{modal.title}</h3>}
            {modal.body && <div className="mt-2 text-xs text-zinc-300">{modal.body}</div>}
            <div className="mt-4 grid gap-2">
              {(modal.actions || [{ id: 'close', label: 'Close' }]).map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  onClick={() => {
                    action.onSelect?.()
                    setModal(null)
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

