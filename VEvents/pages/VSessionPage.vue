<template>
  <div class="v-session-page">
    <VIconButton
      v-if="showQaSection && isMobile"
      class="v-session-page__chat-button v-focus-a"
      aria-label="Open Chat"
      :icon-name="'fas fa-comments'"
      :icon-color="'white'"
      :icon-hover-color="'white'"
      :size="'48px'"
      @click="openChatSheet"
    />

    <VSplitStackLayout
      v-if="!isMobile"
      ref="splitLayoutRef"
      :enabled="showQaSection"
      :default-layout="currentLayout"
      :show-toggle-button="showQaSection"
      :is-slido-qa="isSlidoQA"
      @toggle-view="handleToggleView"
    >
      <template #first-panel>
        <VSessionContent
          ref="contentRef"
          class="v-scrollbar v-session-page__content"
          :computed-buttons="computedButtons"
          :event="event"
          :events-settings="eventsSettings"
          :login-enabled="loginEnabled"
          :map-settings="mapSettings"
          :is-map-view="isMapView"
          :event-status="eventStatus"
          :can-launch-event="canLaunchEvent"
          :is-mobile="isMobile"
          :is-full-stack-view="isStackedView"
          :show-chat="showQaSection"
          @like-click="handleLikeClick"
          @back-click="handleBackClick"
          @update-show-agenda="$emit('updateShowAgenda', $event)"
          @status-change="handleStatusChange"
          @navigation-request="$emit('navigationRequest', $event)"
          @watch-click="openMobilePlayer"
        />
      </template>
      <template #second-panel>
        <VSessionChat
          ref="chatRef"
          class="v-scrollbar v-session-page__chat"
          :event-details="eventDetails"
        />
      </template>
    </VSplitStackLayout>

    <VSessionContent
      v-if="isMobile"
      ref="mobileContentRef"
      :inert="showMobilePlayer"
      class="v-scrollbar v-session-page__content"
      :computed-buttons="computedButtons"
      :event="event"
      :events-settings="eventsSettings"
      :login-enabled="loginEnabled"
      :map-settings="mapSettings"
      :is-map-view="isMapView"
      :event-status="eventStatus"
      :can-launch-event="canLaunchEvent"
      :is-mobile="isMobile"
      :is-full-stack-view="false"
      :show-chat="false"
      @like-click="handleLikeClick"
      @back-click="handleBackClick"
      @update-show-agenda="$emit('updateShowAgenda', $event)"
      @status-change="handleStatusChange"
      @navigation-request="$emit('navigationRequest', $event)"
      @watch-click="openMobilePlayer"
    />

    <VTikTokPlayer
      v-if="showMobilePlayer"
      :media-src="eventDetails.mediaSrc || ''"
      :title="event.title"
      :description="eventDescription"
      :is-liked="eventDetails.isLiked"
      :show-comments-button="showQaSection"
      :show-like-button="true"
      :show-share-button="true"
      @close="closeMobilePlayer"
      @like="handleLikeClick"
      @comments="openChatSheet"
      @share="handleShareClick"
    />

    <VSwipe
      v-if="(showQaSection && isMobile) || showMobilePlayer"
      ref="chatSheetRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      class="v-session-page__chat-sheet"
      :can-close="true"
      @opened="handleSheetOpened"
      @closed="handleSheetClosed"
    >
      <h2 id="chat-title" class="sr-only">Event Chat</h2>
      <VSessionChat
        ref="mobileChatRef"
        class="v-session-page__chat"
        :event-details="eventDetails"
      />
    </VSwipe>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  onBeforeMount,
  onBeforeUnmount
} from 'vue'
import VSplitStackLayout from '@/components/VSplitStackLayout/VSplitStackLayout.vue'
import VSessionContent from '@/components/VEvents/components/session/VSessionContent.vue'
import VSessionChat from '@/components/VEvents/components/session/VSessionChat.vue'
import VTikTokPlayer from '@/components/VTikTokPlayer/VTikTokPlayer.vue'
import VSwipe from '@/components/VSwipe/VSwipe.vue'
import VIconButton from '@/components/VIconButton/VIconButton.vue'
import { shareEvent } from '@/components/VEvents/utils/shareUtils'
import type {
  Event,
  EventsSettings,
  ComputedButtons,
  MapSettings,
  EventDetails
} from '@/types/events'

// Props
const props = defineProps<{
  computedButtons: ComputedButtons
  event: Event
  eventsSettings: EventsSettings
  loginEnabled?: boolean
  mapSettings?: MapSettings
  isMapView?: boolean
  autoOpenTiktok?: boolean
}>()

// Emits
const emit = defineEmits<{
  likeClick: [event: Event]
  backClick: []
  updateShowAgenda: [show: boolean]
  qaSectionVisibilityChange: [visible: boolean]
  navigationRequest: [request: { path: string; data: any }]
  tiktokStateChange: [isOpen: boolean]
}>()

// Refs and reactive state
const eventStatus = ref<string>('upcoming')
const splitLayoutRef = ref<InstanceType<typeof VSplitStackLayout> | null>(null)
const contentRef = ref<InstanceType<typeof VSessionContent> | null>(null)
const mobileContentRef = ref<InstanceType<typeof VSessionContent> | null>(null)
const chatRef = ref<InstanceType<typeof VSessionChat> | null>(null)
const mobileChatRef = ref<InstanceType<typeof VSessionChat> | null>(null)
const chatSheetRef = ref<InstanceType<typeof VSwipe> | null>(null)
const windowWidth = ref<number>(0)
const isChatSheetOpen = ref<boolean>(false)
const isStackedView = ref<boolean>(false)
const showMobilePlayer = ref<boolean>(false)

