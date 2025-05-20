<template>
  <div
    class="v-event-card"
    tabindex="0"
    role="button"
    :aria-label="eventTitle"
    :data-event-id="event.node.databaseId || event.node.id || ''"
    @click="handleCardClick"
    @keydown="handleKeyDown"
  >
    <div class="v-event-card__image">
      <VImage
        v-if="featuredImage"
        :alt="featuredImage.node.altText || `Image for ${eventTitle}`"
        :src="featuredImage.node.sourceUrl"
        :ratio="'auto'"
      ></VImage>
      <VEventBadge
        v-if="eventDetails.isLive"
        type="live"
        :colour="{ name: '#22C55E', light: false }"
      />
      <VEventBadge
        v-if="eventDetails.isSoon"
        type="soon"
        :colour="colors.primaryColor"
      />
      <VIconButton
        class="v-event-card__image__like-button v-focus-a"
        :aria-label="isLiked ? 'Remove from favorites' : 'Add to favorites'"
        :icon-color="isLiked ? 'red' : 'black'"
        :icon-hover-color="isLiked ? 'black' : 'red'"
        :background-color="'white'"
        :background-hover-color="'white'"
        :icon-name="isLiked ? 'fas fa-heart' : 'far fa-heart'"
        :size="'34px'"
        @click.stop="handleLikeClick"
      >
      </VIconButton>
    </div>
    <div class="v-event-card__details">
      <div class="v-event-card__details__date">
        <div class="v-event-card__details__date__month">
          <time
            v-if="formattedDate.startMonth"
            class="v-event-card__details__date__month__start"
            :style="{ color: colors.secondary2Color.name }"
            :datetime="eventDetails.startDate"
            v-html="formattedDate.startMonth"
          ></time>
          <p
            v-if="formattedDate.endMonth"
            class="v-event-card__details__date__month__hyphen"
            :style="{ color: colors.secondary2Color.name }"
          >
            -
          </p>
          <time
            v-if="formattedDate.endMonth"
            class="v-event-card__details__date__month__start"
            :style="{ color: colors.secondary2Color.name }"
            :datetime="eventDetails.endDate"
            v-html="formattedDate.endMonth"
          ></time>
        </div>
        <div class="v-event-card__details__date__day">
          <time
            v-if="formattedDate.startDay"
            class="v-event-card__details__date__day__start"
            :style="{ color: colors.textColor.name }"
            :datetime="eventDetails.startDate"
            v-html="formattedDate.startDay"
          ></time>
          <p
            v-if="formattedDate.endDay"
            class="v-event-card__details__date__day__hyphen"
            :style="{ color: colors.textColor.name }"
          >
            -
          </p>
          <time
            v-if="formattedDate.endDay"
            class="v-event-card__details__date__day__start"
            :style="{ color: colors.textColor.name }"
            :datetime="eventDetails.endDate"
            v-html="formattedDate.endDay"
          ></time>
        </div>
      </div>

      <div class="v-event-card__details__content">
        <div class="v-event-card__details__content__top">
          <h3
            class="v-event-card__details__content__top__title"
            :style="{ color: colors.textColor.name }"
            v-html="eventTitle"
          ></h3>
        </div>
        <div class="v-event-card__details__content__top__context">
          <VEventTimeContext
            type="time"
            :event-details="eventDetails"
            :events-settings="eventsSettings"
            :style="{ color: colors.contextTextColour.name }"
          ></VEventTimeContext>
          <VEventLocationContext
            :event-details="eventDetails"
            :events-settings="eventsSettings"
            :badge-shown="eventDetails.isLive"
            :style="{ color: colors.contextTextColour.name }"
          ></VEventLocationContext>
        </div>
        <p
          v-if="eventDetails.eventShortDescription"
          :class="['v-event-card__details__content__short-description']"
          :style="{ color: colors.contextTextColour.name }"
          v-html="eventDetails.eventShortDescription"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VImage from '@/components/VImage/VImage.vue'
import VEventTimeContext from '@/components/VEvents/components/context/VEventTimeContext.vue'
import VEventLocationContext from '@/components/VEvents/components/context/VEventLocationContext.vue'
import VIconButton from '@/components/VIconButton/VIconButton.vue'
import VEventBadge from '@/components/VEvents/components/status/VEventBadge.vue'
import { formatEventDate } from '@/utils/date-formatter'
import type { EventNode, EventsSettings, Event } from '@/types/events'

// Props
const props = defineProps<{
  event: EventNode
  eventsSettings: EventsSettings
}>()

// Emits
const emit = defineEmits<{
  cardClick: [event: Event]
  likeClick: [event: Event]
}>()

// Computed for simplified props access
const colors = computed(() => props.eventsSettings.colors)
const eventTitle = computed(() => props.event.node.title)
const eventDetails = computed(() => props.event.node.eventDetails)
const featuredImage = computed(() => props.event.node.featuredImage)
const isLiked = computed(() => eventDetails.value.isLiked)

// Use the formatEventDate utility function to compute the formatted date
const formattedDate = computed(() => {
  if (!eventDetails.value.startDate) {
    return eventDetails.value.formattedDate || {} // Check if we have date data to format, if the component already has formatted date data, use that
  }
  return formatEventDate(
    eventDetails.value.startDate,
    eventDetails.value.endDate
  ) // Otherwise, format the dates using our utility
})

// Methods
const handleCardClick = () => {
  emit('cardClick', props.event.node)
}

const handleLikeClick = () => {
  emit('likeClick', props.event.node)
}

// Handle keyboard interactions
const handleKeyDown = (event: KeyboardEvent) => {
  // Trigger click on Enter or Space key
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault() // Prevent page scroll on space
    handleCardClick()
  }
}
</script>

<style lang="scss" scoped>
.v-event-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: var(--events-border-radius);
  margin: 0;
  background-color: white;
  box-shadow:
    0px 1px 14px 0px rgba(0, 0, 0, 0.12),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 3px 5px -1px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  &:focus {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
  &__image {
    position: relative;
    height: 190px;
    width: 100%;
    overflow: hidden;
    flex-shrink: 0;
    & :deep(.v-image) {
      height: 100%;
    }
    &__like-button {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1;
    }
  }
  &__details {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 15px;
    flex-grow: 1;
    * {
      line-height: normal;
    }
    &__date {
      display: flex;
      flex-shrink: 0;
      flex-direction: column;
      align-items: center;
      & * {
        font-weight: 600;
      }
      &__month {
        text-transform: uppercase;
        font-size: var(--q-body-fontSize);
      }
      &__day {
        * {
          font-size: var(--q-body-x-big-fontSize);
          font-weight: 700;
        }
      }
      & div {
        display: flex;
        gap: 2px;
      }
    }
    &__content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      &__top {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        gap: 0.25rem;
        &__title {
          font-weight: 600;
          font-size: var(--q-body-fontSize);
        }
        &__context {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          & * {
            font-size: var(--q-body-small-fontSize);
          }
        }
      }
      &__short-description {
        font-size: var(--q-body-small-fontSize);
      }
    }
  }
}
</style>
