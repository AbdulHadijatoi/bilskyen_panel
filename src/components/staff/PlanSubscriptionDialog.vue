<template>
  <v-dialog v-model="showDialog" max-width="600" persistent>
    <v-card class="subscription-dialog">
      <v-card-text class="pa-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <h2 class="text-h5 font-weight-medium mb-2">Select your plan</h2>
          <p class="text-body-2 text-medium-emphasis">Pick your preferred plan below</p>
        </div>

        <!-- Plan Options -->
        <div class="d-flex flex-column gap-3 mb-6">
          <!-- Monthly Option -->
          <v-card
            :class="['plan-option-card', { 'plan-option-selected': selectedCycle === 'monthly' }]"
            variant="outlined"
            @click="selectedCycle = 'monthly'"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <h3 class="text-h6 font-weight-medium mr-2">Monthly Subscription</h3>
                    <v-chip
                      v-if="plan && plan.trial_days && plan.trial_days > 0"
                      color="success"
                      size="small"
                      variant="flat"
                      class="text-white"
                    >
                      {{ plan.trial_days }} Days free trial
                    </v-chip>
                  </div>
                  <div class="text-h5 font-weight-bold mb-2">
                    {{ formatPrice(getMonthlyPrice()) }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Enjoy the added benefit of canceling at any time.
                  </p>
                </div>
                <v-icon
                  v-if="selectedCycle === 'monthly'"
                  color="primary"
                  size="24"
                >
                  mdi-check-circle
                </v-icon>
              </div>
            </v-card-text>
          </v-card>

          <!-- Yearly Option -->
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
                      Yearly Subscription
                      <span v-if="getYearlySavings() > 0" class="text-body-2 font-weight-normal text-medium-emphasis">
                        (SAVE {{ getYearlySavingsPercentage() }}%)
                      </span>
                    </h3>
                    <v-chip
                      v-if="plan && plan.trial_days && plan.trial_days > 0"
                      color="success"
                      size="small"
                      variant="flat"
                      class="text-white"
                    >
                      {{ plan.trial_days }} Days free trial
                    </v-chip>
                  </div>
                  <div class="text-h5 font-weight-bold mb-2">
                    {{ formatPrice(getYearlyPrice()) }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Enjoy the added benefit of canceling at any time.
                  </p>
                </div>
                <v-icon
                  v-if="selectedCycle === 'yearly'"
                  color="primary"
                  size="24"
                >
                  mdi-check-circle
                </v-icon>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Confirm Button -->
        <v-btn
          color="primary"
          variant="flat"
          block
          size="large"
          :disabled="!selectedCycle || props.loading"
          :loading="props.loading || confirming"
          @click="handleConfirm"
          class="mb-4"
        >
          Confirm your purchase at {{ selectedCycle ? formatPrice(getSelectedPrice()) : '' }}
        </v-btn>

        <!-- Security Footer -->
        <div class="text-center">
          <v-icon size="16" color="grey-darken-1" class="mb-1">mdi-lock</v-icon>
          <p class="text-caption text-medium-emphasis mb-0">Payment secured by Stripe</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PlanModel } from '@/api/staff.api'

interface Props {
  plan: PlanModel | null
  show: boolean
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  confirm: [billingCycle: 'monthly' | 'yearly']
  close: []
}>()

const selectedCycle = ref<'monthly' | 'yearly' | null>(null)
const confirming = ref(false)

const showDialog = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

watch(() => props.show, (newVal) => {
  if (newVal && props.plan) {
    // Default to monthly if available, otherwise yearly
    const pricing = getCurrentPricing()
    if (pricing?.monthly) {
      selectedCycle.value = 'monthly'
    } else if (pricing?.yearly) {
      selectedCycle.value = 'yearly'
    } else {
      selectedCycle.value = null
    }
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

const getMonthlyPrice = () => {
  const pricing = getCurrentPricing()
  return pricing?.monthly?.price || 0
}

const getYearlyPrice = () => {
  const pricing = getCurrentPricing()
  return pricing?.yearly?.price || 0
}

const getSelectedPrice = () => {
  if (selectedCycle.value === 'monthly') {
    return getMonthlyPrice()
  } else if (selectedCycle.value === 'yearly') {
    return getYearlyPrice()
  }
  return 0
}

const getYearlySavings = () => {
  const monthly = getMonthlyPrice()
  const yearly = getYearlyPrice()
  if (monthly > 0 && yearly > 0) {
    return (monthly * 12) - yearly
  }
  return 0
}

const getYearlySavingsPercentage = () => {
  const monthly = getMonthlyPrice()
  const savings = getYearlySavings()
  if (monthly > 0) {
    return Math.round((savings / (monthly * 12)) * 100)
  }
  return 0
}

const formatPrice = (priceInCents: number) => {
  if (!priceInCents) return 'N/A'
  const pricing = getCurrentPricing()
  const currency = pricing?.monthly?.currency || pricing?.yearly?.currency || 'DKK'
  const price = priceInCents / 100
  return `${price.toFixed(2)} ${currency}/${selectedCycle.value === 'yearly' ? 'yearly' : 'monthly'}`
}

const handleConfirm = () => {
  if (!selectedCycle.value || props.loading) return
  emit('confirm', selectedCycle.value)
}
</script>

<style scoped>
.subscription-dialog {
  border-radius: 12px;
}

.plan-option-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}

.plan-option-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.02);
}

.plan-option-selected {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  background: rgba(var(--v-theme-primary), 0.05) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.1);
}
</style>
