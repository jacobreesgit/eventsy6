<template>
  <div v-if="eventsEnabled" v-resize class="col-12" @resize="handleResize">
    <div
      class="q-px-md q-py-lg q-px-sm-lg"
      :class="[backgroundColor, { 'q-pa-md-none': removePadding }]"
    >
      <div
        v-if="widget.heading || widget.body"
        :class="`text-${widget.styles.block.textColor}`"
      >
        <div v-if="widget.heading" class="row items-center q-mb-lg">
          <q-icon
            :class="[`text-${widget.styles.block.textColor} q-mr-md`]"
            :name="widget.icon"
            :size="widget.styles.block.headingSize"
          />

          <h2
            class="q-ma-none"
            :class="
              widget.styles.block.headingColor
                ? `text-${widget.styles.block.headingColor}`
                : `text-${widget.styles.block.textColor}`
            "
            :style="`font-size: ${widget.styles.block.headingSize}`"
            v-html="$replaceDynamicText(widget.heading)"
          />
        </div>

        <div
          v-if="widget.body"
          :class="[
            `text-{widget.styles.block.textColor}`,
            widget.styles.block.textSize
          ]"
          v-html="$replaceDynamicText(widget.body)"
        />
      </div>

      <div v-if="events && events.nodes.length">
        <div class="flex row items-stretch q-mb-md">
          <RelevantEvent
            v-for="event in events.nodes"
            :key="event.slug"
            :event="event"
            :settings="settings"
            :widget="widget"
            :container-size="containerSize"
            :class="
              containerSize.width > 1200
                ? 'col-3'
                : containerSize.width > 900
                ? 'col-4'
                : containerSize.width > 500
                ? 'col-6'
                : 'col-12'
            "
            @handle-data-layer="handleDataLayer"
          />
        </div>

        <div class="flex" :class="buttonAlignmentClass">
          <Button
            type="a"
            :class="{ 'full-width': button.fullWidth }"
            :content="{
              ...button,
              buttonText,
              internalLink: `/events/all`
            }"
            :styles="button.buttonStyle"
            @click="
              handleDataLayer({
                name: 'moreEventsClick',
                copy: buttonText,
                parent: widget.parent,
                value:
                  widget.parent === 'drawer'
                    ? 'sectionRelevantEvents Drawer Interaction'
                    : undefined
              })
            "
          />
        </div>
      </div>

      <p
        v-else
        class="q-mb-none"
        :class="`text-${widget.styles.block.textColor}`"
        v-html="noEventsText"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from 'villus'
import { eventQueries } from 'src/queries'
import { handleTimezone } from 'src/helpers'
import { getQueryVariables } from 'src/helpers/filters'
import { useBaseStore } from 'stores/base'
import { date } from 'quasar'
const { formatDate } = date

import RelevantEvent from 'components/events/RelevantEvent.vue'
import Button from 'components/ui/Button.vue'

export default {
  name: 'SectionRelevantEvents',

  components: {
    RelevantEvent,
    Button
  },

  inject: ['section', 'settings'],

  props: {
    widget: {
      type: Object,
      default: () => {}
    },

    columnWidth: {
      type: String,
      default: ''
    },

    backgroundColor: {
      type: String,
      default: ''
    }
  },

  emits: ['handleDataLayer'],

  setup(props) {
    const route = useRoute()
    const language = inject('language')
    let events = ref(null)
    const { eventsEnabled } = useBaseStore()

    const dateNow = computed(() => {
      const now = new Date()
      const nowString = formatDate(now, 'YYYY-MM-DD HH:mm:ss')
      const serverUnix = handleTimezone(nowString).serverUnix
      const serverString = formatDate(serverUnix, 'YYYY-MM-DD HH:mm:ss')

      return serverString
    })

    const orderField = computed(() => {
      return props.widget.eventOrder || 'EVENT_START'
    })

    const isOnDemand = computed(() => {
      return props.widget.eventType === 'on-demand'
    })

    const queryVariables = computed(() => {
      return getQueryVariables(route.params.section_id, 'event')
    })

    useQuery({
      query: eventQueries.relevantEventsQuery(
        queryVariables.value.declaration,
        queryVariables.value.taxArray
      ),

      variables: computed(() => {
        return {
          ...queryVariables.value.variables,
          eventType: props.widget.eventType,
          language: language.value.value.toUpperCase(),
          dateNow: dateNow.value,
          size: props.widget.noOfEvents,
          startsBefore: isOnDemand.value ? dateNow.value : null,
          orderField: orderField.value
        }
      }),

      onData: (res) => {
        events.value = {
          ...res.events,
          nodes: res.events.nodes.map((node) => ({
            ...node,
            title: node.eventDetails?.displayName || node.title
          }))
        }
      }
    })

    return { events, isOnDemand, eventsEnabled }
  },

  data() {
    const { padding } = this.widget || {}

    return {
      removePadding: padding,
      containerSize: {}
    }
  },

  computed: {
    eventsSettings() {
      return this.settings.eventsSettings
    },

    button() {
      return this.widget?.buttonFieldsGroup || {}
    },

    buttonAlignmentClass() {
      const { buttonAlignment } = this.button
      return buttonAlignment ? `justify-${buttonAlignment}` : ''
    },

    buttonText() {
      const { button } = this
      const { buttonText } = button || {}
      return buttonText || `View all events`
    },

    noEventsText() {
      const { eventsSettings = {}, isOnDemand } = this
      const { copy = {} } = eventsSettings
      const { noScheduledEventsCopy, noOnDemandEventsCopy } = copy
      return isOnDemand ? noScheduledEventsCopy : noOnDemandEventsCopy
    }
  },

  methods: {
    handleResize(size) {
      this.containerSize = size.detail
    },

    handleDataLayer(payload) {
      this.$emit('handleDataLayer', {
        block: 'sectionRelevantEvents',
        parent: this.widget.parent,
        value:
          this.widget.parent === 'drawer'
            ? 'sectionRelevantEvents Drawer Interaction'
            : undefined,
        ...payload
      })
    }
  }
}
</script>
