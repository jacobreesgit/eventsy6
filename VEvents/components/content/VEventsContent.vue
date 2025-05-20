<template>
  <main class="v-events-content">
    <VCardHolder
      v-if="filteredEvents.length > 0"
      :events="filteredEvents"
      :computed-buttons="computedButtons"
      :events-settings="eventsSettings"
      @card-click="$emit('cardClick', $event)"
      @like-click="$emit('likeClick', $event)"
    />

    <div
      v-else-if="!isLoading"
      class="v-events-content__no-sessions"
      role="status"
      aria-live="polite"
    >
      <VIcon
        class="no-events-icon"
        :name="searchQuery ? 'fas fa-search' : 'fas fa-calendar-xmark'"
        size="2.5rem"
        :color="colors.textColor.name"
        aria-hidden="true"
      />
      <p>
        {{ searchQuery ? 'No matching events found' : 'No events available' }}
      </p>
      <p v-if="searchQuery" class="hint-text">
        Try adjusting your search criteria
      </p>
      <p v-if="!searchQuery" class="hint-text">
        Check back later for upcoming events
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import VCardHolder from '@/components/VEvents/components/cards/VCardHolder.vue'
import VIcon from '@/components/VIcon/VIcon.vue'
import type {
  EventNode,
  EventsSettings,
  ComputedButtons,
  Event
} from '@/types/events'

// Props
const props = defineProps<{
  filteredEvents: EventNode[]
  computedButtons: ComputedButtons
  eventsSettings: EventsSettings
  isLoading?: boolean
  searchQuery: string
  colors: any
}>()

// Emits
const emit = defineEmits<{
  cardClick: [event: Event]
  likeClick: [event: Event]
}>()
</script>

<style lang="scss" scoped>
.v-events-content {
  &__no-sessions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    .no-events-icon {
      margin-bottom: 1rem;
      opacity: 0.7;
    }
    p {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0.25rem 0;

      &.hint-text {
        font-size: 0.9rem;
        font-weight: normal;
        opacity: 0.7;
        margin-top: 0.5rem;
      }
    }
    @media only screen and (max-width: 768px) {
      padding: 2rem 1rem;
      .no-events-icon {
        font-size: 2rem;
      }
      p {
        font-size: 1rem;
      }
    }
  }
}
</style>
