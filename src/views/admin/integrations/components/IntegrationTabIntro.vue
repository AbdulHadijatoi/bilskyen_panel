<template>
  <div class="integration-tab-intro">
    <h2 class="integration-tab-intro__title">{{ title }}</h2>
    <PanelHelpHint :text="help" location="bottom start" :max-width="360" :aria-label="t('admin.views.integrations.helpAria')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'

defineProps<{
  title: string
  help: string
}>()

const { t } = useI18n()
</script>

<style scoped>
.integration-tab-intro {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.integration-tab-intro__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.3;
}
</style>
