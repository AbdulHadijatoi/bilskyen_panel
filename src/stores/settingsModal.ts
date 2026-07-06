import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SettingsSection = 'profile' | 'password' | 'sessions'

export const useSettingsModalStore = defineStore('settingsModal', () => {
  const isOpen = ref(false)
  const activeSection = ref<SettingsSection>('profile')

  function open(section: SettingsSection = 'profile') {
    activeSection.value = section
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function setSection(section: SettingsSection) {
    activeSection.value = section
  }

  return {
    isOpen,
    activeSection,
    open,
    close,
    setSection,
  }
})
