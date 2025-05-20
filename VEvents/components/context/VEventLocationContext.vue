<template>
  <div
    class="event-context"
    :class="{ 'event-context--session': session }"
    role="group"
  >
    <div class="icon-wrapper" :style="iconWrapperStyle">
      <VIcon
        :size="session ? '24px' : '14px'"
        :name="iconName"
        :color="session ? colors.secondaryColor.name : 'black'"
        aria-hidden="true"
      />
    </div>

    <span
      :key="`text-${uniqueKey}`"
      :class="['badge', bgClass]"
      role="status"
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
  eventDetails?: EventDetails
  eventsSettings: EventsSettings
  session?: boolean
  // New prop to check if the badge is already shown on the card
  badgeShown?: boolean
}

const props = defineProps<Props>()

// Computed properties
const colors = computed(() => props.eventsSettings.colors)

// Styling
const iconWrapperStyle = computed(() => {
  return props.session
    ? { backgroundColor: `${colors.value.secondaryColor.name}1A` }
    : {}
})

// Helper function to generate a badge class
const getClasses = (variant: string) => `badge-${variant}`

// Config for each location type
const locationConfigs = {
  live: {
    text: 'Live Now',
    class: getClasses('positive'),
    icon: props.session ? 'fas fa-tower-broadcast' : 'fal fa-tower-broadcast',
    getAriaLabel: (text: string) => `This event is ${text}`,
    getText: () => 'Live Now'
  },
  'on-demand': {
    text: 'On Demand',
    class: getClasses('negative'),
    icon: props.session ? 'fas fa-bolt' : 'fal fa-bolt',
    getAriaLabel: (text: string) => `This event is ${text}`,
    getText: () => 'On Demand'
  },
  'on-campus': {
    text: 'On Campus',
    class: getClasses('info'),
    icon: props.session ? 'fas fa-location-dot' : 'fal fa-location-dot',
    getAriaLabel: (text: string) => `This event is ${text}`,
    getText: () => 'On Campus'
  },
  virtual: {
    text: 'Virtual',
    class: getClasses('info'),
    icon: props.session ? 'fas fa-laptop-mobile' : 'fal fa-laptop-mobile',
    getAriaLabel: (text: string) => `This event is ${text}`,
    getText: () => 'Virtual'
  }
}

// Determine which configuration to use based on event details
const locationStatus = computed(() => {
  if (!props.eventDetails) return 'virtual' // Default to Virtual

  const { isLive, onLocation, eventType } = props.eventDetails

  // Modified logic: If isLive is true, but don't show it in the context
  // if it's already shown as a badge on the card
  if (isLive && props.session) {
    // Always show live status in session view
    return 'live'
  } else if (isLive && !props.badgeShown) {
    // Show live status in card only if badge is not shown
    return 'live'
  } else if (onLocation) {
    return 'on-campus' // On Campus
  } else if (eventType === 'on-demand') {
    return 'on-demand' // On Demand
  } else {
    return 'virtual' // Virtual
  }
})

// Get the selected config based on location status
const selectedConfig = computed(() => locationConfigs[locationStatus.value])

// Computed properties for display
const iconName = computed(() => selectedConfig.value.icon)
const bgClass = computed(() => selectedConfig.value.class)
const displayText = computed(() => selectedConfig.value.getText())
const ariaLabel = computed(() =>
  selectedConfig.value.getAriaLabel(displayText.value)
)

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
    & .badge-info,
    & .badge-positive,
    & .badge-negative {
      background-color: transparent;
      font-size: var(--q-body-fontSize);
      color: black;
    }
    & .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }
  }
}
</style>
