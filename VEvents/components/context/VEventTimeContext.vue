<template>
  <div
    class="event-context"
    :class="{ 'event-context--session': session }"
    role="group"
  >
    <!-- Icon wrapper -->
    <div class="icon-wrapper" :style="iconWrapperStyle">
      <VIcon
        :size="session ? '24px' : '14px'"
        :name="iconName"
        :color="session ? colors.secondaryColor.name : 'black'"
        aria-hidden="true"
      />
    </div>

    <!-- DateTime display -->
    <div
      v-if="isDatetime"
      :key="`datetime-${uniqueKey}`"
      :class="['badge-datetime', bgClass]"
      role="status"
      :aria-label="ariaLabel"
    >
      <div class="date-line">{{ dateDisplay }}</div>
      <div class="time-line">{{ timeDisplay }}</div>
    </div>

    <!-- Standard time display -->
    <span
      v-else
      :key="`text-${uniqueKey}`"
      :class="['badge', bgClass]"
      role="status"
      :aria-label="ariaLabel"
      v-html="displayText"
    >
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VIcon from '@/components/VIcon/VIcon.vue'
import type { EventDetails, EventsSettings } from '@/types/events'

// Props
interface Props {
  type?: 'time' | 'date' | 'datetime'
  eventDetails?: EventDetails
  eventsSettings: EventsSettings
  session?: boolean
}

const props = defineProps<Props>()

// Computed properties
const colors = computed(() => props.eventsSettings.colors)
const isDatetime = computed(() => props.type === 'datetime')

// Styling
const iconWrapperStyle = computed(() => {
  return props.session
    ? { backgroundColor: `${colors.value.secondaryColor.name}1A` }
    : {}
})

// Helper functions
function formatTimeFromISO(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
      .toLowerCase()
  } catch (e) {
    return isoString
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

// Helper function to generate a badge class
const getClasses = (variant: string) => `badge-${variant}`

// Config for time badges
const timeConfig = {
  class: getClasses('time'),
  icon: props.session ? 'fas fa-clock' : 'fal fa-clock',
  getAriaLabel: (text: string) => `Event time: ${text}`,
  getText: (details?: EventDetails) => {
    if (!details) return ''
    const { eventStart, eventEnd } = details

    if (eventStart && eventEnd) {
      return `${formatTimeFromISO(eventStart)} - ${formatTimeFromISO(eventEnd)}`
    } else if (eventStart) {
      return formatTimeFromISO(eventStart)
    } else if (eventEnd) {
      return formatTimeFromISO(eventEnd)
    }

    return ''
  }
}

// Date display computed
const dateDisplay = computed(() => {
  if (props.eventDetails?.eventStart) {
    return formatDate(props.eventDetails.eventStart)
  }
  return ''
})

// Time display computed
const timeDisplay = computed(() => {
  if (props.eventDetails) {
    const { eventStart, eventEnd } = props.eventDetails

    if (eventStart && eventEnd) {
      return `${formatTimeFromISO(eventStart)} - ${formatTimeFromISO(eventEnd)}`
    } else if (eventStart) {
      return formatTimeFromISO(eventStart)
    }
  }
  return ''
})

// Icon, class and text computed properties
const iconName = computed(() => {
  if (props.type === 'date' || props.type === 'datetime') {
    return props.session ? 'fas fa-calendar-days' : 'fal fa-calendar-days'
  }
  return timeConfig.icon
})

const bgClass = computed(() => timeConfig.class)

const displayText = computed(() => {
  if (props.type === 'date' && props.eventDetails?.eventStart) {
    return formatDate(props.eventDetails.eventStart)
  } else if (props.type === 'datetime' && props.eventDetails) {
    const { eventStart, eventEnd } = props.eventDetails
    let result = ''

    if (eventStart) {
      result = formatDate(eventStart)

      if (eventStart && eventEnd) {
        return `${result}, ${formatTimeFromISO(eventStart)} - ${formatTimeFromISO(eventEnd)}`
      } else if (eventStart) {
        return `${result}, ${formatTimeFromISO(eventStart)}`
      }

      return result
    }

    return ''
  }

  return timeConfig.getText(props.eventDetails)
})

const ariaLabel = computed(() => {
  if (props.type === 'datetime' && props.eventDetails) {
    return `Event scheduled for ${dateDisplay.value} at ${timeDisplay.value}`
  }
  return timeConfig.getAriaLabel(displayText.value)
})

const uniqueKey = computed(() => {
  return `${bgClass.value}-${displayText.value}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
})
</script>

<style lang="scss" scoped>
.event-context {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  text-decoration: none;
  & .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .badge {
    display: flex;
    justify-content: center;
    background-color: transparent;
    text-decoration: none;
  }
  & span {
    font-size: var(--q-body-small-fontSize);
  }
  &--session {
    width: fit-content;
    display: flex;
    gap: 12px;
    & .badge-time,
    & .badge-date,
    & .badge-datetime {
      background-color: transparent;
      font-size: var(--q-body-fontSize);
      color: black;
    }
    & .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }
    & .badge-datetime {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      & .date-line {
        font-size: var(--q-body-big-fontSize);
        font-weight: 500;
      }
      & .time-line {
        font-size: var(--q-body-fontSize);
      }
    }
  }
}
</style>
