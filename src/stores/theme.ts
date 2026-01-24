import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Get Vuetify theme instance - this will be set when the app initializes
  let vuetifyTheme: any = null

  const currentTheme = ref<'light' | 'dark' | 'system'>('light')

  const isDark = computed(() => {
    if (currentTheme.value === 'system') {
      if (typeof window === 'undefined') return false
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
    }
    return currentTheme.value === 'dark'
  })

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    currentTheme.value = theme
    const resolvedTheme =
      theme === 'system' ? (isDark.value ? 'dark' : 'light') : theme

    if (vuetifyTheme) {
      vuetifyTheme.change(resolvedTheme)
    }

    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(resolvedTheme)
    }
  }

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    applyTheme(theme)
  }

  const setVuetifyTheme = (theme: any) => {
    vuetifyTheme = theme
    applyTheme(currentTheme.value)
  }

  // Initialize theme to light
  applyTheme('light')

  return {
    setVuetifyTheme,
    setTheme,
    currentTheme,
    isDark,
  }
})
