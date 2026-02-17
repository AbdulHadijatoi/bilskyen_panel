<template>
  <!-- Simple menu item (no children) -->
  <v-tooltip
    v-if="sidebarStore.isCollapsed && !sidebarStore.isMobile && (!item.items || item.items.length === 0)"
    location="right"
  >
    <template #activator="{ props: tooltipProps }">
      <component
        :is="item.url ? 'router-link' : 'div'"
        :to="item.url"
        v-bind="tooltipProps"
        tabindex="0"
        class="group __menu-item hoverable"
        :class="{
          'menu-item-active': isActive,
          'menu-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile,
        }"
        data-sidebar-item="true"
      >
        <div class="flex min-w-0 items-center gap-1.5">
          <div
            v-if="item.icon"
            class="flex items-center justify-center icon group-disabled:opacity-50 group-data-disabled:opacity-50"
          >
            <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
          </div>
          <div class="flex min-w-0 grow items-center gap-2.5">
            <div class="truncate">{{ translatedItemTitle }}</div>
            <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
          </div>
        </div>
        <div v-if="item.shortcut && (!sidebarStore.isCollapsed || sidebarStore.isMobile)" class="trailing highlight text-token-text-tertiary">
          <div class="inline-flex whitespace-pre *:inline-flex *:font-sans touch:hidden">
            <kbd v-for="(key, index) in item.shortcut" :key="index" :aria-label="key">
              <span class="min-w-[1em]">{{ formatKey(key) }}</span>
            </kbd>
          </div>
        </div>
      </component>
    </template>
    <span>{{ translatedItemTitle }}</span>
  </v-tooltip>
  <component
    v-else-if="!item.items || item.items.length === 0"
    :is="item.url ? 'router-link' : 'div'"
    :to="item.url"
    tabindex="0"
    class="group __menu-item hoverable"
    :class="{
      'menu-item-active': isActive,
      'menu-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile,
    }"
    data-sidebar-item="true"
  >
    <div class="flex min-w-0 items-center gap-1.5">
      <div
        v-if="item.icon"
        class="flex items-center justify-center icon group-disabled:opacity-50 group-data-disabled:opacity-50"
      >
        <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
      </div>
      <div class="flex min-w-0 grow items-center gap-2.5">
        <div class="truncate">{{ translatedItemTitle }}</div>
        <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
      </div>
    </div>
    <div v-if="item.shortcut && (!sidebarStore.isCollapsed || sidebarStore.isMobile)" class="trailing highlight text-token-text-tertiary">
      <div class="inline-flex whitespace-pre *:inline-flex *:font-sans touch:hidden">
        <kbd v-for="(key, index) in item.shortcut" :key="index" :aria-label="key">
          <span class="min-w-[1em]">{{ formatKey(key) }}</span>
        </kbd>
      </div>
    </div>
  </component>

  <!-- Expandable menu item (with children) -->
  <div v-else ref="menuGroupRef" class="sidebar-menu-group">
    <v-tooltip
      v-if="sidebarStore.isCollapsed && !sidebarStore.isMobile"
      location="right"
    >
      <template #activator="{ props: tooltipProps }">
        <div
          v-bind="tooltipProps"
          tabindex="0"
          class="group __menu-item hoverable"
          :class="{
            'menu-item-active': isActive,
            'menu-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile,
          }"
          data-sidebar-item="true"
          @click="toggleExpanded"
          @keydown.enter="toggleExpanded"
          @keydown.space.prevent="toggleExpanded"
        >
          <div class="flex min-w-0 items-center gap-1.5">
            <div
              v-if="item.icon"
              class="flex items-center justify-center icon group-disabled:opacity-50 group-data-disabled:opacity-50"
            >
              <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
            </div>
            <div class="flex min-w-0 grow items-center gap-2.5">
              <div class="truncate">{{ translatedItemTitle }}</div>
              <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
            </div>
          </div>
          <div class="trailing">
            <v-icon
              :size="16"
              class="transition-transform duration-200"
              :style="{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }"
            >
              mdi-chevron-right
            </v-icon>
          </div>
        </div>
      </template>
      <span>{{ translatedItemTitle }}</span>
    </v-tooltip>
    <div
      v-else
      tabindex="0"
      class="group __menu-item hoverable"
      :class="{
        'menu-item-active': isActive,
        'menu-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile,
      }"
      data-sidebar-item="true"
      @click="toggleExpanded"
      @keydown.enter="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <div class="flex min-w-0 items-center gap-1.5">
        <div
          v-if="item.icon"
          class="flex items-center justify-center icon group-disabled:opacity-50 group-data-disabled:opacity-50"
        >
          <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
        </div>
        <div class="flex min-w-0 grow items-center gap-2.5">
          <div class="truncate">{{ translatedItemTitle }}</div>
          <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
        </div>
      </div>
      <div class="trailing">
        <v-icon
          :size="16"
          class="transition-transform duration-200"
          :style="{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }"
        >
          mdi-chevron-right
        </v-icon>
      </div>
    </div>

    <transition
      v-if="!sidebarStore.isCollapsed || sidebarStore.isMobile"
      name="collapsible"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="isExpanded && (!sidebarStore.isCollapsed || sidebarStore.isMobile)"
        ref="submenuRef"
        class="sidebar-menu-sub"
      >
        <router-link
          v-for="(subItem, index) in item.items"
          :key="`${item.title}-${index}`"
          :to="subItem.url"
          tabindex="0"
          class="group __menu-item hoverable __submenu-item"
          :class="{ 'menu-item-active': isSubItemActive(subItem.url) }"
          data-sidebar-item="true"
        >
          <div class="flex min-w-0 items-center gap-1.5">
            <div
              v-if="subItem.icon"
              class="flex items-center justify-center icon group-disabled:opacity-50 group-data-disabled:opacity-50"
            >
              <v-icon :size="20" class="icon">{{ subItem.icon || 'mdi-circle-small' }}</v-icon>
            </div>
            <div class="flex min-w-0 grow items-center gap-2.5">
              <div class="truncate">{{ getSubItemTitle(subItem.title) }}</div>
              <span v-if="subItem.badge" class="__menu-item-badge">{{ subItem.badge }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSidebarStore } from '@/stores/sidebar'
