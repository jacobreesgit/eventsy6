<template>
  <div
    class="v-eventsviewer v-reset"
    role="application"
    aria-label="Events Viewer"
  >
    <transition
      name="v-fade"
      @after-leave="handleAfterLeave"
      @after-enter="handleAfterEnter"
    >
      <VEventsMainPage
        v-if="!selectedEvent"
        ref="mainPageRef"
        :computed-buttons="computedButtons"
        :events="events"
        :events-settings="eventsSettings"
        :login-enabled="loginEnabled"
        :sort-options="sortOptions"
        :initial-sort="initialSort"
        :is-loading="isLoading"
        @update-show-agenda="emit('updateShowAgenda', $event)"
        @card-click="handleCardClick"
        @like-click="handleLikeClick"
        @sort-change="emit('sortChange', $event)"
      ></VEventsMainPage>
      <VSessionPage
        v-else
        ref="sessionPageRef"
        :computed-buttons="computedButtons"
        :event="selectedEvent"
        :events-settings="eventsSettings"
        :login-enabled="loginEnabled"
        :map-settings="mapSettings"
        :is-map-view="isMapView"
        :auto-open-tiktok="shouldOpenTiktok"
        @like-click="handleLikeClick"
        @back-click="handleBackClick"
        @update-show-agenda="emit('updateShowAgenda', $event)"
        @qa-section-visibility-change="handleQaSectionVisibilityChange"
        @navigation-request="emit('navigationRequest', $event)"
        @tiktok-state-change="handleTiktokStateChange"
      ></VSessionPage>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import VEventsMainPage from '@/components/VEvents/pages/VEventsMainPage.vue'
import VSessionPage from '@/components/VEvents/pages/VSessionPage.vue'
import type {
  Event as EventInterface,
  EventNode,
  EventsSettings,
  ComputedButtons,
  SortOption,
  NavigationRequest,
  MapSettings
} from '@/types/events'

// Props
const props = defineProps<{
  computedButtons: ComputedButtons
  events: EventNode[]
  eventsSettings: EventsSettings
  loginEnabled?: boolean
  sortOptions?: SortOption[]
  initialSort?: string
  isLoading?: boolean
  mapSettings?: MapSettings
  isMapView?: boolean
  shouldOpenTiktok?: boolean
}>()

// Emits
const emit = defineEmits<{
  updateShowAgenda: [show: boolean]
  cardClick: [event: EventInterface]
  likeClick: [event: EventInterface]
  sortChange: [sortValue: string]
  navigationRequest: [request: NavigationRequest]
  qaSectionVisibilityChange: [visible: boolean]
  tiktokStateChange: [isOpen: boolean]
}>()

// Refs and reactive state
const selectedEventObj = ref<EventInterface | null>(null)
const selectedEventId = ref<string | number | null>(null)
const sessionPageRef = ref<InstanceType<typeof VSessionPage> | null>(null)
const mainPageRef = ref<InstanceType<typeof VEventsMainPage> | null>(null)
const lastSelectedId = ref<string | number | null>(null)

// Computed property for selected event
const selectedEvent = computed(() => {
  if (!selectedEventObj.value) return null

  // If we don't have an ID to look up updates, return the stored object
  if (!selectedEventId.value) return selectedEventObj.value

  // Look for updates in the events array
  const foundEvent = props.events.find(
    (item) =>
      item.node.databaseId === selectedEventId.value ||
      item.node.id === selectedEventId.value
  )

  // If we find an updated version in the events array, merge it with the original
  if (foundEvent) {
    const mergedEvent = { ...selectedEventObj.value }

    // Update specific properties that may change
    if (mergedEvent.eventDetails && foundEvent.node.eventDetails) {
      mergedEvent.eventDetails = {
        ...mergedEvent.eventDetails,
        isLiked: foundEvent.node.eventDetails.isLiked
      }
    }

    return mergedEvent
  }

  return selectedEventObj.value
})

// Methods
const setSelectedEvent = (event: EventInterface | null): void => {
  selectedEventObj.value = event
  if (event) {
    const eventId = event.databaseId || event.id || null
    selectedEventId.value = eventId
    lastSelectedId.value = eventId // Store for focus restoration
  } else {
    selectedEventId.value = null
    // We don't clear lastSelectedId here to remember which card was selected
  }
}

// Focus management - handle page transitions
const handleAfterEnter = (): void => {
  if (selectedEvent.value && sessionPageRef.value) {
    // Focus on the back button after session page enters
    const backButton = sessionPageRef.value.$el.querySelector(
      '.v-session-header__back-button'
    )
    if (backButton) {
      backButton.focus()
    }
  }
}

const handleAfterLeave = (): void => {
  if (!selectedEvent.value && mainPageRef.value) {
    nextTick(() => {
      // Try to find the last selected card based on data attribute
      if (lastSelectedId.value) {
        const cardSelector = `.v-event-card[data-event-id="${lastSelectedId.value}"]`
        const lastSelectedCard =
          mainPageRef.value?.$el.querySelector(cardSelector)

        if (lastSelectedCard) {
          lastSelectedCard.focus()
          return
        }
      }

      // Fallback to first card if we can't find the last selected one
      const firstCard = mainPageRef.value?.$el.querySelector('.v-event-card')
      if (firstCard) {
        firstCard.focus()
      }
    })
  }
}

// Event handlers
const handleLikeClick = (event: EventInterface): void => {
  emit('likeClick', event)
}

const handleCardClick = (data: EventInterface): void => {
  emit('qaSectionVisibilityChange', false)
  setSelectedEvent(data)
  emit('cardClick', data)

  const path = props.isMapView
    ? `/map/${data.slug}/event`
    : `/events/session/${data.slug}`

  emit('navigationRequest', {
    path,
    data
  })
}

const handleBackClick = (): void => {
  selectedEventObj.value = null
  selectedEventId.value = null

  const path = props.isMapView ? '/map/back' : '/events/all'

  emit('navigationRequest', {
    path,
    data: null
  })
}

const handleQaSectionVisibilityChange = (visible: boolean): void => {
  emit('qaSectionVisibilityChange', visible)
}

const handleTiktokStateChange = (isOpen: boolean): void => {
  emit('tiktokStateChange', isOpen)
}

// Set TikTok player state from parent
const setTiktokPlayerState = (isOpen: boolean): void => {
  if (sessionPageRef.value) {
    sessionPageRef.value.setTiktokPlayerState(isOpen)
  }
}

// Lifecycle hooks and watchers
watch(selectedEvent, async (newEvent) => {
  if (newEvent && sessionPageRef.value) {
    await nextTick()
    const splitLayout = sessionPageRef.value.splitLayout?.()
    if (splitLayout) {
      splitLayout.initializeViewMode()
      splitLayout.showIndicatorTemporarily(1500)
    }
  }
})

// Expose methods to parent component
defineExpose({
  setSelectedEvent,
  setTiktokPlayerState
})
</script>

<style lang="scss" scoped>
.v-eventsviewer {
  width: 100%;
}
</style>
