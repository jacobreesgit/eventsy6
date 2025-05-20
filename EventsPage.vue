<template>
  <q-page
    class="events"
    :class="{
      'session-view': isSessionView,
      'main-view': !isSessionView,
      'with-qa-section': hasQaSection,
      'with-no-qa-section': !hasQaSection
    }"
  >
    <EventUpdate
      v-if="events.length"
      :events="events.map((item) => item.node)"
      :interval="60000"
      @status="onStatusUpdate"
      @progress="onProgressUpdate"
    ></EventUpdate>

    <VEventsViewer
      ref="eventsViewer"
      :style="{
        '--q-body-x-small-fontSize': `calc(var(--v-${textSize}) * 0.75)`,
        '--q-body-small-fontSize': `calc(var(--v-${textSize}) * 0.875)`,
        '--q-body-medium-fontSize': `calc(var(--v-${textSize}) * 0.9375)`,
        '--q-body-fontSize': `var(--v-${textSize})`,
        '--q-body-big-fontSize': `calc(var(--v-${textSize}) * 1.125)`,
        '--q-body-x-big-fontSize': `calc(var(--v-${textSize}) * 1.25)`,
        '--q-body-xx-big-fontSize': `calc(var(--v-${textSize}) * 1.5)`,
        '--q-body-xxx-big-fontSize': `calc(var(--v-${textSize}) * 1.75)`
      }"
      :computed-buttons="computedButtons"
      :events="events"
      :events-settings="{ ...eventsSettings, colors: computedColors }"
      :login-enabled="baseStore.loginEnabled"
      :initial-sort="sortValue"
      :map-settings="processedMapSettings"
      :is-map-view="isMapRoute"
      :sort-options="sortOptions"
      :is-loading="isLoading"
      :should-open-tiktok="shouldOpenTiktok"
      @update-show-agenda="redirectToMySchedule"
      @card-click="handleCardClick"
      @like-click="handleLikeClick"
      @sort-change="handleSort"
      @navigation-request="handleNavigationRequest"
      @qa-section-visibility-change="handleQaSectionVisibilityChange"
      @tiktok-state-change="handleTiktokStateChange"
    ></VEventsViewer>
  </q-page>
</template>

<script setup>
import {
  computed,
  reactive,
  inject,
  nextTick,
  watch,
  getCurrentInstance,
  ref,
  onMounted
} from 'vue'
import { useQuasar, QSpinnerBars } from 'quasar'
import { eventQueries } from 'src/queries'
import { findSetting } from 'src/helpers'
import { getQueryVariables } from 'src/helpers/filters'
import { useBaseStore } from 'stores/base'
import { useAuthStore } from 'src/stores/auth'
import { useMainStore } from 'src/stores/main'
import { date } from 'quasar'
import EventUpdate from 'src/components/events/EventUpdate.vue'
import {
  handleTimezone,
  handleDate,
  getHexValue,
  getButtonClass
} from 'src/helpers'
import { useQuery } from 'villus'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { VEventsViewer } from 'VeppleLib'
import { onBeforeRouteLeave } from 'vue-router'

const { formatDate } = date
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const baseStore = useBaseStore()
const authStore = useAuthStore()
const mainStore = useMainStore()
const pushToDataLayer = inject('$pushToDataLayer')
const getString = inject('$getString')

// Map settings
const { markerBgColor, markerTextColor } = findSetting('mapSettings')
const processedMapSettings = computed(() => ({
  markerBgColor: getHexValue(markerBgColor),
  markerTextColor: getHexValue(markerTextColor)
}))

// UI references
const eventsViewer = ref(null)

// Route information
const isMapRoute = computed(() => route.path.includes('/map/'))
const locationId = computed(() => route.params.location_id)
const sessionSlug = computed(() => route.params.session_id)
const isAllEventsView = computed(() => route.params.events_id === 'all')

