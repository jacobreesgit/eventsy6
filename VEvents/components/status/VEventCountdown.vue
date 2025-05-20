<template>
  <div
    class="v-event-countdown"
    :class="statusClasses"
    aria-live="polite"
    role="timer"
    :aria-label="ariaLabelText"
  >
    <!-- Upcoming or Starting Soon: Full countdown for desktop, simplified for mobile -->
    <template v-if="status === 'upcoming' || status === 'startingSoon'">
      <VIcon
        name="fal fa-clock"
        size="24px"
        color="white"
        class="v-event-countdown__icon"
        aria-hidden="true"
      />

      <!-- Desktop view (full countdown) -->
      <div class="v-event-countdown__items v-event-countdown__items--desktop">
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.days
          }}</span>
          <span class="v-event-countdown__item-label">days</span>
        </div>
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.hours
          }}</span>
          <span class="v-event-countdown__item-label">{{ hoursLabel }}</span>
        </div>
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.minutes
          }}</span>
          <span class="v-event-countdown__item-label">minutes</span>
        </div>
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.seconds
          }}</span>
          <span class="v-event-countdown__item-label">seconds</span>
        </div>
      </div>

      <!-- Mobile view (simplified countdown) -->
      <div class="v-event-countdown__items v-event-countdown__items--mobile">
        <template v-if="showMobileDays">
          <div class="v-event-countdown__item">
            <span class="v-event-countdown__item-value">{{
              countdownValues.days
            }}</span>
            <span class="v-event-countdown__item-label">d</span>
          </div>
        </template>
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.hours
          }}</span>
          <span class="v-event-countdown__item-label">h</span>
        </div>
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.minutes
          }}</span>
          <span class="v-event-countdown__item-label">m</span>
        </div>
        <div class="v-event-countdown__item">
          <span class="v-event-countdown__item-value">{{
            countdownValues.seconds
          }}</span>
          <span class="v-event-countdown__item-label">s</span>
        </div>
      </div>
    </template>

    <!-- No changes to live and ended states -->
    <template v-else-if="status === 'live'">
      <VIcon
        name="fal fa-alarm-clock"
        size="24px"
        color="white"
        class="v-event-countdown__icon"
        aria-hidden="true"
      />

      <div class="v-event-countdown__status">
        <span
          class="v-event-countdown__status-text v-event-countdown__status-text--live"
        >
          Happening Now
        </span>
      </div>
    </template>

    <template v-else>
      <VIcon
        name="fal fa-calendar-check"
        size="24px"
        color="white"
        class="v-event-countdown__icon"
        aria-hidden="true"
      />
      <div class="v-event-countdown__status">
        <span
          class="v-event-countdown__status-text v-event-countdown__status-text--ended"
        >
          This event has ended
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import VIcon from '@/components/VIcon/VIcon.vue'
import type { Event, EventsSettings } from '@/types/events'

// Props
const props = defineProps<{
  event: Event
  eventsSettings: EventsSettings
}>()

// Emits
const emit = defineEmits<{
  statusChange: [status: string]
}>()

// Types
interface CountdownValues {
  days: string
  hours: string
  minutes: string
  seconds: string
}

// Refs
const countdownValues = ref<CountdownValues>({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00'
})
const currentTime = ref(Date.now())
const timerInterval = ref<number | null>(null)

// Computed
const startingSoonThreshold = computed(() => {
  return parseInt(props.eventsSettings.startingSoonThreshold)
})

// Event start and end timestamps
const eventStartTime = computed(() => {
  const startTimeString = props.event.eventDetails.eventStart
  return new Date(startTimeString).getTime()
})

const eventEndTime = computed(() => {
  const endTimeString = props.event.eventDetails.eventEnd
  return new Date(endTimeString).getTime()
})

// Calculate current status: upcoming, startingSoon, live, or ended
const status = computed(() => {
  const now = currentTime.value
  if (now < eventStartTime.value) {
    const diffMs = eventStartTime.value - now
    const minutesRemaining = diffMs / (1000 * 60)
    if (minutesRemaining <= startingSoonThreshold.value) {
      return 'startingSoon'
    }
    return 'upcoming'
  } else if (now >= eventStartTime.value && now < eventEndTime.value) {
    return 'live'
  } else {
    return 'ended'
  }
})

// Show days in mobile view only if days > 0
const showMobileDays = computed(() => {
  return parseInt(countdownValues.value.days) > 0
})

// Computed for class binding
const statusClasses = computed(() => ({
  'v-event-countdown--upcoming': status.value === 'upcoming',
  'v-event-countdown--starting-soon': status.value === 'startingSoon',
  'v-event-countdown--live': status.value === 'live',
  'v-event-countdown--ended': status.value === 'ended'
}))

// Computed for aria label
const ariaLabelText = computed(() => {
  if (status.value === 'upcoming' || status.value === 'startingSoon') {
    return `Event starts in ${countdownValues.value.days} days, ${countdownValues.value.hours} hours, ${countdownValues.value.minutes} minutes, and ${countdownValues.value.seconds} seconds`
  } else if (status.value === 'live') {
    return 'Event is happening now'
  } else {
    return 'This event has ended'
  }
})

// Computed for dynamic hour label
const hoursLabel = computed(() => {
  return countdownValues.value.hours === '01' ? 'hour' : 'hours'
})

// Methods
const updateCountdown = () => {
  currentTime.value = Date.now()
  const now = currentTime.value
  let diff = 0
  if (status.value === 'upcoming' || status.value === 'startingSoon') {
    diff = eventStartTime.value - now
  } else if (status.value === 'live') {
    diff = eventEndTime.value - now
  } else {
    if (timerInterval.value !== null) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    return
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  countdownValues.value = {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
}

// Watchers
watch(
  status,
  (newStatus) => {
    emit('statusChange', newStatus)
  },
  { immediate: true }
)

// Lifecycle hooks
onMounted(() => {
  updateCountdown()

  if (timerInterval.value === null) {
    timerInterval.value = setInterval(
      updateCountdown,
      1000
    ) as unknown as number // Start the timer interval
  }
})

// Clean up interval on component unmount
onBeforeUnmount(() => {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
})
</script>

<style lang="scss" scoped>
.v-event-countdown {
  display: inline-flex;
  border-radius: var(--q-widget-radius);
  overflow: hidden;
  background-color: var(--v-accessible-background);
  color: white;
  padding: 12px 16px;
  gap: 16px;
  align-items: center;
  &__items {
    display: flex;
    align-items: center;
    gap: 12px;
    &--desktop {
      display: flex;
      @media (max-width: 280px) {
        display: none;
      }
    }
    &--mobile {
      display: none;
      gap: 8px;
      @media (max-width: 280px) {
        display: flex;
      }
    }
  }
  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 40px;
    @media (max-width: 280px) {
      min-width: 30px;
    }
    &-value {
      font-size: var(--q-body-xx-big-fontSize);
      font-weight: 700;
      line-height: 1.2;
      @media (max-width: 280px) {
        font-size: var(--q-body-big-fontSize);
      }
    }
    &-label {
      font-size: var(--q-body-x-small-fontSize);
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
    }
  }
  &__status {
    display: flex;
    align-items: center;
    &-text {
      color: white;
      font-size: var(--q-body-small-fontSize);
      &--live {
        font-weight: 700;
      }
      &--ended {
        font-weight: 500;
      }
    }
  }
  @media (max-width: 280px) {
    padding: 8px 12px;
    gap: 8px;
  }
}
</style>
