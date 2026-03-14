export interface DropCalendarEvent {
  id: string
  name: string
  description?: string
  startsAt: number
  endsAt: number
  location?: string
}

function formatDateForCalendar(dateValue: number): string {
  return new Date(dateValue).toISOString().replace(/-|:|\./g, '').split('Z')[0] + 'Z'
}

function escapeCalendarText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function generateDropICS(event: DropCalendarEvent): string {
  const dtstamp = formatDateForCalendar(Date.now())
  const dtstart = formatDateForCalendar(event.startsAt)
  const dtend = formatDateForCalendar(event.endsAt)
  const location = event.location || 'ROA Store'
  const description = event.description || 'Limited-time store drop'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ROA Store Drops//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:drop-${event.id}@roa-store`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeCalendarText(event.name)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `LOCATION:${escapeCalendarText(location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadDropICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${filename}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function generateDropGoogleCalendarLink(event: DropCalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${formatDateForCalendar(event.startsAt)}/${formatDateForCalendar(event.endsAt)}`,
    details: event.description || 'Limited-time store drop',
    location: event.location || 'ROA Store',
  })

  return `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`
}

export function openDropGoogleCalendar(event: DropCalendarEvent): void {
  const url = generateDropGoogleCalendarLink(event)
  window.open(url, '_blank', 'noopener,noreferrer')
}
