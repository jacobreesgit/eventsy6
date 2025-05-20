<template>
  <div class="v-events-filter">
    <VEventSearch
      class="v-events-filter__search-bar"
      :events="events"
      :computed-buttons="computedButtons"
      :events-settings="eventsSettings"
      @update-filtered-events="$emit('updateFilteredEvents', $event)"
      @update-search-term="$emit('updateSearchTerm', $event)"
    />
    <span id="sort-options-label" class="sr-only">Sort options</span>
    <ul
      v-if="sortOptions && sortOptions.length"
      class="v-events-filter__sort flex"
      role="list"
      aria-label="Sort options"
      aria-labelledby="sort-options-label"
    >
      <li v-for="option in sortOptions" :key="option.value">
        <VButton
          ref="sortButtons"
          :class="computedButtons.secondaryStyle.buttonClass"
          :label="option.label"
          :aria-label="getAriaLabel(option)"
          @click="updateSort(option.value)"
          @keydown.space.prevent="updateSort(option.value)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import VButton from '@/components/VButton/VButton.vue'
import VEventSearch from '@/components/VEvents/components/filters/VEventSearch.vue'
import type {
  EventNode,
  EventsSettings,
  ComputedButtons,
  SortOption
} from '@/types/events'

// Props
const props = defineProps<{
  events: EventNode[]
  computedButtons: ComputedButtons
  eventsSettings: EventsSettings
  sortOptions?: SortOption[]
  initialSort?: string
}>()

// Emits
const emit = defineEmits<{
  updateFilteredEvents: [events: EventNode[]]
  updateSearchTerm: [term: string]
  sortChange: [sortValue: string]
}>()

// Refs
const sortModel = ref(props.initialSort ?? '')
const sortButtons = ref<any[]>([])

// Methods
const updateSort = (value: string) => {
  sortModel.value = value

  nextTick(() => {
    if (sortButtons.value && sortButtons.value.length > 0) {
      sortButtons.value.forEach((button, index) => {
        if (button && button.$el) {
          button.$el.classList.remove('focus')
          if (props.sortOptions && props.sortOptions[index].value === value) {
            button.$el.classList.add('focus')
          }
        }
      })
    }
  })

  emit('sortChange', value)
}

const getAriaLabel = (option: SortOption) => {
  const active = sortModel.value === option.value
  const str = `Sort events by ${option.label}`
  return active ? `${str}. Active` : str
}

// Lifecycle hooks
onMounted(() => {
  updateSort(sortModel.value)
})
</script>

<style lang="scss" scoped>
.v-events-filter {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  justify-content: space-between;
  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    gap: 12px;
  }
  &__sort {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    flex: 0 0 auto;
    li {
      list-style: none;
    }
    @media only screen and (max-width: 1023px) {
      flex-direction: row;
      width: 100%;
      li {
        flex: 1;
        :deep(.v-button) {
          width: 100%;
        }
      }
    }
    @media only screen and (max-width: 320px) {
      flex-direction: column;
    }
  }
}
</style>
