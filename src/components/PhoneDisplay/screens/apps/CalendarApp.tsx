import { useMemo, useState } from 'react'
import AppScaffold from './AppScaffold'
import { usePhoneOverlay } from '../../PhoneOverlayProvider'

type CalendarEvent = { day: number; title: string; href?: string }

const weekLabels = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
}

export default function CalendarApp() {
  const { content, locale, setSheet } = usePhoneOverlay()
  const [cursor, setCursor] = useState(() => new Date())

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
  const startOffset = monthStart.getDay()
  const daysInMonth = monthEnd.getDate()
  const today = new Date()

  const seededEvents = useMemo<CalendarEvent[]>(() => {
    const releases = content.music.discography.slice(0, 4).map((release, index) => ({
      day: 4 + index * 5,
      title: release.name,
    }))
    return [
      ...releases,
      { day: 20, title: locale === 'es' ? 'Evento / Stage Call' : 'Stage Call Event', href: '/events' },
      { day: 27, title: locale === 'es' ? 'Merch Drop' : 'Merch Drop', href: '/store/drops' },
    ]
  }, [content.music.discography, locale])

  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null
  })

  return (
    <AppScaffold
      title={locale === 'es' ? 'Calendario' : 'Calendar'}
      subtitle={cursor.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })}
      toolbar={
        <div className="flex items-center gap-1">
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <iconify-icon icon="solar:alt-arrow-left-linear" width="12" height="12" />
          </button>
          <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <iconify-icon icon="solar:alt-arrow-right-linear" width="12" height="12" />
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekLabels[locale].map((label, index) => (
            <div key={`${label}-${index}`} className="py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              {label}
            </div>
          ))}
          {cells.map((day, index) => {
            const hasEvent = typeof day === 'number' && seededEvents.some((event) => event.day === day)
            const isToday =
              typeof day === 'number' &&
              cursor.getFullYear() === today.getFullYear() &&
              cursor.getMonth() === today.getMonth() &&
              day === today.getDate()

            return (
              <button
                key={`cell-${index}`}
                type="button"
                disabled={day === null}
                className={`relative aspect-square rounded-lg border text-xs ${
                  day === null
                    ? 'border-transparent bg-transparent text-transparent'
                    : isToday
                      ? 'border-red-600/60 bg-red-950/30 text-red-200'
                      : 'border-white/5 bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
                onClick={() => {
                  if (day === null) return
                  const eventsForDay = seededEvents.filter((event) => event.day === day)
                  setSheet({
                    id: `calendar-day-${day}`,
                    title: `${cursor.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long' })} ${day}`,
                    subtitle: eventsForDay.length ? undefined : locale === 'es' ? 'Sin eventos' : 'No events',
                    body: eventsForDay.length ? (
                      <div className="space-y-2">
                        {eventsForDay.map((event) => (
                          <div key={`${day}-${event.title}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                            <div className="text-xs text-white">{event.title}</div>
                          </div>
                        ))}
                      </div>
                    ) : undefined,
                    actions: eventsForDay.some((event) => event.href)
                      ? [
                          {
                            id: 'events-link',
                            label: locale === 'es' ? 'Abrir Eventos' : 'Open Events',
                            tone: 'accent',
                            href: eventsForDay.find((event) => event.href)?.href,
                          },
                          { id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' },
                        ]
                      : [{ id: 'close', label: locale === 'es' ? 'Cerrar' : 'Close' }],
                  })
                }}
              >
                {day}
                {hasEvent ? <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-400" /> : null}
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
            {locale === 'es' ? 'Proximos' : 'Upcoming'}
          </h3>
          <div className="mt-2 space-y-2">
            {seededEvents.slice(0, 4).map((event) => (
              <div key={`${event.day}-${event.title}`} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-2 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/40 text-xs text-red-200">{event.day}</span>
                <span className="min-w-0 truncate text-xs text-zinc-100">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppScaffold>
  )
}

