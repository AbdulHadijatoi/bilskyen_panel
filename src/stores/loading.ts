import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingMessage = ref<string | null>(null)

  function setLoading(value: boolean, message: string | null = null) {
    isLoading.value = value
    loadingMessage.value = message
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

