<template>
  <div class="panel-page plans-overview">
    <!-- Header -->
    <PageHeader
      :title="t('admin.views.plans.title')"
      :subtitle="t('admin.views.plans.subtitle')"
      centered
    >
      <template #actions>
        <v-btn
          v-if="hasPermission('admin.plans.create')"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
          size="default"
          variant="flat"
        >
          {{ t('admin.views.plans.createPlan') }}
        </v-btn>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
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
      v-else-if="plans.length === 0"
      variant="elevated"
      elevation="1"
      class="text-center py-12"
    >
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">No Plans Yet</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Create your first subscription plan
      </p>
      <v-btn
        v-if="hasPermission('admin.plans.create')"
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        variant="flat"
      >
        Create Plan
      </v-btn>
    </v-card>

    <!-- Plans Grid -->
    <template v-else>
      <div v-if="showBillingToggle" class="subscription-pricing-toolbar">
        <BillingCycleToggle v-model="billingCycle" :yearly-discount-label="yearlyDiscountBadge" />
      </div>

      <PlanPricingGrid
        :plans="plans"
        cta-mode="view"
        :billing-cycle="billingCycle"
        :show-status-chip="true"
        :show-section-titles="true"
        @select="viewPlan"
      />

      <PlanFeatureComparison
        v-if="subscriptionPlansForComparison.length > 0"
        :plans="subscriptionPlansForComparison"
        :highlight-column="false"
        feature-info-mode="admin"
      />

      <PlanFeatureComparison
        v-if="paygPlansForComparison.length > 0"
        :plans="paygPlansForComparison"
        :highlight-column="false"
        :title="paygComparisonTitle"
        feature-info-mode="admin"
      />
    </template>

    <!-- Create Plan Dialog -->
    <PanelDialog
      v-model="showCreateDialog"
      :title="t('admin.views.plans.createPlan')"
      :max-width="600"
      persistent
    >
      <v-form ref="createFormRef" v-model="createFormValid">
            <v-text-field
              v-model="newPlan.name"
              :label="t('admin.views.plans.planName')"
              variant="outlined"
              density="compact"
              class="mb-2"
              :rules="[v => !!v || t('common.required')]"
            />
            <v-text-field
              v-model="newPlan.slug"
              :label="t('admin.views.plans.slug')"
              variant="outlined"
              density="compact"
              hint="URL-friendly identifier"
              persistent-hint
              class="mb-2"
              :rules="[v => !!v || t('common.required'), v => !v || /^[a-z0-9-]+$/.test(v) || t('common.invalidFormat')]"
            />
            <v-textarea
              v-model="newPlan.description"
              :label="t('admin.views.plans.description')"
              variant="outlined"
              density="compact"
              rows="2"
              class="mb-2"
            />
            <v-switch
              v-model="newPlan.is_active"
              :label="t('admin.views.plans.active')"
              density="compact"
              color="primary"
              class="mb-2"
            />
            <v-select
              v-model="newPlan.billing_model"
              :items="createBillingModelOptions"
              item-title="title"
              item-value="value"
              :label="t('admin.views.plans.billingModel')"
              variant="outlined"
              density="compact"
              class="mb-2"
            />
            <v-text-field
              v-model.number="newPlan.trial_days"
              :label="t('admin.views.plans.trialDays')"
              type="number"
              variant="outlined"
              density="compact"
              hint="Number of free trial days (0 or empty to disable trial)"
              persistent-hint
              :min="0"
              class="mb-2"
            />
            <v-select
              v-model="newPlan.role_ids"
              :items="rolesList"
              item-title="name"
              item-value="id"
              :label="t('admin.views.plans.roles')"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              :loading="loadingRoles"
              class="mb-2"
            />
            <v-row dense class="mb-2">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newPlan.pricing!.monthly_price"
                  :label="t('admin.views.plans.monthly')"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :min="0"
                  hint="Price in cents (optional)"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newPlan.pricing!.yearly_price"
                  :label="t('admin.views.plans.yearly')"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :min="0"
                  hint="Price in cents (optional)"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newPlan.pricing!.currency"
                  :label="t('admin.views.plans.currency')"
                  variant="outlined"
                  density="compact"
                  maxlength="3"
                />
              </v-col>
            </v-row>
            <v-autocomplete
              v-model="newPlan.dealer_ids"
              :items="dealersList"
              :item-title="(item) => `${item.cvr || t('common.na')} - ${item.city || t('common.na')}`"
              item-value="id"
              :label="t('admin.views.plans.specificDealers')"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              :loading="loadingDealers"
              class="mb-2"
            />
            <v-alert
              v-if="!newPlan.role_ids?.length && !newPlan.dealer_ids?.length"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              {{ t('admin.views.plans.rolesOptionalHint') }}
            </v-alert>
      </v-form>

      <template #footer>
        <PanelButton variant="ghost" @click="closeCreateDialog">
          {{ t('common.cancel') }}
        </PanelButton>
        <PanelButton
          variant="primary"
          :loading="creating"
          :disabled="!canCreatePlan"
          @click="createPlan"
        >
          Create
        </PanelButton>
      </template>
    </PanelDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { hasPermission } from '@/utils/permissions'