const eventsDataLoaded = ref(false)
const hasQaSection = ref(false)
const shouldOpenTiktok = ref(false)

// Load settings
const settings = inject('settings').value
const { eventsSettings, defaults } = settings || {}
const { enablePriority, defaultOrder, copy, buttons } = eventsSettings || {}
const { fallbackImage } = defaults || {}
const { typography } = settings || {}
const { styles } = typography || {}
const { body } = styles || {}
const { textSize } = body || {}

// Set meta tags
const handleMeta = inject('$handleMeta')
handleMeta({ title: copy?.title })

// Sort options
const sortOptions = [
  { label: 'Date', value: 'EVENT_START' },
  { label: 'A - Z', value: 'TITLE' }
]

if (enablePriority) {
  sortOptions.unshift({ label: 'Relevance', value: 'EVENT_PRIORITY' })
}

// Reactive state
const initialOrder =
  (defaultOrder === 'EVENT_PRIORITY' && !enablePriority) || !defaultOrder
    ? 'EVENT_START'
    : defaultOrder

const state = reactive({
  scheduledEvents: null,
  onDemandEvents: null,
  searchString: '',
  sortValue: initialOrder,
  eventStatuses: {},
  eventProgresses: {}
})

// Computed values
const sortValue = computed(() => state.sortValue)
const isLoading = computed(
  () =>
    fetchingScheduledEvents.value ||
    fetchingOnDemandEvents.value ||
    fetchingSession.value
)

// Mobile detection helper function
const isMobileDevice = () => window.innerWidth < 1024

// Date formatting utilities
const dateNow = computed(() => {
  const now = new Date()
  const nowString = formatDate(now, 'YYYY-MM-DD HH:mm:ss')
  const serverUnix = handleTimezone(nowString).serverUnix
  return formatDate(serverUnix, 'YYYY-MM-DD HH:mm:ss')
})

const queryVariables = computed(() => getQueryVariables())

// Data fetching queries
const { isFetching: fetchingScheduledEvents, refetch: refetchScheduledEvents } =
  useQuery({
    query: eventQueries.eventsQuery(
      queryVariables.value.declaration,
      queryVariables.value.taxArray
    ),
    variables: computed(() => ({
      ...queryVariables.value.variables,
      language: baseStore.language.value.toUpperCase(),
      dateNow: dateNow.value,
      eventType: 'scheduled',
      order: 'ASC',
      orderField: sortValue.value,
      search: state.searchString
    })),
    skip: computed(() => {
      // Only skip if we're not on relevant routes AND data is already loaded
      if (eventsDataLoaded.value) {
        return (
          !isAllEventsView.value &&
          !isMapRoute.value &&
          !route.path.includes('/events/all')
        )
      }
      // Don't skip if data hasn't been loaded yet
      return false
    }),
    onData: (res) => {
      const { edges } = res.events
      state.scheduledEvents = edges.map(({ node, ...rest }) => ({
        ...rest,
        node: {
          ...node,
          title: node.eventDetails?.displayName || node.title,
          eventType: 'scheduled',
          eventStart: node.eventDetails?.eventStart || node.eventStart
        }
      }))
      eventsDataLoaded.value = true
    }
  })

const { isFetching: fetchingOnDemandEvents, refetch: refetchOnDemandEvents } =
  useQuery({
    query: eventQueries.eventsQuery(
      queryVariables.value.declaration,
      queryVariables.value.taxArray
    ),
    variables: computed(() => ({
      ...queryVariables.value.variables,
      language: baseStore.language.value.toUpperCase(),
      dateNow: dateNow.value,
      eventType: 'on-demand',
      order: 'ASC',
      orderField: sortValue.value,
      search: state.searchString,
      startsBefore: dateNow.value
    })),
    skip: computed(() => {
      // Only skip if we're not on relevant routes AND data is already loaded
      if (eventsDataLoaded.value) {
        return (
          !isAllEventsView.value &&
          !isMapRoute.value &&
          !route.path.includes('/events/all')
        )
      }
      // Don't skip if data hasn't been loaded yet
      return false
    }),
    onData: (res) => {
      const { edges } = res.events
      state.onDemandEvents = edges.map(({ node, ...rest }) => ({
        ...rest,
        node: {
          ...node,
          eventStart: node.eventDetails?.eventStart || node.eventStart,
          title: node.eventDetails?.displayName || node.title,
          eventType: 'on-demand'
        }
      }))
      eventsDataLoaded.value = true
    }
  })

