<template>
  <div class="panel-page integrations-page">
    <PageHeader :title="t('admin.views.integrations.title')" :subtitle="t('admin.views.integrations.subtitle')" />

    <v-tabs v-model="tab" class="integrations-tabs mb-4">
      <v-tab value="crm">{{ t('admin.views.integrations.tabCrm') }}</v-tab>
      <v-tab value="payment">{{ t('admin.views.integrations.tabPayment') }}</v-tab>
      <v-tab value="ai">{{ t('admin.views.integrations.tabAi') }}</v-tab>
      <v-tab value="media">{{ t('admin.views.integrations.tabMedia') }}</v-tab>
      <v-tab value="finance">{{ t('admin.views.integrations.tabFinance') }}</v-tab>
      <v-tab value="marketplace">{{ t('admin.views.integrations.tabMarketplace') }}</v-tab>
      <v-tab value="marketing">{{ t('admin.views.integrations.tabMarketing') }}</v-tab>
      <v-tab value="compliance">{{ t('admin.views.integrations.tabCompliance') }}</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="crm">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabCrm')" :help="help('tabCrm')" />

          <IntegrationField
            :label="t('admin.views.integrations.emailOnNewLead')"
            help-key="emailOnNewLead"
            switch-field
            class="mb-4"
          >
            <v-switch v-model="crmSettings.email_on_new_lead" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.staleLeadHours')" help-key="staleLeadHours">
            <v-text-field
              v-model.number="crmSettings.stale_lead_hours"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>
        </v-card>
      </v-window-item>

      <v-window-item value="payment">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabPayment')" :help="help('tabPayment')" />

          <IntegrationField
            :label="t('admin.views.integrations.enableStripe')"
            help-key="enableStripe"
            switch-field
            class="mb-4"
          >
            <v-switch v-model="paymentSettings.stripe_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField
            :label="t('admin.views.integrations.instantSubscriptionCheckout')"
            help-key="instantSubscriptionCheckout"
            switch-field
            class="mb-4"
          >
            <v-switch v-model="paymentSettings.instant_subscription_checkout" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.stripeMode')" help-key="stripeMode" class="mb-3">
            <v-select
              v-model="paymentSettings.stripe_mode"
              :items="stripeModeOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.publishableKey')" help-key="publishableKey" class="mb-3">
            <v-text-field
              v-model="paymentSettings.publishable_key"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.secretKey')" help-key="secretKey" class="mb-3">
            <v-text-field
              v-model="paymentSettings.secret_key"
              type="password"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.webhookSecret')" help-key="webhookSecret" class="mb-3">
            <v-text-field
              v-model="paymentSettings.webhook_secret"
              type="password"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.webhookUrl')" help-key="webhookUrl" class="mb-1">
            <v-text-field
              :model-value="stripeWebhookUrl"
              variant="outlined"
              density="compact"
              readonly
              hide-details
            />
          </IntegrationField>

          <p class="integrations-note">
            <span class="integrations-note__label">{{ t('admin.views.integrations.webhookEvents') }}</span>
            <PanelHelpHint :text="help('webhookEvents')" size="sm" :aria-label="t('admin.views.integrations.helpAria')" />
          </p>
          <p class="integrations-note text-medium-emphasis mt-2">{{ t('admin.views.integrations.stripeR2Note') }}</p>
        </v-card>
      </v-window-item>

      <v-window-item value="ai">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabAi')" :help="help('tabAi')" />

          <div class="integrations-prompts-banner">
            <div class="integrations-prompts-banner__content">
              <div class="integrations-prompts-banner__icon" aria-hidden="true">
                <v-icon size="22" color="primary">mdi-text-box-edit-outline</v-icon>
              </div>
              <div class="integrations-prompts-banner__text">
                <h3 class="integrations-prompts-banner__title">{{ t('admin.views.integrations.promptTemplatesTitle') }}</h3>
                <p class="integrations-prompts-banner__desc">{{ t('admin.views.integrations.promptTemplatesDesc') }}</p>
              </div>
            </div>
            <v-btn color="primary" :to="{ name: 'admin.ai.prompts' }">
              <v-icon start>mdi-arrow-right</v-icon>
              {{ t('admin.views.integrations.openPromptTemplates') }}
            </v-btn>
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <IntegrationField :label="t('admin.views.integrations.openai')" help-key="openai" switch-field class="mb-2">
                <v-switch v-model="aiSettings.openai_enabled" color="primary" hide-details />
              </IntegrationField>
              <IntegrationField :label="t('admin.views.integrations.openaiApiKey')" help-key="openaiApiKey" class="mb-2">
                <v-text-field
                  v-model="aiSettings.openai_api_key"
                  type="password"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </IntegrationField>
              <IntegrationField :label="t('admin.views.integrations.openaiModel')" help-key="openaiModel">
                <v-text-field v-model="aiSettings.openai_model" variant="outlined" density="compact" hide-details />
              </IntegrationField>
            </v-col>

            <v-col cols="12" md="4">
              <IntegrationField :label="t('admin.views.integrations.anthropic')" help-key="anthropic" switch-field class="mb-2">
                <v-switch v-model="aiSettings.anthropic_enabled" color="primary" hide-details />
              </IntegrationField>
              <IntegrationField :label="t('admin.views.integrations.anthropicApiKey')" help-key="anthropicApiKey" class="mb-2">
                <v-text-field
                  v-model="aiSettings.anthropic_api_key"
                  type="password"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </IntegrationField>
              <IntegrationField :label="t('admin.views.integrations.anthropicModel')" help-key="anthropicModel">
                <v-text-field v-model="aiSettings.anthropic_model" variant="outlined" density="compact" hide-details />
              </IntegrationField>
            </v-col>

            <v-col cols="12" md="4">
              <IntegrationField :label="t('admin.views.integrations.googleGemini')" help-key="googleGemini" switch-field class="mb-2">
                <v-switch v-model="aiSettings.gemini_enabled" color="primary" hide-details />
              </IntegrationField>
              <IntegrationField :label="t('admin.views.integrations.geminiApiKey')" help-key="geminiApiKey" class="mb-2">
                <v-text-field
                  v-model="aiSettings.gemini_api_key"
                  type="password"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </IntegrationField>
              <IntegrationField :label="t('admin.views.integrations.geminiModel')" help-key="geminiModel">
                <v-text-field v-model="aiSettings.gemini_model" variant="outlined" density="compact" hide-details />
              </IntegrationField>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="4">
              <IntegrationField :label="t('admin.views.integrations.aiMaxTokens')" help-key="aiMaxTokens">
                <v-text-field
                  v-model.number="aiSettings.max_tokens"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </IntegrationField>
            </v-col>
            <v-col cols="12" md="4">
              <IntegrationField :label="t('admin.views.integrations.aiTemperature')" help-key="aiTemperature">
                <v-text-field
                  v-model.number="aiSettings.temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </IntegrationField>
            </v-col>
            <v-col cols="12" md="4">
              <IntegrationField :label="t('admin.views.integrations.aiMonthlyTokenBudget')" help-key="aiMonthlyTokenBudget">
                <v-text-field
                  v-model.number="aiSettings.monthly_token_budget"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :hint="t('admin.views.integrations.tokenBudgetUnlimitedHint')"
                  persistent-hint
                />
              </IntegrationField>
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
          </div>

          <p class="integrations-note text-medium-emphasis mt-3">{{ t('admin.views.integrations.aiR3Note') }}</p>
          <p class="integrations-note text-medium-emphasis">{{ t('admin.views.integrations.aiTokenBudgetNote') }}</p>
        </v-card>
      </v-window-item>

      <v-window-item value="media">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabMedia')" :help="help('tabMedia')" />

          <IntegrationField
            :label="t('admin.views.integrations.minImagesBeforePublish')"
            help-key="minImagesBeforePublish"
            class="mb-3"
          >
            <v-text-field
              v-model.number="mediaSettings.min_images_before_publish"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.maxImageUploadMb')" help-key="maxImageUploadMb" class="mb-3">
            <v-text-field
              v-model.number="mediaSettings.max_image_upload_mb"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField
            :label="t('admin.views.integrations.watermarkEnabled')"
            help-key="watermarkEnabled"
            switch-field
            class="mb-3"
          >
            <v-switch v-model="mediaSettings.watermark_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.watermarkOpacity')" help-key="watermarkOpacity">
            <v-text-field
              v-model.number="mediaSettings.watermark_opacity"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>
        </v-card>
      </v-window-item>

      <v-window-item value="finance">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabFinance')" :help="help('tabFinance')" />

          <IntegrationField
            :label="t('admin.views.integrations.calculatorEnabled')"
            help-key="calculatorEnabled"
            switch-field
            class="mb-4"
          >
            <v-switch v-model="financeSettings.calculator_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.defaultRatePct')" help-key="defaultRatePct" class="mb-2">
            <v-text-field
              v-model.number="financeSettings.default_rate_pct"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.minRatePct')" help-key="minRatePct" class="mb-2">
            <v-text-field
              v-model.number="financeSettings.min_rate_pct"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.maxRatePct')" help-key="maxRatePct" class="mb-2">
            <v-text-field
              v-model.number="financeSettings.max_rate_pct"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.defaultTermMonths')" help-key="defaultTermMonths" class="mb-2">
            <v-text-field
              v-model.number="financeSettings.default_term_months"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.disclaimerEn')" help-key="disclaimerEn" class="mb-2">
            <v-textarea v-model="financeSettings.disclaimer_en" rows="2" variant="outlined" density="compact" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.disclaimerDa')" help-key="disclaimerDa">
            <v-textarea v-model="financeSettings.disclaimer_da" rows="2" variant="outlined" density="compact" hide-details />
          </IntegrationField>
        </v-card>
      </v-window-item>

      <v-window-item value="marketplace">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabMarketplace')" :help="help('tabMarketplace')" />

          <IntegrationField
            :label="t('admin.views.integrations.trustReportEnabled')"
            help-key="trustReportEnabled"
            switch-field
          >
            <v-switch v-model="marketplaceSettings.trust_report_enabled" color="primary" hide-details />
          </IntegrationField>
        </v-card>
      </v-window-item>

      <v-window-item value="marketing">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabMarketing')" :help="help('tabMarketing')" />

          <IntegrationField
            :label="t('admin.views.integrations.enquirySequenceEnabled')"
            help-key="enquirySequenceEnabled"
            switch-field
            class="mb-2"
          >
            <v-switch v-model="marketingSettings.enquiry_sequence_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.enquiryDay1Hours')" help-key="enquiryDay1Hours" class="mb-2">
            <v-text-field
              v-model.number="marketingSettings.enquiry_day1_hours"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.enquiryDay3Days')" help-key="enquiryDay3Days" class="mb-2">
            <v-text-field
              v-model.number="marketingSettings.enquiry_day3_days"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField
            :label="t('admin.views.integrations.abandonedEnquiryEnabled')"
            help-key="abandonedEnquiryEnabled"
            switch-field
            class="mb-2"
          >
            <v-switch v-model="marketingSettings.abandoned_enquiry_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField
            :label="t('admin.views.integrations.abandonedTimeoutMinutes')"
            help-key="abandonedTimeoutMinutes"
            class="mb-2"
          >
            <v-text-field
              v-model.number="marketingSettings.abandoned_timeout_minutes"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.whatsappAutoTask')" help-key="whatsappAutoTask" switch-field class="mb-4">
            <v-switch v-model="marketingSettings.whatsapp_auto_task" color="primary" hide-details />
          </IntegrationField>

          <v-divider class="mb-4" />
          <IntegrationTabIntro
            :title="t('admin.views.integrations.metaSectionTitle')"
            :help="help('metaSection')"
          />

          <IntegrationField
            :label="t('admin.views.integrations.metaPixelEnabled')"
            help-key="metaPixelEnabled"
            switch-field
            class="mb-2"
          >
            <v-switch v-model="marketingSettings.meta_pixel_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.metaPixelId')" help-key="metaPixelId" class="mb-2">
            <v-text-field
              v-model="marketingSettings.meta_pixel_id"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="123456789012345"
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.metaCapiAccessToken')" help-key="metaCapiAccessToken" class="mb-2">
            <v-text-field
              v-model="marketingSettings.meta_capi_access_token"
              type="password"
              variant="outlined"
              density="compact"
              hide-details
              autocomplete="new-password"
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.metaCapiTestEventCode')" help-key="metaCapiTestEventCode" class="mb-2">
            <v-text-field
              v-model="marketingSettings.meta_capi_test_event_code"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <div class="d-flex flex-wrap ga-2 mt-2">
            <v-btn size="small" color="primary" variant="tonal" :to="'/admin/meta-ads-guide'">
              {{ t('admin.views.integrations.openMetaGuide') }}
            </v-btn>
            <v-btn
              v-if="platformMetaFeedUrl"
              size="small"
              variant="text"
              @click="copyPlatformFeed"
            >
              {{ t('admin.views.integrations.copyPlatformFeed') }}
            </v-btn>
          </div>
          <p v-if="platformMetaFeedUrl" class="text-caption text-medium-emphasis mt-2 mb-0 text-break">
            {{ platformMetaFeedUrl }}
          </p>
        </v-card>
      </v-window-item>

      <v-window-item value="compliance">
        <v-card variant="outlined" class="integrations-card pa-4">
          <IntegrationTabIntro :title="t('admin.views.integrations.tabCompliance')" :help="help('tabCompliance')" />

          <IntegrationField
            :label="t('admin.views.integrations.gdprExportEnabled')"
            help-key="gdprExportEnabled"
            switch-field
            class="mb-2"
          >
            <v-switch v-model="complianceSettings.gdpr_export_enabled" color="primary" hide-details />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.dataRetentionDays')" help-key="dataRetentionDays" class="mb-2">
            <v-text-field
              v-model.number="complianceSettings.data_retention_days"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>

          <IntegrationField :label="t('admin.views.integrations.googlePlacesApiKey')" help-key="googlePlacesApiKey">
            <v-text-field
              v-model="reputationSettings.google_places_api_key"
              type="password"
              variant="outlined"
              density="compact"
              hide-details
            />
          </IntegrationField>
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
import { getIntegrations, updateIntegrations, testIntegration, testAiProvider as testAiProviderApi, getAdminMetaFeedUrl } from '@/api/admin.api'
import { API_CONFIG } from '@/config/api'
import PageHeader from '@/components/panel/PageHeader.vue'
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'
import IntegrationField from '@/views/admin/integrations/components/IntegrationField.vue'
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
const marketplaceSettings = ref<Record<string, any>>({ trust_report_enabled: true })
const marketingSettings = ref<Record<string, any>>({
  enquiry_sequence_enabled: true,
  enquiry_day1_hours: 24,
  enquiry_day3_days: 3,
  abandoned_enquiry_enabled: true,
  abandoned_timeout_minutes: 30,
  whatsapp_auto_task: true,
  meta_pixel_enabled: false,
  meta_pixel_id: '',
  meta_capi_access_token: '',
  meta_capi_test_event_code: '',
})
const complianceSettings = ref<Record<string, any>>({ gdpr_export_enabled: true, data_retention_days: 730 })
const reputationSettings = ref<Record<string, any>>({ google_places_api_key: '' })
const platformMetaFeedUrl = ref('')

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
  try {
    const data = await getIntegrations()
    crmSettings.value = { ...crmSettings.value, ...normalizeBools(data.crm ?? {}) }
    paymentSettings.value = { ...paymentSettings.value, ...normalizePaymentBools(data.payment ?? {}) }
    aiSettings.value = { ...aiSettings.value, ...normalizeAiBools(data.ai ?? {}) }
    mediaSettings.value = { ...mediaSettings.value, ...normalizeGenericBools(data.media ?? {}, ['watermark_enabled']) }
    financeSettings.value = { ...financeSettings.value, ...normalizeGenericBools(data.finance ?? {}, ['calculator_enabled']) }
    marketplaceSettings.value = { ...marketplaceSettings.value, ...normalizeGenericBools(data.marketplace ?? {}, ['trust_report_enabled']) }
    marketingSettings.value = {
      ...marketingSettings.value,
      ...normalizeGenericBools(data.marketing ?? {}, [
        'enquiry_sequence_enabled',
        'abandoned_enquiry_enabled',
        'whatsapp_auto_task',
        'meta_pixel_enabled',
      ]),
    }
    complianceSettings.value = { ...complianceSettings.value, ...normalizeGenericBools(data.compliance ?? {}, ['gdpr_export_enabled']) }
    reputationSettings.value = { ...reputationSettings.value, ...(data.reputation ?? {}) }
    try {
      const feed = await getAdminMetaFeedUrl()
      platformMetaFeedUrl.value = feed.feed_url || ''
    } catch {
      platformMetaFeedUrl.value = ''
    }
  } catch {
    message.value = t('admin.views.integrations.loadFailed')
    messageType.value = 'error'
  }
}

