<template>
  <div class="v-session-actions-bar">
    <div class="v-session-actions-bar__title">
      <h1 v-if="title" :style="{ color: textColor }" v-html="title"></h1>
    </div>
    <div
      class="v-session-actions-bar__buttons"
      role="toolbar"
      aria-label="Event actions"
    >
      <VIconButton
        :aria-label="isLiked ? 'Remove from favorites' : 'Add to favorites'"
        :icon-color="isLiked ? 'red' : 'white'"
        :icon-hover-color="isLiked ? 'white' : 'red'"
        :background-color="'black'"
        :background-hover-color="'black'"
        :icon-name="isLiked ? 'fas fa-heart' : 'far fa-heart'"
        :size="'34px'"
        class="v-session-actions-bar__buttons__like-button v-focus-a"
        @click="$emit('likeClick')"
      />
      <VIconButton
        aria-label="Add event to calendar"
        :icon-color="'white'"
        :icon-hover-color="'white'"
        :background-color="'black'"
        :background-hover-color="'black'"
        :icon-name="'far fa-cloud-download'"
        :size="'34px'"
        class="v-session-actions-bar__buttons__download-button v-focus-a"
        @click="handleDownloadEvent"
      />
      <VIconButton
        aria-label="Share event"
        :icon-color="'white'"
        :icon-hover-color="'white'"
        :background-color="'black'"
        :background-hover-color="'black'"
        :icon-name="'far fa-share-from-square'"
        :size="'34px'"
        class="v-session-actions-bar__buttons__share-button v-focus-a"
        @click="handleShareEvent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VIconButton from '@/components/VIconButton/VIconButton.vue'
import type { Event, EventsSettings } from '@/types/events'
import { downloadEvent } from '@/components/VEvents/utils/calendarUtils'
import { shareEvent } from '@/components/VEvents/utils/shareUtils'

// Props
const props = defineProps<{
  event: Event
  eventsSettings: EventsSettings
}>()

// Emits
const emit = defineEmits<{
  likeClick: []
}>()

// Computed properties
const colors = computed(() => props.eventsSettings.colors)
const textColor = computed(() => colors.value.textColor.name)
const title = computed(() => props.event.title)
const eventDetails = computed(() => props.event.eventDetails)
const isLiked = computed(() => eventDetails.value.isLiked)

// Methods
const handleDownloadEvent = () => {
  downloadEvent(props.event)
}

const handleShareEvent = () => {
  shareEvent(props.event)
}
</script>

<style lang="scss" scoped>
.v-session-actions-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  &__title {
    h1 {
      font-weight: 600;
      font-size: var(--q-body-xxx-big-fontSize);
    }
  }
  &__buttons {
    display: flex;
    gap: 12px;
    &__like-button,
    &__download-button,
    &__share-button {
      background-color: var(--v-accessible-background) !important;
    }
  }
  @media only screen and (max-width: 1023px) {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
