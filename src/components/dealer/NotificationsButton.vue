<template>
  <div class="notifications-button-wrapper" style="position: relative;">
    <button
      aria-label="Notifications"
      class="notifications-button"
      :style="{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background-color 0.2s',
      }"
      @mouseenter="(e: MouseEvent) => {
        (e.target as HTMLElement).style.backgroundColor = 'var(--secondary)'
        ;(e.target as HTMLElement).style.opacity = '0.8'
      }"
      @mouseleave="(e: MouseEvent) => {
        (e.target as HTMLElement).style.backgroundColor = 'var(--secondary)'
        ;(e.target as HTMLElement).style.opacity = '1'
      }"
      @click="() => {}"
    >
      <v-icon size="16">mdi-bell-outline</v-icon>
    </button>

    <span
      v-if="count > 0"
      class="notification-badge"
      :style="{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        height: '20px',
        minWidth: '20px',
        width: 'auto',
        borderRadius: '9999px',
        padding: '0 4px',
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
      }"
      :aria-live="'polite'"
      :aria-busy="isLoading"
    >
      {{ count }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

const count = ref(0)
const isLoading = ref(true)

const fetchNotificationCount = async () => {
  try {
    isLoading.value = true
    const response = await axios.get<{ count: number }>('/api/notifications/count')
    count.value = typeof response.data?.count === 'number' ? response.data.count : 0
  } catch (error) {
    console.error('Error fetching notification count:', error)
    count.value = 0
  } finally {
    isLoading.value = false
  }
}

// Fetch on mount and when route changes
fetchNotificationCount()
watch(() => [route.path, route.query], () => {
  fetchNotificationCount()
})
</script>

<style scoped>
.notifications-button:hover {
  opacity: 0.8;
}
</style>
