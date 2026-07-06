<template>
  <div class="settings-sessions-panel">
    <PanelSection
      :title="t('dealer.views.sessions.title')"
      description="View and manage your active sessions."
      icon="mdi-devices"
      :divider="false"
    >
      <PanelCard>
        <p class="settings-sessions-panel__placeholder">{{ t('dealer.views.sessions.placeholder') }}</p>
      </PanelCard>
    </PanelSection>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PanelSection from '@/components/ui/PanelSection.vue'
import PanelCard from '@/components/panel/PanelCard.vue'

const { t } = useI18n()
</script>

<style scoped>
.settings-sessions-panel__placeholder {
  margin: 0;
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--muted-foreground);
  font-size: var(--text-sm);
}
</style>