import type { SidebarSectionItem } from '@/constants/admin'

const ADMIN_NAV_TITLE_KEYS: Record<string, string> = {
  Dashboard: 'admin.nav.dashboard',
  Users: 'admin.nav.users',
  Overview: 'admin.nav.overview',
  Vehicles: 'admin.nav.vehicles',
  Pages: 'admin.nav.pages',
  'Home Page Content': 'admin.nav.homePageContent',
  'About Page Content': 'admin.nav.aboutPageContent',
  'Contact Page Content': 'admin.nav.contactPageContent',
  'Privacy Page Content': 'admin.nav.privacyPageContent',
  'Terms Page Content': 'admin.nav.termsPageContent',
  'Featured Vehicles': 'admin.nav.featuredVehicles',
  Plans: 'admin.nav.plans',
  Subscriptions: 'admin.nav.subscriptions',
  Analytics: 'admin.nav.analytics',
  'Audit Logs': 'admin.nav.auditLogs',
  Constants: 'admin.nav.constants',
  Permissions: 'admin.nav.permissions',
  Translations: 'admin.nav.translations',
  'Manage Translations': 'admin.nav.manageTranslations',
  'Import Translations': 'admin.nav.importTranslations',
}

interface Props {
  item: SidebarSectionItem
}

const props = defineProps<Props>()
const { t } = useI18n()
const route = useRoute()
const sidebarStore = useSidebarStore()

const translatedItemTitle = computed(() => {
  const key = ADMIN_NAV_TITLE_KEYS[props.item.title]
  return key ? t(key) : props.item.title
})

function getSubItemTitle(title: string): string {
  const key = ADMIN_NAV_TITLE_KEYS[title]
  return key ? t(key) : title
}

const isActive = computed(() => {
  return (
    route.path.startsWith(props.item.url) &&
    (!props.item.items || route.path === props.item.url)
  )
})

const isExpanded = ref(false)

// Watch for route changes to auto-expand
watch(
  () => route.path,
  (newPath) => {
    if (props.item.items) {
      if (sidebarStore.isCollapsed && !sidebarStore.isMobile) {
        return
      }
      
      const shouldBeExpanded = props.item.items.some((subItem) =>
        newPath.startsWith(subItem.url)
      )
      if (shouldBeExpanded && !isExpanded.value) {
        isExpanded.value = true
      }
    }
  },
  { immediate: true }
)

watch(
  () => sidebarStore.isCollapsed,
  (isCollapsed) => {
    if (!props.item.items) return
    
    if (isCollapsed && !sidebarStore.isMobile && isExpanded.value) {
      isExpanded.value = false
    } else if (!isCollapsed && !sidebarStore.isMobile) {
      const hasActiveSubItem = props.item.items.some((subItem) =>
        route.path.startsWith(subItem.url)
      )
      if (hasActiveSubItem && !isExpanded.value) {
        isExpanded.value = true
      }
    }
  }
)

