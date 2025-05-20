/**
 * Create and download an iCalendar (.ics) file for an event
 * @param event The event object containing all event details
 */
export const downloadEvent = (event: any) => {
  const title = event.eventDetails.displayName || event.title

  const description = event.eventDetails.eventShortDescription

  const address = event.eventDetails.address

  // Format date and time
  const formatICSDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().replace(/-|:|\.\d{3}/g, '')
  }

  const startDate = formatICSDate(event.eventDetails.eventStart)
  const endDate = formatICSDate(event.eventDetails.eventEnd)

  // Build ICS content
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VIEX//Calendar Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@viex.com`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${address}`
  ]

  // Add meeting link based on configuration
  let meetingUrl = ''

  // Follow the exact logic from the component:
  // If zoomIntegration is true, use zoomOptions.joinLink with no fallback
  // If zoomIntegration is false, use externalPlatformLink
  if (event.eventDetails.zoomIntegration) {
    meetingUrl = event.eventDetails.zoomOptions?.joinLink || ''
  } else {
    meetingUrl = event.eventDetails.externalPlatformLink || ''
  }

  // Add meeting URL to calendar event if we have one
  if (meetingUrl) {
    // Add the URL to the calendar entry
    icsContent.push(`URL:${meetingUrl}`)
  }

  // Complete the calendar entry
  icsContent = [...icsContent, 'END:VEVENT', 'END:VCALENDAR']

  // Join with proper line breaks
  const icsData = icsContent.join('\r\n')

  // Create blob and download
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)

  // Create a clean filename from the event title
  const cleanTitle = (event.eventDetails.displayNam || event.title)
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()

  link.download = `${cleanTitle}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
