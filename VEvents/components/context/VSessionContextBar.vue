<template>
  <div
    class="v-session-context-bar"
    role="complementary"
    aria-label="Event details"
  >
    <VEventTimeContext
      type="datetime"
      :event-details="eventDetails"
      :session="true"
      :events-settings="eventsSettings"
    />
    <VEventLocationContext
      :event-details="eventDetails"
      :session="true"
      :events-settings="eventsSettings"
    />
    <template v-if="hasAdditionalLinks">
      <VEventLinkContext
        v-for="(link, index) in eventDetails.additionalLink"
        :key="`link-${index}`"
        :event-details="eventDetails"
        :link-index="index"
        :session="true"
        :events-settings="eventsSettings"
      />
    </template>
    <template v-if="hasPresenters">
      <VEventPresenterContext
        v-for="(presenter, index) in eventDetails.presenterInformation"
        :key="`presenter-${index}`"
        :event-details="eventDetails"
        :presenter-index="index"
        :session="true"
        :events-settings="eventsSettings"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VEventTimeContext from '@/components/VEvents/components/context/VEventTimeContext.vue'
import VEventLocationContext from '@/components/VEvents/components/context/VEventLocationContext.vue'
import VEventLinkContext from '@/components/VEvents/components/context/VEventLinkContext.vue'
import VEventPresenterContext from '@/components/VEvents/components/context/VEventPresenterContext.vue'
import type { Event, EventsSettings } from '@/types/events'

// Props
const props = defineProps<{
  event: Event
  eventsSettings: EventsSettings
}>()

// Computed properties
const eventDetails = computed(() => props.event.eventDetails)

const hasAdditionalLinks = computed(() => {
  return (
    eventDetails.value.additionalLink &&
    eventDetails.value.additionalLink.length > 0
  )
})

const hasPresenters = computed(() => {
  return (
    eventDetails.value.presenterInformation &&
    eventDetails.value.presenterInformation.length > 0
  )
})
</script>

<style lang="scss" scoped>
.v-session-context-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