// Computed properties
const eventDetails = computed<EventDetails>(() => props.event.eventDetails)

const eventDescription = computed<string>(
  () =>
    eventDetails.value.eventDescription ||
    eventDetails.value.eventShortDescription ||
    ''
)

const canLaunchEvent = computed<boolean>(() => {
  return eventStatus.value === 'startingSoon' || eventStatus.value === 'live'
})

const showQaSection = computed<boolean>(() => {
  const {
    qaQuestion,
    qaPlatformQuestion,
    slidoQa,
    chatifyQa,
    customQa,
    onLocation
  } = eventDetails.value

  if (onLocation) {
    return false
  }

  return Boolean(
    qaQuestion &&
      ((qaPlatformQuestion === 'slido' && slidoQa?.src) ||
        (qaPlatformQuestion === 'chatify' && chatifyQa?.html) ||
        (qaPlatformQuestion === 'other' && customQa?.html))
  )
})

// Check if Slido is the active QA platform
const isSlidoQA = computed<boolean>(() => {
  return (
    eventDetails.value.qaPlatformQuestion === 'slido' &&
    Boolean(eventDetails.value.slidoQa?.src)
  )
})

const currentLayout = computed<string>(() => {
  // If qaQuestion is null, force stacked layout
  if (!eventDetails.value.qaQuestion) {
    return 'col-md-12/col-md-12'
  }

  // Otherwise use the configured widths
  return (
    eventDetails.value.qaWidth ||
    eventDetails.value.qaAndEmbedWidth ||
    'col-md-6/col-md-6'
  )
})

// Mobile detection
const isMobile = computed<boolean>(() => {
  return windowWidth.value < 1024
})

// Methods
const handleStatusChange = (status: string): void => {
  eventStatus.value = status
}

const handleLikeClick = (): void => {
  emit('likeClick', props.event)
}

const handleBackClick = (): void => {
  emit('backClick')
}

const handleShareClick = (): void => {
  shareEvent(props.event)
}

const handleToggleView = (stacked: boolean): void => {
  isStackedView.value = stacked
}

const openMobilePlayer = (): void => {
  if (!isMobile.value) return

  showMobilePlayer.value = true
  emit('tiktokStateChange', true) // Notify parent that TikTok player opened
}

const closeMobilePlayer = (): void => {
  showMobilePlayer.value = false
  emit('tiktokStateChange', false) // Notify parent that TikTok player closed

  // Close the chat sheet if it's open
  if (isChatSheetOpen.value && chatSheetRef.value) {
    chatSheetRef.value.close()
  }
}

const openChatSheet = (): void => {
  if (chatSheetRef.value) {
    chatSheetRef.value.open()
  }
}

const handleSheetOpened = (): void => {
  isChatSheetOpen.value = true
}

const handleSheetClosed = (): void => {
  isChatSheetOpen.value = false
}

// Handle escape key press to close TikTok player or chat sheet
const handleEscapeKey = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    if (showMobilePlayer.value) {
      closeMobilePlayer()
    } else if (isChatSheetOpen.value && chatSheetRef.value) {
      chatSheetRef.value.close()
    }
  }
}

// Set TikTok player state explicitly (called from parent)
const setTiktokPlayerState = (isOpen: boolean): void => {
  // Only allow TikTok player on mobile devices
  if (!isMobile.value) {
    return // Do nothing on desktop
  }

  if (isOpen && !showMobilePlayer.value && eventDetails.value.mediaSrc) {
    openMobilePlayer()
  } else if (!isOpen && showMobilePlayer.value) {
    closeMobilePlayer()
  }
}

// Window resize handler
const updateWindowWidth = (): void => {
  windowWidth.value = window.innerWidth
}

// Lifecycle hooks and watchers
watch(showQaSection, (visible) => {
  emit('qaSectionVisibilityChange', visible)
})

watch(isMobile, (mobile) => {
  // Close the chat sheet if switching from mobile to desktop
  if (!mobile && chatSheetRef.value && isChatSheetOpen.value) {
    chatSheetRef.value.close()
  }

  // Close the mobile player if switching to desktop
  if (!mobile && showMobilePlayer.value) {
    showMobilePlayer.value = false
  }
})

onBeforeMount(() => {
  // Set initial window width
  updateWindowWidth()
})

onMounted(() => {
  // Initial setup for desktop
  if (!isMobile.value && showQaSection.value && splitLayoutRef.value) {
    splitLayoutRef.value.showIndicatorTemporarily()
  }

  // Check if we should automatically open the player based on the prop
  if (isMobile.value && props.autoOpenTiktok && eventDetails.value.mediaSrc) {
    openMobilePlayer()
  }

  // Add event listener for window resize
  window.addEventListener('resize', updateWindowWidth)

  // Add event listener for escape key
  window.addEventListener('keydown', handleEscapeKey)
})

onBeforeUnmount(() => {
  // Clean up event listeners
  window.removeEventListener('resize', updateWindowWidth)
  window.removeEventListener('keydown', handleEscapeKey)
})

// Expose components for external access
defineExpose({
  splitLayout: () => splitLayoutRef.value,
  chatSheet: () => chatSheetRef.value,
  isStackedView: () => isStackedView.value,
  showMobilePlayer: () => showMobilePlayer.value,
  setTiktokPlayerState
})
</script>

<style lang="scss" scoped>
.v-session-page {
  width: 100%;
  position: relative;
  &__chat-button {
    background-color: var(--v-accessible-background) !important;
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
  &__chat-sheet {
    z-index: 1020;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
  }
}
</style>
