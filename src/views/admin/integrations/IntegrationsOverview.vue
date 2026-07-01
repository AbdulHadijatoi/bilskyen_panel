<template>
  <div>
    <div class="header-section mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">{{ t('admin.views.integrations.title') }}</h1>
      <p class="text-body-2 text-medium-emphasis">{{ t('admin.views.integrations.subtitle') }}</p>
    </div>

    <v-tabs v-model="tab" class="mb-4">
      <v-tab value="crm">{{ t('admin.views.integrations.tabCrm') }}</v-tab>
      <v-tab value="payment">{{ t('admin.views.integrations.tabPayment') }}</v-tab>
      <v-tab value="ai">{{ t('admin.views.integrations.tabAi') }}</v-tab>
      <v-tab value="media">{{ t('admin.views.integrations.tabMedia') }}</v-tab>
      <v-tab value="finance">{{ t('admin.views.integrations.tabFinance') }}</v-tab>
      <v-tab value="marketing">{{ t('admin.views.integrations.tabMarketing') }}</v-tab>
      <v-tab value="compliance">{{ t('admin.views.integrations.tabCompliance') }}</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="crm">
        <v-card variant="outlined" class="pa-4">
          <v-switch
            v-model="crmSettings.email_on_new_lead"
            :label="t('admin.views.integrations.emailOnNewLead')"
            color="primary"
            hide-details
            class="mb-4"
          />
          <v-text-field
            v-model.number="crmSettings.stale_lead_hours"
            type="number"
            :label="t('admin.views.integrations.staleLeadHours')"
            variant="outlined"
            density="compact"
          />
        </v-card>
      </v-window-item>
      <v-window-item value="payment">
        <v-card variant="outlined" class="pa-4">
          <v-switch
            v-model="paymentSettings.stripe_enabled"
            :label="t('admin.views.integrations.enableStripe')"
            color="primary"
            class="mb-4"
          />
          <v-switch
            v-model="paymentSettings.instant_subscription_checkout"
            :label="t('admin.views.integrations.instantSubscriptionCheckout')"
            color="primary"
            class="mb-4"
          />
          <v-select
            v-model="paymentSettings.stripe_mode"
            :items="stripeModeOptions"
            item-title="title"
            item-value="value"
            :label="t('admin.views.integrations.stripeMode')"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="paymentSettings.publishable_key"
            :label="t('admin.views.integrations.publishableKey')"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="paymentSettings.secret_key"
            :label="t('admin.views.integrations.secretKey')"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="paymentSettings.webhook_secret"
            :label="t('admin.views.integrations.webhookSecret')"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            :model-value="stripeWebhookUrl"
            :label="t('admin.views.integrations.webhookUrl')"
            variant="outlined"
            density="compact"
            readonly
            class="mb-1"
          />
          <p class="text-caption text-medium-emphasis">{{ t('admin.views.integrations.webhookEvents') }}</p>
          <p class="text-caption text-medium-emphasis mt-2">{{ t('admin.views.integrations.stripeR2Note') }}</p>
        </v-card>
      </v-window-item>
      <v-window-item value="ai">
        <v-card variant="outlined" class="pa-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-switch
                v-model="aiSettings.openai_enabled"
                :label="t('admin.views.integrations.openai')"
                color="primary"
                class="mb-2"
              />
              <v-text-field
                v-model="aiSettings.openai_api_key"
                :label="t('admin.views.integrations.openaiApiKey')"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              />
              <v-text-field
                v-model="aiSettings.openai_model"
                :label="t('admin.views.integrations.openaiModel')"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch
                v-model="aiSettings.anthropic_enabled"
                :label="t('admin.views.integrations.anthropic')"
                color="primary"
                class="mb-2"
              />
              <v-text-field
                v-model="aiSettings.anthropic_api_key"
                :label="t('admin.views.integrations.anthropicApiKey')"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              />
              <v-text-field
                v-model="aiSettings.anthropic_model"
                :label="t('admin.views.integrations.anthropicModel')"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch
                v-model="aiSettings.gemini_enabled"
                :label="t('admin.views.integrations.googleGemini')"
                color="primary"
                class="mb-2"
              />
              <v-text-field
                v-model="aiSettings.gemini_api_key"
                :label="t('admin.views.integrations.geminiApiKey')"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              />
              <v-text-field
                v-model="aiSettings.gemini_model"
                :label="t('admin.views.integrations.geminiModel')"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>
          <v-divider class="my-4" />
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="aiSettings.max_tokens"
                type="number"
                :label="t('admin.views.integrations.aiMaxTokens')"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="aiSettings.temperature"
                type="number"
                step="0.1"
                min="0"
                max="1"
                :label="t('admin.views.integrations.aiTemperature')"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="aiSettings.monthly_token_budget"
                type="number"
                :label="t('admin.views.integrations.aiMonthlyTokenBudget')"
                variant="outlined"
                density="compact"
                :hint="t('admin.views.integrations.tokenBudgetUnlimitedHint')"
                persistent-hint
              />
            </v-col>
          </v-row>
          <div class="d-flex flex-wrap gap-2 mt-4">
            <v-btn variant="outlined" size="small" :loading="testingProvider === 'openai'" @click="testAiProvider('openai')">
              {{ t('admin.views.integrations.testOpenai') }}
            </v-btn>
            <v-btn variant="outlined" size="small" :loading="testingProvider === 'anthropic'" @click="testAiProvider('anthropic')">
              {{ t('admin.views.integrations.testAnthropic') }}
            </v-btn>
            <v-btn variant="outlined" size="small" :loading="testingProvider === 'gemini'" @click="testAiProvider('gemini')">
              {{ t('admin.views.integrations.testGemini') }}
            </v-btn>
            <v-btn variant="text" size="small" :to="{ name: 'admin.ai.prompts' }">{{ t('admin.views.integrations.editPrompts') }}</v-btn>
          </div>
          <p class="text-caption text-medium-emphasis mt-3">{{ t('admin.views.integrations.aiR3Note') }}</p>
        </v-card>
      </v-window-item>
      <v-window-item value="media">
        <v-card variant="outlined" class="pa-4">
          <v-text-field
            v-model.number="mediaSettings.min_images_before_publish"
            type="number"
            :label="t('admin.views.integrations.minImagesBeforePublish')"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model.number="mediaSettings.max_image_upload_mb"
            type="number"
            :label="t('admin.views.integrations.maxImageUploadMb')"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-switch
            v-model="mediaSettings.watermark_enabled"
            :label="t('admin.views.integrations.watermarkEnabled')"
            color="primary"
            class="mb-3"
          />
          <v-text-field
            v-model.number="mediaSettings.watermark_opacity"
            type="number"
            :label="t('admin.views.integrations.watermarkOpacity')"
            variant="outlined"
            density="compact"
          />
        </v-card>
      </v-window-item>
      <v-window-item value="finance">
        <v-card variant="outlined" class="pa-4">
          <v-switch
            v-model="financeSettings.calculator_enabled"
            :label="t('admin.views.integrations.calculatorEnabled')"
            color="primary"
            hide-details
            class="mb-4"
          />
          <v-text-field
            v-model.number="financeSettings.default_rate_pct"
            type="number"
            :label="t('admin.views.integrations.defaultRatePct')"
            class="mb-2"
          />
          <v-text-field
            v-model.number="financeSettings.min_rate_pct"
            type="number"
            :label="t('admin.views.integrations.minRatePct')"
            class="mb-2"
          />
          <v-text-field
            v-model.number="financeSettings.max_rate_pct"
            type="number"
            :label="t('admin.views.integrations.maxRatePct')"
            class="mb-2"
          />
          <v-text-field
            v-model.number="financeSettings.default_term_months"
            type="number"
            :label="t('admin.views.integrations.defaultTermMonths')"
            class="mb-2"
          />
          <v-textarea
            v-model="financeSettings.disclaimer_en"
            :label="t('admin.views.integrations.disclaimerEn')"
            rows="2"
            class="mb-2"
          />
          <v-textarea v-model="financeSettings.disclaimer_da" :label="t('admin.views.integrations.disclaimerDa')" rows="2" />
        </v-card>
      </v-window-item>
      <v-window-item value="marketing">
        <v-card variant="outlined" class="pa-4">
          <v-switch
            v-model="marketingSettings.enquiry_sequence_enabled"
            :label="t('admin.views.integrations.enquirySequenceEnabled')"
            color="primary"
            class="mb-2"
          />
          <v-text-field
            v-model.number="marketingSettings.enquiry_day1_hours"
            type="number"
            :label="t('admin.views.integrations.enquiryDay1Hours')"
            class="mb-2"
          />
          <v-text-field
            v-model.number="marketingSettings.enquiry_day3_days"
            type="number"
            :label="t('admin.views.integrations.enquiryDay3Days')"
            class="mb-2"
          />
          <v-switch
            v-model="marketingSettings.abandoned_enquiry_enabled"
            :label="t('admin.views.integrations.abandonedEnquiryEnabled')"
            color="primary"
            class="mb-2"
          />
          <v-text-field
            v-model.number="marketingSettings.abandoned_timeout_minutes"
            type="number"
            :label="t('admin.views.integrations.abandonedTimeoutMinutes')"
            class="mb-2"
          />
          <v-switch
            v-model="marketingSettings.whatsapp_auto_task"
            :label="t('admin.views.integrations.whatsappAutoTask')"
            color="primary"
          />
        </v-card>
      </v-window-item>
      <v-window-item value="compliance">
        <v-card variant="outlined" class="pa-4">
          <v-switch
            v-model="complianceSettings.gdpr_export_enabled"
            :label="t('admin.views.integrations.gdprExportEnabled')"
            color="primary"
            class="mb-2"
          />
          <v-text-field
            v-model.number="complianceSettings.data_retention_days"
            type="number"
            :label="t('admin.views.integrations.dataRetentionDays')"
            class="mb-2"
          />
          <v-text-field
            v-model="reputationSettings.google_places_api_key"
            :label="t('admin.views.integrations.googlePlacesApiKey')"
            type="password"
          />
        </v-card>
      </v-window-item>
    </v-window>

    <div class="d-flex gap-2 mt-4">
      <v-btn color="primary" :loading="saving" @click="save">{{ t('common.save') }}</v-btn>
      <v-btn variant="outlined" :loading="testing" @click="testConnection">{{ t('admin.views.integrations.test') }}</v-btn>
    </div>

    <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal">{{ message }}</v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getIntegrations, updateIntegrations, testIntegration, testAiProvider as testAiProviderApi } from '@/api/admin.api'
