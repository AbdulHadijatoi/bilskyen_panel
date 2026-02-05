<template>
  <div class="subscription-page">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">Select your plan</h1>
        <p class="text-body-2 text-medium-emphasis">
          Pick your preferred plan below
        </p>
      </div>
    </div>

    <!-- Current Subscription (if exists) -->
    <v-card
      v-if="currentSubscription"
      variant="elevated"
      elevation="1"
      class="mb-6"
    >
      <v-card-title class="pa-4">Current Subscription</v-card-title>
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">Plan</div>
              <div class="font-weight-medium">{{ currentSubscription.plan?.name || 'N/A' }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">Status</div>
              <v-chip
                :color="getStatusColor(currentSubscription.subscription_status_id)"
                size="small"
                variant="tonal"
              >
                {{ getStatusLabel(currentSubscription.subscription_status_id) }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="6" v-if="currentSubscription.starts_at">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">Start Date</div>
              <div>{{ formatDate(currentSubscription.starts_at) }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6" v-if="currentSubscription.ends_at">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">End Date</div>
              <div>{{ formatDate(currentSubscription.ends_at) }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loadingPlans" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-6"
    >
      {{ error }}
    </v-alert>

    <!-- Empty State -->
    <v-card
      v-else-if="availablePlans.length === 0"
      variant="elevated"
      elevation="1"
      class="text-center py-12"
    >
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">No Plans Available</h3>
      <p class="text-body-2 text-medium-emphasis">
        There are no subscription plans available for your account at this time.
      </p>
    </v-card>

    <!-- Plans Grid -->
    <v-row v-else class="plans-grid" dense>
      <v-col
        v-for="plan in availablePlans"
        :key="plan.id"
        cols="12"
        sm="6"
        md="6"
        lg="3"
      >
        <v-card
          :class="['plan-card', { 'plan-card-active': isPlanActive(plan) }]"
          variant="elevated"
          elevation="1"
        >
          <v-card-text class="pa-4">
            <!-- Plan Name -->
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-h6 font-weight-medium mb-0">{{ plan.name }}</h3>
              <v-chip
                v-if="isPlanActive(plan)"
                color="success"
                size="small"
                variant="flat"
              >
                Active
              </v-chip>
            </div>
            
            <!-- Pricing -->
            <div v-if="getCurrentPricing(plan)" class="mb-3">
              <div class="text-h5 font-weight-bold mb-1">
                <template v-if="getCurrentPricing(plan)?.monthly">
                  {{ formatPrice(getCurrentPricing(plan)!.monthly!.price, getCurrentPricing(plan)!.monthly!.currency) }}
                </template>
                <template v-else-if="getCurrentPricing(plan)?.yearly">
                  {{ formatPrice(getCurrentPricing(plan)!.yearly!.price, getCurrentPricing(plan)!.yearly!.currency) }}
                </template>
                <span class="text-body-2 font-weight-normal text-medium-emphasis">/ Month</span>
              </div>
              <div v-if="getCurrentPricing(plan)?.yearly && getCurrentPricing(plan)?.monthly" class="text-caption text-medium-emphasis">
                or {{ formatPrice(getCurrentPricing(plan)!.yearly!.price, getCurrentPricing(plan)!.yearly!.currency) }} / Year
              </div>
            </div>
            <div v-else class="mb-3">
              <div class="text-h6 font-weight-bold text-medium-emphasis">No pricing</div>
            </div>

            <!-- Description -->
            <p class="text-body-2 text-medium-emphasis mb-4" style="min-height: 2.5em;">
              {{ plan.description || 'No description provided' }}
            </p>

            <!-- Features List -->
            <div v-if="getFilteredFeatures(plan).length > 0" class="features-list mb-4">
              <div
                v-for="feature in getFilteredFeatures(plan)"
                :key="feature.id"
                class="feature-item d-flex align-center mb-2"
              >
                <div class="feature-check-circle mr-2">
                  <v-icon size="12" color="success">mdi-check</v-icon>
                </div>
                <span class="text-body-2">{{ formatFeatureDisplay(feature) }}</span>
              </div>
            </div>
            <div v-else class="mb-4">
              <div class="text-body-2 text-medium-emphasis">No features assigned</div>
            </div>

            <!-- Trial Badge -->
            <div v-if="plan.trial_days && plan.trial_days > 0" class="mb-3">
              <v-chip
                color="success"
                size="small"
                variant="flat"
                class="text-white"
              >
                {{ plan.trial_days }} Days free trial
              </v-chip>
            </div>
          </v-card-text>

          <v-divider v-if="!isPlanActive(plan)" />

          <v-card-actions v-if="!isPlanActive(plan)" class="pa-3">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              @click="openSubscriptionDialog(plan)"
              block
            >
              Select Plan
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Subscription Dialog -->
    <PlanSubscriptionDialog
      :plan="selectedPlan"
      :show="showSubscriptionDialog"
      :loading="creatingSubscription"
      @confirm="handleSubscriptionConfirm"
      @close="closeSubscriptionDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSubscription, getAvailablePlans, createSubscription, type PlanModel, type CreateDealerSubscriptionData } from '@/api/dealer.api'
import PlanSubscriptionDialog from '@/components/dealer/PlanSubscriptionDialog.vue'
import type { ApiErrorModel } from '@/models/api-error.model'

const loadingPlans = ref(false)
const error = ref<string | null>(null)
const availablePlans = ref<PlanModel[]>([])
const currentSubscription = ref<any>(null)
const showSubscriptionDialog = ref(false)
const selectedPlan = ref<PlanModel | null>(null)
const creatingSubscription = ref(false)

const loadPlans = async () => {
  try {
    loadingPlans.value = true
    error.value = null
    const plans = await getAvailablePlans()
    availablePlans.value = plans
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load plans'
    availablePlans.value = []
  } finally {
    loadingPlans.value = false
  }
}

const loadCurrentSubscription = async () => {
  try {
    const sub = await getSubscription()
    currentSubscription.value = sub
  } catch (err) {
    // No subscription is fine, just don't show the section
    currentSubscription.value = null
  }
}

const getCurrentPricing = (plan: PlanModel) => {
  const priceHistory = plan.priceHistory || plan.price_history || []
  if (priceHistory.length === 0) return null
  
  const activePricing = priceHistory.filter((p: any) => !p.ends_at || new Date(p.ends_at) > new Date())
  if (activePricing.length === 0) return null
  
  const monthly = activePricing.find((p: any) => p.billing_cycle === 'monthly')
  const yearly = activePricing.find((p: any) => p.billing_cycle === 'yearly')
  
  return { monthly, yearly }
}

const formatPrice = (priceInCents: number, currency: string) => {
  const price = priceInCents / 100
  return `${price.toFixed(2)} ${currency}`
}

const getStatusColor = (statusId?: number) => {
  const colors: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'error',
    4: 'warning',
    5: 'primary'
  }
  return colors[statusId || 0] || 'grey'
}

const getStatusLabel = (statusId?: number) => {
  const labels: Record<number, string> = {
    1: 'Trial',
    2: 'Active',
    3: 'Expired',
    4: 'Canceled',
    5: 'Scheduled'
  }
  return labels[statusId || 0] || 'Unknown'
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFeatureKey = (key: string) => {
  // Convert snake_case to Title Case
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getFilteredFeatures = (plan: PlanModel) => {
  if (!plan.features || plan.features.length === 0) return []
  
  return plan.features.filter((feature: any) => {
    const valueTypeId = feature.feature_value_type_id || feature.featureValueType?.id || feature.feature_value_type?.id
    const value = feature.pivot?.value || feature.value
    
    // For boolean features, only show if value is true
    if (valueTypeId === 1) { // BOOLEAN
      return value === 'true' || value === '1' || value === true || value === 1
    }
    
    // For number and text features, always show
    return true
  })
}

const formatFeatureDisplay = (feature: any) => {
  const key = feature.key || ''
  const formattedKey = formatFeatureKey(key)
  const valueTypeId = feature.feature_value_type_id || feature.featureValueType?.id || feature.feature_value_type?.id
  const value = feature.pivot?.value || feature.value
  
  // Boolean features: just show the key name
  if (valueTypeId === 1) { // BOOLEAN
    return formattedKey
  }
  
  // Number features: show "Key Name: value"
  if (valueTypeId === 2) { // NUMBER
    return `${formattedKey}: ${value}`
  }
  
  // Text features: show "Key Name: value"
  if (valueTypeId === 3) { // TEXT
    return `${formattedKey}: ${value}`
  }
  
  // Fallback: just show key name
  return formattedKey
}

const isPlanActive = (plan: PlanModel) => {
  if (!currentSubscription.value) return false
  return currentSubscription.value.plan_id === plan.id
}

const openSubscriptionDialog = (plan: PlanModel) => {
  selectedPlan.value = plan
  showSubscriptionDialog.value = true
}

const closeSubscriptionDialog = () => {
  showSubscriptionDialog.value = false
  selectedPlan.value = null
}

const handleSubscriptionConfirm = async (billingCycle: 'monthly' | 'yearly') => {
  if (!selectedPlan.value) return

  try {
    creatingSubscription.value = true
    const data: CreateDealerSubscriptionData = {
      plan_id: selectedPlan.value.id,
      billing_cycle: billingCycle
    }
    await createSubscription(data)
    closeSubscriptionDialog()
    // Reload plans and current subscription
    await Promise.all([loadPlans(), loadCurrentSubscription()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create subscription'
  } finally {
    creatingSubscription.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadPlans(), loadCurrentSubscription()])
})
</script>

<style scoped>
.subscription-page {
  padding: 0;
}

.plans-grid {
  margin-top: 0;
}

.plan-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
}

.plan-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.plan-card-active {
  border-color: rgba(var(--v-theme-success), 0.5) !important;
  background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.08) 0%, rgba(var(--v-theme-success), 0.03) 100%);
  box-shadow: 0 2px 12px rgba(var(--v-theme-success), 0.15) !important;
}

.plan-card-active:hover {
  border-color: rgba(var(--v-theme-success), 0.6) !important;
  box-shadow: 0 4px 20px rgba(var(--v-theme-success), 0.2) !important;
  transform: translateY(-2px);
}

.features-list {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding-top: 12px;
  padding-bottom: 12px;
}

.feature-item {
  min-height: 24px;
}

.feature-check-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgb(var(--v-theme-success));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
