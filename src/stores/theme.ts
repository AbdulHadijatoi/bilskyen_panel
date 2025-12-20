import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useDark } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useDark({
    storageKey: 'vuetify-theme',
    valueDark: 'dark',
    valueLight: 'light',
  })

  const currentTheme = ref<'light' | 'dark' | 'system'>('system')

  // Get Vuetify theme instance - this will be set when the app initializes
  let vuetifyTheme: any = null

  const setVuetifyTheme = (theme: any) => {
    vuetifyTheme = theme
    // Apply current theme immediately when Vuetify theme is set
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('system')
    }
  }

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    currentTheme.value = newTheme
    localStorage.setItem('theme', newTheme)

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
      if (vuetifyTheme) {
        vuetifyTheme.change(prefersDark ? 'dark' : 'light')
      }
    } else {
      isDark.value = newTheme === 'dark'
      if (vuetifyTheme) {
        vuetifyTheme.change(newTheme)
      }
    }
  }

  // Watch for isDark changes and sync with Vuetify
  watch(isDark, (newValue) => {
    if (vuetifyTheme) {
      vuetifyTheme.change(newValue ? 'dark' : 'light')
    }
    document.documentElement.classList.toggle('dark', newValue)
  }, { immediate: true })

  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
  if (savedTheme) {
    currentTheme.value = savedTheme
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    setVuetifyTheme,
  }
})