const { isFetching: fetchingSession } = useQuery({
  query: eventQueries.eventQuery,
  variables: computed(() => ({
    event: sessionSlug.value || (isMapRoute.value ? locationId.value : null),
    language: baseStore.language.value.toUpperCase()
  })),
  skip: computed(() => {
    if (isMapRoute.value && locationId.value) return false
    return !sessionSlug.value || sessionSlug.value === 'all'
  }),
  onData: ({ events }) => {
    if (events?.nodes?.[0]) {
      const event = events.nodes[0]
      const currentUser = authStore.currentUser

      const featuredImage = event.featuredImage || {
        node: {
          altText: fallbackImage?.alt || '',
          sourceUrl: fallbackImage?.url || ''
        }
      }

      const processedEvent = {
        ...event,
        title: event.eventDetails?.displayName || event.title,
        eventStart: event.eventDetails?.eventStart,
        featuredImage,
        eventDetails: {
          ...event.eventDetails,
          formattedDate: formatEventDate({
            node: {
              eventDetails: {
                eventStart: event.eventDetails?.eventStart,
                eventEnd: event.eventDetails?.eventEnd
              }
            }
          }),
          isLiked: !!(currentUser?.tracking?.favouritedContent || []).find(
            (item) => item.id === event.databaseId || item.id === event.id
          )
        }
      }

      eventsViewer.value?.setSelectedEvent(processedEvent)
      handleMeta({ title: processedEvent.title })

      // Check if we should open TikTok player based on URL query
      if (
        isMobileDevice() &&
        route.query.tiktok === 'true' &&
        eventsViewer.value
      ) {
        nextTick(() => {
          eventsViewer.value.setTiktokPlayerState(true)
        })
      }
    }
  }
})

// Route leave guard to reset data loaded flag when leaving events section
onBeforeRouteLeave((to, from, next) => {
  // If navigating away from events section
  if (!to.path.includes('/events')) {
    eventsDataLoaded.value = false
  }
  next()
})

