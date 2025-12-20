<template>
  <v-navigation-drawer
    v-model="sidebarStore.isOpen"
    :temporary="sidebarStore.isMobile"
    :permanent="!sidebarStore.isMobile"
    :rail="sidebarStore.isCollapsed && !sidebarStore.isMobile"
    location="left"
    app
    class="dealer-sidebar"
    :width="sidebarStore.isCollapsed && !sidebarStore.isMobile ? 48 : 256"
    :style="{
      backgroundColor: 'var(--sidebar)',
      color: 'var(--sidebar-foreground)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }"
  >
    <!-- Sidebar Header - Fixed at top -->
    <div class="sidebar-header" :style="{ flexShrink: 0 }">
      <v-list nav density="compact">
        <v-list-item 
          class="sidebar-header-item"
          :class="{ 'sidebar-header-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
        >
          <template #prepend>
            <div
              class="d-flex align-center justify-center rounded-lg sidebar-header-icon"
              :style="{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--sidebar-primary)',
                color: 'var(--sidebar-primary-foreground)',
                flexShrink: 0,
              }"
            >
              <span class="font-bold text-sm">B</span>
            </div>
          </template>
          <template v-if="!sidebarStore.isCollapsed || sidebarStore.isMobile">
            <div class="flex-1 text-left" style="min-width: 0;">
              <div class="text-sm font-medium truncate">Bilskyen</div>
              <div class="text-xs truncate">Dealer Panel</div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <v-divider :style="{ borderColor: 'var(--sidebar-border)', flexShrink: 0 }" />

    <!-- Navigation Items - Scrollable -->
    <div 
      class="sidebar-content" 
      :class="{ 'sidebar-content-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
      style="flex: 1 1 0%; min-height: 0; overflow-y: auto; overflow-x: hidden;"
    >
      <template v-for="(section, sectionIndex) in dealerSidebarSections" :key="sectionIndex">
        <div 
          class="sidebar-group" 
          :class="{ 'sidebar-group-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
        >
          <div
            v-if="section.title"
            class="sidebar-group-label"
            :class="{ 'sidebar-group-label-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
            :style="{
              height: '32px',
              padding: '0 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'color-mix(in oklch, var(--sidebar-foreground) 70%, transparent)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '0.375rem',
            }"
          >
            {{ section.title }}
          </div>

          <v-list nav density="compact" class="sidebar-menu" style="gap: 0.25rem;">
            <template v-for="(item, itemIndex) in section.items" :key="itemIndex">
              <SidebarItem :item="item" />
            </template>
          </v-list>
        </div>
      </template>
    </div>

    <template #append>
      <v-divider :style="{ borderColor: 'var(--sidebar-border)', margin: '0 0.5rem', flexShrink: 0 }" />
      <div class="sidebar-footer" :style="{ padding: '0.5rem', flexShrink: 0 }">
        <v-menu location="top">
          <template #activator="{ props: menuProps }">
            <v-list nav density="compact">
              <v-list-item
                v-bind="menuProps"
                class="sidebar-footer-item"
                :class="{ 'sidebar-footer-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
                :style="{
                  height: sidebarStore.isCollapsed && !sidebarStore.isMobile ? '32px' : '48px',
                  padding: sidebarStore.isCollapsed && !sidebarStore.isMobile ? '0.5rem' : '0.375rem 0.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }"
              >
                <template #prepend>
                  <v-avatar
                    size="32"
                    class="rounded-lg"
                    :style="{
                      backgroundColor: 'var(--muted)',
                      color: 'var(--muted-foreground)',
                      flexShrink: 0,
                    }"
                  >
                    <span class="text-xs font-medium">{{ userInitials }}</span>
                  </v-avatar>
                </template>
                <template v-if="!sidebarStore.isCollapsed || sidebarStore.isMobile">
                  <div class="flex-1 text-left" style="min-width: 0;">
                    <div class="text-sm font-medium truncate">{{ authStore.user?.name || 'User' }}</div>
                    <div class="text-xs truncate">{{ authStore.user?.email || '' }}</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </template>
          <v-list>
            <v-list-item :to="{ name: 'dealer.settings.profile' }" prepend-icon="mdi-account">
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'dealer.settings.general' }" prepend-icon="mdi-cog">
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item prepend-icon="mdi-logout" @click="handleLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useAuthStore } from '@/stores/auth'
import { logout, getCurrentUser } from '@/services/auth'
import { dealerSidebarSections } from '@/constants/dealer'
import SidebarItem from './SidebarItem.vue'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const router = useRouter()

