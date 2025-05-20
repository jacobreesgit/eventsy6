<template>
  <div class="v-event-search v-full-w">
    <VIcon
      name="fas fa-magnifying-glass"
      size="24px"
      color="black"
      aria-hidden="true"
    />
    <input
      v-model="searchQuery"
      type="search"
      class="v-event-search__input"
      :placeholder="searchPlaceholder"
      :aria-label="searchPlaceholder"
    />
    <VIcon
      v-if="searchQuery"
      class="v-event-search__close"
      role="button"
      name="fas fa-xmark"
      size="24px"
      color="black"
      aria-label="Clear search"
      tabindex="0"
      @click="clearSearch"
      @keydown.enter="clearSearch"
      @keydown.space.prevent="clearSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import Fuse from 'fuse.js'
import debounce from 'debounce'
import VIcon from '@/components/VIcon/VIcon.vue'
import type { EventNode, ComputedButtons, EventsSettings } from '@/types/events'

// Props
const props = defineProps<{
  events: EventNode[]
  computedButtons?: ComputedButtons
  eventsSettings?: EventsSettings
}>()

// Emits
const emit = defineEmits<{
  'update-filtered-events': [events: EventNode[]]
  'update-search-term': [term: string]
}>()

// Refs
const searchQuery = ref('')
const fuse = ref<Fuse<EventNode> | null>(null)

// Computed properties
const searchPlaceholder = computed(() => 'Type to start searching...')

const filteredEvents = computed(() => {
  if (!searchQuery.value || !fuse.value) return props.events
  return fuse.value.search(searchQuery.value).map((result) => result.item)
})

// Methods
const initializeFuse = () => {
  fuse.value = new Fuse(props.events, {
    keys: [
      'node.title',
      'node.eventDetails.displayName',
      'node.eventDetails.presenterInformation.name'
    ],
    threshold: 0.4,
    includeScore: true
  })
}

const clearSearch = () => {
  searchQuery.value = ''
}

// Create a debounced version of the emit function
const debouncedEmitFilteredEvents = debounce((events: EventNode[]) => {
  emit('update-filtered-events', events)
}, 300) // 300ms debounce

// Watchers
watch(searchQuery, () => {
  emit('update-search-term', searchQuery.value) // Immediate emit for search term - no debounce needed for UI updates
})

watch(filteredEvents, () => {
  debouncedEmitFilteredEvents(filteredEvents.value) // Debounced emit for filtered events to reduce processing
})

watch(() => props.events, initializeFuse, { deep: true })

// Lifecycle hooks
onMounted(() => {
  initializeFuse()
})

// Cleanup debounce on component unmount
onUnmounted(() => {
  debouncedEmitFilteredEvents.clear()
})
</script>

<style lang="scss" scoped>
.v-event-search {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 1rem;
  border-radius: 20px;
  box-shadow:
    0 1px 3px 1px #3c404326,
    0 1px 2px #3c40434d;
  background-color: #fff;
  position: relative;
  gap: 12px;
  &__input {
    border: none;
    outline: none;
    height: 100%;
    background: transparent;
    color: #565656;
    font-size: var(--q-body-fontSize);
    padding-right: 28px;
    width: 100%;
    text-overflow: ellipsis;
  }
  &__close {
    cursor: pointer;
    position: absolute;
    right: 1rem;
  }
}
</style>