import { API_CONFIG } from '@/config/api'

const { t } = useI18n()
const tab = ref('crm')
const saving = ref(false)
const testing = ref(false)
const testingProvider = ref<string | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('success')

const crmSettings = ref<Record<string, any>>({ email_on_new_lead: true, stale_lead_hours: 24 })
const paymentSettings = ref<Record<string, any>>({
  stripe_enabled: false,
  stripe_mode: 'test',
  instant_subscription_checkout: true,
})
const aiSettings = ref<Record<string, any>>({})
const mediaSettings = ref<Record<string, any>>({ min_images_before_publish: 0, max_image_upload_mb: 10, watermark_enabled: false, watermark_opacity: 40 })
const financeSettings = ref<Record<string, any>>({ calculator_enabled: true, default_rate_pct: 4.9, min_rate_pct: 2.9, max_rate_pct: 12.9, default_term_months: 60 })
const marketingSettings = ref<Record<string, any>>({ enquiry_sequence_enabled: true, enquiry_day1_hours: 24, enquiry_day3_days: 3, abandoned_enquiry_enabled: true, abandoned_timeout_minutes: 30, whatsapp_auto_task: true })
const complianceSettings = ref<Record<string, any>>({ gdpr_export_enabled: true, data_retention_days: 730 })
const reputationSettings = ref<Record<string, any>>({ google_places_api_key: '' })

