<template>
  <v-navigation-drawer
    v-model="sidebarStore.isOpen"
    :temporary="sidebarStore.isMobile"
    :permanent="!sidebarStore.isMobile"
    :rail="sidebarStore.isCollapsed && !sidebarStore.isMobile"
    location="left"
    app
    class="panel-sidebar"
    :width="sidebarStore.isCollapsed && !sidebarStore.isMobile ? 56 : 264"
    :style="{
      backgroundColor: 'var(--sidebar)',
      color: 'var(--sidebar-foreground)',
      borderRight: '1px solid var(--sidebar-border)',
    }"
  >
    <div class="sidebar-header">
      <div
        class="sidebar-header-content"
        :class="{ 'sidebar-header-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
      >
        <router-link :to="logoTo" class="sidebar-header-logo">
          <img
            src="/images/logo.png"
            alt="Bilskyen"
            :style="{
              height: sidebarStore.isCollapsed && !sidebarStore.isMobile ? '28px' : '40px',
            }"
          />
        </router-link>
      </div>
    </div>

    <SidebarSearch
      v-model="searchQuery"
      :collapsed="sidebarStore.isCollapsed && !sidebarStore.isMobile"
      :placeholder="t('common.search')"
    />

    <aside
      class="sidebar-content"
      :class="{ 'sidebar-content-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
    >
      <div
        v-for="(section, sectionIndex) in displayedSections"
        :key="sectionIndex"
        class="sidebar-group"
        :class="{ 'sidebar-group-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
        :style="{ marginTop: sectionIndex === 0 ? '0' : '0.5rem' }"
      >
        <div
          v-if="section.title && (!sidebarStore.isCollapsed || sidebarStore.isMobile)"
          class="sidebar-group-label"
        >
          {{ getSectionTitle(section.title) }}
        </div>
        <div class="sidebar-menu">
          <PanelSidebarItem
            v-for="(item, itemIndex) in section.items"
            :key="itemIndex"
            :item="item"
            :nav-title-keys="navTitleKeys"
          />
        </div>
      </div>
    </aside>

    <div class="sidebar-footer">
      <v-menu location="top" content-class="sidebar-user-menu">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="text"
            class="sidebar-footer-item"
            :class="{ 'sidebar-footer-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
            block
          >
            <div class="flex min-w-0 items-center gap-1.5">
              <div class="sidebar-footer-avatar">{{ userInitials }}</div>
              <div v-if="!sidebarStore.isCollapsed || sidebarStore.isMobile" class="sidebar-footer-meta">
                <div class="truncate text-xs font-medium">{{ authStore.user?.name || t('common.userFallback') }}</div>
                <div class="truncate text-xs sidebar-footer-email">{{ authStore.user?.email || '' }}</div>
              </div>
            </div>
          </v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-lock-reset" @click="showChangePasswordDialog = true">
            <v-list-item-title>{{ t('nav.changePassword') }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item prepend-icon="mdi-logout" @click="handleLogout">
            <v-list-item-title>{{ t('nav.logout') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-navigation-drawer>

  <ChangePasswordDialog v-model="showChangePasswordDialog" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSidebarStore } from '@/stores/sidebar'
import { useAuthStore } from '@/stores/auth.store'
import SidebarSearch from '@/components/panel/SidebarSearch.vue'
import PanelSidebarItem, { type PanelNavItem } from '@/components/panel/PanelSidebarItem.vue'
import ChangePasswordDialog from '@/components/dealer/ChangePasswordDialog.vue'

export interface PanelSidebarSection {
  title?: string
  items: PanelNavItem[]
}

interface Props {
  sections: PanelSidebarSection[]
  sectionTitleKeys: Record<string, string>
  navTitleKeys: Record<string, string>
  logoTo?: string
  onLogout: () => Promise<void>
  bootstrapUser?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  logoTo: '/',
  bootstrapUser: false,
})

const { t } = useI18n()
const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const router = useRouter()
const showChangePasswordDialog = ref(false)
const searchQuery = ref('')

const userInitials = computed(() => {
  const name = authStore.user?.name || t('common.userFallback')
  const names = name.split(' ')
  if (names.length >= 2) {
    const first = names[0]?.[0] || ''
    const last = names[names.length - 1]?.[0] || ''
    return (first + last).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

function getSectionTitle(title: string | undefined): string {
  if (!title) return ''
  const key = props.sectionTitleKeys[title]
  return key ? t(key) : title
}

function getItemSearchLabel(title: string): string {
  const key = props.navTitleKeys[title] || props.sectionTitleKeys[title]
  return key ? t(key) : title
}

const displayedSections = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.sections

  return props.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const title = getItemSearchLabel(item.title).toLowerCase()
        if (title.includes(query)) return true
        return item.items?.some((sub) => getItemSearchLabel(sub.title).toLowerCase().includes(query))
      }),
    }))
    .filter((section) => section.items.length > 0)
})

const handleLogout = async () => {
  try {
    await props.onLogout()
  } catch (error) {
    console.error('Logout error:', error)
    authStore.logout()
    router.push('/auth/login')
  }
}

onMounted(async () => {
  if (!props.bootstrapUser) return
  if (!authStore.accessToken || authStore.user) return
  try {
    const { getCurrentUser } = await import('@/services/auth')
    await getCurrentUser()
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
})
</script>

<style scoped>
.panel-sidebar {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

.panel-sidebar :deep(.v-navigation-drawer__content) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden !important;
}

.sidebar-header {
  flex-shrink: 0;
  padding: 0.875rem 0.75rem 0.5rem;
}

.sidebar-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-header-collapsed {
  justify-content: center;
}

.sidebar-header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.sidebar-header-logo img {
  width: auto;
  object-fit: contain;
  display: block;
}

.sidebar-content {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--sidebar-border) transparent;
}

.sidebar-content-collapsed {
  overflow: hidden !important;
}

.sidebar-group-label {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: color-mix(in oklch, var(--sidebar-foreground) 55%, transparent);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sidebar-group-collapsed .sidebar-menu {
  align-items: center;
}

.sidebar-footer {
  padding: 0.75rem;
  flex-shrink: 0;
  border-top: 1px solid var(--sidebar-border);
}

.sidebar-footer-item {
  cursor: pointer;
  min-height: 48px;
  padding: 0.375rem 0.75rem !important;
  border-radius: var(--radius-lg);
  justify-content: flex-start !important;
  text-transform: none;
  letter-spacing: normal;
  height: auto !important;
}

.sidebar-footer-item :deep(.v-btn__content) {
  justify-content: flex-start !important;
  width: 100%;
}

.sidebar-footer-meta {
  text-align: left;
}

.sidebar-footer-item-collapsed {
  justify-content: center;
  padding: 0.5rem !important;
  width: 36px;
  min-width: 36px;
  height: 36px;
  margin: 0 auto;
}

.sidebar-footer-item-collapsed .sidebar-footer-meta {
  display: none;
}

.sidebar-footer-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: var(--sidebar-active-bg);
  color: var(--sidebar-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.sidebar-footer-email {
  opacity: 0.7;
  font-size: 0.6875rem;
}

.sidebar-footer-item:hover {
  background: color-mix(in oklch, var(--sidebar-active-bg) 70%, var(--sidebar));
}

.flex { display: flex; }
.min-w-0 { min-width: 0; }
.items-center { align-items: center; }
.gap-1\.5 { gap: 0.375rem; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>

<style>
/* Menu is teleported outside the sidebar — needs a global class */
.sidebar-user-menu .v-list-item {
  justify-content: flex-start !important;
}

.sidebar-user-menu .v-list-item-title {
  text-align: left;
}
</style>
