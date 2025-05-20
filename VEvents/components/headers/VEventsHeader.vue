<template>
  <header class="v-events-header">
    <h2 :style="{ color: colors.textColor.name }">Events</h2>
    <VButton
      v-if="loginEnabled"
      class="v-events-header__controls__schedule v-focus-a"
      :class="computedButtons.primaryStyle.buttonClass"
      label="My Schedule"
      icon-left="fas fa-heart"
      aria-label="View my schedule"
      @click="toggleMyAgenda"
    />
  </header>
</template>

<script setup lang="ts">
import VButton from '@/components/VButton/VButton.vue'
import type { ComputedButtons } from '@/types/events'

// Props
const props = defineProps<{
  loginEnabled?: boolean
  computedButtons: ComputedButtons
  colors: any
}>()

// Emits
const emit = defineEmits<{
  updateShowAgenda: [show: boolean]
}>()

// Methods
const toggleMyAgenda = () => {
  emit('updateShowAgenda', true)
}
</script>

<style lang="scss" scoped>
.v-events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  h2 {
    font-weight: 600;
  }
  @media only screen and (max-width: 280px) {
    flex-direction: column;
    align-items: flex-start;
    & .v-events-header__controls__schedule {
      width: 100%;
    }
  }
}
</style>
