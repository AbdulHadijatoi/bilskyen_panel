<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="d-flex align-center">
      {{ t('dealer.views.dealBuilder.title') }}
      <v-spacer />
      <v-btn v-if="canUseDealBuilder" size="small" color="primary" @click="openCreate">
        {{ t('dealer.views.dealBuilder.newQuote') }}
      </v-btn>
    </v-card-title>
    <v-card-text>
      <UpgradePrompt v-if="!canUseDealBuilder" :feature-key="FeatureKey.DEAL_BUILDER" />

      <template v-else>
        <v-alert v-if="loadError" type="error" variant="tonal" density="compact" class="mb-3">
          {{ loadError }}
        </v-alert>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

        <v-list v-else-if="quotes.length" density="compact">
          <v-list-item v-for="quote in quotes" :key="quote.id">
            <v-list-item-title>
              {{ formatPrice(quote.list_price) }}
              <span v-if="quote.discount_amount"> − {{ formatPrice(quote.discount_amount) }}</span>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ quote.status }}
              <span v-if="quote.monthly_payment"> · {{ formatPrice(quote.monthly_payment) }}/mo</span>
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                v-if="quote.status === 'draft'"
                size="x-small"
                variant="text"
                color="primary"
                :loading="sendingId === quote.id"
                @click="sendQuote(quote.id)"
              >
                {{ t('dealer.views.dealBuilder.send') }}
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <p v-else class="text-body-2 text-medium-emphasis mb-0">{{ t('dealer.views.dealBuilder.empty') }}</p>
      </template>
    </v-card-text>

    <v-dialog v-model="showDialog" max-width="520">
      <v-card>
        <v-card-title>{{ t('dealer.views.dealBuilder.newQuote') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model.number="form.list_price" type="number" :label="t('dealer.views.dealBuilder.listPrice')" class="mb-2" />
          <v-text-field v-model.number="form.discount_amount" type="number" :label="t('dealer.views.dealBuilder.discount')" class="mb-2" />
          <v-text-field v-model.number="form.trade_in_value" type="number" :label="t('dealer.views.dealBuilder.tradeIn')" class="mb-2" />
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="form.finance_apr" type="number" :label="t('dealer.views.dealBuilder.apr')" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="form.finance_term_months" type="number" :label="t('dealer.views.dealBuilder.termMonths')" />
            </v-col>
          </v-row>
          <v-textarea v-model="form.notes" :label="t('dealer.views.dealBuilder.notes')" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="creating" @click="createQuote">{{ t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'
import { createDealQuote, getDealQuotes, sendDealQuote } from '@/api/dealer.api'

const props = defineProps<{ leadId: number; defaultListPrice?: number }>()

const { t } = useI18n()
const canUseDealBuilder = hasFeature(FeatureKey.DEAL_BUILDER)
const loading = ref(false)
const loadError = ref('')
const creating = ref(false)
const sendingId = ref<number | null>(null)
const quotes = ref<any[]>([])
const showDialog = ref(false)
const form = ref({
  list_price: 0,
  discount_amount: 0,
  trade_in_value: 0,
  finance_apr: null as number | null,
  finance_term_months: null as number | null,
  notes: '',
})

function formatPrice(value?: number) {
  if (!value) return t('common.na')
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(value)
}

async function load() {
  if (!canUseDealBuilder) return
  loading.value = true
  loadError.value = ''
  try {
    quotes.value = await getDealQuotes(props.leadId)
  } catch (err: any) {
    loadError.value = err?.message || t('dealer.views.dealBuilder.loadFailed')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = {
    list_price: props.defaultListPrice || 0,
    discount_amount: 0,
    trade_in_value: 0,
    finance_apr: null,
    finance_term_months: null,
    notes: '',
  }
  showDialog.value = true
}

async function createQuote() {
  creating.value = true
  try {
    await createDealQuote(props.leadId, form.value)
    showDialog.value = false
    await load()
  } finally {
    creating.value = false
  }
}

async function sendQuote(id: number) {
  sendingId.value = id
  try {
    await sendDealQuote(props.leadId, id)
    await load()
  } finally {
    sendingId.value = null
  }
}

onMounted(load)
</script>
