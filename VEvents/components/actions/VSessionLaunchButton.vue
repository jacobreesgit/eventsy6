<template>
  <div class="v-session-launch-button">
    <VButton
      v-if="shouldShowMobilePlayer"
      :label="'Watch Event'"
      :class="computedButtons.secondaryStyle.buttonClass"
      :icon-name="'fas fa-play'"
      class="v-session-launch-button__watch-button"
      @click="$emit('watchClick')"
    />
    <VButton
      v-else-if="canLaunchEvent && !hasMedia"
      class="v-session-launch-button__launch-button"
      :label="launchButtonText"
      :class="computedButtons.secondaryStyle.buttonClass"
      :href="launchEventUrl"
      :disabled="canLaunchEvent ? undefined : true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VButton from '@/components/VButton/VButton.vue'
import type { Event, EventsSettings, ComputedButtons } from '@/types/events'

// Props
const props = defineProps<{
  event: Event
  eventsSettings: EventsSettings
  computedButtons: ComputedButtons
  canLaunchEvent: boolean
  isMobile?: boolean
}>()

// Emits
const emit = defineEmits<{
  watchClick: []
}>()

// Computed properties
const eventDetails = computed(() => props.event.eventDetails)

// Check if we have media content
const hasMedia = computed(() => {
  return Boolean(
    eventDetails.value.mediaSrc && eventDetails.value.mediaQuestion
  )
})

// Only show the watch button on mobile when we have embeddable media
// Removed zoomIntegration check
const shouldShowMobilePlayer = computed(() => {
  return props.isMobile && hasMedia.value
})

const launchButtonText = computed(() => {
  return (
    eventDetails.value.launchEventButtonCopy ||
    props.eventsSettings.copy.launchEventText
  )
})

const launchEventUrl = computed(() => {
  if (!props.canLaunchEvent) return undefined

  return eventDetails.value.zoomIntegration
    ? eventDetails.value.zoomOptions?.joinLink
    : eventDetails.value.externalPlatformLink
})
</script>

<style lang="scss" scoped>
.v-session-launch-button {
  &__watch-button,
  &__launch-button {
    width: 100%;
  }
}
</style>