// Loading state handling
watch(
  [fetchingScheduledEvents, fetchingOnDemandEvents, fetchingSession],
  ([scheduledFetching, onDemandFetching, sessionFetching]) => {
    if (scheduledFetching || onDemandFetching || sessionFetching) {
      $q.loading.show({
        message: getString('loading_spinner_message'),
        spinner: QSpinnerBars,
        customClass: 'QSpinnerBarsClass'
      })
    } else {
      $q.loading.hide()
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Check if on mobile
  if (isMobileDevice()) {
    // Only check the tiktok param on mobile
    shouldOpenTiktok.value = route.query.tiktok === 'true'
  } else if (route.query.tiktok === 'true') {
    // If on desktop but tiktok=true in URL, remove it
    const currentQuery = { ...route.query }
    delete currentQuery.tiktok

    router.replace({
      path: route.path,
      query: currentQuery
    })
  }
})

// Watch for changes in tiktok URL parameter
watch(
  () => route.query.tiktok,
  (newValue) => {
    // Only process on mobile devices
    if (isMobileDevice()) {
      const shouldOpen = newValue === 'true'

      // Update local state
      shouldOpenTiktok.value = shouldOpen

      // If we have the viewer component and an event is selected, update TikTok state
      if (
        eventsViewer.value &&
        (sessionSlug.value || (isMapRoute.value && locationId.value))
      ) {
        nextTick(() => {
          eventsViewer.value.setTiktokPlayerState(shouldOpen)
        })
      }
    }
  }
)

// Handle TikTok player state changes
function handleTiktokStateChange(isOpen) {
  // Only modify URL for TikTok player on mobile devices
  if (isMobileDevice()) {
    // Update the URL when TikTok player state changes
    const currentQuery = { ...route.query }

    if (isOpen) {
      currentQuery.tiktok = 'true'
    } else {
      delete currentQuery.tiktok
    }

    // Replace the current URL to maintain history state
    router.replace({
      path: route.path,
      query: currentQuery
    })
  }
}

// Route change handling
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('/events/all')) {
      // Reset to all events view
      eventsViewer.value?.setSelectedEvent(null)
      // Reset title back to default events list title
      handleMeta({ title: copy?.title })

      // If no events data or empty data, refetch
      if (
        !state.scheduledEvents ||
        !state.onDemandEvents ||
        state.scheduledEvents.length === 0 ||
        state.onDemandEvents.length === 0
      ) {
        refetchScheduledEvents()
        refetchOnDemandEvents()
      } else {
        // Refresh events list if it exists
        state.scheduledEvents = [...state.scheduledEvents]
        state.onDemandEvents = [...state.onDemandEvents]
      }
    }
  }
)

// Event sorting logic
function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (sortValue.value === 'TITLE') {
      return a.node.title.localeCompare(b.node.title)
    } else if (sortValue.value === 'EVENT_PRIORITY') {
      const aPriority = a.node.eventDetails?.eventPriority || Number.MAX_VALUE
      const bPriority = b.node.eventDetails?.eventPriority || Number.MAX_VALUE
      const priorityDiff = aPriority - bPriority

      // If same priority, sort by start date, then title
      if (priorityDiff !== 0) {
        return priorityDiff
      } else {
        // Use the same date sorting logic as the default case
        const aDate = new Date(a.node.eventStart || a.node.publishedAt)
        const bDate = new Date(b.node.eventStart || b.node.publishedAt)
        const dateDiff = aDate - bDate
        if (dateDiff !== 0) {
          return dateDiff
        } else {
          return a.node.title.localeCompare(b.node.title)
        }
      }
    } else {
      // Default sort: sort by eventStart date, then title
      const aDate = new Date(a.node.eventStart || a.node.publishedAt)
      const bDate = new Date(b.node.eventStart || b.node.publishedAt)
      const dateDiff = aDate - bDate
      if (dateDiff !== 0) {
        return dateDiff
      } else {
        return a.node.title.localeCompare(b.node.title)
      }
    }
  })
}

// Event data transformation
const combinedEvents = computed(() => {
  const scheduled = state.scheduledEvents || []
  const onDemand = state.onDemandEvents || []
  const combined = [...scheduled, ...onDemand]
  return sortEvents(combined)
})

const events = computed(() =>
  combinedEvents.value.map((event) => {
    if (!event.node.eventDetails) return event

    const formattedDate = formatEventDate(event)
    const { ...restDetails } = event.node.eventDetails

    // Get the event ID for status lookup
    const eventId =
      event.node.databaseId || event.node.id || JSON.stringify(event.node)

    // Get status for this event
    const status = state.eventStatuses[eventId] || null
    const progress = state.eventProgresses[eventId] || null

    // Create boolean flags based on status
    const isSoon = status === 'soon'
    const isLive = status === 'live'
    const isOver = status === 'over'

    // Like functionality
    const currentUser = authStore.currentUser
    const favouritedContent = currentUser?.tracking?.favouritedContent || []
    const likedItem = favouritedContent.find(
      (item) => item.id === event.node.databaseId || item.id === event.node.id
    )
    const isLiked = !!likedItem

    const featuredImage = event.node.featuredImage || {
      node: {
        altText: fallbackImage?.alt || '',
        sourceUrl: fallbackImage?.url || ''
      }
    }

    return {
      ...event,
      node: {
        ...event.node,
        featuredImage,
        eventDetails: {
          ...restDetails,
          formattedDate,
          isSoon,
          isLive,
          isOver,
          eventProgress: progress,
          isLiked
        }
      }
    }
  })
)