const stripeModeOptions = computed(() => [
  { title: t('admin.views.integrations.stripeModeTest'), value: 'test' },
  { title: t('admin.views.integrations.stripeModeLive'), value: 'live' },
])

const stripeWebhookUrl = computed(() => {
  const base = API_CONFIG.baseUrl
  const path = '/webhooks/stripe'
  if (base.startsWith('http')) {
    return `${base.replace(/\/$/, '')}${path}`
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${base.replace(/\/$/, '')}${path}`
  }
  return `${base}${path}`
})

async function load() {
  const data = await getIntegrations()
  crmSettings.value = { ...crmSettings.value, ...normalizeBools(data.crm ?? {}) }
  paymentSettings.value = { ...paymentSettings.value, ...normalizePaymentBools(data.payment ?? {}) }
  aiSettings.value = { ...aiSettings.value, ...normalizeAiBools(data.ai ?? {}) }
  mediaSettings.value = { ...mediaSettings.value, ...normalizeGenericBools(data.media ?? {}, ['watermark_enabled']) }
  financeSettings.value = { ...financeSettings.value, ...normalizeGenericBools(data.finance ?? {}, ['calculator_enabled']) }
  marketingSettings.value = { ...marketingSettings.value, ...normalizeGenericBools(data.marketing ?? {}, ['enquiry_sequence_enabled', 'abandoned_enquiry_enabled', 'whatsapp_auto_task']) }
  complianceSettings.value = { ...complianceSettings.value, ...normalizeGenericBools(data.compliance ?? {}, ['gdpr_export_enabled']) }
  reputationSettings.value = { ...reputationSettings.value, ...(data.reputation ?? {}) }
}

function normalizeBools(obj: Record<string, any>) {
  const out = { ...obj }
  if (out.email_on_new_lead === 'true' || out.email_on_new_lead === true) out.email_on_new_lead = true
  if (out.email_on_new_lead === 'false' || out.email_on_new_lead === false) out.email_on_new_lead = false
  return out
}

function normalizePaymentBools(obj: Record<string, any>) {
  const out = { ...obj }
  for (const key of ['stripe_enabled', 'instant_subscription_checkout']) {
    if (out[key] === 'true' || out[key] === true) out[key] = true
    if (out[key] === 'false' || out[key] === false) out[key] = false
  }
  return out
}

function normalizeAiBools(obj: Record<string, any>) {
  const out = { ...obj }
  for (const key of ['openai_enabled', 'anthropic_enabled', 'gemini_enabled']) {
    if (out[key] === 'true' || out[key] === true) out[key] = true
    if (out[key] === 'false' || out[key] === false) out[key] = false
  }
  return out
}

function normalizeGenericBools(obj: Record<string, any>, keys: string[]) {
  const out = { ...obj }
  for (const key of keys) {
    if (out[key] === 'true' || out[key] === true) out[key] = true
    if (out[key] === 'false' || out[key] === false) out[key] = false
  }
  return out
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    const groupMap: Record<string, string> = { crm: 'crm', payment: 'payment', ai: 'ai', media: 'media', finance: 'finance', marketing: 'marketing', compliance: 'compliance' }
    const group = groupMap[tab.value] ?? 'crm'
    const settingsMap: Record<string, any> = {
      crm: crmSettings.value,
      payment: paymentSettings.value,
      ai: aiSettings.value,
      media: mediaSettings.value,
      finance: financeSettings.value,
      marketing: marketingSettings.value,
      compliance: complianceSettings.value,
    }
    await updateIntegrations(group, settingsMap[group])
    if (tab.value === 'compliance') {
      await updateIntegrations('reputation', reputationSettings.value)
    }
    message.value = t('admin.views.integrations.saved')
    messageType.value = 'success'
    await load()
  } catch {
    message.value = t('admin.views.integrations.saveFailed')
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

async function testConnection() {
  testing.value = true
  message.value = ''
  try {
    const provider = tab.value === 'payment' ? 'stripe' : tab.value
    if (provider === 'ai') {
      message.value = t('admin.views.integrations.aiUseProviderTest')
      messageType.value = 'info'
      return
    }
    await testIntegration(provider)
    message.value = t('admin.views.integrations.testOk')
    messageType.value = 'success'
  } catch {
    message.value = t('admin.views.integrations.testFailed')
    messageType.value = 'error'
  } finally {
    testing.value = false
  }
}

async function testAiProvider(provider: 'openai' | 'anthropic' | 'gemini') {
  testingProvider.value = provider
  message.value = ''
  try {
    const result = await testAiProviderApi(provider)
    message.value = result.message || t('admin.views.integrations.testOk')
    messageType.value = 'success'
  } catch {
    message.value = t('admin.views.integrations.testFailed')
    messageType.value = 'error'
  } finally {
    testingProvider.value = null
  }
}

onMounted(async () => {
  await load()
})
</script>
