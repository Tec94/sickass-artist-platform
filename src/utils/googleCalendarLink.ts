import type { EventDetail, UserTicket } from '../types/events'

/**
 * Generates a Google Calendar link with pre-filled event details
 * @param event - Event detail object
 * @param confirmationCode - Optional confirmation code to include in description
 * @returns Google Calendar event creation URL
 */
export function generateGoogleCalendarLink(
  event: EventDetail | UserTicket['event'],
  confirmationCode?: string
): string {
  const startDate = new Date(event.startAtUtc)
  const endDate = new Date(event.endAtUtc)

  // Format dates for Google Calendar: YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\./g, '').split('Z')[0] + 'Z'
  }

  const startFormatted = formatDate(startDate)
  const endFormatted = formatDate(endDate)

  // Get venue address from event
  const location = 'address' in event 
    ? event.address 
    : `${event.city}`

  // Build description with event details
  const descriptionParts = []
  if ('description' in event && event.description) {
    descriptionParts.push(event.description)
  }
  if (confirmationCode) {
    descriptionParts.push(`\n\nConfirmation Code: ${confirmationCode}`)
  }
  
  const description = descriptionParts.join('')

  // Build Google Calendar URL parameters
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startFormatted}/${endFormatted}`,
    details: description,
    location: location,
  })

  return `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`
}

/**
 * Opens Google Calendar in a new tab with pre-filled event details
 * @param event - Event detail object
 * @param confirmationCode - Optional confirmation code to include in description
 */
export function openGoogleCalendar(
  event: EventDetail | UserTicket['event'],
  confirmationCode?: string
): void {
  const url = generateGoogleCalendarLink(event, confirmationCode)
  window.open(url, '_blank', 'noopener,noreferrer')
}
