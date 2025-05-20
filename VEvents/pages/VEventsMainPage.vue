<template>
  <div ref="containerRef" class="v-events-main-page v-scrollbar" role="main">
    <VEventsHeader
      :login-enabled="props.loginEnabled"
      :computed-buttons="computedButtons"
      :colors="colors"
      @update-show-agenda="emit('updateShowAgenda', $event)"
    />

    <VEventsFilter
      :events="events"
      :computed-buttons="computedButtons"
      :events-settings="eventsSettings"
      :sort-options="sortOptions"
      :initial-sort="initialSort"
      @update-filtered-events="filteredEvents = $event"
      @update-search-term="searchQuery = $event"
      @sort-change="emit('sortChange', $event)"
    />

    <VEventsContent
      :filtered-events="filteredEvents"
      :computed-buttons="computedButtons"
      :events-settings="eventsSettings"
      :is-loading="props.isLoading"
      :search-query="searchQuery"
      :colors="colors"
      @card-click="emit('cardClick', $event)"
      @like-click="emit('likeClick', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VEventsHeader from '@/components/VEvents/components/headers/VEventsHeader.vue'
import VEventsFilter from '@/components/VEvents/components/filters/VEventsFilter.vue'
import VEventsContent from '@/components/VEvents/components/content/VEventsContent.vue'
import type {
  EventNode,
  EventsSettings,
  ComputedButtons,
  SortOption,
  Event
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
}>()

// Emits
const emit = defineEmits<{
  updateShowAgenda: [show: boolean]
  cardClick: [event: Event]
  likeClick: [event: Event]
  sortChange: [sortValue: string]
}>()

// Computed
const eventsSettings = computed(() => props.eventsSettings || {})
const colors = computed(() => eventsSettings.value.colors || {})
const computedButtons = computed(() => props.computedButtons)

// Refs
const filteredEvents = ref<EventNode[]>(props.events)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)

// Watchers
watch(
  () => props.events,
  (newEvents) => {
    if (newEvents && newEvents.length > 0) {
      filteredEvents.value = newEvents
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.v-events-main-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
