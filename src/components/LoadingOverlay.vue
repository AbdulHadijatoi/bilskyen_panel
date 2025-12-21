<template>
  <transition name="fade">
    <div
      v-if="loadingStore.isLoading"
      class="loading-overlay"
      :style="{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)',
      }"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
      />
      <p
        v-if="loadingStore.loadingMessage"
        :style="{
          marginTop: '1rem',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 500,
        }"
      >
        {{ loadingStore.loadingMessage }}
      </p>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

