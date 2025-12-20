<template>
  <div
    :style="{
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      minHeight: '100vh',
    }"
  >
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

onMounted(() => {
  // Set Vuetify theme instance in the store
  if (vuetifyTheme) {
    themeStore.setVuetifyTheme(vuetifyTheme)
  }
  
  // Initialize theme from storage
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
  if (savedTheme) {
    themeStore.setTheme(savedTheme)
  } else {
    themeStore.setTheme('system')
  }
})
</script>
