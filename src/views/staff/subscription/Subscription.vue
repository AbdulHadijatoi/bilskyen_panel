<template>
  <div class="panel-page subscription-page">
    <!-- Header -->
    <PageHeader
      :title="t('dealer.views.subscription.selectYourPlan')"
      :subtitle="t('dealer.views.subscription.pickPlanSubtitle')"
      centered
    />

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="successMessage = null"
    >
      {{ successMessage }}
    </v-alert>

    <v-alert
      v-if="pendingChangeRequest"
      type="info"
      variant="tonal"
      class="mb-6"
    >
      <div class="font-weight-medium mb-1">{{ t('dealer.views.subscription.pendingRequestTitle') }}</div>
      <div class="text-body-2 mb-3">
        {{
          t('dealer.views.subscription.pendingRequestBody', {
            plan: pendingChangeRequest.requested_plan?.name || '#' + pendingChangeRequest.requested_plan_id,
            billing:
              pendingChangeRequest.billing_cycle === 'yearly'
                ? t('admin.views.plans.yearly')
                : t('admin.views.plans.monthly'),
          })
        }}
      </div>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        :loading="cancellingPending"
        @click="handleCancelPending"
      >
        {{ t('dealer.views.subscription.cancelPendingRequest') }}
      </v-btn>
    </v-alert>

    <!-- Current Subscription (if exists) -->
    <v-card
      v-if="currentSubscription"
      class="panel-card panel-card--highlighted subscription-current-card mb-6"
      variant="flat"
    >
      <div class="panel-card__header">
        <h2 class="panel-card__title">
          <v-icon size="18" color="primary">mdi-check-decagram</v-icon>
          {{ t('dealer.views.subscription.currentSubscription') }}
        </h2>
        <span class="subscription-active-badge">
          <v-icon size="14">mdi-check-circle</v-icon>
          {{ getStatusLabel(currentSubscription.subscription_status_id) }}
        </span>
      </div>
      <div class="panel-card__body">
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.plan') }}</div>
              <div class="font-weight-bold text-h6 text-primary">{{ currentSubscription.plan?.name || t('common.na') }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.status') }}</div>
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
              <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.startDate') }}</div>
              <div>{{ formatDate(currentSubscription.starts_at) }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6" v-if="currentSubscription.ends_at">
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.endDate') }}</div>
              <div>{{ formatDate(currentSubscription.ends_at) }}</div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <v-card v-if="usageSummary?.is_usage_plan" class="panel-card mb-6" variant="flat">
      <div class="panel-card__header">
        <h2 class="panel-card__title">{{ t('dealer.views.subscription.usageTitle') }}</h2>
      </div>
      <div class="panel-card__body">
        <v-row>
          <v-col cols="12" md="4">
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.publishedListings') }}</div>
            <div class="text-h6">{{ usageSummary.published_listings }}</div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.dailyRate') }}</div>
            <div class="text-h6">{{ formatPrice(usageSummary.daily_rate_cents, 'DKK') }} / {{ t('dealer.views.subscription.perListingPerDay') }}</div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.chargedThisMonth') }}</div>
            <div class="text-h6">{{ formatPrice(usageSummary.total_charged_cents, 'DKK') }}</div>
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-medium-emphasis">{{ t('dealer.views.subscription.estimatedMonthly') }}</div>
            <div>{{ formatPrice(usageSummary.estimated_monthly_cents, 'DKK') }}</div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- Loading State -->
    <div v-if="loadingPlans" class="panel-loading py-12">
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
      class="panel-card text-center py-12"
      variant="flat"
    >
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">{{ t('dealer.views.subscription.noPlansAvailable') }}</h3>
      <p class="text-body-2 text-medium-emphasis">
        {{ t('dealer.views.subscription.noPlansMessage') }}
      </p>
    </v-card>

    <!-- Plans Grid -->
    <template v-else>
      <div v-if="showBillingToggle" class="subscription-pricing-toolbar">
        <BillingCycleToggle v-model="billingCycle" />
      </div>

      <PlanPricingGrid
        :plans="availablePlans"
        :active-plan-id="currentSubscription?.plan_id ?? null"
        :has-current-subscription="!!currentSubscription"
        :disabled="!!pendingChangeRequest"
        :disabled-hint="pendingChangeRequest ? t('dealer.views.subscription.pendingBlocksNewRequest') : undefined"
        :billing-cycle="billingCycle"
        @select="openSubscriptionDialog"
      />

      <PlanFeatureComparison
        v-if="subscriptionPlansForComparison.length > 0"
        :plans="subscriptionPlansForComparison"
        :active-plan-id="currentSubscription?.plan_id ?? null"
      />

      <PlanFeatureComparison
        v-if="paygPlansForComparison.length > 0"
        :plans="paygPlansForComparison"
        :active-plan-id="currentSubscription?.plan_id ?? null"
        :title="paygComparisonTitle"
      />
    </template>

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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getSubscription,
  getSubscriptionUsage,
  getAvailablePlans,
  createSubscription,
  getPendingSubscriptionChangeRequest,
  cancelPendingSubscriptionChangeRequest,
  type PlanModel,
  type CreateDealerSubscriptionData,
  type StaffPendingChangeRequestModel,
  type DealerSubscriptionUsageModel,
} from '@/api/staff.api'
import PlanSubscriptionDialog from '@/components/staff/PlanSubscriptionDialog.vue'
import BillingCycleToggle from '@/components/subscription/BillingCycleToggle.vue'
import PlanPricingGrid from '@/components/subscription/PlanPricingGrid.vue'
import PlanFeatureComparison from '@/components/subscription/PlanFeatureComparison.vue'
import type { ApiErrorModel } from '@/models/api-error.model'
import { getSubscriptionStatusLabel } from '@/utils/analyticsDisplay'
import { PLAN_SORT_ORDER } from '@/utils/subscriptionFeatures'
import { splitPlansByBillingModel } from '@/utils/planFeatureGroups'
import { usePlanDisplay, type BillingCycle, type PlanLike } from '@/composables/usePlanDisplay'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()
const { formatPrice, plansHaveBothCycles } = usePlanDisplay()

const loadingPlans = ref(false)
const error = ref<string | null>(null)
const availablePlans = ref<PlanModel[]>([])
const currentSubscription = ref<any>(null)
const showSubscriptionDialog = ref(false)
const selectedPlan = ref<PlanModel | null>(null)
const creatingSubscription = ref(false)
const pendingChangeRequest = ref<StaffPendingChangeRequestModel | null>(null)
const successMessage = ref<string | null>(null)
const cancellingPending = ref(false)
const usageSummary = ref<DealerSubscriptionUsageModel | null>(null)
const billingCycle = ref<BillingCycle>('monthly')

const showBillingToggle = computed(() => plansHaveBothCycles(availablePlans.value))

const subscriptionPlansForComparison = computed(
  () => splitPlansByBillingModel(availablePlans.value).subscriptionPlans
)

const paygPlansForComparison = computed(
  () => splitPlansByBillingModel(availablePlans.value).paygPlans
)

const paygComparisonTitle = computed(() => {
  if (subscriptionPlansForComparison.value.length === 0) {
    return undefined
  }
  return t('subscription.comparison.title') + ' — ' + t('subscription.pricing.payAsYouGoPlans')
})

const loadPlans = async () => {
  try {
    loadingPlans.value = true
    error.value = null
    const plans = await getAvailablePlans()
    availablePlans.value = plans.sort((a, b) => {
      const orderA = PLAN_SORT_ORDER[a.slug || ''] ?? 99
      const orderB = PLAN_SORT_ORDER[b.slug || ''] ?? 99
      return orderA - orderB
    })
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.plans.failedLoadPlans')
    availablePlans.value = []
  } finally {
    loadingPlans.value = false
  }
}

const loadCurrentSubscription = async () => {
  try {
    const sub = await getSubscription()
    currentSubscription.value = sub
  } catch {
    currentSubscription.value = null
  }
}

const loadUsageSummary = async () => {
  try {
    usageSummary.value = await getSubscriptionUsage()
  } catch {
    usageSummary.value = null
  }
}

const loadPendingChangeRequest = async () => {
  try {
    pendingChangeRequest.value = await getPendingSubscriptionChangeRequest()
  } catch {
    pendingChangeRequest.value = null
  }
}

const handleCancelPending = async () => {
  try {
    cancellingPending.value = true
    error.value = null
    await cancelPendingSubscriptionChangeRequest()
    successMessage.value = t('dealer.views.subscription.pendingCancelled')
    await loadPendingChangeRequest()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedCancelRequest')
  } finally {
    cancellingPending.value = false
  }
}

const getStatusColor = (statusId?: number) => {
  const colors: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'error',
    4: 'warning',
    5: 'primary',
  }
  return colors[statusId || 0] || 'grey'
}

const getStatusLabel = getSubscriptionStatusLabel

const formatDate = (date?: string) => {
  if (!date) return t('common.na')
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const openSubscriptionDialog = (plan: PlanLike) => {
  selectedPlan.value = plan as PlanModel
  showSubscriptionDialog.value = true
}

const closeSubscriptionDialog = () => {
  showSubscriptionDialog.value = false
  selectedPlan.value = null
}

const handleSubscriptionConfirm = async (billingCycleSelected: 'monthly' | 'yearly' | 'usage_daily') => {
  if (!selectedPlan.value) return

  try {
    creatingSubscription.value = true
    const data: CreateDealerSubscriptionData = {
      plan_id: selectedPlan.value.id,
      billing_cycle: billingCycleSelected,
    }
    const result = await createSubscription(data)
    closeSubscriptionDialog()
    successMessage.value = result.message || t('dealer.views.subscription.requestSubmitted')
    await Promise.all([loadPlans(), loadCurrentSubscription(), loadPendingChangeRequest()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.plans.failedCreateSubscription')
  } finally {
    creatingSubscription.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadPlans(), loadCurrentSubscription(), loadPendingChangeRequest(), loadUsageSummary()])
})
</script>