const isSubItemActive = (url: string) => {
  return route.path === url
}

const toggleExpanded = () => {
  if (sidebarStore.isCollapsed && !sidebarStore.isMobile) {
    sidebarStore.isCollapsed = false
    return
  }
  
  isExpanded.value = !isExpanded.value
}

const formatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'Shift': '⇧',
    'Command': '⌘',
    'Ctrl': '⌃',
    'Alt': '⌥',
    'Meta': '⌘',
  }
  return keyMap[key] || key
}

const submenuRef = ref<HTMLElement | null>(null)
const menuGroupRef = ref<HTMLElement | null>(null)

const findScrollableContainer = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null
  
  let current: HTMLElement | null = element.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
      return current
    }
    if (current.classList.contains('sidebar-content')) {
      return current
    }
    current = current.parentElement
  }
  return null
}

const scrollToExpandedContent = () => {
  nextTick(() => {
    if (!submenuRef.value || !menuGroupRef.value) return
    
    if (sidebarStore.isCollapsed && !sidebarStore.isMobile) return
    
    const scrollContainer = findScrollableContainer(submenuRef.value)
    if (!scrollContainer) return
    
    const containerRect = scrollContainer.getBoundingClientRect()
    const expandedRect = submenuRef.value.getBoundingClientRect()
    
    const isAboveViewport = expandedRect.top < containerRect.top
    const isBelowViewport = expandedRect.bottom > containerRect.bottom
    
    if (isAboveViewport || isBelowViewport) {
      submenuRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  })
}

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.overflow = 'hidden'
  void element.offsetHeight
  element.style.height = `${element.scrollHeight}px`
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = 'auto'
  element.style.overflow = ''
  scrollToExpandedContent()
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.overflow = 'hidden'
  void element.offsetHeight
  element.style.height = '0'
}

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = ''
  element.style.overflow = ''
}
</script>

<style scoped>
/* ChatGPT-style menu item */
.__menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  text-decoration: none;
  color: var(--sidebar-foreground);
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.8125rem;
  line-height: 1.25rem;
}

.__menu-item.router-link-active,
.__menu-item.router-link-exact-active {
  background-color: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  font-weight: 500;
}

.__menu-item:hover,
.__menu-item.hoverable:hover {
  background-color: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.__menu-item.menu-item-active {
  background-color: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  font-weight: 500;
}

.__menu-item:focus-visible {
  outline: 2px solid var(--sidebar-ring);
  outline-offset: 2px;
}

.__menu-item.menu-item-collapsed {
  justify-content: center;
  padding: 0.5rem;
  width: 32px;
  min-width: 32px;
  height: 32px;
  margin: 0 auto;
}

.menu-item-collapsed .flex {
  justify-content: center;
}

.menu-item-collapsed .flex.min-w-0.grow {
  display: none !important;
}

.menu-item-collapsed .trailing {
  display: none !important;
}

.menu-item-collapsed .icon {
  margin: 0;
}

.icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.__menu-item-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
  border-radius: 9999px;
  background-color: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  white-space: nowrap;
}

.trailing {
  flex-shrink: 0;
  margin-left: auto;
  opacity: 0.6;
  font-size: 0.6875rem;
}

.trailing kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1em;
  padding: 0.125rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
  border-radius: 0.25rem;
  background-color: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  border: 1px solid var(--sidebar-border);
  box-shadow: 0 1px 0 0 var(--sidebar-border);
}

.trailing kbd + kbd {
  margin-left: 0.125rem;
}

.__submenu-item {
  padding-left: 2.75rem;
  min-height: 28px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.sidebar-menu-group {
  position: relative;
}

.sidebar-menu-sub {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  overflow: hidden;
}

.collapsible-enter-active {
  transition: height 0.2s ease-out;
  overflow: hidden;
}

.collapsible-leave-active {
  transition: height 0.2s ease-out;
  overflow: hidden;
}

.flex {
  display: flex;
}

.min-w-0 {
  min-width: 0;
}

.items-center {
  align-items: center;
}

.gap-1\.5 {
  gap: 0.375rem;
}

.gap-2\.5 {
  gap: 0.625rem;
}

.grow {
  flex-grow: 1;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.whitespace-pre {
  white-space: pre;
}

.inline-flex {
  display: inline-flex;
}
</style>

