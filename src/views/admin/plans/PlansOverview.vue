<template>
  <div class="plans-overview">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">Subscription Plans</h1>
        <p class="text-body-2 text-medium-emphasis">
          Manage subscription plans and pricing for dealers
        </p>
      </div>
      <v-btn
        v-if="hasPermission('admin.plans.create')"
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        size="default"
        variant="flat"
      >
        Create Plan
      </v-btn>
    </div>

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
    <v-row v-else class="plans-grid" dense>
      <v-col
        v-for="plan in plans"
        :key="plan.id"
        cols="12"
        sm="6"
        md="6"
        lg="3"
      >
        <v-card
          class="plan-card"
          variant="elevated"
          elevation="1"
          @click="viewPlan(plan.id)"
        >
          <v-card-text class="pa-4">
            <!-- Plan Name -->
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-h6 font-weight-medium mb-0">{{ plan.name }}</h3>
              <v-chip
                :color="plan.is_active !== false ? 'success' : 'grey'"
                size="small"
                variant="flat"
              >
                {{ plan.is_active !== false ? 'Active' : 'Inactive' }}
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
    </v-card>
      </v-col>
    </v-row>

    <!-- Create Plan Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600" scrollable persistent>
      <v-card>
        <v-card-title class="pa-3 text-subtitle-1">
          Create New Plan
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form ref="createFormRef" v-model="createFormValid">
            <v-text-field
              v-model="newPlan.name"
              label="Plan Name *"
              variant="outlined"
              density="compact"
              class="mb-2"
              :rules="[v => !!v || 'Required']"
            />
            <v-text-field
              v-model="newPlan.slug"
              label="Slug *"
              variant="outlined"
              density="compact"
              hint="URL-friendly identifier"
              persistent-hint
              class="mb-2"
              :rules="[v => !!v || 'Required', v => !v || /^[a-z0-9-]+$/.test(v) || 'Invalid format']"
            />
            <v-textarea
              v-model="newPlan.description"
              label="Description"
              variant="outlined"
              density="compact"
              rows="2"
              class="mb-2"
            />
            <v-switch
              v-model="newPlan.is_active"
              label="Active"
              density="compact"
              color="primary"
              class="mb-2"
            />
            <v-text-field
              v-model.number="newPlan.trial_days"
              label="Trial Days"
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
              label="Roles *"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              :loading="loadingRoles"
              class="mb-2"
            />
            <v-autocomplete
              v-model="newPlan.dealer_ids"
              :items="dealersList"
              :item-title="(item) => `${item.cvr || 'N/A'} - ${item.city || 'N/A'}`"
              item-value="id"
              label="Specific Dealers"
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
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              At least one role or dealer must be selected
            </v-alert>
            <div class="text-caption text-medium-emphasis mb-2">Pricing (Optional - in cents)</div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newPlan.pricing!.monthly_price"
                  label="Monthly"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newPlan.pricing!.yearly_price"
                  label="Yearly"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newPlan.pricing!.currency"
                  label="Currency"
                  variant="outlined"
                  density="compact"
                  maxlength="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="closeCreateDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            @click="createPlan"
            :loading="creating"
            :disabled="!canCreatePlan"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()

const loading = ref(false)
const loadingRoles = ref(false)
const loadingDealers = ref(false)
const error = ref<string | null>(null)
const plans = ref<PlanModel[]>([])
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

const newPlan = ref<CreatePlanData>({
  name: '',
  slug: '',
  description: '',
  is_active: true,
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
  return !!(
    newPlan.value.name &&
    newPlan.value.slug &&
    ((newPlan.value.role_ids && newPlan.value.role_ids.length > 0) ||
    (newPlan.value.dealer_ids && newPlan.value.dealer_ids.length > 0)) &&
    createFormValid.value
  )
})

const getCurrentPricing = (plan: PlanModel) => {
  const priceHistory = plan.priceHistory || plan.price_history || []
  if (priceHistory.length === 0) return null
  
  const activePricing = priceHistory.filter((p: any) => !p.ends_at)
  if (activePricing.length === 0) return null
  
  const monthly = activePricing.find((p: any) => p.billing_cycle === 'monthly')
  const yearly = activePricing.find((p: any) => p.billing_cycle === 'yearly')
  
  return { monthly, yearly }
}

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
    error.value = (err as ApiErrorModel).message || 'Failed to load plans'
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
    error.value = (err as ApiErrorModel).message || 'Failed to create plan'
  } finally {
    creating.value = false
  }
}

const viewPlan = (id: number) => {
  router.push({ name: 'admin.plans.detail', params: { id } })
}

const deletePlan = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this plan?')) return

  try {
    await deletePlanApi(id)
    await loadPlans()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete plan'
  }
}

const formatPrice = (priceInCents: number, currency: string) => {
  const price = priceInCents / 100
  return `${price.toFixed(2)} ${currency}`
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

onMounted(() => {
  loadPlans()
  loadRoles()
  loadDealers()
})
</script>

<style scoped>
.plans-overview {
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
  cursor: pointer;
}

.plan-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.2);
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
