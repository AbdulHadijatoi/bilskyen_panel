<template>
  <v-card variant="flat" elevation="1" class="pricing-intelligence-panel">
    <v-card-title class="d-flex align-center flex-wrap gap-2">
      <v-icon size="20" class="mr-1">mdi-chart-line</v-icon>
      <span>{{ t('dealer.views.vehicleDetail.pricingIntelligenceTitle') }}</span>
    </v-card-title>
    <v-card-text>
      <template v-if="pricing">
        <div class="d-flex flex-wrap gap-4 mb-3">
          <div>
            <div class="text-caption text-medium-emphasis">
              {{ t('dealer.views.vehicleDetail.marketMedian') }}
            </div>
            <div class="text-body-1 font-weight-bold">
              {{ formatPrice(pricing.median_price) }}
            </div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">
              {{ t('dealer.views.vehicleDetail.suggestedRange') }}
            </div>
            <div class="text-body-2">
              {{ formatPrice(pricing.suggested_min) }} – {{ formatPrice(pricing.suggested_max) }}
            </div>
          </div>
          <div v-if="pricing.cohort_count">
            <div class="text-caption text-medium-emphasis">
              {{ t('dealer.views.vehicleDetail.comparableListings') }}
            </div>
            <div class="text-body-2">{{ pricing.cohort_count }}</div>
          </div>
        </div>

        <v-chip
          size="small"
          :color="labelColor"
          variant="tonal"
          class="mb-3"
        >
          {{ marketLabel }}
          <span v-if="pricing.diff_percent != null" class="ml-1">
            ({{ pricing.diff_percent > 0 ? '+' : '' }}{{ pricing.diff_percent }}%)
          </span>
        </v-chip>

        <div v-if="metrics" class="text-caption text-medium-emphasis mb-3">
          <span v-if="metrics.days_since_price_change != null">
            {{ t('dealer.views.vehicleDetail.daysSincePriceChange', { days: metrics.days_since_price_change }) }}
          </span>
          <span v-if="metrics.views_30d != null" class="ml-2">
            · {{ metrics.views_30d }} {{ t('dealer.views.vehicleDetail.views30d') }}
          </span>
          <span v-if="metrics.enquiries_30d != null" class="ml-2">
            · {{ metrics.enquiries_30d }} {{ t('dealer.views.vehicleDetail.enquiries30d') }}
          </span>
        </div>

        <div v-if="canApplyPrice && suggestedPrice" class="d-flex flex-wrap gap-2 align-center">
          <v-btn
            size="small"
            color="primary"
            variant="flat"
            :loading="applying"
            :disabled="applying || currentPrice === suggestedPrice"
            @click="applySuggestedPrice"
          >
            {{ t('dealer.views.vehicleDetail.applySuggestedPrice', { price: formatPrice(suggestedPrice) }) }}
          </v-btn>
          <span v-if="currentPrice === suggestedPrice" class="text-caption text-success">
            {{ t('dealer.views.vehicleDetail.alreadyAtSuggestedPrice') }}
          </span>
        </div>
        <UpgradePrompt
          v-else-if="suggestedPrice && !canApplyPrice"
          :feature-key="FeatureKey.LISTING_HEALTH_PRICE_APPLY"
        />
      </template>

      <p v-else class="text-medium-emphasis mb-0">
        {{ t('dealer.views.vehicleDetail.pricingIntelligenceUnavailable') }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UpgradePrompt from '@/components/dealer/UpgradePrompt.vue'
import { applyVehicleSuggestedPrice } from '@/api/dealer.api'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'

export interface PricingIntelligenceData {
  median_price?: number
  suggested_min?: number
  suggested_max?: number
  cohort_count?: number
  diff_percent?: number
  label?: string
  metrics?: {
    days_since_price_change?: number | null
    days_on_market?: number | null
    views_30d?: number
    enquiries_30d?: number
  }
}

const props = defineProps<{
  vehicleId: number | string
  currentPrice?: number | null
  pricing: PricingIntelligenceData | null
}>()

const emit = defineEmits<{
  applied: [payload: { newPrice: number }]
}>()

const { t } = useI18n()
const applying = ref(false)
const canApplyPrice = hasFeature(FeatureKey.LISTING_HEALTH_PRICE_APPLY)

const metrics = computed(() => props.pricing?.metrics)
const suggestedPrice = computed(() => {
  const median = props.pricing?.median_price
  return median ? Math.round(Number(median)) : null
})

const marketLabel = computed(() => {
  const label = props.pricing?.label
  if (label === 'below_market') return t('dealer.views.vehicleDetail.fairPriceBelowMarket')
  if (label === 'above_market') return t('dealer.views.vehicleDetail.fairPriceAboveMarket')
  return t('dealer.views.vehicleDetail.fairPriceFair')
})

const labelColor = computed(() => {
  const label = props.pricing?.label
  if (label === 'below_market') return 'success'
  if (label === 'above_market') return 'error'
  return 'info'
})

async function applySuggestedPrice() {
  if (!suggestedPrice.value) return

  try {
    applying.value = true
    const result = await applyVehicleSuggestedPrice(props.vehicleId)
    emit('applied', { newPrice: result.newPrice })
  } finally {
    applying.value = false
  }
}

function formatPrice(value?: number | null) {
  if (!value) return '—'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>