import {
  getPlans,
  createPlan as createPlanApi,
  deletePlan as deletePlanApi,
  getRoles,
  getDealers,
  type CreatePlanData,
  type PlanModel
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import BillingCycleToggle from '@/components/subscription/BillingCycleToggle.vue'
import PlanPricingGrid from '@/components/subscription/PlanPricingGrid.vue'
import PlanFeatureComparison from '@/components/subscription/PlanFeatureComparison.vue'
import { splitPlansByBillingModel } from '@/utils/planFeatureGroups'
import { usePlanDisplay, type BillingCycle, type PlanLike, computeMaxYearlyDiscountPercent } from '@/composables/usePlanDisplay'
import PageHeader from '@/components/panel/PageHeader.vue'
import PanelDialog from '@/components/ui/PanelDialog.vue'
import PanelButton from '@/components/ui/PanelButton.vue'

const router = useRouter()
const { t } = useI18n()
const { plansHaveBothCycles } = usePlanDisplay()

const loading = ref(false)
const loadingRoles = ref(false)
const loadingDealers = ref(false)
const error = ref<string | null>(null)
const plans = ref<PlanLike[]>([])
const roles = ref<any[]>([])
const dealers = ref<any[]>([])
const rolesList = computed(() => {
  const allRoles = Array.isArray(roles.value) ? roles.value : []
  // Filter to show only dealer role
  return allRoles.filter((role: any) => role.name === 'dealer' || role.name === 'Dealer')
})
const dealersList = computed(() => Array.isArray(dealers.value) ? dealers.value : [])
const showCreateDialog = ref(false)
const creating = ref(false)
const createFormValid = ref(false)
const createFormRef = ref()
const billingCycle = ref<BillingCycle>('monthly')

const createBillingModelOptions = [
  { title: t('admin.views.plans.billingSubscription'), value: 'subscription' as const },
  { title: t('admin.views.plans.billingUsageDaily'), value: 'usage_daily' as const },
]

const showBillingToggle = computed(() => plansHaveBothCycles(plans.value))

const subscriptionPlansForComparison = computed(
  () => splitPlansByBillingModel(plans.value).subscriptionPlans
)

const paygPlansForComparison = computed(
  () => splitPlansByBillingModel(plans.value).paygPlans
)

const paygComparisonTitle = computed(() => {
  if (subscriptionPlansForComparison.value.length === 0) {
    return undefined
  }
  return t('subscription.comparison.title') + ' — ' + t('subscription.pricing.payAsYouGoPlans')
})

const newPlan = ref<CreatePlanData>({
  name: '',
  slug: '',
  description: '',
  is_active: true,
  billing_model: 'subscription',
  trial_days: null,
  role_ids: [],
  dealer_ids: [],
  pricing: {
    monthly_price: undefined as number | undefined,
    yearly_price: undefined as number | undefined,
    currency: 'DKK',
  },
})

const canCreatePlan = computed(() => {
  return !!(newPlan.value.name && newPlan.value.slug && createFormValid.value)
})

const yearlyDiscountBadge = computed(() => {
  const pct = computeMaxYearlyDiscountPercent(plans.value)
  if (pct == null || pct <= 0) return undefined
  return t('subscription.pricing.yearlyDiscountPercent', { percent: pct })
})

const loadPlans = async () => {
  try {
    loading.value = true
    error.value = null
    const plansList = await getPlans()
    plans.value = (Array.isArray(plansList) ? plansList : []).map((plan: any) => ({
      ...plan,
      priceHistory: plan.price_history || plan.priceHistory || [],
      price_history: plan.price_history || plan.priceHistory || [],
      availability: (plan.availability || []).map((avail: any) => ({
        ...avail,
        allowedRole: avail.allowed_role || avail.allowedRole,
        allowed_role: avail.allowed_role || avail.allowedRole,
      })),
    }))
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.plans.failedLoadPlans')
    plans.value = []
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    loadingRoles.value = true
    const result = await getRoles()
    roles.value = Array.isArray(result) ? result : []
  } catch (err) {
    console.error('Failed to load roles:', err)
    roles.value = []
  } finally {
    loadingRoles.value = false
  }
}

const loadDealers = async () => {
  try {
    loadingDealers.value = true
    const response = await getDealers({ limit: 100 })
    dealers.value = Array.isArray(response?.docs) ? response.docs : (Array.isArray(response) ? response : [])
  } catch (err) {
    console.error('Failed to load dealers:', err)
    dealers.value = []
  } finally {
    loadingDealers.value = false
  }
}

const openCreateDialog = () => {
  newPlan.value = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
    billing_model: 'subscription',
    trial_days: null,
    role_ids: [],
    dealer_ids: [],
    pricing: {
      monthly_price: undefined,
      yearly_price: undefined,
      currency: 'DKK',
    },
  }
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  createFormRef.value?.reset()
}

const createPlan = async () => {
  if (!canCreatePlan.value) return

  try {
    creating.value = true
    await createPlanApi(newPlan.value)
    showCreateDialog.value = false
    await loadPlans()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedCreatePlan')
  } finally {
    creating.value = false
  }
}

const viewPlan = (plan: PlanLike) => {
  router.push({ name: 'admin.plans.detail', params: { id: plan.id } })
}

const deletePlan = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this plan?')) return

  try {
    await deletePlanApi(id)
    await loadPlans()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedDeletePlan')
  }
}

onMounted(() => {
  loadPlans()
  loadRoles()
  loadDealers()
})
</script>
