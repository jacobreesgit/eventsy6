<template>
  <div class="v-session-media">
    <iframe
      v-if="showMediaIframe"
      :src="mediaSrc"
      class="v-session-media__iframe"
      :title="`${event.title} video content`"
    />
    <div v-else class="v-session-media__image">
      <VImage
        v-if="featuredImage"
        class="v-session-media__image__content"
        :alt="featuredImage.node.altText"
        :src="featuredImage.node.sourceUrl"
      ></VImage>
      <VEventCountdown
        class="v-session-media__image__countdown"
        :event="event"
        :events-settings="eventsSettings"
        @status-change="$emit('statusChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VImage from '@/components/VImage/VImage.vue'
import VEventCountdown from '@/components/VEvents/components/status/VEventCountdown.vue'
import type { Event, EventsSettings } from '@/types/events'

// Props
const props = defineProps<{
  event: Event
  eventsSettings: EventsSettings
  eventStatus: string
  isMobile?: boolean
}>()

// Emits
const emit = defineEmits<{
  statusChange: [status: string]
}>()

// Computed properties
const eventDetails = computed(() => props.event.eventDetails)
const featuredImage = computed(() => props.event.featuredImage)
const mediaSrc = computed(() => eventDetails.value.mediaSrc || '')

// Computed for conditional rendering
const showMediaIframe = computed(() => {
  const hasMedia = mediaSrc.value && eventDetails.value.mediaQuestion
  const isEmbeddedVideo = !eventDetails.value.zoomIntegration
  const isActive = props.eventStatus === 'live'

  // On mobile, hide the iframe in this view
  if (props.isMobile) {
    return false
  } else {
    // On desktop, show the iframe inline when the conditions are met
    return isActive && hasMedia && isEmbeddedVideo
  }
})
</script>

<style lang="scss" scoped>
.v-session-media {
  &__iframe {
    aspect-ratio: 16 / 9;
    width: 100%;
    border-radius: var(--q-widget-radius);
    overflow: hidden;
  }
  &__image {
    width: 100%;
    height: 344px;
    border-radius: var(--q-widget-radius);
    position: relative;
    overflow: hidden;
    &__content {
      width: 100%;
      height: 100%;
    }
    &__countdown {
      position: absolute;
      left: 16px;
      bottom: 16px;
      @media (max-width: 767px) {
        left: 50%;
        transform: translateX(-50%);
        width: fit-content;
        bottom: 12px;
      }
    }
  }
}
</style>
