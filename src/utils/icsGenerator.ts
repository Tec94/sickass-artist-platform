import type { EventDetail, UserTicket } from '../types/events'

/**
 * Generates an ICS (iCalendar) file content for an event
 * @param event - Event detail object with date, time, and venue info
 * @param confirmationCode - Optional confirmation code to include in description
 * @returns ICS file content as a string
 */
export function generateICS(
  event: EventDetail | UserTicket['event'],
  confirmationCode?: string
): string {
  const now = new Date()
  const startDate = new Date(event.startAtUtc)
  const endDate = new Date(event.endAtUtc)

  // Format dates to ICS format: YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\./g, '').split('Z')[0] + 'Z'
  }

  const dtstamp = formatDate(now)
  const dtstart = formatDate(startDate)
  const dtend = formatDate(endDate)

  // Build description with event details
  const descriptionParts = []
  if ('description' in event && event.description) {
    descriptionParts.push(event.description)
  }
  if (confirmationCode) {
    descriptionParts.push(`\\n\\nConfirmation Code: ${confirmationCode}`)
  }
  
  const description = descriptionParts.join('').replace(/\n/g, '\\n')

  // Get venue address from event
  const location = 'address' in event 
    ? event.address 
    : `${event.city}`

  // Generate unique UID for the event
  const uid = `event-${event._id}@events-system`

  // Build ICS content following RFC 5545 specification
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Events System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `LOCATION:${escapeICSText(location)}`,
    description ? `DESCRIPTION:${escapeICSText(description)}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')

  return icsContent
}

/**
 * Escapes special characters in ICS text fields
 * @param text - Text to escape
 * @returns Escaped text safe for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/;/g, '\\;')   // Escape semicolons
    .replace(/,/g, '\\,')   // Escape commas
    .replace(/\n/g, '\\n')  // Escape newlines
}

/**
 * Downloads an ICS file to the user's device
 * @param icsContent - ICS file content
 * @param filename - Filename for the download (without .ics extension)
 */
export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.ics`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
