<template>
  <div v-if="hasValidLocation" class="v-session-map">
    <VIconButton
      class="v-session-map__direction-button v-focus-a"
      aria-label="Open location on map"
      :icon-hover-color="'white'"
      :icon-name="'fas fa-diamond-turn-right'"
      @click="navigateToMapLocation"
    ></VIconButton>
    <VMap
      class="v-session-map__content"
      :pager="locationPager"
      :options="mapOptions"
      :geo-json="locationGeoJson"
      :compact="true"
      :aria-label="`Map showing location for ${event.title}`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import VIconButton from '@/components/VIconButton/VIconButton.vue'
import VMap from '@/components/VMap/VMap.vue'
import type { Pager } from '@/types'
import type { Event, MapSettings } from '@/types/events'

// Props
const props = defineProps<{
  event: Event
  mapSettings?: MapSettings
}>()

// Emits
const emit = defineEmits<{
  navigationRequest: [request: { path: string; data: any }]
}>()

// Computed properties
const eventDetails = computed(() => props.event.eventDetails)

// Map related computed properties
const hasValidLocation = computed(() => {
  return Boolean(
    props.event.locationSettings?.location &&
      props.event.locationSettings?.coords?.latitude &&
      props.event.locationSettings?.coords?.longitude
  )
})

// Method to navigate to map location
const navigateToMapLocation = () => {
  if (hasValidLocation.value) {
    emit('navigationRequest', {
      path: `/map/${props.event.slug || props.event.databaseId}`,
      data: props.event
    })
  }
}

const locationGeoJson = computed(() => {
  if (!hasValidLocation.value)
    return { type: 'FeatureCollection', features: [] }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: props.event.databaseId,
        geometry: {
          type: 'Point',
          coordinates: [
            props.event.locationSettings?.coords?.longitude ?? 0,
            props.event.locationSettings?.coords?.latitude ?? 0
          ]
        },
        properties: {
          title: eventDetails.value.displayName || props.event.title,
          mapMarkerIconColor: props.mapSettings?.markerTextColor,
          mapMarkerBackgroundColor: props.mapSettings?.markerBgColor,
          mapMarkerIcon: props.event.locationSettings?.markerIcon ?? ''
        }
      }
    ]
  }
})

// Location items for the pager
const currentCoords = computed(() => {
  if (!hasValidLocation.value) {
    return null
  }

  return [
    props.event.locationSettings?.coords?.longitude ?? 0,
    props.event.locationSettings?.coords?.latitude ?? 0
  ]
})

// Location pager state
const locationItems = ref([
  {
    coords: currentCoords.value,
    databaseId: props.event.databaseId,
    title: props.event.title || 'Event Location',
    idx: 0
  }
])

const currentLocation = ref({
  coords: currentCoords.value,
  databaseId: props.event.databaseId
})

const nickIndex = ref<number>(0)
const totalLocations = ref<number>(1)
const isFirstItem = ref<boolean>(true)
const isLastItem = ref<boolean>(true)
const isPlaying = ref<boolean>(false)
const viewedIndices = ref<Set<number>>(new Set([0]))
const viewedItems = ref<Set<any>>(new Set([props.event.databaseId]))
const callbacks = ref<Array<(state: any) => void>>([])
const isMapCallbacksSafe = ref<boolean>(false)

// Set a delay before attempting to use map callbacks
nextTick(() => {
  isMapCallbacksSafe.value = true
})

// Location pager for map navigation
const locationPager = computed<Pager>(() => {
  return {
    current: currentLocation,
    items: locationItems,
    nick: nickIndex,
    total: totalLocations,
    isFirst: isFirstItem,
    isLast: isLastItem,
    isPlaying: isPlaying,
    viewedIndices: viewedIndices.value,
    viewedItems: viewedItems.value,
    pick: () => {},
    next: () => {},
    prev: () => {},
    isIndexViewed: (index: number) => {
      return viewedIndices.value.has(index)
    },
    isItemViewed: (id: number | string, key = 'databaseId') => {
      if (key === 'databaseId') {
        return viewedItems.value.has(id)
      }
      return true
    },
    registerCallback: (callback: (state: any) => void) => {
      callbacks.value.push(callback)
      if (hasValidLocation.value && currentCoords.value) {
        nextTick(() => {
          try {
            callback({
              current: currentLocation.value,
              nick: nickIndex.value,
              isFirst: isFirstItem.value,
              isLast: isLastItem.value,
              total: totalLocations.value
            })
          } catch (error) {
            console.warn(error)
          }
        })
      }
    },
    unregisterCallback: (callback: () => void) => {
      const index = callbacks.value.indexOf(callback as any)
      if (index !== -1) {
        callbacks.value.splice(index, 1)
      }
    },
    togglePlay: () => {
      isPlaying.value = !isPlaying.value
    }
  }
})

const mapOptions = computed(() => {
  return {
    scrollZoom: false,
    ...props.mapSettings
  }
})
</script>

<style lang="scss" scoped>
.v-session-map {
  position: relative;
  &__content {
    aspect-ratio: 4/3;
    position: relative;
    border-radius: var(--q-widget-radius);
    overflow: hidden;
  }
  &__direction-button {
    position: absolute;
    z-index: 1;
    left: 0.5rem;
    bottom: 0.5rem;
    background-color: var(--v-accessible-background) !important;
  }
}
</style>
