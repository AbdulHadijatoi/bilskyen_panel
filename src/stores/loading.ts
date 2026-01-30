import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingMessage = ref<string | null>(null)
  let stopLoadingTimeout: ReturnType<typeof setTimeout> | null = null

  function setLoading(value: boolean, message: string | null = null) {
    // Clear any pending stop timeout
    if (stopLoadingTimeout) {
      clearTimeout(stopLoadingTimeout)
      stopLoadingTimeout = null
    }

    if (value) {
      // Start loading immediately
      isLoading.value = true
      loadingMessage.value = message
    } else {
      // Stop loading immediately (removed debounce to prevent stuck loading)
      isLoading.value = false
      loadingMessage.value = null
    }
  }

  function startLoading(message: string | null = null) {
    setLoading(true, message)
  }

  function stopLoading() {
    setLoading(false, null)
  }

  return {
    isLoading,
    loadingMessage,
    setLoading,
    startLoading,
    stopLoading,
  }
})

