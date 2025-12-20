<template>
  <header
    class="dealer-header"
    :class="{ 'header-collapsed': sidebarStore.isCollapsed && !sidebarStore.isMobile }"
    :style="{
      backgroundColor: 'var(--background)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: '0.5rem',
      borderBottom: '1px solid var(--border)',
      padding: '0.625rem 1rem',
      transition: 'width 0.2s ease-linear, height 0.2s ease-linear',
      width: '100%',
      minHeight: '48px',
    }"
  >
    <div
      class="header-content"
      :style="{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '0.5rem',
      }"
    >
      <button
        @click="sidebarStore.toggleSidebar"
        class="sidebar-trigger"
        aria-label="Toggle Sidebar"
        type="button"
        :style="{
          marginLeft: '-0.25rem',
          width: '28px',
          height: '28px',
          minWidth: '28px',
          minHeight: '28px',
          display: 'flex !important',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.375rem',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'var(--foreground)',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }"
        @mouseenter="(e: MouseEvent) => {
          const target = e.currentTarget as HTMLElement
          target.style.backgroundColor = 'var(--accent)'
        }"
        @mouseleave="(e: MouseEvent) => {
          const target = e.currentTarget as HTMLElement
          target.style.backgroundColor = 'transparent'
        }"
      >
        <LayoutPanelLeft
          class="menu-icon"
        />
      </button>

      <div
        class="header-separator"
        :style="{
          width: '1px',
          height: '16px',
          backgroundColor: 'var(--border)',
          marginRight: '0.5rem',
        }"
      />

      <Breadcrumb />

      <div style="flex-grow: 1;" />

      <ThemeToggle />

      <NotificationsButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import { LayoutPanelLeft } from 'lucide-vue-next'
import { useSidebarStore } from '@/stores/sidebar'
import Breadcrumb from './Breadcrumb.vue'
import NotificationsButton from './NotificationsButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const sidebarStore = useSidebarStore()
</script>

<style scoped>
.dealer-header {
  height: 48px;
  min-height: 48px;
  box-sizing: border-box;
}

.header-collapsed {
  height: 48px;
}

.header-content {
  display: flex !important;
  width: 100% !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.sidebar-trigger {
  position: relative;
  flex-shrink: 0;
}

.sidebar-trigger:hover {
  background-color: var(--accent) !important;
}

.sidebar-trigger {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.sidebar-trigger .menu-icon {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  flex-shrink: 0;
}

.sidebar-trigger .menu-icon svg {
  width: 16px !important;
  height: 16px !important;
  display: block !important;
  stroke: var(--foreground) !important;
  color: var(--foreground) !important;
}

.header-separator {
  flex-shrink: 0;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.breadcrumb {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  flex-shrink: 1;
  min-width: 0;
}

.breadcrumb :deep(*) {
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
