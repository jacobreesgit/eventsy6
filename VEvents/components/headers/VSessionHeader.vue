<template>
  <header class="v-session-header">
    <VButton
      class="v-session-header__back-button v-focus-a"
      icon-left="fas fa-arrow-left-long"
      :icon-size="'24px'"
      :label="isMapView ? 'Back to Map' : 'Back to Events'"
      :aria-label="isMapView ? 'Return to map view' : 'Return to events list'"
      @click="$emit('backClick')"
    ></VButton>
    <VButton
      v-if="loginEnabled"
      :class="computedButtons.primaryStyle.buttonClass"
      label="My Schedule"
      icon-left="fas fa-heart"
      class="v-session-header__schedule v-focus-a"
      aria-label="View my schedule"
      @click="$emit('updateShowAgenda', true)"
    />
  </header>
</template>

<script setup lang="ts">
import VButton from '@/components/VButton/VButton.vue'
import type { ComputedButtons } from '@/types/events'

// Props
const props = defineProps<{
  computedButtons: ComputedButtons
  loginEnabled?: boolean
  isMapView?: boolean
}>()

// Emits
const emit = defineEmits<{
  backClick: []
  updateShowAgenda: [show: boolean]
}>()
</script>

<style lang="scss" scoped>
.v-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  &__back-button {
    color: black;
    font-weight: 500;
    background-color: transparent;
    & span {
      font-size: var(--q-body-fontSize);
    }
  }
  @media only screen and (max-width: 280px) {
    flex-direction: column;
    align-items: flex-start;
    & .v-session-header__schedule,
    .v-session-header__back-button {
      width: 100%;
      justify-content: flex-start;
    }
  }
}
</style>
