<template>
  <div class="plan-pricing-grid">
    <template v-if="subscriptionPlans.length > 0">
      <div v-if="showSectionTitles" class="plan-pricing-grid__section-title">
        {{ t('subscription.pricing.subscriptionPlans') }}
      </div>
      <v-row class="plan-pricing-grid__row" dense>
        <v-col
          v-for="plan in subscriptionPlans"
          :key="plan.id"
          cols="12"
          sm="6"
          :lg="subscriptionColSize"
          class="d-flex"
        >
          <PlanPricingCard
            :plan="plan"
            :is-active="activePlanId === plan.id"
            :is-popular="isPopularPlan(plan)"
            :cta-mode="resolveCtaMode(plan)"
            :disabled="disabled"
            :disabled-hint="disabledHint"
            :billing-cycle="billingCycle"
            :show-status-chip="showStatusChip"
            @select="$emit('select', $event)"
          />
        </v-col>
      </v-row>
    </template>

    <template v-if="paygPlans.length > 0">
      <div v-if="showSectionTitles && subscriptionPlans.length > 0" class="plan-pricing-grid__section-title plan-pricing-grid__section-title--spaced">
        {{ t('subscription.pricing.payAsYouGoPlans') }}
      </div>
      <v-row class="plan-pricing-grid__row" dense>
        <v-col
          v-for="plan in paygPlans"
          :key="plan.id"
          cols="12"
          sm="6"
          :lg="paygColSize"
          class="d-flex"
        >
          <PlanPricingCard
            :plan="plan"
            :is-active="activePlanId === plan.id"
            :cta-mode="resolveCtaMode(plan)"
            :disabled="disabled"
            :disabled-hint="disabledHint"
            :billing-cycle="billingCycle"
            :show-status-chip="showStatusChip"
            @select="$emit('select', $event)"
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PlanPricingCard from '@/components/subscription/PlanPricingCard.vue'
import type { PlanCtaMode } from '@/types/plan-pricing'
import { usePlanDisplay, type BillingCycle, type PlanLike } from '@/composables/usePlanDisplay'
import { splitPlansByBillingModel } from '@/utils/planFeatureGroups'

const props = withDefaults(
  defineProps<{
    plans: PlanLike[]
    activePlanId?: number | null
    ctaMode?: PlanCtaMode
    hasCurrentSubscription?: boolean
    disabled?: boolean
    disabledHint?: string
    billingCycle?: BillingCycle
    showStatusChip?: boolean
    showSectionTitles?: boolean
  }>(),
  {
    activePlanId: null,
    ctaMode: 'select',
    hasCurrentSubscription: false,
    disabled: false,
    billingCycle: 'monthly',
    showStatusChip: false,
    showSectionTitles: true,
  }
)

defineEmits<{
  select: [plan: PlanLike]
}>()

const { t } = useI18n()
const { isPopularPlan } = usePlanDisplay()

const subscriptionPlans = computed(() => splitPlansByBillingModel(props.plans).subscriptionPlans)
const paygPlans = computed(() => splitPlansByBillingModel(props.plans).paygPlans)

const subscriptionColSize = computed(() => {
  const count = subscriptionPlans.value.length
  if (count <= 1) return 12
  if (count === 2) return 6
  return 4
})

const paygColSize = computed(() => {
  const count = paygPlans.value.length
  if (count <= 1) return 12
  if (count === 2) return 6
  return 4
})

function resolveCtaMode(plan: PlanLike): PlanCtaMode {
  if (props.ctaMode === 'view' || props.ctaMode === 'none') {
    return props.ctaMode
  }
  if (props.activePlanId === plan.id) {
    return 'active'
  }
  return props.hasCurrentSubscription ? 'change' : 'select'
}
</script>
