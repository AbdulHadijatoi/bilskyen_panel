import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const SIDEBAR_STORAGE_KEY = 'sidebar_state'
const SIDEBAR_STORAGE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// Helper to get stored sidebar state
function getStoredSidebarState(): { isCollapsed: boolean; isOpen: boolean } | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    // Check if the stored data is still valid (not expired)
    if (parsed.expires && parsed.expires < Date.now()) {
      localStorage.removeItem(SIDEBAR_STORAGE_KEY)
      return null
    }

    return {
      isCollapsed: parsed.isCollapsed ?? false,
      isOpen: parsed.isOpen ?? true,
    }
  } catch (error) {
    console.error('Error reading sidebar state from storage:', error)
    return null
  }
}

// Helper to save sidebar state
function saveSidebarState(isCollapsed: boolean, isOpen: boolean) {
  if (typeof window === 'undefined') return

  try {
    const expires = Date.now() + SIDEBAR_STORAGE_MAX_AGE * 1000
    const state = {
      isCollapsed,
      isOpen,
      expires,
    }
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving sidebar state to storage:', error)
  }
}

// Initialize from storage
const storedState = getStoredSidebarState()

export const useSidebarStore = defineStore('sidebar', () => {
  const isOpen = ref(storedState?.isOpen ?? true)
  const isMobile = ref(false)
  const isCollapsed = ref(storedState?.isCollapsed ?? false)

  // Save state to localStorage whenever it changes (only for desktop, not mobile)
  watch(
    [isCollapsed, isOpen],
    ([newCollapsed, newOpen]) => {
      // Only persist desktop state, not mobile state
      if (!isMobile.value) {
        saveSidebarState(newCollapsed, newOpen)
      }
    },
    { immediate: false }
  )

  const toggleSidebar = () => {
    if (isMobile.value) {
      isOpen.value = !isOpen.value
    } else {
      isCollapsed.value = !isCollapsed.value
      // State will be saved automatically via watch
    }
  }

  const setOpen = (value: boolean) => {
    isOpen.value = value
    // State will be saved automatically via watch
  }

  const setMobile = (value: boolean) => {
    isMobile.value = value
    if (value) {
      isOpen.value = false
    } else {
      // When switching from mobile to desktop, restore the persisted state
      const stored = getStoredSidebarState()
      if (stored) {
        isOpen.value = stored.isOpen
        isCollapsed.value = stored.isCollapsed
      } else {
        isOpen.value = true
      }
    }
  }

  return {
    isOpen,
    isMobile,
    isCollapsed,
    toggleSidebar,
    setOpen,
    setMobile,
  }
})

