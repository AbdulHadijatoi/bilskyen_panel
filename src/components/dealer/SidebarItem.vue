<template>
  <v-tooltip
    v-if="sidebarStore.isCollapsed && !sidebarStore.isMobile && (!item.items || item.items.length === 0)"
    location="right"
    :disabled="!sidebarStore.isCollapsed || sidebarStore.isMobile"
  >
    <template #activator="{ props: tooltipProps }">
      <v-list-item
        v-if="!item.items || item.items.length === 0"
        v-bind="tooltipProps"
        :to="item.url"
        :title="item.title"
        :active="isActive"
        class="sidebar-menu-item"
        :class="{ 'sidebar-menu-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
        :style="{
          height: sidebarStore.isCollapsed && !sidebarStore.isMobile ? '32px' : '32px',
          padding: '0.5rem',
          gap: '0.5rem',
        }"
      >
        <template #prepend>
          <v-icon v-if="item.icon" :size="16" :style="{ flexShrink: 0, display: 'block' }">{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </template>
    <span>{{ item.title }}</span>
  </v-tooltip>
  <v-list-item
    v-else-if="!item.items || item.items.length === 0"
    :to="item.url"
    :title="item.title"
    :active="isActive"
    class="sidebar-menu-item"
    :style="{
      height: '32px',
      padding: '0.5rem',
      gap: '0.5rem',
    }"
  >
    <template #prepend>
      <v-icon v-if="item.icon" :size="16" :style="{ flexShrink: 0, display: 'block' }">{{ item.icon }}</v-icon>
    </template>
  </v-list-item>

  <v-tooltip
    v-else-if="sidebarStore.isCollapsed && !sidebarStore.isMobile && item.items"
    location="right"
  >
    <template #activator="{ props: tooltipProps }">
      <v-list-item
        v-bind="tooltipProps"
        :active="isActive"
        class="sidebar-menu-item sidebar-menu-item-collapsed"
        :style="{
          height: '32px',
          padding: '0.5rem',
          gap: '0.5rem',
        }"
      >
        <template #prepend>
          <v-icon :size="16" :style="{ flexShrink: 0, display: 'block', visibility: 'visible', opacity: 1 }">{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </template>
    <span>{{ item.title }}</span>
  </v-tooltip>
  <div v-else-if="item.items" ref="menuGroupRef" class="sidebar-menu-group">
    <v-list-item
      :title="item.title"
      :active="isActive"
      class="sidebar-menu-item"
      :style="{
        height: '32px',
        padding: '0.5rem',
        gap: '0.5rem',
        cursor: 'pointer',
      }"
      @click="toggleExpanded"
    >
      <template #prepend>
        <v-icon :size="16" :style="{ flexShrink: 0, display: 'block' }">{{ item.icon }}</v-icon>
      </template>
      <template #append>
        <v-icon
          :size="16"
          class="sidebar-chevron transition-transform duration-200"
          :style="{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }"
        >
          mdi-chevron-right
        </v-icon>
      </template>
    </v-list-item>

    <transition
      name="collapsible"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="isExpanded"
        ref="submenuRef"
        class="sidebar-menu-sub"
        :style="{
          flexDirection: 'column',
          gap: '0.25rem',
          paddingLeft: '2rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
        }"
      >
        <v-list-item
          v-for="(subItem, index) in item.items"
          :key="`${item.title}-${index}`"
          :to="subItem.url"
          :title="subItem.title"
          :active="isSubItemActive(subItem.url)"
          class="sidebar-submenu-item"
          :style="{
            height: '28px',
            minHeight: '28px',
            padding: '0 0.5rem',
            gap: '0.5rem',
          }"
        >
          <template #prepend>
            <v-icon :size="16" :style="{ flexShrink: 0 }">{{ subItem.icon || 'mdi-circle-small' }}</v-icon>
          </template>
        </v-list-item>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import type { SidebarSectionItem } from '@/constants/dealer'

interface Props {
  item: SidebarSectionItem
}

const props = defineProps<Props>()
const route = useRoute()
const sidebarStore = useSidebarStore()

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
      // Only auto-expand if a sub-item is active, don't force collapse
      const shouldBeExpanded = props.item.items.some((subItem) =>
        newPath.startsWith(subItem.url)
      )
      if (shouldBeExpanded && !isExpanded.value) {
        isExpanded.value = true
        // Scroll will be handled by onAfterEnter transition hook
      }
    }
  },
  { immediate: true }
)

