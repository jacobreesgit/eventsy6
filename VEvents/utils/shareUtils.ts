import { useShare, useWebNotification } from '@vueuse/core'
import type { Event } from '@/types/events'

/**
 * Shares an event using the Web Share API
 * Falls back to clipboard copy if Web Share API is not supported
 * @param event The event to share
 */
export const shareEvent = async (event: Event): Promise<void> => {
  const { share, isSupported } = useShare()

  const shareText =
    event.eventDetails.eventShortDescription ||
    event.eventDetails.eventDescription ||
    'Check out this event!'

  try {
    await share({
      title: event.eventDetails.displayName || event.title,
      text: shareText,
      url: window.location.href
    })
  } catch (error) {
    console.error('Error sharing event:', error)

    if (!isSupported.value) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        showShareNotification()
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError)
      }
    }
  }
}

/**
 * Shows a notification that the event link has been copied
 */
const showShareNotification = (): void => {
  const { show } = useWebNotification({
    title: 'Link Copied',
    body: 'Event link has been copied to clipboard!',
    dir: 'auto',
    lang: 'en-US'
  })

  show()
}
