<template>
  <transition name="fade">
    <div
      v-if="loadingStore.isLoading"
      class="loading-overlay"
      :class="{ 'dark-theme': isDark }"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
      />
      <p
        v-if="loadingStore.loadingMessage"
        class="loading-message"
      >
        {{ loadingStore.loadingMessage }}
      </p>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import { useTheme } from 'vuetify'

const loadingStore = useLoadingStore()
const theme = useTheme()

const isDark = computed(() => theme.current.value.dark)
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.4);
  transition: background-color 0.2s ease;
}

.loading-overlay.dark-theme {
  background-color: rgba(0, 0, 0, 0.6);
}

.loading-message {
  margin-top: 1rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.fade-enter-active {
  transition: opacity 0.25s ease-in;
}

.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

