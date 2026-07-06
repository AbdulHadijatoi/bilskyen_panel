<template>
  <v-card
    :class="cardClasses"
    variant="flat"
    @click="handleCardClick"
  >
    <div v-if="isPopular && !isActive" class="plan-pricing-card__ribbon">
      {{ t('subscription.pricing.mostPopular') }}
    </div>

    <div class="plan-pricing-card__body">
      <div class="plan-pricing-card__header">
        <h3 class="plan-pricing-card__name" :class="{ 'plan-pricing-card__name--active': isActive }">
          {{ plan.name }}
        </h3>
        <div class="plan-pricing-card__badges">
          <span v-if="isActive" class="plan-pricing-card__active-badge">
            <v-icon size="12">mdi-check</v-icon>
            {{ t('dealer.views.subscription.statusActive') }}
          </span>
          <PanelBadge
            v-else-if="showStatusChip"
            :label="plan.is_active !== false ? t('subscription.pricing.active') : t('subscription.pricing.inactive')"
            :variant="plan.is_active !== false ? 'success' : 'muted'"
            size="sm"
          />
        </div>
      </div>

      <div class="plan-pricing-card__price-block">
        <template v-if="displayPrice">
          <div class="plan-pricing-card__price">
            {{ displayPrice.primary }}
            <span class="plan-pricing-card__price-suffix">
              {{ priceSuffix }}
            </span>
          </div>
          <div
            v-if="displayPrice.secondary && billingCycle === 'monthly'"
            class="plan-pricing-card__price-secondary"
          >
            {{ t('dealer.views.subscription.orPerYear', { price: displayPrice.secondary }) }}
          </div>
          <div
            v-else-if="displayPrice.secondary && billingCycle === 'yearly'"
            class="plan-pricing-card__price-secondary"
          >
            {{ t('subscription.pricing.orPerMonth', { price: displayPrice.secondary }) }}
          </div>
        </template>
        <div v-else class="plan-pricing-card__price plan-pricing-card__price--muted">
          {{ t('dealer.views.subscription.noPricing') }}
        </div>
      </div>

      <p class="plan-pricing-card__description">
        {{ plan.description || t('dealer.views.subscription.noDescription') }}
      </p>

      <ul v-if="featureHighlights.length > 0" class="plan-pricing-card__features">
        <li v-for="(feature, index) in featureHighlights" :key="index" class="plan-pricing-card__feature">
          <v-icon size="14" color="success" class="plan-pricing-card__feature-icon">mdi-check</v-icon>
          <span>{{ feature }}</span>
        </li>
      </ul>

      <div v-if="plan.trial_days && plan.trial_days > 0" class="plan-pricing-card__trial">
        <v-chip color="success" size="x-small" variant="flat" class="text-white">
          {{ t('dealer.views.subscription.daysFreeTrial', { count: plan.trial_days }) }}
        </v-chip>
      </div>
    </div>

    <div v-if="ctaMode === 'active'" class="plan-pricing-card__footer">
      <button type="button" class="panel-btn panel-btn--block plan-pricing-card__current-btn" disabled>
        {{ t('subscription.pricing.currentPlan') }}
      </button>
    </div>

    <div v-else-if="ctaMode === 'select' || ctaMode === 'change'" class="plan-pricing-card__footer">
      <button
        type="button"
        class="panel-btn panel-btn--primary panel-btn--block"
        :disabled="disabled"
        @click.stop="$emit('select', plan)"
      >
        {{ ctaMode === 'change' ? t('dealer.views.subscription.changePlan') : t('dealer.views.subscription.selectPlan') }}
        <v-icon size="16">mdi-arrow-right</v-icon>
      </button>
      <div v-if="disabled && disabledHint" class="plan-pricing-card__disabled-hint">
        {{ disabledHint }}
      </div>
    </div>

    <div v-else-if="ctaMode === 'view'" class="plan-pricing-card__footer plan-pricing-card__footer--view">
      <span class="plan-pricing-card__view-link">
        {{ t('subscription.pricing.viewDetails') }}
        <v-icon size="16">mdi-arrow-right</v-icon>
      </span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlanDisplay, type BillingCycle, type PlanLike } from '@/composables/usePlanDisplay'
import PanelBadge from '@/components/ui/PanelBadge.vue'

import type { PlanCtaMode } from '@/types/plan-pricing'

const props = withDefaults(
  defineProps<{
    plan: PlanLike
    isActive?: boolean
    isPopular?: boolean
    ctaMode?: PlanCtaMode
    disabled?: boolean
    disabledHint?: string
    billingCycle?: BillingCycle
    showStatusChip?: boolean
  }>(),
  {
    isActive: false,
    isPopular: false,
    ctaMode: 'select',
    disabled: false,
    billingCycle: 'monthly',
    showStatusChip: false,
  }
)

const emit = defineEmits<{
  select: [plan: PlanLike]
}>()

const { t } = useI18n()
const { getDisplayPrice, isUsagePlan, getFilteredFeatures, formatFeatureDisplay } = usePlanDisplay()

const displayPrice = computed(() => getDisplayPrice(props.plan, props.billingCycle))

const featureHighlights = computed(() =>
  getFilteredFeatures(props.plan)
    .slice(0, 8)
    .map((feature) => formatFeatureDisplay(feature))
)

const priceSuffix = computed(() => {
  if (!displayPrice.value) return ''
  if (displayPrice.value.suffix === 'perListingPerDay') {
    return t('dealer.views.subscription.perListingPerDay')
  }
  if (displayPrice.value.suffix === 'perYear') {
    return t('subscription.pricing.perYear')
  }
  return t('dealer.views.subscription.perMonth')
})

const cardClasses = computed(() => [
  'panel-card',
  'plan-pricing-card',
  'w-100',
  {
    'plan-pricing-card--active': props.isActive,
    'plan-pricing-card--popular': props.isPopular && !props.isActive,
    'plan-pricing-card--clickable': props.ctaMode === 'view',
    'plan-pricing-card--usage': isUsagePlan(props.plan),
  },
])

function handleCardClick() {
  if (props.ctaMode === 'view') {
    emit('select', props.plan)
  }
}
</script>
