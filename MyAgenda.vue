<template>
  <VCardHolder
    :events="myAgenda"
    :events-settings="processedEventsSettings"
    :computed-buttons="computedButtons"
    @card-click="handleCardClick"
    @like-click="handleLikeClick"
  ></VCardHolder>
</template>

<script setup>
import { ref, computed, inject, nextTick } from 'vue'
import { useQuery } from 'villus'
import { eventQueries } from 'src/queries'
import { useAuthStore } from 'stores/auth'
import { useBaseStore } from 'stores/base'
import { useMainStore } from 'src/stores/main'
import { date } from 'quasar'
import { getButtonClass } from 'src/helpers'
const { formatDate } = date

const settings = inject('settings').value
const { defaults, eventsSettings, buttons } = settings || {}
const { fallbackImage } = defaults || {}

import { VCardHolder } from 'VeppleLib'

const authStore = useAuthStore()
const baseStore = useBaseStore()
const mainStore = useMainStore()
const pushToDataLayer = inject('$pushToDataLayer')

// Calculate current date in the required format
const dateNow = computed(() => {
  const timeStamp = Date.now()
  return formatDate(timeStamp, 'YYYY-MM-DD').toString()
})

// Get list of favorited event IDs from the user
const likedEvents = computed(() => {
  const favouritedContent =
    authStore.currentUser?.tracking.favouritedContent || []
  // Extract just the IDs from favouritedContent
  return favouritedContent.map((item) => item.id)
})

// Compute button styles to match the rest of the app
const computedButtons = computed(() => {
  let transformed = {}
  // If button fields are updated
  if (settings.buttons && settings.buttons.length > 0) {
    transformed = {
      primaryStyle: {
        buttonStyle: settings.buttons[0].btnName,
        buttonClass: getButtonClass(settings.buttons[0].btnName)
      },
      secondaryStyle: {
        buttonStyle: settings.buttons[0].btnName,
        buttonClass: getButtonClass(settings.buttons[0].btnName)
      }
    }
  }
  return transformed
})

// Process event settings to ensure colors are properly set
const processedEventsSettings = computed(() => {
  // Make a copy to avoid modifying the original
  return {
    ...eventsSettings,
    // Ensure colors are properly set
    colors: eventsSettings?.colors || {}
  }
})

const myAgenda = ref([])

// Fetch user's favorited events
useQuery({
  query: eventQueries.myAgendaQuery,
  variables: computed(() => ({
    language: baseStore.language.value.toUpperCase(),
    dateNow: dateNow.value,
    idArray: likedEvents.value
  })),
  skip: computed(() => !authStore.currentUser || !likedEvents.value.length),
  onData: (data) => {
    myAgenda.value = data.events.edges.map(({ node, ...rest }) => ({
      ...rest,
      node: {
        ...node,
        title: node.eventDetails?.displayName || node.title,
        featuredImage: node.featuredImage || {
          node: {
            altText: fallbackImage?.alt || '',
            sourceUrl: fallbackImage?.url || ''
          }
        },
        eventDetails: {
          ...(node.eventDetails || {}),
          isLiked: true // Set all agenda events as liked
        }
      }
    }))
  }
})

// Handle click on event card - navigate to event details
const handleCardClick = (event) => {
  handleDataLayer({
    name: 'viewEventClick',
    eventTitle: event.title,
    eventId: event.databaseId || event.id,
    eventDate: event.eventDetails?.eventStart || '',
    eventType: event.eventDetails?.eventType || ''
  })
}

// Handle like/unlike action
const handleLikeClick = (event) => {
  const currentUser = authStore.currentUser
  const id = event.databaseId || event.id
  const path = window.location.pathname
  const postSlug = event.slug
  const postTitle = event.title

  if (currentUser) {
    const query = window.location.search
    const url = `${path}${query}`
    const favouritedContent = currentUser?.tracking?.favouritedContent || []
    const like = favouritedContent.find((item) => item.id === id)

    // Toggle like status
    authStore.HANDLE_USER_FAVOURITES({
      id,
      url,
      postSlug,
      postTitle
    })

    // Track the action in analytics
    handleDataLayer({
      name: like ? 'removeFromAgenda' : 'addToAgenda',
      eventTitle: event.title,
      eventId: id
    })
  } else {
    mainStore.TOGGLE_AUTH_MODAL()
  }
}

// Send analytics data
async function handleDataLayer(payload) {
  await nextTick()

  pushToDataLayer({
    event: 'eventsInteraction',
    ...payload
  })
}
</script>

<style lang="scss" scoped>
.v-card-holder {
  --events-border-radius: var(--q-widget-radius, 20px);
}
</style>
