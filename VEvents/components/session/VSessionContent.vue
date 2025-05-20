<template>
  <div class="v-session-content">
    <div class="v-session-content__main-section">
      <VSessionHeader
        :computed-buttons="computedButtons"
        :login-enabled="loginEnabled"
        :is-map-view="isMapView"
        @back-click="$emit('backClick')"
        @update-show-agenda="$emit('updateShowAgenda', $event)"
      />

      <div class="v-session-content__main-section__content" role="main">
        <VSessionMedia
          :event="event"
          :events-settings="eventsSettings"
          :event-status="eventStatus"
          :is-mobile="isMobile"
          @status-change="$emit('statusChange', $event)"
        />

        <div class="v-session-content__main-section__content__info">
          <VSessionActionsBar
            :event="event"
            :events-settings="eventsSettings"
            @like-click="$emit('likeClick')"
          />

          <div
            class="v-session-content__main-section__content__info__context-wrapper"
          >
            <VSessionContextBar
              :event="event"
              :events-settings="eventsSettings"
            />
            <VSessionLaunchButton
              class="v-session-content__main-section__content__info__context-wrapper__launch-button"
              :event="event"
              :events-settings="eventsSettings"
              :computed-buttons="computedButtons"
              :can-launch-event="canLaunchEvent"
              :is-mobile="isMobile"
              @watch-click="$emit('watchClick')"
            />
          </div>

          <VSessionDescription :event="event" />

          <!-- Always display the map without the adjacent chat -->
          <VSessionMap
            :event="event"
            :map-settings="mapSettings"
            @navigation-request="$emit('navigationRequest', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VSessionHeader from '@/components/VEvents/components/headers/VSessionHeader.vue'
import VSessionMedia from '@/components/VEvents/components/media/VSessionMedia.vue'
import VSessionActionsBar from '@/components/VEvents/components/actions/VSessionActionsBar.vue'
import VSessionContextBar from '@/components/VEvents/components/context/VSessionContextBar.vue'
import VSessionLaunchButton from '@/components/VEvents/components/actions/VSessionLaunchButton.vue'
import VSessionDescription from '@/components/VEvents/components/media/VSessionDescription.vue'
import VSessionMap from '@/components/VEvents/components/media/VSessionMap.vue'
import type {
  Event,
  EventsSettings,
  ComputedButtons,
  MapSettings
} from '@/types/events'

// Props
const props = defineProps<{
  computedButtons: ComputedButtons
  event: Event
  eventsSettings: EventsSettings
  loginEnabled?: boolean
  mapSettings?: MapSettings
  isMapView?: boolean
  eventStatus: string
  canLaunchEvent: boolean
  isMobile: boolean
  isFullStackView: boolean
  showChat: boolean
}>()

// Emits
const emit = defineEmits<{
  likeClick: []
  backClick: []
  updateShowAgenda: [show: boolean]
  statusChange: [status: string]
  navigationRequest: [request: { path: string; data: any }]
  watchClick: []
}>()
</script>

<style lang="scss" scoped>
.v-session-content {
  width: 100%;
  &__main-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    &__content {
      display: flex;
      flex-direction: column;
      &__info {
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 16px;
        &__context-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          &__launch-button {
            align-self: flex-start;
            max-width: 240px;
          }
        }
        @media only screen and (min-width: 600px) and (max-width: 1023px) {
          &__context-wrapper {
            &__launch-button {
              max-width: 50%;
              width: 50%;
            }
          }
        }
        @media only screen and (max-width: 599px) {
          padding: 16px 0px 0px;

          &__context-wrapper {
            &__launch-button {
              max-width: none;
              width: 100%;
            }
          }
        }
      }
    }
  }
  &__blocks {
    display: flex;
    width: 100%;
    gap: 16px;
    &__map,
    &__chat {
      width: 50%;
      min-height: 300px;
    }
  }
}
</style>