const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  const names = name.split(' ')
  if (names.length >= 2) {
    const firstName = names[0]
    const lastName = names[names.length - 1]
    if (firstName && lastName) {
      const first = firstName[0] || ''
      const last = lastName[0] || ''
      return (first + last).toUpperCase()
    }
  }
  return name.substring(0, 2).toUpperCase()
})

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    // Even if logout fails, clear local state and redirect
    console.error('Logout error:', error)
    authStore.logout()
    router.push('/auth/login')
  }
}

// Fetch user data on mount if we have a token but no user data
onMounted(async () => {
  if (authStore.accessToken && !authStore.user) {
    try {
      await getCurrentUser()
    } catch (error) {
      // If fetching user fails, it will be handled by the router guard
      console.error('Failed to fetch user data:', error)
    }
  }
})
</script>

<style scoped>
/* Ensure sidebar uses flexbox layout */
.dealer-sidebar {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

.dealer-sidebar :deep(.v-navigation-drawer__content) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* Remove all spacers in sidebar items */
.dealer-sidebar :deep(.v-list-item__spacer) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  flex: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.sidebar-header-item {
  min-height: 48px;
  height: 48px;
}

.sidebar-header-item-collapsed {
  min-height: 32px !important;
  height: 32px !important;
  justify-content: center !important;
  padding: 0.5rem !important;
  width: 32px !important;
  min-width: 32px !important;
  margin: 0 auto !important;
}

.sidebar-header-item-collapsed :deep(.v-list-item__prepend) {
  margin-inline-end: 0 !important;
  margin-inline-start: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.sidebar-header-item-collapsed :deep(.v-list-item__content) {
  display: none !important;
}

.sidebar-footer-item {
  min-height: 48px;
  height: 48px;
}

.sidebar-footer-item-collapsed {
  min-height: 32px !important;
  height: 32px !important;
  justify-content: center !important;
  width: 32px !important;
  min-width: 32px !important;
  margin: 0 auto !important;
}

.sidebar-footer-item-collapsed :deep(.v-list-item__prepend) {
  margin-inline-end: 0 !important;
  margin-inline-start: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.sidebar-footer-item-collapsed :deep(.v-list-item__content) {
  display: none !important;
}

.sidebar-content {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-content-collapsed {
  overflow: hidden !important;
}

.sidebar-group {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.sidebar-group-collapsed {
  align-items: center !important;
}

.sidebar-group-label {
  transition: margin 0.2s ease-linear, opacity 0.2s ease-linear;
}

.sidebar-group-label-collapsed {
  margin-top: -32px !important;
  opacity: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}

.sidebar-menu {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-group-collapsed .sidebar-menu {
  align-items: center !important;
}

/* Ensure icons are visible when collapsed */
.sidebar-content-collapsed :deep(.v-list-item__prepend) {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  flex-shrink: 0 !important;
}

.sidebar-content-collapsed :deep(.v-list-item__prepend .v-icon) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  flex-shrink: 0 !important;
}

/* Override Vuetify rail mode styles */
.dealer-sidebar.v-navigation-drawer--rail :deep(.v-list-item__prepend) {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  margin-inline-end: 0 !important;
}

.dealer-sidebar.v-navigation-drawer--rail :deep(.v-list-item__prepend .v-icon) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.dealer-sidebar.v-navigation-drawer--rail :deep(.v-list-item) {
  justify-content: center !important;
  min-height: 32px !important;
  height: 32px !important;
}

.dealer-sidebar.v-navigation-drawer--rail :deep(.v-list-item__content) {
  display: none !important;
}

/* Match Next.js sidebar menu item styling */
:deep(.v-list-item) {
  margin: 0;
  border-radius: 0.375rem;
  min-height: 32px;
  height: auto;
  padding: 0.5rem !important;
  transition: width 0.2s ease-linear, height 0.2s ease-linear, padding 0.2s ease-linear;
}

:deep(.v-list-item__prepend) {
  margin-inline-end: 0.5rem;
}

:deep(.v-list-item-title) {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  line-height: 1.25rem;
}

:deep(.v-list-item--active) {
  background-color: var(--sidebar-accent) !important;
  color: var(--sidebar-accent-foreground) !important;
  font-weight: 500 !important;
}

:deep(.v-list-item:hover:not(.v-list-item--active)) {
  background-color: var(--sidebar-accent) !important;
  color: var(--sidebar-accent-foreground) !important;
}

:deep(.v-list-item:focus-visible) {
  outline: 2px solid var(--sidebar-ring);
  outline-offset: 2px;
}

:deep(.v-list-group__items .v-list-item) {
  padding-left: 0.625rem !important;
}
</style>
