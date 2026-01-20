import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // Get Vuetify theme instance - this will be set when the app initializes
  let vuetifyTheme: any = null

  const setVuetifyTheme = (theme: any) => {
    vuetifyTheme = theme
    // Always set to light theme
    if (vuetifyTheme) {
      vuetifyTheme.change('light')
    }
    // Ensure light class is applied
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }

  // Initialize theme to light
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }

  return {
    setVuetifyTheme,
  }
})
