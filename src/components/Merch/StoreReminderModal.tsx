import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { downloadDropICS, generateDropICS, openDropGoogleCalendar } from '../../utils/dropCalendar'

interface StoreReminderDrop {
  id: string
  name: string
  description?: string
  startsAt: number
  endsAt: number
  timezone: string
}

interface StoreReminderModalProps {
  isOpen: boolean
  onClose: () => void
  drop: StoreReminderDrop | null
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function StoreReminderModal({ isOpen, onClose, drop }: StoreReminderModalProps) {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)
  const [selectedIntent, setSelectedIntent] = useState<'email' | 'sms' | null>(null)
  const hasScheduledDrop = Boolean(drop)
  const localTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: drop?.timezone || localTimeZone,
      }),
    [drop?.timezone, localTimeZone],
  )

  useEffect(() => {
    if (!isOpen) return

    const previousFocused = document.activeElement as HTMLElement | null
    const root = modalRef.current
    const focusable = root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)) : []
    focusable[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || focusable.length < 2) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocused?.focus()
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setSelectedIntent(null)
  }, [isOpen])

  if (!isOpen) return null

  const handleDownloadCalendar = () => {
    if (!drop) return
    const ics = generateDropICS({
      id: drop.id,
      name: drop.name,
      description: drop.description,
      startsAt: drop.startsAt,
      endsAt: drop.endsAt,
      location: 'ROA Store',
    })
    const filename = `${drop.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-drop`
    downloadDropICS(ics, filename)
  }

  const handleGoogleCalendar = () => {
    if (!drop) return
    openDropGoogleCalendar({
      id: drop.id,
      name: drop.name,
      description: drop.description,
      startsAt: drop.startsAt,
      endsAt: drop.endsAt,
      location: 'ROA Store',
    })
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-reminder-title"
        className="store-surface-card w-full max-w-xl p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="store-reminder-title" className="text-xl font-display font-semibold text-slate-100">
              {t('store.reminderTitle')}
            </h2>
            {drop ? (
              <>
                <p className="mt-1 text-sm text-slate-200">{drop.name}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {dateFormatter.format(drop.startsAt)} ({drop.timezone})
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-slate-200">{t('store.notifyNextDrop')}</p>
                <p className="mt-1 text-xs text-slate-300">{t('store.reminderNoDropBody')}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600 bg-slate-900/80 p-2 text-slate-200 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100"
            aria-label={t('common.close')}
          >
            <iconify-icon icon="solar:close-circle-linear" width="18" height="18"></iconify-icon>
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSelectedIntent('email')}
            aria-pressed={selectedIntent === 'email'}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100 ${
              selectedIntent === 'email'
                ? 'border-rose-300/70 bg-rose-500/14'
                : 'border-slate-600 bg-slate-950/70 hover:border-slate-400'
            }`}
          >
            <span className="text-sm font-semibold text-slate-100">{t('store.reminderEmail')}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">{t('store.comingSoon')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIntent('sms')}
            aria-pressed={selectedIntent === 'sms'}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100 ${
              selectedIntent === 'sms'
                ? 'border-rose-300/70 bg-rose-500/14'
                : 'border-slate-600 bg-slate-950/70 hover:border-slate-400'
            }`}
          >
            <span className="text-sm font-semibold text-slate-100">{t('store.reminderSms')}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">{t('store.comingSoon')}</span>
          </button>

          {selectedIntent ? (
            <p className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-200">
              {selectedIntent === 'email' ? t('store.reminderEmailComingSoonDetail') : t('store.reminderSmsComingSoonDetail')}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleGoogleCalendar}
            disabled={!hasScheduledDrop}
            className="flex w-full items-center justify-between rounded-xl border border-rose-300/60 bg-rose-500/20 px-4 py-3 text-left transition hover:border-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-900/70 disabled:text-slate-500"
          >
            <span className="text-sm font-semibold text-rose-100">{t('store.reminderGoogleCalendar')}</span>
            <iconify-icon icon="solar:calendar-linear" width="18" height="18"></iconify-icon>
          </button>

          <button
            type="button"
            onClick={handleDownloadCalendar}
            disabled={!hasScheduledDrop}
            className="flex w-full items-center justify-between rounded-xl border border-emerald-300/60 bg-emerald-500/15 px-4 py-3 text-left transition hover:border-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-900/70 disabled:text-slate-500"
          >
            <span className="text-sm font-semibold text-emerald-100">{t('store.reminderDownloadCalendar')}</span>
            <iconify-icon icon="solar:download-linear" width="18" height="18"></iconify-icon>
          </button>

          {!hasScheduledDrop ? (
            <p className="text-xs text-slate-300">{t('store.reminderCalendarDisabled')}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
