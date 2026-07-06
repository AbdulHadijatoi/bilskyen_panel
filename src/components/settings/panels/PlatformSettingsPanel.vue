<template>
  <div class="settings-platform-panel">
    <PanelSection
      :title="t('settings.platform.localizationTitle')"
      :description="t('settings.platform.localizationDescription')"
      icon="mdi-translate"
      :divider="false"
    >
      <div class="settings-platform-panel__row">
        <v-switch
          v-model="languageSwitcherEnabled"
          color="primary"
          hide-details
          :loading="saving"
          :disabled="loading || saving"
          @update:model-value="saveLanguageSwitcher"
        />
        <div class="settings-platform-panel__copy">
          <p class="settings-platform-panel__label">{{ t('settings.platform.languageSwitcherEnabled') }}</p>
          <p class="settings-platform-panel__hint">{{ t('settings.platform.languageSwitcherHint') }}</p>
        </div>
      </div>
    </PanelSection>

    <v-alert
      v-if="message"
      :type="messageType"
      variant="tonal"
      density="compact"
      class="mt-4"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getIntegrations, updateIntegrations } from '@/api/admin.api'
import PanelSection from '@/components/ui/PanelSection.vue'
import { usePlatformSettingsStore } from '@/stores/platformSettings.store'

const { t } = useI18n()
const platformSettingsStore = usePlatformSettingsStore()

const loading = ref(true)
const saving = ref(false)
const languageSwitcherEnabled = ref(true)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

function parseEnabled(value: unknown): boolean {
  return value === true || value === 'true'
}

async function load() {
  loading.value = true
  message.value = ''
  try {
    const data = await getIntegrations()
    const enabled = parseEnabled(data.general?.language_switcher_enabled ?? true)
    languageSwitcherEnabled.value = enabled
    platformSettingsStore.setLanguageSwitcherEnabled(enabled)
  } catch {
    message.value = t('settings.platform.loadFailed')
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function saveLanguageSwitcher(enabled: boolean | null) {
  if (enabled === null || loading.value) return

  saving.value = true
  message.value = ''
  try {
    await updateIntegrations('general', { language_switcher_enabled: enabled })
    platformSettingsStore.setLanguageSwitcherEnabled(enabled)
    message.value = t('settings.platform.saved')
    messageType.value = 'success'
  } catch {
    languageSwitcherEnabled.value = platformSettingsStore.languageSwitcherEnabled
    message.value = t('settings.platform.saveFailed')
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.settings-platform-panel__row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.settings-platform-panel__copy {
  flex: 1;
  min-width: 0;
}

.settings-platform-panel__label {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--foreground);
}

.settings-platform-panel__hint {
  margin: 0.25rem 0 0;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  line-height: 1.5;
}
</style>
