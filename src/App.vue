<template>
  <div
    :style="{
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      minHeight: '100vh',
    }"
  >
    <LoadingBar />
    <router-view v-slot="{ Component, route }">
      <transition
        :name="getTransitionName(route.meta.transition)"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <LoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/theme'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import LoadingBar from '@/components/LoadingBar.vue'

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

const getTransitionName = (transition: unknown): string => {
  return typeof transition === 'string' ? transition : 'fade'
}

onMounted(() => {
  // Set Vuetify theme instance in the store
  if (vuetifyTheme) {
    themeStore.setVuetifyTheme(vuetifyTheme)
  }
})
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scale transition */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
