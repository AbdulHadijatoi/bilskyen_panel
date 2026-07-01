<template>
  <header class="panel-shell-header">
    <div class="panel-shell-header__inner">
      <button
        type="button"
        class="panel-shell-header__trigger"
        :aria-label="t('common.toggleSidebar')"
        @click="sidebarStore.toggleSidebar"
      >
        <LayoutPanelLeft :size="18" />
      </button>

      <div class="panel-shell-header__sep" />

      <Breadcrumb />

      <div class="panel-shell-header__spacer" />

      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { LayoutPanelLeft } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSidebarStore } from '@/stores/sidebar'
import Breadcrumb from '@/components/dealer/Breadcrumb.vue'

const { t } = useI18n()
const sidebarStore = useSidebarStore()
</script>
