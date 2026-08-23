<template>
  <div class="settings-platform-panel">
    <PanelSection
      :title="t('settings.platform.localizationTitle')"
      :description="t('settings.platform.localizationDescription')"
      icon="mdi-translate"
    >
      <div class="settings-platform-panel__row">
        <v-switch
          v-model="languageSwitcherEnabled"
          color="primary"
          hide-details
          :loading="savingKey === 'language'"
          :disabled="loading || savingKey !== null"
          @update:model-value="saveLanguageSwitcher"
        />
        <div class="settings-platform-panel__copy">
          <p class="settings-platform-panel__label">{{ t('settings.platform.languageSwitcherEnabled') }}</p>
          <p class="settings-platform-panel__hint">{{ t('settings.platform.languageSwitcherHint') }}</p>
        </div>
      </div>
    </PanelSection>

    <PanelSection
      :title="t('settings.platform.faqTitle')"
      :description="t('settings.platform.faqDescription')"
      icon="mdi-help-circle-outline"
    >
      <div class="settings-platform-panel__row mb-4">
        <v-switch
          v-model="faqPageEnabled"
          color="primary"
          hide-details
          :loading="savingKey === 'faq_page'"
          :disabled="loading || savingKey !== null"
          @update:model-value="saveFaqPage"
        />
        <div class="settings-platform-panel__copy">
          <p class="settings-platform-panel__label">{{ t('settings.platform.faqPageEnabled') }}</p>
          <p class="settings-platform-panel__hint">{{ t('settings.platform.faqPageHint') }}</p>
        </div>
      </div>
      <div class="settings-platform-panel__row">
        <v-switch
          v-model="faqChatbotEnabled"
          color="primary"
          hide-details
          :loading="savingKey === 'faq_chatbot'"
          :disabled="loading || savingKey !== null || !faqPageEnabled"
          @update:model-value="saveFaqChatbot"
        />
        <div class="settings-platform-panel__copy">
          <p class="settings-platform-panel__label">{{ t('settings.platform.faqChatbotEnabled') }}</p>
          <p class="settings-platform-panel__hint">{{ t('settings.platform.faqChatbotHint') }}</p>
        </div>
      </div>
    </PanelSection>

    <PanelSection
      :title="t('settings.platform.vehicleDetailMapTitle')"
      :description="t('settings.platform.vehicleDetailMapDescription')"
      icon="mdi-map-marker-outline"
      :divider="false"
    >
      <div class="settings-platform-panel__row">
        <v-switch
          v-model="vehicleDetailMapEnabled"
          color="primary"
          hide-details
          :loading="savingKey === 'vehicle_detail_map'"
          :disabled="loading || savingKey !== null"
          @update:model-value="saveVehicleDetailMap"
        />
        <div class="settings-platform-panel__copy">
          <p class="settings-platform-panel__label">{{ t('settings.platform.vehicleDetailMapEnabled') }}</p>
          <p class="settings-platform-panel__hint">{{ t('settings.platform.vehicleDetailMapHint') }}</p>
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
const savingKey = ref<'language' | 'faq_page' | 'faq_chatbot' | 'vehicle_detail_map' | null>(null)
const languageSwitcherEnabled = ref(true)
const faqPageEnabled = ref(true)
const faqChatbotEnabled = ref(false)
const vehicleDetailMapEnabled = ref(true)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

function parseEnabled(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null) return fallback
  return value === true || value === 'true'
}

async function load() {
  loading.value = true
  message.value = ''
  try {
    const data = await getIntegrations()
    const enabled = parseEnabled(data.general?.language_switcher_enabled, true)
    languageSwitcherEnabled.value = enabled
    platformSettingsStore.setLanguageSwitcherEnabled(enabled)
    faqPageEnabled.value = parseEnabled(data.general?.faq_page_enabled, true)
    faqChatbotEnabled.value = parseEnabled(data.general?.faq_chatbot_enabled, false)
    vehicleDetailMapEnabled.value = parseEnabled(data.marketplace?.vehicle_detail_map_enabled, true)
  } catch {
    message.value = t('settings.platform.loadFailed')
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function saveLanguageSwitcher(enabled: boolean | null) {
  if (enabled === null || loading.value) return

  savingKey.value = 'language'
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
    savingKey.value = null
  }
}

async function saveFaqPage(enabled: boolean | null) {
  if (enabled === null || loading.value) return

  const previous = !enabled
  savingKey.value = 'faq_page'
  message.value = ''
  try {
    const payload: Record<string, boolean> = { faq_page_enabled: enabled }
    if (!enabled) {
      payload.faq_chatbot_enabled = false
      faqChatbotEnabled.value = false
    }
    await updateIntegrations('general', payload)
    message.value = t('settings.platform.saved')
    messageType.value = 'success'
  } catch {
    faqPageEnabled.value = previous
    message.value = t('settings.platform.saveFailed')
    messageType.value = 'error'
  } finally {
    savingKey.value = null
  }
}

async function saveFaqChatbot(enabled: boolean | null) {
  if (enabled === null || loading.value) return

  const previous = !enabled
  savingKey.value = 'faq_chatbot'
  message.value = ''
  try {
    await updateIntegrations('general', { faq_chatbot_enabled: enabled })
    message.value = t('settings.platform.saved')
    messageType.value = 'success'
  } catch {
    faqChatbotEnabled.value = previous
    message.value = t('settings.platform.saveFailed')
    messageType.value = 'error'
  } finally {
    savingKey.value = null
  }
}

async function saveVehicleDetailMap(enabled: boolean | null) {
  if (enabled === null || loading.value) return

  const previous = !enabled
  savingKey.value = 'vehicle_detail_map'
  message.value = ''
  try {
    await updateIntegrations('marketplace', { vehicle_detail_map_enabled: enabled })
    message.value = t('settings.platform.saved')
    messageType.value = 'success'
  } catch {
    vehicleDetailMapEnabled.value = previous
    message.value = t('settings.platform.saveFailed')
    messageType.value = 'error'
  } finally {
    savingKey.value = null
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
