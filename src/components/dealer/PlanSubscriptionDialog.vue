<template>
  <v-dialog v-model="showDialog" max-width="600" persistent>
    <v-card class="subscription-dialog">
      <v-card-title class="d-flex justify-space-between align-center pa-4 pb-2">
        <div class="flex-grow-1"></div>
        <v-btn icon variant="text" size="small" @click="handleClose" class="ml-auto">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <div class="text-center mb-6">
          <h2 class="text-h5 font-weight-medium mb-2">{{ t('dealerComponents.planSubscriptionDialog.selectYourPlan') }}</h2>
          <p class="text-body-2 text-medium-emphasis">{{ t('dealerComponents.planSubscriptionDialog.pickPlanBelow') }}</p>
        </div>

        <v-alert type="info" variant="tonal" density="compact" class="mb-6" icon="mdi-shield-account">
          <div class="font-weight-medium mb-1">{{ t('dealerComponents.planSubscriptionDialog.warningChangePlan') }}</div>
          <div class="text-body-2">{{ t('dealerComponents.planSubscriptionDialog.warningChangePlanMessage') }}</div>
        </v-alert>

        <div v-if="isUsagePlan" class="mb-6">
          <v-card variant="outlined" class="plan-option-selected">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium mb-2">{{ t('dealerComponents.planSubscriptionDialog.payAsYouGo') }}</h3>
              <div class="text-h5 font-weight-bold mb-2">{{ formatDailyPrice() }}</div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t('dealerComponents.planSubscriptionDialog.payAsYouGoDescription') }}
              </p>
            </v-card-text>
          </v-card>
        </div>

        <div v-else class="d-flex flex-column gap-3 mb-6">
          <v-card
            :class="['plan-option-card', { 'plan-option-selected': selectedCycle === 'monthly' }]"
            variant="outlined"
            @click="selectedCycle = 'monthly'"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <h3 class="text-h6 font-weight-medium mr-2">{{ t('dealerComponents.planSubscriptionDialog.monthlySubscription') }}</h3>
                    <v-chip v-if="plan && plan.trial_days && plan.trial_days > 0" color="success" size="small" variant="flat" class="text-white">
                      {{ plan.trial_days }} {{ t('dealerComponents.planSubscriptionDialog.daysFreeTrial') }}
                    </v-chip>
                  </div>
                  <div class="text-h5 font-weight-bold mb-2">{{ formatPrice(getMonthlyPrice()) }}</div>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ t('dealerComponents.planSubscriptionDialog.enjoyCancelAnytime') }}</p>
                </div>
                <v-icon v-if="selectedCycle === 'monthly'" color="primary" size="24">mdi-check-circle</v-icon>
              </div>
            </v-card-text>
          </v-card>

          <v-card
            :class="['plan-option-card', { 'plan-option-selected': selectedCycle === 'yearly' }]"
            variant="outlined"
            @click="selectedCycle = 'yearly'"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <h3 class="text-h6 font-weight-medium mr-2">
                      {{ t('dealerComponents.planSubscriptionDialog.yearlySubscription') }}
                      <span v-if="getYearlySavings() > 0" class="text-body-2 font-weight-normal text-medium-emphasis">
                        {{ t('dealerComponents.planSubscriptionDialog.savePercent', { percent: getYearlySavingsPercentage() }) }}
                      </span>
                    </h3>
                    <v-chip v-if="plan && plan.trial_days && plan.trial_days > 0" color="success" size="small" variant="flat" class="text-white">
                      {{ plan.trial_days }} {{ t('dealerComponents.planSubscriptionDialog.daysFreeTrial') }}
                    </v-chip>
                  </div>
                  <div class="text-h5 font-weight-bold mb-2">{{ formatPrice(getYearlyPrice()) }}</div>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ t('dealerComponents.planSubscriptionDialog.enjoyCancelAnytime') }}</p>
                </div>
                <v-icon v-if="selectedCycle === 'yearly'" color="primary" size="24">mdi-check-circle</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <div class="d-flex gap-3 mb-4">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            :disabled="!canConfirm || props.loading"
            :loading="props.loading || confirming"
            @click="handleConfirm"
            class="flex-grow-1"
          >
            {{ confirmButtonLabel }}
          </v-btn>
        </div>

        <div class="text-center">
          <v-icon size="16" color="grey-darken-1" class="mb-1">mdi-lock</v-icon>
          <p class="text-caption text-medium-emphasis mb-0">{{ t('dealerComponents.planSubscriptionDialog.offlinePaymentNote') }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PlanModel } from '@/api/dealer.api'

