<template>
  <div>
    <h1 class="text-h5 font-weight-medium mb-4">{{ t('dealer.views.branding.title') }}</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4 mb-4">
          <h2 class="text-subtitle-1 mb-3">{{ t('dealer.views.branding.theme') }}</h2>
          <v-select
            v-model="form.finance_calculator_enabled"
            :items="financeCalculatorOptions"
            item-title="title"
            item-value="value"
            :label="t('dealer.views.branding.financeCalculatorEnabled')"
            :disabled="!platformFinanceCalculatorEnabled"
            :hint="financeCalculatorHint"
            persistent-hint
            class="mb-2"
          />
          <v-text-field v-model="form.finance_partner_url" :label="t('dealer.views.branding.financeUrl')" class="mb-2" />
          <v-text-field v-model="form.google_review_url" :label="t('dealer.views.branding.googleReviewUrl')" class="mb-2" />
          <v-text-field v-model="form.google_place_id" :label="t('dealer.views.branding.googlePlaceId')" class="mb-2" />
          <v-text-field v-model="form.theme_primary_color" :label="t('dealer.views.branding.primaryColor')" class="mb-2" />
          <v-text-field v-model="form.theme_secondary_color" :label="t('dealer.views.branding.secondaryColor')" class="mb-2" />
          <v-btn color="primary" :loading="saving" @click="saveBranding">{{ t('common.save') }}</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4 mb-4">
          <h2 class="text-subtitle-1 mb-3">{{ t('dealer.views.branding.domains') }}</h2>
          <p class="text-caption text-medium-emphasis mb-2">{{ t('dealer.views.branding.cnameHint', { target: cnameTarget }) }}</p>
          <v-text-field v-model="newDomain" :label="t('dealer.views.branding.addDomain')" class="mb-2" />
          <v-btn class="mb-4" @click="addDomain">{{ t('common.add') }}</v-btn>
          <v-list density="compact">
            <v-list-item
              v-for="d in domains"
              :key="d.id"
              :title="d.domain"
              :subtitle="d.verified_at ? t('common.verified') : t('common.pending')"
            >
              <template #append>
                <v-btn v-if="!d.verified_at" size="x-small" @click="verify(d.id)">{{ t('dealer.views.branding.verify') }}</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-card variant="outlined" class="pa-4">
          <h2 class="text-subtitle-1 mb-3">{{ t('dealer.views.branding.dmsTitle') }}</h2>
          <v-btn class="mb-2" @click="createKey">{{ t('dealer.views.branding.createApiKey') }}</v-btn>
          <v-alert v-if="plainKey" type="info" class="mb-2">{{ t('dealer.views.branding.apiKeyLabel', { key: plainKey }) }}</v-alert>
          <v-text-field v-model="webhookUrl" :label="t('dealer.views.branding.webhookUrl')" class="mb-2" />
          <v-btn @click="createHook">{{ t('dealer.views.branding.addWebhook') }}</v-btn>
          <v-btn class="mt-4 ml-2" variant="outlined" @click="exportLeadPiiAudit">{{ t('dealer.views.branding.exportPiiAudit') }}</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  addDealerDomain,
  createDealerApiKey,
  createDealerWebhook,
  exportLeadPiiAudit,
  getDealerBranding,
  updateDealerBranding,
  verifyDealerDomain,
} from '@/api/dealer.api'

const { t } = useI18n()
const saving = ref(false)
const platformFinanceCalculatorEnabled = ref(true)
const form = ref<{
  finance_partner_url: string
  finance_calculator_enabled: boolean | null
  google_review_url: string
  google_place_id: string
  theme_primary_color: string
  theme_secondary_color: string
}>({
  finance_partner_url: '',
  finance_calculator_enabled: null,
  google_review_url: '',
  google_place_id: '',
  theme_primary_color: '',
  theme_secondary_color: '',
})
const domains = ref<any[]>([])
const cnameTarget = ref('')
const newDomain = ref('')
const plainKey = ref('')
const webhookUrl = ref('')

const financeCalculatorOptions = computed(() => [
  { title: t('dealer.views.branding.financeCalculatorInherit'), value: null },
  { title: t('dealer.views.branding.financeCalculatorOptionEnabled'), value: true },
  { title: t('dealer.views.branding.financeCalculatorOptionDisabled'), value: false },
])

const financeCalculatorHint = computed(() => {
  if (!platformFinanceCalculatorEnabled.value) {
    return t('dealer.views.branding.financeCalculatorPlatformOff')
  }
  return t('dealer.views.branding.financeCalculatorInherit')
})

async function load() {
  const data = await getDealerBranding()
  platformFinanceCalculatorEnabled.value = data.platform_finance_calculator_enabled !== false
  form.value = {
    finance_partner_url: data.finance_partner_url || '',
    finance_calculator_enabled: data.finance_calculator_enabled ?? null,
    google_review_url: data.google_review_url || '',
    google_place_id: data.google_place_id || '',
    theme_primary_color: data.theme_primary_color || '',
    theme_secondary_color: data.theme_secondary_color || '',
  }
  domains.value = data.domains || []
  cnameTarget.value = data.cname_target || ''
}

async function saveBranding() {
  saving.value = true
  try {
    await updateDealerBranding(form.value)
    await load()
  } finally {
    saving.value = false
  }
}

async function addDomain() {
  if (!newDomain.value) return
  await addDealerDomain(newDomain.value)
  newDomain.value = ''
  await load()
}

async function verify(id: number) {
  await verifyDealerDomain(id)
  await load()
}

async function createKey() {
  const res = await createDealerApiKey(t('dealer.views.branding.defaultApiKeyName'))
  plainKey.value = res.plain_key
}

async function createHook() {
  if (!webhookUrl.value) return
  await createDealerWebhook(webhookUrl.value, ['vehicle.published', 'vehicle.updated'])
  webhookUrl.value = ''
}

onMounted(load)
</script>
