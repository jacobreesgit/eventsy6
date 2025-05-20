<template>
  <div
    class="event-context"
    :class="{ 'event-context--session': session }"
    role="group"
  >
    <div class="presenter-image">
      <img
        v-if="hasPresenterImage"
        :src="presenterImageSrc"
        :alt="`Presenter: ${presenterName}`"
        class="presenter-avatar"
      />
      <div
        v-else
        :style="presenterPlaceholderStyle"
        class="presenter-placeholder"
        aria-hidden="true"
        v-html="presenterInitials"
      ></div>
    </div>

    <span
      :key="`presenter-${uniqueKey}`"
      :class="['badge', 'badge-presenter']"
      role="status"
      v-html="presenterName"
    >
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventDetails, EventsSettings } from '@/types/events'

// Props
interface Props {
  eventDetails?: EventDetails
  eventsSettings: EventsSettings
  session?: boolean
  presenterIndex?: number
}

const props = defineProps<Props>()

// Computed properties
const colors = computed(() => props.eventsSettings.colors)

// Get the current presenter based on presenterIndex
const currentPresenter = computed(() => {
  if (
    props.eventDetails?.presenterInformation &&
    props.presenterIndex !== undefined &&
    props.eventDetails.presenterInformation.length > props.presenterIndex
  ) {
    return props.eventDetails.presenterInformation[props.presenterIndex]
  }
  return null
})

// Safe presenter properties with null checks
const hasPresenterImage = computed(() => {
  return Boolean(currentPresenter.value?.image?.sourceUrl)
})

const presenterImageSrc = computed(() => {
  return currentPresenter.value?.image?.sourceUrl || ''
})

const presenterName = computed(() => {
  return currentPresenter.value?.name || 'Unknown Presenter'
})

// Helper function to get presenter initials
const presenterInitials = computed(() => {
  if (!currentPresenter.value?.name) return ''

  return currentPresenter.value.name
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

// Styling
const presenterPlaceholderStyle = computed(() => {
  return currentPresenter.value && !hasPresenterImage.value
    ? {
        color: `${colors.value.secondaryColor.name}`,
        backgroundColor: `${colors.value.secondaryColor.name}1A`
      }
    : {}
})

// Badge class and aria label
const ariaLabel = computed(() => `Event presenter: ${presenterName.value}`)

const uniqueKey = computed(() => {
  return `presenter-${presenterName.value}`
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
    & .badge-presenter {
      background-color: transparent;
      font-size: var(--q-body-fontSize);
      color: black;
    }
    & .presenter-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      overflow: hidden;
      & .presenter-avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      & .presenter-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-weight: 600;
        font-size: var(--q-body-big-fontSize);
      }
    }
  }
}
</style>