const { t } = useI18n()

interface Props {
  plan: PlanModel | null
  show: boolean
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  confirm: [billingCycle: 'monthly' | 'yearly' | 'usage_daily']
  close: []
}>()

const selectedCycle = ref<'monthly' | 'yearly' | 'usage_daily' | null>(null)
const confirming = ref(false)

const isUsagePlan = computed(() => props.plan?.billing_model === 'usage_daily')

const showDialog = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close')
  }
})

const canConfirm = computed(() => isUsagePlan.value || !!selectedCycle.value)

const confirmButtonLabel = computed(() => {
  if (isUsagePlan.value) {
    return t('dealerComponents.planSubscriptionDialog.requestPlanChange')
  }
  if (!selectedCycle.value) return ''
  return t('dealerComponents.planSubscriptionDialog.requestPlanChange')
})

watch(() => props.show, (newVal) => {
  if (newVal && props.plan) {
    if (props.plan.billing_model === 'usage_daily') {
      selectedCycle.value = 'usage_daily'
      return
    }
    const pricing = getCurrentPricing()
    if (pricing?.monthly) selectedCycle.value = 'monthly'
    else if (pricing?.yearly) selectedCycle.value = 'yearly'
    else selectedCycle.value = null
  } else {
    selectedCycle.value = null
  }
})

const getCurrentPricing = () => {
  if (!props.plan) return null
  const priceHistory = props.plan.priceHistory || props.plan.price_history || []
  if (priceHistory.length === 0) return null
  const activePricing = priceHistory.filter((p: any) => !p.ends_at || new Date(p.ends_at) > new Date())
  if (activePricing.length === 0) return null
  const monthly = activePricing.find((p: any) => p.billing_cycle === 'monthly')
  const yearly = activePricing.find((p: any) => p.billing_cycle === 'yearly')
  return { monthly, yearly }
}

const getMonthlyPrice = () => getCurrentPricing()?.monthly?.price || 0
const getYearlyPrice = () => getCurrentPricing()?.yearly?.price || 0

const getYearlySavings = () => {
  const monthly = getMonthlyPrice()
  const yearly = getYearlyPrice()
  return monthly > 0 && yearly > 0 ? monthly * 12 - yearly : 0
}

const getYearlySavingsPercentage = () => {
  const monthly = getMonthlyPrice()
  const savings = getYearlySavings()
  return monthly > 0 ? Math.round((savings / (monthly * 12)) * 100) : 0
}

const formatPrice = (priceInCents: number) => {
  if (!priceInCents) return t('common.na')
  const pricing = getCurrentPricing()
  const currency = pricing?.monthly?.currency || pricing?.yearly?.currency || 'DKK'
  const price = priceInCents / 100
  const suffix = selectedCycle.value === 'yearly' ? 'yearly' : 'monthly'
  return `${price.toFixed(2)} ${currency}/${suffix}`
}

const formatDailyPrice = () => {
  const cents = props.plan?.price_per_listing_per_day || 0
  if (!cents) return t('common.na')
  return `${(cents / 100).toFixed(2)} DKK/${t('dealerComponents.planSubscriptionDialog.perListingPerDay')}`
}

const handleConfirm = () => {
  if (!canConfirm.value || props.loading) return
  emit('confirm', isUsagePlan.value ? 'usage_daily' : (selectedCycle.value as 'monthly' | 'yearly'))
}

const handleClose = () => {
  if (props.loading) return
  emit('close')
}
</script>

<style scoped>
.plan-option-card {
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.plan-option-selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
