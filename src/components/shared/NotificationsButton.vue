<template>
  <div class="notifications-button-wrapper" style="position: relative;">
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom end"
      max-width="420"
      min-width="320"
      @update:model-value="onMenuToggle"
    >
      <template #activator="{ props: menuProps }">
        <button
          v-bind="menuProps"
          :aria-label="t('dealerComponents.notificationsButton.ariaLabel')"
          class="notifications-button"
          :style="buttonStyle"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
        >
          <v-icon size="16">mdi-bell-outline</v-icon>
        </button>
      </template>

      <v-card>
        <v-card-title class="d-flex align-center pa-3 text-subtitle-1">
          <span>{{ t('dealerComponents.notificationsButton.title') }}</span>
          <v-spacer />
          <v-btn
            v-if="notifications.length > 0"
            variant="text"
            size="small"
            :loading="markingAllRead"
            @click="markAllRead"
          >
            {{ t('dealerComponents.notificationsButton.markAllRead') }}
          </v-btn>
        </v-card-title>
        <v-divider />
        <div v-if="loadingList" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>
        <v-list v-else-if="notifications.length > 0" density="compact" class="py-0" max-height="360" style="overflow-y: auto;">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'bg-surface-variant': !notification.is_read }"
            @click="markOneRead(notification)"
          >
            <template #prepend>
              <v-icon
                :color="notification.is_read ? 'medium-emphasis' : 'primary'"
                size="18"
              >
                {{ notification.is_read ? 'mdi-email-open-outline' : 'mdi-email-outline' }}
              </v-icon>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ notification.title }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="notification.message" class="text-caption">
              {{ notification.message }}
            </v-list-item-subtitle>
            <template #append>
              <span class="text-caption text-medium-emphasis">{{ formatDate(notification.created_at) }}</span>
            </template>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text-center text-medium-emphasis py-6">
          {{ t('dealerComponents.notificationsButton.empty') }}
        </v-card-text>
      </v-card>
    </v-menu>

    <span
      v-if="count > 0"
      class="notification-badge"
      :style="badgeStyle"
      :aria-live="'polite'"
      :aria-busy="isLoading"
    >
      {{ count > 99 ? '99+' : count }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  getNotificationCount,
  getNotifications,
  markNotificationsRead,
  type DealerNotificationModel,
} from '@/api/dealer.api'

const { t, locale } = useI18n()
const route = useRoute()

const count = ref(0)
const isLoading = ref(true)
const menuOpen = ref(false)
const loadingList = ref(false)
const markingAllRead = ref(false)
const notifications = ref<DealerNotificationModel[]>([])

const buttonStyle = {
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
}

const badgeStyle = {
  position: 'absolute' as const,
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
  pointerEvents: 'none' as const,
}

const onMouseEnter = (e: MouseEvent) => {
  const el = e.target as HTMLElement
  el.style.backgroundColor = 'var(--secondary)'
  el.style.opacity = '0.8'
}

const onMouseLeave = (e: MouseEvent) => {
  const el = e.target as HTMLElement
  el.style.backgroundColor = 'var(--secondary)'
  el.style.opacity = '1'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'da' ? 'da-DK' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchNotificationCount = async () => {
  try {
    isLoading.value = true
    count.value = await getNotificationCount(true)
  } catch (error) {
    console.error('Error fetching notification count:', error)
    count.value = 0
  } finally {
    isLoading.value = false
  }
}

const loadNotifications = async () => {
  try {
    loadingList.value = true
    const result = await getNotifications({ unread: false, perPage: 20 })
    notifications.value = result.docs ?? []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    notifications.value = []
  } finally {
    loadingList.value = false
  }
}

const onMenuToggle = (open: boolean) => {
  if (open) {
    loadNotifications()
  }
}

const markOneRead = async (notification: DealerNotificationModel) => {
  if (notification.is_read) return
  try {
    await markNotificationsRead([notification.id])
    notification.is_read = true
    await fetchNotificationCount()
  } catch (error) {
    console.error('Error marking notification read:', error)
  }
}

const markAllRead = async () => {
  const unreadIds = notifications.value.filter((n) => !n.is_read).map((n) => n.id)
  if (unreadIds.length === 0) return
  try {
    markingAllRead.value = true
    await markNotificationsRead(unreadIds)
    notifications.value.forEach((n) => {
      n.is_read = true
    })
    await fetchNotificationCount()
  } catch (error) {
    console.error('Error marking all notifications read:', error)
  } finally {
    markingAllRead.value = false
  }
}

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