async function copyPlatformFeed() {
  if (!platformMetaFeedUrl.value) return
  try {
    await navigator.clipboard.writeText(platformMetaFeedUrl.value)
    message.value = t('admin.views.integrations.feedCopied')
    messageType.value = 'success'
  } catch {
    message.value = t('admin.views.integrations.feedCopyFailed')
    messageType.value = 'error'
  }
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

/** Omit masked secret fields so unchanged API keys are not sent to the server. */
function stripMaskedSecrets(settings: Record<string, any>): Record<string, any> {
  const out = { ...settings }
  for (const [key, value] of Object.entries(out)) {
    if (value === '********') {
      delete out[key]
      continue
    }
    const isSecret =
      key.endsWith('_api_key') ||
      key.endsWith('_secret') ||
      key.endsWith('_token') ||
      key.endsWith('_password') ||
      key === 'secret_key' ||
      key === 'webhook_secret' ||
      key === 'api_key'
    if (isSecret && value === '********') {
      delete out[key]
    }
  }
  return out
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    const groupMap: Record<string, string> = { crm: 'crm', payment: 'payment', ai: 'ai', media: 'media', finance: 'finance', marketplace: 'marketplace', marketing: 'marketing', compliance: 'compliance' }
    const group = groupMap[tab.value] ?? 'crm'
    const settingsMap: Record<string, any> = {
      crm: crmSettings.value,
      payment: paymentSettings.value,
      ai: aiSettings.value,
      media: mediaSettings.value,
      finance: financeSettings.value,
      marketplace: marketplaceSettings.value,
      marketing: marketingSettings.value,
      compliance: complianceSettings.value,
    }
    await updateIntegrations(group, stripMaskedSecrets(settingsMap[group]))
    if (tab.value === 'compliance') {
      await updateIntegrations('reputation', stripMaskedSecrets(reputationSettings.value))
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
    const unsupportedTabs = new Set([
      'crm',
      'media',
      'finance',
      'marketplace',
      'marketing',
      'compliance',
      'reputation',
      'general',
    ])

    if (unsupportedTabs.has(tab.value)) {
      message.value = t('admin.views.integrations.testNotSupported')
      messageType.value = 'info'
      return
    }

    let provider = tab.value === 'payment' ? 'stripe' : tab.value
    if (tab.value === 'syndication') {
      provider = 'syndication_sftp'
    }
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
  } catch (err) {
    message.value = (err as { message?: string }).message || t('admin.views.integrations.testFailed')
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
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  line-height: 1.45;
  margin: 0;
}

.integrations-note__label {
  color: var(--muted-foreground);
}

.integrations-action-with-help {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.integrations-footer {
  gap: 0.75rem;
}

.integrations-prompts-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding: 1rem 1.25rem;
  border: 1px solid color-mix(in oklch, var(--primary) 22%, var(--border));
  border-radius: var(--radius);
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--primary) 8%, var(--card)) 0%,
    var(--card) 100%
  );
}

.integrations-prompts-banner__content {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  min-width: 0;
  flex: 1;
}

.integrations-prompts-banner__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: var(--radius);
  background: var(--primary-light);
}

.integrations-prompts-banner__title {
  margin: 0 0 0.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.3;
}

.integrations-prompts-banner__desc {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--muted-foreground);
  max-width: 42rem;
}
</style>
