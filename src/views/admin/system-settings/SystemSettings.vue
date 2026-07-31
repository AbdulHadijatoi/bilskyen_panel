<template>
  <div class="panel-page system-settings-page">
    <PageHeader
      :title="t('admin.views.systemSettings.title')"
      :subtitle="t('admin.views.systemSettings.subtitle')"
    />
    <PlatformSettingsPanel />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/panel/PageHeader.vue'
import PlatformSettingsPanel from '@/components/settings/panels/PlatformSettingsPanel.vue'

const { t } = useI18n()
</script>
