<template>
  <div class="panel-page integrations-page">
    <PageHeader :title="t('admin.views.integrations.title')" :subtitle="t('admin.views.integrations.subtitle')" />

    <v-tabs v-model="tab" class="integrations-tabs mb-4">
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
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabCrm')" :help="help('tabCrm')" />

          <v-switch
            v-model="crmSettings.email_on_new_lead"
            color="primary"
            hide-details
            class="mb-4"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.emailOnNewLead')" help-key="emailOnNewLead" />
            </template>
          </v-switch>

          <v-text-field
            v-model.number="crmSettings.stale_lead_hours"
            type="number"
            variant="outlined"
            density="compact"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.staleLeadHours')" help-key="staleLeadHours" />
            </template>
          </v-text-field>
        </v-card>
      </v-window-item>

      <v-window-item value="payment">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabPayment')" :help="help('tabPayment')" />

          <v-switch v-model="paymentSettings.stripe_enabled" color="primary" class="mb-4">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.enableStripe')" help-key="enableStripe" />
            </template>
          </v-switch>

          <v-switch v-model="paymentSettings.instant_subscription_checkout" color="primary" class="mb-4">
            <template #label>
              <IntegrationFieldLabel
                :label="t('admin.views.integrations.instantSubscriptionCheckout')"
                help-key="instantSubscriptionCheckout"
              />
            </template>
          </v-switch>

          <v-select
            v-model="paymentSettings.stripe_mode"
            :items="stripeModeOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            class="mb-3"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.stripeMode')" help-key="stripeMode" />
            </template>
          </v-select>

          <v-text-field
            v-model="paymentSettings.publishable_key"
            variant="outlined"
            density="compact"
            class="mb-3"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.publishableKey')" help-key="publishableKey" />
            </template>
          </v-text-field>

          <v-text-field
            v-model="paymentSettings.secret_key"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-3"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.secretKey')" help-key="secretKey" />
            </template>
          </v-text-field>

          <v-text-field
            v-model="paymentSettings.webhook_secret"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-3"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.webhookSecret')" help-key="webhookSecret" />
            </template>
          </v-text-field>

          <v-text-field
            :model-value="stripeWebhookUrl"
            variant="outlined"
            density="compact"
            readonly
            class="mb-1"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.webhookUrl')" help-key="webhookUrl" />
            </template>
          </v-text-field>

          <p class="integrations-note">
            <IntegrationFieldLabel :label="t('admin.views.integrations.webhookEvents')" help-key="webhookEvents" size="sm" />
          </p>
          <p class="integrations-note text-medium-emphasis mt-2">{{ t('admin.views.integrations.stripeR2Note') }}</p>
        </v-card>
      </v-window-item>

      <v-window-item value="ai">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabAi')" :help="help('tabAi')" />

          <v-row>
            <v-col cols="12" md="4">
              <v-switch v-model="aiSettings.openai_enabled" color="primary" class="mb-2">
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.openai')" help-key="openai" />
                </template>
              </v-switch>
              <v-text-field
                v-model="aiSettings.openai_api_key"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              >
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.openaiApiKey')" help-key="openaiApiKey" />
                </template>
              </v-text-field>
              <v-text-field v-model="aiSettings.openai_model" variant="outlined" density="compact">
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.openaiModel')" help-key="openaiModel" />
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-switch v-model="aiSettings.anthropic_enabled" color="primary" class="mb-2">
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.anthropic')" help-key="anthropic" />
                </template>
              </v-switch>
              <v-text-field
                v-model="aiSettings.anthropic_api_key"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              >
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.anthropicApiKey')" help-key="anthropicApiKey" />
                </template>
              </v-text-field>
              <v-text-field v-model="aiSettings.anthropic_model" variant="outlined" density="compact">
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.anthropicModel')" help-key="anthropicModel" />
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-switch v-model="aiSettings.gemini_enabled" color="primary" class="mb-2">
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.googleGemini')" help-key="googleGemini" />
                </template>
              </v-switch>
              <v-text-field
                v-model="aiSettings.gemini_api_key"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              >
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.geminiApiKey')" help-key="geminiApiKey" />
                </template>
              </v-text-field>
              <v-text-field v-model="aiSettings.gemini_model" variant="outlined" density="compact">
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.geminiModel')" help-key="geminiModel" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="aiSettings.max_tokens"
                type="number"
                variant="outlined"
                density="compact"
              >
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.aiMaxTokens')" help-key="aiMaxTokens" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="aiSettings.temperature"
                type="number"
                step="0.1"
                min="0"
                max="1"
                variant="outlined"
                density="compact"
              >
                <template #label>
                  <IntegrationFieldLabel :label="t('admin.views.integrations.aiTemperature')" help-key="aiTemperature" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="aiSettings.monthly_token_budget"
                type="number"
                variant="outlined"
                density="compact"
                :hint="t('admin.views.integrations.tokenBudgetUnlimitedHint')"
                persistent-hint
              >
                <template #label>
                  <IntegrationFieldLabel
                    :label="t('admin.views.integrations.aiMonthlyTokenBudget')"
                    help-key="aiMonthlyTokenBudget"
                  />
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <div class="d-flex flex-wrap align-center gap-2 mt-4">
            <span class="integrations-action-with-help">
              <v-btn variant="outlined" size="small" :loading="testingProvider === 'openai'" @click="testAiProvider('openai')">
                {{ t('admin.views.integrations.testOpenai') }}
              </v-btn>
              <PanelHelpHint :text="help('testOpenai')" size="sm" :aria-label="t('admin.views.integrations.helpAria')" />
            </span>
            <span class="integrations-action-with-help">
              <v-btn variant="outlined" size="small" :loading="testingProvider === 'anthropic'" @click="testAiProvider('anthropic')">
                {{ t('admin.views.integrations.testAnthropic') }}
              </v-btn>
              <PanelHelpHint :text="help('testAnthropic')" size="sm" :aria-label="t('admin.views.integrations.helpAria')" />
            </span>
            <span class="integrations-action-with-help">
              <v-btn variant="outlined" size="small" :loading="testingProvider === 'gemini'" @click="testAiProvider('gemini')">
                {{ t('admin.views.integrations.testGemini') }}
              </v-btn>
              <PanelHelpHint :text="help('testGemini')" size="sm" :aria-label="t('admin.views.integrations.helpAria')" />
            </span>
            <span class="integrations-action-with-help">
              <v-btn variant="text" size="small" :to="{ name: 'admin.ai.prompts' }">
                {{ t('admin.views.integrations.editPrompts') }}
              </v-btn>
              <PanelHelpHint :text="help('editPrompts')" size="sm" :aria-label="t('admin.views.integrations.helpAria')" />
            </span>
          </div>

          <p class="integrations-note text-medium-emphasis mt-3">{{ t('admin.views.integrations.aiR3Note') }}</p>
        </v-card>
      </v-window-item>

      <v-window-item value="media">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabMedia')" :help="help('tabMedia')" />

          <v-text-field
            v-model.number="mediaSettings.min_images_before_publish"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-3"
          >
            <template #label>
              <IntegrationFieldLabel
                :label="t('admin.views.integrations.minImagesBeforePublish')"
                help-key="minImagesBeforePublish"
              />
            </template>
          </v-text-field>

          <v-text-field
            v-model.number="mediaSettings.max_image_upload_mb"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-3"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.maxImageUploadMb')" help-key="maxImageUploadMb" />
            </template>
          </v-text-field>

          <v-switch v-model="mediaSettings.watermark_enabled" color="primary" class="mb-3">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.watermarkEnabled')" help-key="watermarkEnabled" />
            </template>
          </v-switch>

          <v-text-field
            v-model.number="mediaSettings.watermark_opacity"
            type="number"
            variant="outlined"
            density="compact"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.watermarkOpacity')" help-key="watermarkOpacity" />
            </template>
          </v-text-field>
        </v-card>
      </v-window-item>

      <v-window-item value="finance">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabFinance')" :help="help('tabFinance')" />

          <v-switch
            v-model="financeSettings.calculator_enabled"
            color="primary"
            hide-details
            class="mb-4"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.calculatorEnabled')" help-key="calculatorEnabled" />
            </template>
          </v-switch>

          <v-text-field v-model.number="financeSettings.default_rate_pct" type="number" variant="outlined" density="compact" class="mb-2">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.defaultRatePct')" help-key="defaultRatePct" />
            </template>
          </v-text-field>

          <v-text-field v-model.number="financeSettings.min_rate_pct" type="number" variant="outlined" density="compact" class="mb-2">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.minRatePct')" help-key="minRatePct" />
            </template>
          </v-text-field>

          <v-text-field v-model.number="financeSettings.max_rate_pct" type="number" variant="outlined" density="compact" class="mb-2">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.maxRatePct')" help-key="maxRatePct" />
            </template>
          </v-text-field>

          <v-text-field
            v-model.number="financeSettings.default_term_months"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-2"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.defaultTermMonths')" help-key="defaultTermMonths" />
            </template>
          </v-text-field>

          <v-textarea v-model="financeSettings.disclaimer_en" rows="2" variant="outlined" density="compact" class="mb-2">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.disclaimerEn')" help-key="disclaimerEn" />
            </template>
          </v-textarea>

          <v-textarea v-model="financeSettings.disclaimer_da" rows="2" variant="outlined" density="compact">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.disclaimerDa')" help-key="disclaimerDa" />
            </template>
          </v-textarea>
        </v-card>
      </v-window-item>

      <v-window-item value="marketing">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabMarketing')" :help="help('tabMarketing')" />

          <v-switch v-model="marketingSettings.enquiry_sequence_enabled" color="primary" class="mb-2">
            <template #label>
              <IntegrationFieldLabel
                :label="t('admin.views.integrations.enquirySequenceEnabled')"
                help-key="enquirySequenceEnabled"
              />
            </template>
          </v-switch>

          <v-text-field
            v-model.number="marketingSettings.enquiry_day1_hours"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-2"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.enquiryDay1Hours')" help-key="enquiryDay1Hours" />
            </template>
          </v-text-field>

          <v-text-field
            v-model.number="marketingSettings.enquiry_day3_days"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-2"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.enquiryDay3Days')" help-key="enquiryDay3Days" />
            </template>
          </v-text-field>

          <v-switch v-model="marketingSettings.abandoned_enquiry_enabled" color="primary" class="mb-2">
            <template #label>
              <IntegrationFieldLabel
                :label="t('admin.views.integrations.abandonedEnquiryEnabled')"
                help-key="abandonedEnquiryEnabled"
              />
            </template>
          </v-switch>

          <v-text-field
            v-model.number="marketingSettings.abandoned_timeout_minutes"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-2"
          >
            <template #label>
              <IntegrationFieldLabel
                :label="t('admin.views.integrations.abandonedTimeoutMinutes')"
                help-key="abandonedTimeoutMinutes"
              />
            </template>
          </v-text-field>

          <v-switch v-model="marketingSettings.whatsapp_auto_task" color="primary">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.whatsappAutoTask')" help-key="whatsappAutoTask" />
            </template>
          </v-switch>
        </v-card>
      </v-window-item>

      <v-window-item value="compliance">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabCompliance')" :help="help('tabCompliance')" />

          <v-switch v-model="complianceSettings.gdpr_export_enabled" color="primary" class="mb-2">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.gdprExportEnabled')" help-key="gdprExportEnabled" />
            </template>
          </v-switch>

          <v-text-field
            v-model.number="complianceSettings.data_retention_days"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-2"
          >
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.dataRetentionDays')" help-key="dataRetentionDays" />
            </template>
          </v-text-field>

          <v-text-field v-model="reputationSettings.google_places_api_key" type="password" variant="outlined" density="compact">
            <template #label>
              <IntegrationFieldLabel :label="t('admin.views.integrations.googlePlacesApiKey')" help-key="googlePlacesApiKey" />
            </template>
          </v-text-field>
        </v-card>
      </v-window-item>
    </v-window>

    <div class="integrations-footer d-flex flex-wrap align-center gap-2 mt-4">
      <span class="integrations-action-with-help">
        <v-btn color="primary" :loading="saving" @click="save">{{ t('common.save') }}</v-btn>
        <PanelHelpHint :text="help('save')" :aria-label="t('admin.views.integrations.helpAria')" />
      </span>
      <span class="integrations-action-with-help">
        <v-btn variant="outlined" :loading="testing" @click="testConnection">{{ t('admin.views.integrations.test') }}</v-btn>
        <PanelHelpHint :text="help('testConnection')" :aria-label="t('admin.views.integrations.helpAria')" />
      </span>
    </div>

    <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal">{{ message }}</v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getIntegrations, updateIntegrations, testIntegration, testAiProvider as testAiProviderApi } from '@/api/admin.api'
import { API_CONFIG } from '@/config/api'
import PageHeader from '@/components/panel/PageHeader.vue'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'
import IntegrationFieldLabel from '@/views/admin/integrations/components/IntegrationFieldLabel.vue'
import IntegrationTabIntro from '@/views/admin/integrations/components/IntegrationTabIntro.vue'

const { t } = useI18n()
const tab = ref('crm')
const saving = ref(false)
const testing = ref(false)
const testingProvider = ref<string | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('success')

function help(key: string) {
  return t(`admin.views.integrations.help.${key}`)
}

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

<style scoped>
.integrations-card {
  border-color: var(--border) !important;
  border-radius: var(--radius-lg) !important;
}

.integrations-note {
  font-size: 0.75rem;
  line-height: 1.45;
  margin: 0;
}

.integrations-action-with-help {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.integrations-footer {
  gap: 0.75rem;
}
</style>
