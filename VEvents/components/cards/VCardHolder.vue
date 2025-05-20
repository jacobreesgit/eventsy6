<template>
  <div ref="cardHolderRef" class="v-card-holder" :aria-expanded="!hasMore">
    <ul role="list" class="v-card-holder__list">
      <li v-for="(event, index) in visibleEvents" :key="index">
        <VEventCard
          ref="eventCardRefs"
          :event="event"
          :events-settings="eventsSettings"
          @card-click="handleCardClick"
          @like-click="handleLikeClick"
        />
      </li>
    </ul>

    <div
      ref="liveRegionRef"
      class="v-sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ liveAnnouncement }}
    </div>

    <VButton
      v-if="hasMore"
      :class="computedButtons.primaryStyle.buttonClass"
      :label="loadMoreLabel"
      @click="loadMore"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useElementSize, useResizeObserver } from '@vueuse/core'
import VEventCard from '@/components/VEvents/components/cards/VEventCard.vue'
import VButton from '@/components/VButton/VButton.vue'
import type {
  EventNode,
  Event,
  EventsSettings,
  ComputedButtons
} from '@/types/events'

// Props
const props = defineProps<{
  computedButtons: ComputedButtons
  events: EventNode[]
  eventsSettings: EventsSettings
}>()

// Emits
const emit = defineEmits<{
  cardClick: [event: Event]
  likeClick: [event: Event]
}>()

// References and reactive state
const cardHolderRef = ref<HTMLElement | null>(null)
const batchesLoaded = ref(1)
const initialItemCount = 8
const eventCardRefs = ref<any[]>([])

// Accessibility related refs and state
const liveRegionRef = ref<HTMLElement | null>(null)
const liveAnnouncement = ref('')
const previousVisibleCount = ref(0)

// Use VueUse to monitor element size
const { width } = useElementSize(cardHolderRef)

// Calculate number of columns based on container width
const cardsPerRow = computed(() => {
  const cardMinWidth = 280 // Match the minmax value in CSS
  const containerWidth = width.value || 0

  // If container is smaller than minimum card width, ensure we have 1 column
  if (containerWidth < cardMinWidth) {
    return 1
  }

  const columnCount = Math.max(1, Math.floor(containerWidth / cardMinWidth))
  return columnCount
})

// Update visible cards when grid changes, automatically triggering recalculation of cardsPerRow via width.value
useResizeObserver(cardHolderRef, () => {})

// Computed properties
const itemsToShow = computed(() => {
  const desiredItems = initialItemCount * batchesLoaded.value
  const capped = Math.min(desiredItems, props.events.length)

  // Ensure we always show complete rows by rounding up to the nearest multiple of cardsPerRow
  const remainder = capped % cardsPerRow.value
  return remainder > 0 ? capped + (cardsPerRow.value - remainder) : capped
})

const visibleEvents = computed(() => {
  return props.events.slice(0, itemsToShow.value)
})

const hasMore = computed(() => {
  return props.events.length > visibleEvents.value.length
})

const loadMoreLabel = computed(() => 'View More')

// Update live region with appropriate announcement
const updateLiveRegion = () => {
  const newItemCount = visibleEvents.value.length - previousVisibleCount.value
  liveAnnouncement.value = `Loaded ${newItemCount} more events. Focus is on the first new event.`
  setTimeout(() => {
    liveAnnouncement.value = ''
  }, 3000)
}

// Methods
const loadMore = () => {
  previousVisibleCount.value = visibleEvents.value.length // Store current visible count before loading more
  batchesLoaded.value += 1 // Load more items

  // Wait for DOM update, then focus the first new card
  nextTick(() => {
    // Find the first newly added card
    if (
      visibleEvents.value.length > previousVisibleCount.value &&
      eventCardRefs.value.length > previousVisibleCount.value
    ) {
      const componentInstance = eventCardRefs.value[previousVisibleCount.value]
      if (componentInstance && componentInstance.$el) {
        componentInstance.$el.focus() // Focus the component's root element
        updateLiveRegion() // Update live region for screen readers
      }
    }
  })
}

const handleCardClick = (event: Event) => {
  emit('cardClick', event)
}

const handleLikeClick = (event: Event) => {
  emit('likeClick', event)
}
</script>

<style lang="scss" scoped>
.v-card-holder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  &__list {
    list-style: none;
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 16px;
    align-items: stretch;
    grid-auto-rows: 1fr;
    padding: 0;
    & > li {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    @media only screen and (min-width: 1024px) {
      padding: 8px 0px;
    }
  }
}
</style>