const isSubItemActive = (url: string) => {
  return route.path === url
}

const toggleExpanded = () => {
  if (!sidebarStore.isCollapsed || sidebarStore.isMobile) {
    isExpanded.value = !isExpanded.value
  }
}

const submenuRef = ref<HTMLElement | null>(null)
const menuGroupRef = ref<HTMLElement | null>(null)

/**
 * Find the scrollable sidebar container
 */
const findScrollableContainer = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null
  
  let current: HTMLElement | null = element.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
      return current
    }
    // Check if it's the sidebar-content class
    if (current.classList.contains('sidebar-content')) {
      return current
    }
    current = current.parentElement
  }
  return null
}

/**
 * Scroll to make the expanded content visible
 */
const scrollToExpandedContent = () => {
  nextTick(() => {
    if (!submenuRef.value || !menuGroupRef.value) return
    
    // Skip scrolling if sidebar is collapsed or on mobile
    if (sidebarStore.isCollapsed && !sidebarStore.isMobile) return
    
    const scrollContainer = findScrollableContainer(submenuRef.value)
    if (!scrollContainer) return
    
    const containerRect = scrollContainer.getBoundingClientRect()
    const expandedRect = submenuRef.value.getBoundingClientRect()
    
    // Check if the expanded content is outside the visible viewport
    const isAboveViewport = expandedRect.top < containerRect.top
    const isBelowViewport = expandedRect.bottom > containerRect.bottom
    
    // Only scroll if content is outside the viewport
    if (isAboveViewport || isBelowViewport) {
      // Use scrollIntoView for smooth scrolling
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
  // Force reflow
  void element.offsetHeight
  element.style.height = `${element.scrollHeight}px`
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = 'auto'
  element.style.overflow = ''
  // Scroll to make expanded content visible
  scrollToExpandedContent()
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.overflow = 'hidden'
  // Force reflow
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
/* Removed wrapper div, styles moved to individual items */

.sidebar-menu-item {
  border-radius: 0.375rem;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  text-align: left;
  font-size: 0.875rem;
  outline: none;
  transition: width 0.2s ease-linear, height 0.2s ease-linear, padding 0.2s ease-linear;
}

.sidebar-menu-item-collapsed {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  padding: 0.5rem !important;
  justify-content: center !important;
  align-items: center !important;
  margin: 0 auto !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item__prepend) {
  margin-inline-end: 0 !important;
  margin-inline-start: 0 !important;
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  align-items: center !important;
  justify-content: center !important;
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item__prepend .v-icon) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
  font-size: 16px !important;
  line-height: 16px !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item__prepend *) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item__content) {
  display: none !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item-title) {
  display: none !important;
}

.sidebar-menu-group {
  position: relative;
}

:deep(.v-list-group__items) {
  border-left: 1px solid var(--sidebar-border);
  margin-left: 0.875rem;
  margin-right: 0.875rem;
  padding-left: 0.625rem !important;
  padding-right: 0.625rem !important;
  padding-top: 0.125rem !important;
  padding-bottom: 0.125rem !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0.25rem !important;
  transform: translateX(1px);
  transition: opacity 0.2s ease-linear;
}

.sidebar-menu-sub-collapsed {
  display: none !important;
}

/* Prevent group expansion when collapsed */
:deep(.v-list-group--disabled) {
  pointer-events: auto !important;
}

:deep(.v-list-group--disabled .v-list-group__header) {
  pointer-events: auto !important;
  cursor: default !important;
}

:deep(.v-list-group--disabled .v-list-group__items) {
  display: none !important;
}

:deep(.v-list-group:not(.v-list-group--disabled) .v-list-group__items) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: none !important;
  overflow: visible !important;
}

:deep(.v-list-group[aria-expanded="true"] .v-list-group__items) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

:deep(.v-list-group__items) {
  padding: 0 !important;
  margin: 0 !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: none !important;
  overflow: visible !important;
}

:deep(.v-list-group__items .v-list-item) {
  margin-left: 0 !important;
  margin-right: 0 !important;
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.sidebar-menu-sub {
  list-style: none !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
  display: flex !important;
  overflow: hidden !important;
}

/* Remove spacer between icon and label for all sidebar items */
:deep(.sidebar-menu-item .v-list-item__spacer),
:deep(.sidebar-submenu-item .v-list-item__spacer),
:deep(.v-list-item__prepend .v-list-item__spacer),
:deep(.v-list-item__append .v-list-item__spacer),
:deep(.sidebar-menu-item .v-list-item__prepend .v-list-item__spacer),
:deep(.sidebar-menu-item .v-list-item__append .v-list-item__spacer) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  flex: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.sidebar-submenu-item {
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-height: 28px;
  height: 28px;
  list-style: none !important;
}

:deep(.sidebar-menu-sub .v-list-item),
:deep(.sidebar-submenu-item) {
  list-style: none !important;
}

:deep(.sidebar-menu-sub .v-list-item::before),
:deep(.sidebar-menu-sub .v-list-item::marker),
:deep(.sidebar-submenu-item::before),
:deep(.sidebar-submenu-item::marker) {
  display: none !important;
  content: none !important;
}

/* Collapsible transition - matching Next.js sidebar */
.collapsible-enter-active {
  transition: height 0.2s ease-out;
  overflow: hidden;
}

.collapsible-leave-active {
  transition: height 0.2s ease-out;
  overflow: hidden;
}

/* Match Next.js sidebar styling */
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

:deep(.v-list-item-title) {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  line-height: 1.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 0%;
  min-width: 0;
}

/* Right-align chevron icons */
.sidebar-chevron {
  margin-left: auto !important;
  flex-shrink: 0;
}

:deep(.v-list-item__append) {
  margin-left: auto !important;
  flex-shrink: 0;
}

:deep(.v-list-item) {
  display: flex !important;
  align-items: center !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-direction: row !important;
}

.sidebar-menu-item-collapsed :deep(.v-list-item__overlay) {
  display: none !important;
}

:deep(.v-list-group__items) {
  padding: 0 !important;
  margin: 0 !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: none !important;
  overflow: visible !important;
}

:deep(.v-list-group__items .v-list-item) {
  margin-left: 0 !important;
  margin-right: 0 !important;
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

:deep(.v-list-group__header) {
  padding: 0 !important;
}

:deep(.v-list-group__header .v-list-item) {
  padding: 0.5rem !important;
}

/* Hide group items when collapsed */
:deep(.v-list-group[data-collapsed="true"] .v-list-group__items) {
  display: none !important;
}

/* Force show items when expanded - override all Vuetify defaults */
:deep(.v-list-group:not(.v-list-group--disabled) .v-list-group__items) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: 9999px !important;
  height: auto !important;
  overflow: visible !important;
}

/* Ensure items are visible when model is true - check multiple possible states */
:deep(.v-list-group[aria-expanded="true"] .v-list-group__items),
:deep(.v-list-group--active .v-list-group__items),
:deep(.v-list-group[data-model-value="true"] .v-list-group__items) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: 9999px !important;
  height: auto !important;
}

/* Override any Vuetify default hiding - be very aggressive */
:deep(.v-list-group .v-list-group__items[style*="display: none"]),
:deep(.v-list-group .v-list-group__items[style*="display:none"]),
:deep(.v-list-group .v-list-group__items[style*="height: 0"]),
:deep(.v-list-group .v-list-group__items[style*="height:0"]),
:deep(.v-list-group .v-list-group__items[style*="max-height: 0"]),
:deep(.v-list-group .v-list-group__items[style*="max-height:0"]) {
  display: block !important;
  height: auto !important;
  max-height: 9999px !important;
}

/* Make sure all list items inside are visible */
:deep(.v-list-group__items .v-list-item) {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: 28px !important;
  min-height: 28px !important;
}

/* Ensure items are visible when model is true */
:deep(.v-list-group[aria-expanded="true"] .v-list-group__items),
:deep(.v-list-group--active .v-list-group__items) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: 9999px !important;
  height: auto !important;
}

/* Override any Vuetify default hiding - be very aggressive */
:deep(.v-list-group .v-list-group__items[style*="display: none"]),
:deep(.v-list-group .v-list-group__items[style*="display:none"]) {
  display: block !important;
}
</style>
