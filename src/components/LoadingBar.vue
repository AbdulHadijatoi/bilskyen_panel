<template>
  <div
    v-if="loadingStore.isLoading"
    class="loading-bar"
    :style="{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '3px',
      backgroundColor: 'var(--primary-color, #1976d2)',
      zIndex: 10000,
      transition: 'width 0.3s ease, opacity 0.3s ease',
      width: progress + '%',
      opacity: loadingStore.isLoading ? 1 : 0,
    }"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
const progress = ref(0)
let progressInterval: ReturnType<typeof setInterval> | null = null

const startProgress = () => {
  progress.value = 0
  clearInterval(progressInterval!)
  
  // Simulate progress
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      // Gradually increase progress, slower as it approaches 90%
      const increment = Math.max(0.5, (90 - progress.value) * 0.1)
      progress.value = Math.min(90, progress.value + increment)
    }
  }, 50)
}

const completeProgress = () => {
  clearInterval(progressInterval!)
  progress.value = 100
  // Fade out after completion
  setTimeout(() => {
    progress.value = 0
  }, 200)
}

watch(
  () => loadingStore.isLoading,
  (isLoading) => {
    if (isLoading) {
      startProgress()
    } else {
      completeProgress()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  clearInterval(progressInterval!)
})
</script>

<style scoped>
.loading-bar {
  box-shadow: 0 0 10px rgba(25, 118, 210, 0.5);
}
</style>

