<template>
  <a
    class="event-context v-focus-a"
    :class="{ 'event-context--session': session }"
    :href="linkUrl"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${linkText} - Opens in a new window`"
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
      v-html="displayText"
    >
    </span>
  </a>
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
  linkIndex?: number
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

// Get the current link based on linkIndex
const currentLink = computed(() => {
  if (props.eventDetails?.additionalLink) {
    const linkIndex = props.linkIndex !== undefined ? props.linkIndex : 0
    if (props.eventDetails.additionalLink.length > linkIndex) {
      return props.eventDetails.additionalLink[linkIndex]
    }
  }
  return null
})

// Link text and URL with fallbacks
const linkText = computed(() => currentLink.value?.linkText || 'Link')
const linkUrl = computed(() => currentLink.value?.linkUrl || '#')

// Display properties
const iconName = computed(() => (props.session ? 'fas fa-link' : 'fal fa-link'))
const bgClass = computed(() => getClasses('link'))
const displayText = computed(() => linkText.value)

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
    & .badge-link {
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
