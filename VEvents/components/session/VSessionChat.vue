<template>
  <div class="v-session-chat">
    <iframe
      v-if="qaObj.src"
      :src="qaObj.src"
      height="100%"
      width="100%"
      frameBorder="0"
      style="min-height: 600px"
      class="v-session-chat__iframe v-scrollbar"
      :title="'Chat for ' + (platformType || 'event')"
    ></iframe>
    <div
      v-if="chatHTML"
      class="v-session-chat__html v-scrollbar"
      v-html="chatHTML"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { EventDetails, QaObject, WindowWithPubble } from '@/types/events'

// Props
interface Props {
  eventDetails: EventDetails
}

const props = defineProps<Props>()

// Refs and reactive state
const scriptClassName = ref<string>('viex2-qa-script')

// Computed properties
const platformType = computed((): string | null => {
  return props.eventDetails?.qaPlatformQuestion || null
})

const isSlidoQA = computed((): boolean => {
  return platformType.value === 'slido'
})

const isChatifyQA = computed((): boolean => {
  return platformType.value === 'chatify'
})

const isOtherQA = computed((): boolean => {
  return platformType.value === 'other'
})

const qaObj = computed<QaObject>(() => {
  const { slidoQa, chatifyQa, customQa } = props.eventDetails || {}
  if (isSlidoQA.value && slidoQa) {
    return slidoQa
  }
  if (isChatifyQA.value && chatifyQa) {
    return chatifyQa
  }
  if (isOtherQA.value && customQa) {
    return customQa
  }
  return {}
})

const chatHTML = computed((): string => {
  return qaObj.value.html || ''
})

// Methods
const killChatify = (): void => {
  const $scripts = document.querySelectorAll('script')
  $scripts.forEach(($el) => {
    const elSrc = $el.src || ''
    if (elSrc.includes('chatify.com') || elSrc.includes('pubble.io')) {
      $el.parentNode?.removeChild($el) // Remove all chatify + pubble scripts
    }
  })
  const $pubble = document.querySelectorAll('.pubble-iframe')
  $pubble.forEach(($el) => $el.parentNode?.removeChild($el)) // Remove Pubble iFrame
  const win = window as WindowWithPubble
  if (win.pubbleLoader?.tearDownLQA) {
    win.pubbleLoader.tearDownLQA() // Reset pubble entries on window (to allow for loader.js to work again)
  } else {
    win.pubcore = undefined
    win.pubble_coreapp = undefined
    win.pubbleLoader = undefined
    win.pubbleLoader_init = undefined
  }
}

// Lifecycle hooks
onMounted(() => {
  if (qaObj.value.js) {
    const $script = document.createElement('script')
    $script.setAttribute('src', qaObj.value.js)
    $script.className = scriptClassName.value
    document.head.appendChild($script)
  }
})

onBeforeUnmount(() => {
  killChatify()
  const $scripts = document.querySelectorAll(`.${scriptClassName.value}`)
  $scripts.forEach(($el) => $el.parentNode?.removeChild($el))
})
</script>

<style lang="scss" scoped>
.v-session-chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__iframe {
    width: 100%;
    flex-grow: 1;
  }
  &__html {
    width: 100%;
    flex-grow: 1;
    overflow: auto;
  }
}
</style>
