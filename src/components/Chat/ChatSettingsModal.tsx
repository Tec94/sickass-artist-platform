import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { showToast } from '../../lib/toast'
import type { ChatServerSettings } from '../../types/chat'

type UserSettingsView = {
  autoplayMedia: boolean
  showStickers: boolean
  compactMode: boolean
}

type ServerSettingsView = Pick<
  ChatServerSettings,
  'slowModeSeconds' | 'maxImageMb' | 'maxVideoMb' | 'allowedMediaTypes' | 'enabledStickerPackIds' | 'retentionDays'
>

interface ChatSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  serverSettings?: ServerSettingsView
  userSettings: UserSettingsView
  onUpdate: (patch: Partial<UserSettingsView>) => Promise<void>
}

const DEFAULT_SERVER_SETTINGS: ServerSettingsView = {
  slowModeSeconds: 0,
  maxImageMb: 10,
  maxVideoMb: 25,
  allowedMediaTypes: [],
  enabledStickerPackIds: [],
  retentionDays: undefined,
}

export function ChatSettingsModal({
  isOpen,
  onClose,
  serverSettings,
  userSettings,
  onUpdate,
}: ChatSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<UserSettingsView>(userSettings)
  const [error, setError] = useState<string | null>(null)
  const [savingKey, setSavingKey] = useState<keyof UserSettingsView | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLocalSettings(userSettings)
    setError(null)
  }, [isOpen, userSettings])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const settings = useMemo(() => serverSettings ?? DEFAULT_SERVER_SETTINGS, [serverSettings])

  const handleToggle = useCallback(
    async (key: keyof UserSettingsView, value: boolean) => {
      const previous = localSettings[key]
      setLocalSettings((prev) => ({ ...prev, [key]: value }))
      setSavingKey(key)
      setError(null)
      try {
        await onUpdate({ [key]: value })
      } catch (updateError) {
        setLocalSettings((prev) => ({ ...prev, [key]: previous }))
        const message = updateError instanceof Error ? updateError.message : 'Failed to update settings'
        setError(message)
        showToast(message, { type: 'error' })
      } finally {
        setSavingKey(null)
      }
    },
    [localSettings, onUpdate]
  )

  const allowedTypesLabel =
    settings.allowedMediaTypes.length > 0 ? settings.allowedMediaTypes.join(', ') : 'All supported types'
  const retentionLabel = settings.retentionDays ? `${settings.retentionDays} days` : 'No automatic pruning'

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl rounded-2xl border border-[#2a2a2a] bg-[#111] shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Chat Settings</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-[#606060]">Personal preferences</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-[#808080] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                aria-label="Close chat settings"
              >
                <iconify-icon icon="solar:close-circle-linear" width="20" height="20" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#808080]">Experience</h4>
                <div className="space-y-2 rounded-xl border border-[#1a1a1a] bg-[#0b0b0b] p-3">
                  <ToggleRow
                    label="Autoplay media"
                    description="Videos start muted when they enter view."
                    checked={localSettings.autoplayMedia}
                    onChange={(value) => handleToggle('autoplayMedia', value)}
                    isSaving={savingKey === 'autoplayMedia'}
                  />
                  <ToggleRow
                    label="Show stickers"
                    description="Hide sticker art while keeping message context."
                    checked={localSettings.showStickers}
                    onChange={(value) => handleToggle('showStickers', value)}
                    isSaving={savingKey === 'showStickers'}
                  />
                  <ToggleRow
                    label="Compact mode"
                    description="Reduce spacing for denser chat history."
                    checked={localSettings.compactMode}
                    onChange={(value) => handleToggle('compactMode', value)}
                    isSaving={savingKey === 'compactMode'}
                  />
                </div>
                {error && <div className="text-xs font-medium text-[#ff6b6b]">{error}</div>}
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#808080]">Server Limits</h4>
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#1a1a1a] bg-[#0b0b0b] p-4 text-sm text-[#d0d0d0] md:grid-cols-2">
                  <Stat label="Slow mode" value={settings.slowModeSeconds > 0 ? `${settings.slowModeSeconds}s` : 'Off'} />
                  <Stat label="Max image size" value={`${settings.maxImageMb} MB`} />
                  <Stat label="Max video size" value={`${settings.maxVideoMb} MB`} />
                  <Stat label="Allowed types" value={allowedTypesLabel} />
                  <Stat label="Retention" value={retentionLabel} />
                  <Stat
                    label="Sticker packs"
                    value={settings.enabledStickerPackIds.length > 0 ? settings.enabledStickerPackIds.length : 'All active'}
                  />
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
  isSaving: boolean
}

function ToggleRow({ label, description, checked, onChange, isSaving }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-[#2a2a2a]">
      <div className="space-y-0.5">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-[#808080]">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isSaving}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all ${
          checked ? 'border-[#c41e3a] bg-[#c41e3a]' : 'border-[#2a2a2a] bg-[#151515]'
        } ${isSaving ? 'opacity-60' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

interface StatProps {
  label: string
  value: string | number
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#101010] px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#707070]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  )
}
