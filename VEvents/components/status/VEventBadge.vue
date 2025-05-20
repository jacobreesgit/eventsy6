<template>
  <div
    class="v-event-badge"
    :class="`v-event-badge--${text}`"
    :style="{ backgroundColor: backgroundColor }"
    role="status"
    :aria-label="text"
  >
    <VIcon
      :color="textColor"
      :name="iconName"
      size="12px"
      aria-hidden="true"
    ></VIcon>
    <p :style="{ color: textColor }">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VIcon from '@/components/VIcon/VIcon.vue'

// Props
const props = defineProps<{
  type: 'live' | 'soon'
  colour: {
    name: string
    light: boolean
  }
}>()

// Computed properties
const iconName = computed(() => 'fas fa-tower-broadcast')

const text = computed(() => {
  return props.type === 'live' ? 'Live Now' : 'Happening Soon'
})

const backgroundColor = computed(() => {
  return props.colour.name
})

const textColor = computed(() => {
  return props.colour.light ? 'black' : 'white'
})
</script>

<style lang="scss" scoped>
.v-event-badge {
  display: flex;
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
  & p {
    font-size: var(--q-body-x-small-fontSize);
  }
}
</style>
