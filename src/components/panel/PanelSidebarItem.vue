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
          <div v-if="item.icon" class="flex items-center justify-center icon">
            <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
          </div>
          <div class="flex min-w-0 grow items-center gap-2.5">
            <div class="truncate">{{ translatedItemTitle }}</div>
            <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
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
      <div v-if="item.icon" class="flex items-center justify-center icon">
        <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
      </div>
      <div class="flex min-w-0 grow items-center gap-2.5">
        <div class="truncate">{{ translatedItemTitle }}</div>
        <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
      </div>
    </div>
  </component>

  <!-- Expandable menu item -->
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
            <div v-if="item.icon" class="flex items-center justify-center icon">
              <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
            </div>
            <div class="flex min-w-0 grow items-center gap-2.5">
              <div class="truncate">{{ translatedItemTitle }}</div>
              <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
            </div>
          </div>
          <div class="trailing">
            <v-icon :size="16" class="transition-transform duration-200" :style="{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }">
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
      :class="{ 'menu-item-active': isActive, 'menu-item-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
      data-sidebar-item="true"
      @click="toggleExpanded"
      @keydown.enter="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <div class="flex min-w-0 items-center gap-1.5">
        <div v-if="item.icon" class="flex items-center justify-center icon">
          <v-icon :size="20" class="icon">{{ item.icon }}</v-icon>
        </div>
        <div class="flex min-w-0 grow items-center gap-2.5">
          <div class="truncate">{{ translatedItemTitle }}</div>
          <span v-if="item.badge" class="__menu-item-badge">{{ item.badge }}</span>
        </div>
      </div>
      <div class="trailing">
        <v-icon :size="16" class="transition-transform duration-200" :style="{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }">
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
      <div v-if="isExpanded && (!sidebarStore.isCollapsed || sidebarStore.isMobile)" ref="submenuRef" class="sidebar-menu-sub">
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
            <div v-if="subItem.icon" class="flex items-center justify-center icon">
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

export interface PanelNavItem {
  title: string
  url: string
  icon?: string
  badge?: string
  permission?: string
  items?: PanelNavItem[]
  shortcut?: string[]
}

interface Props {
  item: PanelNavItem
  navTitleKeys: Record<string, string>
}

const props = defineProps<Props>()
const { t } = useI18n()
const route = useRoute()
const sidebarStore = useSidebarStore()

const translatedItemTitle = computed(() => {
  const key = props.navTitleKeys[props.item.title]
  return key ? t(key) : props.item.title
})

function getSubItemTitle(title: string): string {
  const key = props.navTitleKeys[title]
  return key ? t(key) : title
}

const isActive = computed(() => {
  return route.path.startsWith(props.item.url) && (!props.item.items || route.path === props.item.url)
})

const isExpanded = ref(false)

watch(
  () => route.path,
  (newPath) => {
    if (!props.item.items) return
    if (sidebarStore.isCollapsed && !sidebarStore.isMobile) return
    const shouldBeExpanded = props.item.items.some((subItem) => newPath.startsWith(subItem.url))
    if (shouldBeExpanded && !isExpanded.value) isExpanded.value = true
  },
  { immediate: true },
)

watch(
  () => sidebarStore.isCollapsed,
  (isCollapsed) => {
    if (!props.item.items) return
    if (isCollapsed && !sidebarStore.isMobile && isExpanded.value) {
      isExpanded.value = false
    } else if (!isCollapsed && !sidebarStore.isMobile) {
      const hasActiveSubItem = props.item.items.some((subItem) => route.path.startsWith(subItem.url))
      if (hasActiveSubItem && !isExpanded.value) isExpanded.value = true
    }
  },
)

const isSubItemActive = (url: string) => route.path === url

const toggleExpanded = () => {
  if (sidebarStore.isCollapsed && !sidebarStore.isMobile) {
    sidebarStore.isCollapsed = false
    return
  }
  isExpanded.value = !isExpanded.value
}

const submenuRef = ref<HTMLElement | null>(null)
const menuGroupRef = ref<HTMLElement | null>(null)

const findScrollableContainer = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null
  let current: HTMLElement | null = element.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll' || current.classList.contains('sidebar-content')) {
      return current
    }
    current = current.parentElement
  }
  return null
}

const scrollToExpandedContent = () => {
  nextTick(() => {
    if (!submenuRef.value || sidebarStore.isCollapsed && !sidebarStore.isMobile) return
    const scrollContainer = findScrollableContainer(submenuRef.value)
    if (!scrollContainer) return
    const containerRect = scrollContainer.getBoundingClientRect()
    const expandedRect = submenuRef.value.getBoundingClientRect()
    if (expandedRect.top < containerRect.top || expandedRect.bottom > containerRect.bottom) {
      submenuRef.value.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
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
.__menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  text-decoration: none;
  color: var(--sidebar-foreground);
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  font-size: var(--text-sm);
  line-height: 1.25rem;
}

.__menu-item.router-link-active,
.__menu-item.router-link-exact-active,
.__menu-item.menu-item-active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-foreground);
  font-weight: 500;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sidebar-active);
}

.__menu-item:hover,
.__menu-item.hoverable:hover {
  background-color: color-mix(in oklch, var(--sidebar-active-bg) 70%, var(--sidebar));
  color: var(--sidebar-foreground);
}

.__menu-item.menu-item-collapsed {
  justify-content: center;
  padding: 0.5rem;
  width: 32px;
  min-width: 32px;
  height: 32px;
  margin: 0 auto;
}

.menu-item-collapsed .flex.min-w-0.grow,
.menu-item-collapsed .trailing {
  display: none !important;
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
  border-radius: 9999px;
  background-color: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.trailing { flex-shrink: 0; margin-left: auto; opacity: 0.6; }
.__submenu-item { padding-left: 2.75rem; min-height: 28px; font-size: 0.75rem; margin-left: 0.5rem; }
.sidebar-menu-sub { display: flex; flex-direction: column; gap: 0.125rem; padding: 0.25rem 0; overflow: hidden; }
.collapsible-enter-active, .collapsible-leave-active { transition: height 0.2s ease-out; overflow: hidden; }
.flex { display: flex; }
.min-w-0 { min-width: 0; }
.items-center { align-items: center; }
.gap-1\.5 { gap: 0.375rem; }
.gap-2\.5 { gap: 0.625rem; }
.grow { flex-grow: 1; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