const computedButtons = computed(() => {
  let transformed = {}
  // If new button fields are updated
  console.log(Object.keys(buttons).length)
  if (Object.keys(buttons).length === 2) {
    for (const key in buttons) {
      if (Object.prototype.hasOwnProperty.call(buttons, key)) {
        const config = buttons[key]
        transformed[key] = {
          ...config,
          buttonClass: getButtonClass(config.buttonStyle)
        }
      }
    }
    // Else, default to  first button choice in settings
  } else {
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

// Color formatting
const isBgDark = (color) => {
  return proxy.$colorIsDark(color)
}

const computedColors = computed(() => {
  const result = {}
  for (const key in eventsSettings.colors) {
    if (Object.hasOwn(eventsSettings.colors, key)) {
      const colorName = eventsSettings.colors[key]
      const hexColor = getHexValue(colorName)
      result[key] = {
        name: hexColor,
        light: !isBgDark(hexColor)
      }
    }
  }
  return result
})

// Event handlers
function handleSort(value) {
  state.sortValue = value

  handleDataLayer({
    name: 'sortEvents',
    sortBy: value
  })
}

function redirectToMySchedule() {
  router.push('/user/events')
}

function handleNavigationRequest(navigationData) {
  const { path, data } = navigationData
  const currentQuery = route.query

  if (path.includes('/events/session/')) {
    const sessionSlug = path.split('/').pop()

    router.push({
      name: 'session',
      params: { session_id: sessionSlug },
      query: currentQuery
    })

    if (data) {
      const eventWithFallback = {
        ...data,
        featuredImage: data.featuredImage || {
          node: {
            altText: fallbackImage?.alt || '',
            sourceUrl: fallbackImage?.url || ''
          }
        }
      }
      eventsViewer.value?.setSelectedEvent(eventWithFallback)
      handleMeta({ title: eventWithFallback.title })
    }
  } else if (path.includes('/map/')) {
    if (path === '/map/back') {
      // Handle "Back to Map" navigation
      // First navigate
      router
        .push({
          name: 'map',
          query: currentQuery
        })
        .then(() => {
          // Then clear selected event after navigation is complete
          eventsViewer.value?.setSelectedEvent(null)
        })
    } else if (path.includes('/event')) {
      // Map event view with existing URL structure
      const parts = path.split('/')
      const locationId = parts[2] // Extract location ID from path

      router.push({
        name: 'locationEvent',
        params: { location_id: locationId },
        query: currentQuery
      })

      if (data) {
        const eventWithFallback = {
          ...data,
          featuredImage: data.featuredImage || {
            node: {
              altText: fallbackImage?.alt || '',
              sourceUrl: fallbackImage?.url || ''
            }
          }
        }
        eventsViewer.value?.setSelectedEvent(eventWithFallback)
      }
    } else {
      // Direct navigation to map location (for the direction button)
      const parts = path.split('/')
      const locationId = parts[2] // Extract location ID from path

      // Don't clear the selected event before navigation
      // Instead, navigate first
      router.push({
        name: 'location',
        params: { location_id: locationId },
        query: currentQuery
      })

      // No need to clear the selectedEvent here since we're navigating away
      // from the EventsPage to the MapPage

      // Track this navigation in analytics if needed
      handleDataLayer({
        name: 'viewMapLocation',
        locationId: locationId,
        eventTitle: data?.title || '',
        eventId: data?.databaseId || ''
      })
    }
  } else {
    // Default case - navigate to events list
    router
      .push({
        name: 'events',
        params: { events_id: 'all' },
        query: currentQuery
      })
      .then(() => {
        // Clear selected event after navigation completes
        eventsViewer.value?.setSelectedEvent(null)
        // Reset the page title back to default events list title
        handleMeta({ title: copy?.title })
      })

    // Check if we need to force a refetch when navigating to all events
    if (
      !state.scheduledEvents ||
      !state.onDemandEvents ||
      state.scheduledEvents.length === 0 ||
      state.onDemandEvents.length === 0
    ) {
      refetchScheduledEvents()
      refetchOnDemandEvents()
    }
  }
}

function handleCardClick(node) {
  handleDataLayer({
    name: 'viewEventClick',
    eventTitle: node.title,
    eventId: node.databaseId,
    eventDate: node.eventDetails?.eventStart || '',
    eventType: node.eventDetails?.eventType || ''
  })
}

function handleLikeClick(node) {
  const currentUser = authStore.currentUser
  const id = node.databaseId || node.id
  const path = window.location.pathname
  const postSlug = node.slug
  const postTitle = node.title

  if (currentUser) {
    const query = window.location.search
    const url = `${path}${query}`
    const favouritedContent = currentUser?.tracking?.favouritedContent || []
    const like = favouritedContent.find((item) => item.id === id)
    if (!like) {
      authStore.HANDLE_USER_FAVOURITES({ id, url, postSlug, postTitle })
    } else {
      authStore.HANDLE_USER_FAVOURITES({ ...like, postSlug, postTitle })
    }
  } else {
    mainStore.TOGGLE_AUTH_MODAL()
  }
}

// Event update callbacks
function onStatusUpdate(status, eventItem) {
  if (!eventItem) return

  const eventId =
    eventItem.databaseId || eventItem.id || JSON.stringify(eventItem)
  state.eventStatuses[eventId] = status
}

function onProgressUpdate(progress, eventItem) {
  if (!eventItem) return

  const eventId =
    eventItem.databaseId || eventItem.id || JSON.stringify(eventItem)
  state.eventProgresses[eventId] = progress
}

// Analytics
async function handleDataLayer(payload) {
  await nextTick()

  pushToDataLayer({
    event: 'eventsInteraction',
    ...payload
  })
}

// Date formatting
function formatEventDate(event) {
  const { eventStart, eventEnd } = event.node.eventDetails || {}
  if (!eventStart || !eventEnd) return null

  const startDate = new Date(eventStart)
  const endDate = new Date(eventEnd)
  const startMonth = startDate.toLocaleString('default', { month: 'short' })
  const startDay = startDate.getDate()
  const endMonth = endDate.toLocaleString('default', { month: 'short' })
  const endDay = endDate.getDate()

  // If the event is in the same month, omit the end month.
  // And if it's on the same day, omit the end day.
  let computedEndMonth = endMonth
  let computedEndDay = endDay
  if (startMonth === endMonth) {
    computedEndMonth = ''
    if (startDay === endDay) {
      computedEndDay = ''
    }
  }

  return {
    startMonth,
    startDay,
    endMonth: computedEndMonth,
    endDay: computedEndDay,
    start: handleDate(eventStart).time,
    end: handleDate(eventEnd).time,
    zone: handleDate(eventStart).zone
  }
}

const isSessionView = computed(() => {
  return (
    (!!sessionSlug.value && sessionSlug.value !== 'all') ||
    (isMapRoute.value && !!locationId.value)
  )
})

function handleQaSectionVisibilityChange(visible) {
  hasQaSection.value = visible
}
</script>

<style lang="scss" scoped>
.events::v-deep() {
  .q-tab-panel {
    padding: 0;
  }

  .q-tab__label {
    font-size: 1.2rem;
  }

  .q-tab__indicator {
    height: 3px;
  }
}

.v-eventsviewer {
  --events-border-radius: var(--q-widget-radius, 20px);
}
</style>
