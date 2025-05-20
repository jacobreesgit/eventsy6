<template>
  <p
    v-if="hasDescription"
    class="v-session-description"
    aria-label="Event description"
    v-html="description"
  ></p>
  <div
    v-else
    class="v-session-description v-session-description--empty"
    aria-hidden="true"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '@/types/events'

// Props
const props = defineProps<{
  event: Event
}>()

// Computed properties
const eventDetails = computed(() => props.event.eventDetails)
const description = computed(() => eventDetails.value.eventDescription || '')
const hasDescription = computed(() => !!description.value)
</script>

<style lang="scss" scoped>
.v-session-description {
  font-size: var(--q-body-fontSize);
}
</style>
