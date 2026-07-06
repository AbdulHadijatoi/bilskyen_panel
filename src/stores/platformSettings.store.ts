import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPlatformUiSettings } from '@/api/public.api'

export const usePlatformSettingsStore = defineStore('platformSettings', () => {
  const languageSwitcherEnabled = ref(true)
  const loaded = ref(false)

  async function load() {
    try {
      const settings = await getPlatformUiSettings()
      languageSwitcherEnabled.value = settings.language_switcher_enabled
    } catch {
      languageSwitcherEnabled.value = true
    } finally {
      loaded.value = true
    }
  }

  function setLanguageSwitcherEnabled(enabled: boolean) {
    languageSwitcherEnabled.value = enabled
  }

  return {
    languageSwitcherEnabled,
    loaded,
    load,
    setLanguageSwitcherEnabled,
  }
})
