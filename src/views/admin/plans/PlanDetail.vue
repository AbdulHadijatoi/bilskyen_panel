<template>
  <div class="plan-detail">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          size="small"
          class="mb-2"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h5 font-weight-medium mb-1">{{ plan?.name || 'Plan Details' }}</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ plan?.slug || 'View and manage plan information' }}
        </p>
      </div>
      <v-btn
        v-if="plan"
        :color="editMode ? 'error' : 'primary'"
        variant="flat"
        :prepend-icon="editMode ? 'mdi-close' : 'mdi-pencil'"
        @click="editMode = !editMode"
        size="small"
      >
        {{ editMode ? 'Cancel' : 'Edit' }}
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
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <!-- Plan Content -->
    <div v-else-if="plan">
      <v-row dense>
        <!-- Left Column - Main Info -->
        <v-col cols="12" md="8">
          <!-- Plan Information -->
          <v-card variant="flat" class="mb-3 plan-section-card">
            <v-card-title class="text-subtitle-2 font-weight-medium pa-3 section-header">
              Plan Information
            </v-card-title>
            <v-divider class="section-divider" />
            <v-card-text class="pa-3 section-content">
              <v-row dense class="compact-row">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="planData.name"
                    label="Name"
                    variant="outlined"
                    density="compact"
                    :readonly="!editMode"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="planData.slug"
                    label="Slug"
                    variant="outlined"
                    density="compact"
                    :readonly="!editMode"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="planData.description"
                    label="Description"
                    variant="outlined"
                    density="compact"
                    :readonly="!editMode"
                    rows="2"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="activeStatus"
                    :items="activeStatusOptions"
                    item-title="title"
                    item-value="value"
                    label="Status"
                    variant="outlined"
                    density="compact"
                    :readonly="!editMode"
                    :disabled="!editMode"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="planData.trial_days"
                    label="Trial Days"
                    type="number"
                    variant="outlined"
                    density="compact"
                    :readonly="!editMode"
                    hint="Number of free trial days (0 or empty to disable trial)"
                    persistent-hint
                    :min="0"
                  />
                </v-col>
              </v-row>
              <v-btn
                v-if="editMode"
                color="primary"
                variant="flat"
                @click="updatePlanBasicInfo"
                :loading="updatingBasicInfo"
                size="small"
                class="mt-2"
              >
                Save Changes
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Pricing -->
          <v-card variant="flat" class="mb-3 plan-section-card">
            <v-card-title class="text-subtitle-2 font-weight-medium pa-3 section-header">
              Pricing
            </v-card-title>
            <v-divider class="section-divider" />
            <v-card-text class="pa-3 section-content">
              <!-- Current Pricing Display -->
              <div v-if="currentPricing && (currentPricing.monthly || currentPricing.yearly)" class="mb-3 pricing-display">
                <div class="text-caption text-medium-emphasis mb-2">Current Pricing</div>
                <div class="d-flex gap-4">
                  <div v-if="currentPricing.monthly" class="pricing-item">
                    <div class="text-h6 font-weight-bold">{{ formatPrice(currentPricing.monthly.price, currentPricing.monthly.currency) }}</div>
                    <div class="text-caption text-medium-emphasis">/ Month</div>
                  </div>
                  <div v-if="currentPricing.yearly" class="pricing-item">
                    <div class="text-h6 font-weight-bold">{{ formatPrice(currentPricing.yearly.price, currentPricing.yearly.currency) }}</div>
                    <div class="text-caption text-medium-emphasis">/ Year</div>
                  </div>
                </div>
              </div>
              <v-alert v-else type="info" variant="tonal" density="compact" class="mb-3 compact-alert">
                No active pricing set
              </v-alert>

              <!-- Pricing Form -->
              <div v-if="editMode">
                <div class="text-caption text-medium-emphasis mb-2">Update Pricing (in cents)</div>
                <v-row dense>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="pricingData.monthly_price"
                      label="Monthly"
                      type="number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="pricingData.yearly_price"
                      label="Yearly"
                      type="number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="pricingData.currency"
                      label="Currency"
                      variant="outlined"
                      density="compact"
                      maxlength="3"
                    />
                  </v-col>
                </v-row>
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="updatePricing"
                  :loading="updatingPricing"
                  :disabled="!pricingData.monthly_price && !pricingData.yearly_price"
                  size="small"
                  class="mt-2"
                >
                  Update Pricing
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Availability -->
          <v-card variant="flat" class="mb-3 plan-section-card">
            <v-card-title class="text-subtitle-2 font-weight-medium pa-3 section-header">
              Availability
            </v-card-title>
            <v-divider class="section-divider" />
            <v-card-text class="pa-3 section-content">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis mb-2">Role-Based</div>
                  <v-select
                    v-model="selectedRoleIds"
                    :items="roles"
                    item-title="name"
                    item-value="id"
                    label="Roles"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    closable-chips
                    :readonly="!editMode"
                    :loading="loadingRoles"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis mb-2">Specific Dealers</div>
                  <v-autocomplete
                    v-model="selectedDealerIds"
                    :items="dealers"
                    :item-title="(item) => `${item.cvr || 'N/A'} - ${item.city || 'N/A'}`"
                    item-value="id"
                    label="Dealers"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    closable-chips
                    :readonly="!editMode"
                    :loading="loadingDealers"
                  />
                </v-col>
              </v-row>
              <v-alert
                v-if="editMode && selectedRoleIds.length === 0 && selectedDealerIds.length === 0"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-3"
              >
                At least one role or dealer must be selected
              </v-alert>
              <v-btn
                v-if="editMode"
                color="primary"
                variant="flat"
                @click="updateAvailability"
                :loading="updatingAvailability"
                :disabled="selectedRoleIds.length === 0 && selectedDealerIds.length === 0"
                size="small"
                class="mt-3"
              >
                Update Availability
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Features -->
        <v-col cols="12" md="4">
          <v-card variant="flat" class="mb-3 plan-section-card">
            <v-card-title class="d-flex justify-space-between align-center pa-3 section-header">
              <span class="text-subtitle-2 font-weight-medium">Features</span>
              <v-btn
                v-if="editMode"
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                @click="openAddFeatureDialog"
                size="x-small"
              >
                Add
              </v-btn>
            </v-card-title>
            <v-divider class="section-divider" />
            <v-card-text class="pa-3 section-content">
              <div v-if="loadingFeatures" class="text-center py-6">
                <v-progress-circular indeterminate color="primary" size="32" />
              </div>
              <div v-else-if="features.length === 0" class="text-center py-6">
                <div class="text-body-2 text-medium-emphasis mb-3">No features assigned</div>
                <v-btn
                  v-if="editMode"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  @click="openAddFeatureDialog"
                  size="small"
                >
                  Add Feature
                </v-btn>
              </div>
              <div v-else class="features-list">
                <div
                  v-for="feature in features"
                  :key="feature.id"
                  class="feature-item d-flex align-center justify-space-between mb-2 pa-3"
                >
                  <div class="d-flex align-center flex-grow-1">
                    <v-icon size="16" class="mr-2 feature-icon">mdi-check</v-icon>
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-medium">{{ formatFeatureKey(feature.key) }}</div>
                      <div class="text-caption text-medium-emphasis">
                        Value: <span class="font-weight-medium">{{ feature.pivot?.value || feature.value || 'Not set' }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="editMode" class="d-flex gap-1">
                    <v-btn
                      icon
                      variant="text"
                      size="x-small"
                      @click="openEditFeatureValueDialog(feature)"
                    >
                      <v-icon size="18">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="x-small"
                      color="error"
                      @click="removeFeature(feature.id)"
                    >
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add Feature Dialog -->
      <v-dialog v-model="showAddFeatureDialog" max-width="600" scrollable persistent>
        <v-card variant="flat" class="dialog-card">
          <v-card-title class="pa-3 section-header">
            <span class="text-subtitle-2 font-weight-medium">Add Feature</span>
          </v-card-title>
          <v-divider class="section-divider" />
          <v-card-text class="pa-3 section-content">
            <v-autocomplete
              v-model="selectedFeatureId"
              :items="availableFeatures"
              item-title="key"
              item-value="id"
              label="Feature *"
              variant="outlined"
              density="compact"
              :loading="loadingAllFeatures"
              :rules="[v => !!v || 'Required']"
              class="mb-3"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" density="compact">
                  <v-list-item-title>{{ item.raw.key }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description || 'No description' }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
            <!-- Boolean Feature: Dropdown -->
            <v-select
              v-if="getFeatureValueTypeId(selectedFeatureId) === 1"
              v-model="featureValue"
              :items="booleanOptions"
              item-title="label"
              item-value="value"
              label="Value *"
              variant="outlined"
              density="compact"
              :rules="[v => v !== null && v !== undefined && v !== '' || 'Required']"
            />
            <!-- Number Feature: Number Input -->
            <v-text-field
              v-else-if="getFeatureValueTypeId(selectedFeatureId) === 2"
              v-model.number="featureValue"
              label="Value *"
              type="number"
              variant="outlined"
              density="compact"
              :placeholder="getFeatureValuePlaceholder(selectedFeatureId)"
              :rules="[v => v !== null && v !== undefined && v !== '' || 'Required']"
            />
            <!-- Text Feature: Text Input -->
            <v-text-field
              v-else-if="getFeatureValueTypeId(selectedFeatureId) === 3"
              v-model="featureValue"
              label="Value *"
              variant="outlined"
              density="compact"
              :placeholder="getFeatureValuePlaceholder(selectedFeatureId)"
              :rules="[v => !!v || 'Required']"
            />
            <!-- Default: Text Input (fallback) -->
            <v-text-field
              v-else
              v-model="featureValue"
              label="Value *"
              variant="outlined"
              density="compact"
              :placeholder="getFeatureValuePlaceholder(selectedFeatureId)"
              :rules="[v => !!v || 'Required']"
            />
            <v-alert v-if="selectedFeatureId" type="info" variant="tonal" density="compact" class="mt-3 compact-alert">
              <div class="text-caption">
                <strong>Type:</strong> {{ getFeatureValueTypeName(selectedFeatureId) }}<br>
                <strong>Description:</strong> {{ getSelectedFeatureDescription(selectedFeatureId) }}
              </div>
            </v-alert>
          </v-card-text>
          <v-divider class="section-divider" />
          <v-card-actions class="pa-3 dialog-actions">
            <v-spacer />
            <v-btn variant="text" size="small" @click="closeAddFeatureDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="addFeature"
              :loading="addingFeature"
              :disabled="!selectedFeatureId || (getFeatureValueTypeId(selectedFeatureId) === 1 && !featureValue)"
              size="small"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Feature Value Dialog -->
      <v-dialog v-model="showEditFeatureValueDialog" max-width="500" scrollable persistent>
        <v-card variant="flat" class="dialog-card">
          <v-card-title class="pa-3 section-header">
            <span class="text-subtitle-2 font-weight-medium">Edit Feature Value</span>
          </v-card-title>
          <v-divider class="section-divider" />
          <v-card-text class="pa-3 section-content">
            <div v-if="editingFeature">
              <div class="text-body-2 font-weight-medium mb-1">{{ editingFeature.key }}</div>
              <div class="text-caption text-medium-emphasis mb-3">{{ editingFeature.description || 'No description' }}</div>
              <!-- Boolean Feature: Dropdown -->
              <v-select
                v-if="editingFeature?.feature_value_type_id === 1"
                v-model="editingFeatureValue"
                :items="booleanOptions"
                item-title="label"
                item-value="value"
                :label="`Value for ${editingFeature.key}`"
                variant="outlined"
                density="compact"
                :rules="[v => v !== null && v !== undefined && v !== '' || 'Required']"
              />
              <!-- Number Feature: Number Input -->
              <v-text-field
                v-else-if="editingFeature?.feature_value_type_id === 2"
                v-model.number="editingFeatureValue"
                :label="`Value for ${editingFeature.key}`"
                type="number"
                variant="outlined"
                density="compact"
                :hint="getFeatureValueHint(editingFeature)"
                persistent-hint
                :rules="[v => v !== null && v !== undefined && v !== '' || 'Required']"
              />
              <!-- Text Feature: Text Input -->
              <v-text-field
                v-else-if="editingFeature?.feature_value_type_id === 3"
                v-model="editingFeatureValue"
                :label="`Value for ${editingFeature.key}`"
                variant="outlined"
                density="compact"
                :hint="getFeatureValueHint(editingFeature)"
                persistent-hint
                :rules="[v => !!v || 'Required']"
              />
              <!-- Default: Text Input (fallback) -->
              <v-text-field
                v-else
                v-model="editingFeatureValue"
                :label="`Value for ${editingFeature.key}`"
                variant="outlined"
                density="compact"
                :hint="getFeatureValueHint(editingFeature)"
                persistent-hint
                :rules="[v => !!v || 'Required']"
              />
            </div>
          </v-card-text>
          <v-divider class="section-divider" />
          <v-card-actions class="pa-3 dialog-actions">
            <v-spacer />
            <v-btn variant="text" size="small" @click="closeEditFeatureValueDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="updateFeatureValue"
              :loading="updatingFeatureValue"
              size="small"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="3000"
        location="top right"
      >
        {{ snackbar.message }}
        <template v-slot:actions>
          <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
        </template>
      </v-snackbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getPlan,
  updatePlan as updatePlanApi,
  getPlanFeatures,
  getPlanAvailability,
  syncPlanAvailability,
  getPlanPricing,
  updatePlanPricing as updatePlanPricingApi,
  removeFeature as removeFeatureApi,
  assignFeature,
  getFeatures,
  getRoles,
  getDealers,
  type UpdatePlanData,
  type PlanModel,
  type SyncPlanAvailabilityData,
  type UpdatePlanPricingData,
  type AssignFeatureData
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingFeatures = ref(false)
const loadingRoles = ref(false)
const loadingDealers = ref(false)
const error = ref<string | null>(null)
const plan = ref<PlanModel | null>(null)
const planData = ref<UpdatePlanData>({
  name: '',
  slug: '',
  description: '',
  is_active: true,
  trial_days: null,
})
const features = ref<any[]>([])
const roles = ref<any[]>([])
const dealers = ref<any[]>([])
const selectedRoleIds = ref<number[]>([])
const selectedDealerIds = ref<number[]>([])
const currentPricing = ref<any>(null)
const pricingData = ref<UpdatePlanPricingData>({
  monthly_price: undefined,
  yearly_price: undefined,
  currency: 'DKK',
})

const editMode = ref(false)
const updatingBasicInfo = ref(false)
const updatingAvailability = ref(false)
const updatingPricing = ref(false)

// Feature management
const showAddFeatureDialog = ref(false)
const showEditFeatureValueDialog = ref(false)
const availableFeatures = ref<any[]>([])
const allFeatures = ref<any[]>([])
const selectedFeatureId = ref<number | null>(null)
const featureValue = ref('')
const editingFeature = ref<any>(null)
const editingFeatureValue = ref('')
const addingFeature = ref(false)
const updatingFeatureValue = ref(false)
const loadingAllFeatures = ref(false)

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const booleanOptions = [
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
]

const activeStatusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false },
]

const activeStatus = computed({
  get: () => planData.value.is_active,
  set: (value: boolean) => {
    planData.value.is_active = value
  }
})

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

const loadPlan = async () => {
  const planId = route.params.id as string
  if (!planId) return

  try {
    loading.value = true
    error.value = null
    const loadedPlan = await getPlan(planId)
    plan.value = loadedPlan
    planData.value = {
      name: loadedPlan.name,
      slug: loadedPlan.slug || '',
      description: loadedPlan.description || '',
      is_active: loadedPlan.is_active ?? true,
      trial_days: loadedPlan.trial_days ?? null,
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load plan'
  } finally {
    loading.value = false
  }
}

const loadFeatures = async () => {
  const planId = route.params.id as string
  if (!planId) return

  try {
    loadingFeatures.value = true
    const featuresList = await getPlanFeatures(planId)
    features.value = featuresList
  } catch (err) {
    console.error('Failed to load features:', err)
  } finally {
    loadingFeatures.value = false
  }
}

const loadAvailability = async () => {
  const planId = route.params.id as string
  if (!planId) return

  try {
    const availability = await getPlanAvailability(planId)
    selectedRoleIds.value = availability.roles?.map((r: any) => r.id) || []
    selectedDealerIds.value = availability.dealers?.map((d: any) => d.id) || []
  } catch (err) {
    console.error('Failed to load availability:', err)
  }
}

const loadPricing = async () => {
  const planId = route.params.id as string
  if (!planId) return

  try {
    const pricing = await getPlanPricing(planId)
    currentPricing.value = pricing
    
    if (pricing.monthly) {
      pricingData.value.monthly_price = pricing.monthly.price
      pricingData.value.currency = pricing.monthly.currency
    }
    if (pricing.yearly) {
      pricingData.value.yearly_price = pricing.yearly.price
      pricingData.value.currency = pricing.yearly.currency
    }
  } catch (err) {
    console.error('Failed to load pricing:', err)
  }
}

const loadRoles = async () => {
  try {
    loadingRoles.value = true
    const allRoles = await getRoles()
    // Filter to show only dealer role
    roles.value = Array.isArray(allRoles) 
      ? allRoles.filter((role: any) => role.name === 'dealer' || role.name === 'Dealer')
      : []
  } catch (err) {
    console.error('Failed to load roles:', err)
  } finally {
    loadingRoles.value = false
  }
}

const loadDealers = async () => {
  try {
    loadingDealers.value = true
    const response = await getDealers({ limit: 100 })
    dealers.value = response.docs || []
  } catch (err) {
    console.error('Failed to load dealers:', err)
  } finally {
    loadingDealers.value = false
  }
}

const updatePlanBasicInfo = async () => {
  if (!plan.value) return

  try {
    updatingBasicInfo.value = true
    const updatedPlan = await updatePlanApi(plan.value.id, planData.value)
    plan.value = updatedPlan
    error.value = null
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update plan'
  } finally {
    updatingBasicInfo.value = false
  }
}

const updateAvailability = async () => {
  const planId = route.params.id as string
  if (!planId) return

  if (selectedRoleIds.value.length === 0 && selectedDealerIds.value.length === 0) {
    error.value = 'At least one role or dealer must be selected'
    return
  }

  try {
    updatingAvailability.value = true
    const data: SyncPlanAvailabilityData = {}
    if (selectedRoleIds.value.length > 0) {
      data.role_ids = selectedRoleIds.value
    }
    if (selectedDealerIds.value.length > 0) {
      data.dealer_ids = selectedDealerIds.value
    }
    
    await syncPlanAvailability(planId, data)
    error.value = null
    await loadAvailability()
    showSnackbar('Plan availability updated successfully', 'success')
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update availability'
    showSnackbar((err as ApiErrorModel).message || 'Failed to update availability', 'error')
  } finally {
    updatingAvailability.value = false
  }
}

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

const updatePricing = async () => {
  const planId = route.params.id as string
  if (!planId) return

  if (!pricingData.value.monthly_price && !pricingData.value.yearly_price) {
    error.value = 'At least one price (monthly or yearly) must be provided'
    return
  }

  try {
    updatingPricing.value = true
    await updatePlanPricingApi(planId, pricingData.value)
    error.value = null
    await loadPricing()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update pricing'
  } finally {
    updatingPricing.value = false
  }
}

const removeFeature = async (featureId: number | string) => {
  if (!plan.value) return

  if (!confirm('Are you sure you want to remove this feature from the plan?')) {
    return
  }

  try {
    await removeFeatureApi(plan.value.id, featureId)
    await loadFeatures()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to remove feature'
  }
}

const loadAllFeatures = async () => {
  try {
    loadingAllFeatures.value = true
    allFeatures.value = await getFeatures()
  } catch (err) {
    console.error('Failed to load all features:', err)
  } finally {
    loadingAllFeatures.value = false
  }
}

const openAddFeatureDialog = async () => {
  try {
    await loadAllFeatures()
    const assignedFeatureIds = features.value.map(f => f.id)
    availableFeatures.value = allFeatures.value.filter(f => !assignedFeatureIds.includes(f.id))
    selectedFeatureId.value = null
    featureValue.value = ''
    showAddFeatureDialog.value = true
  } catch (err) {
    error.value = 'Failed to load features'
  }
}

const closeAddFeatureDialog = () => {
  showAddFeatureDialog.value = false
  selectedFeatureId.value = null
  featureValue.value = ''
}

const addFeature = async () => {
  if (!selectedFeatureId.value || !plan.value) return

  try {
    addingFeature.value = true
    const data: AssignFeatureData = {
      feature_id: selectedFeatureId.value,
      value: featureValue.value || null
    }
    await assignFeature(plan.value.id, data)
    showAddFeatureDialog.value = false
    await loadFeatures()
    error.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to add feature'
  } finally {
    addingFeature.value = false
  }
}

const openEditFeatureValueDialog = (feature: any) => {
  editingFeature.value = feature
  const currentValue = feature.pivot?.value || feature.value || ''
  // For boolean features, ensure value is 'true' or 'false' string
  if (feature.feature_value_type_id === 1) {
    editingFeatureValue.value = currentValue === 'true' || currentValue === true || currentValue === '1' || currentValue === 1 ? 'true' : 'false'
  } else {
    editingFeatureValue.value = currentValue
  }
  showEditFeatureValueDialog.value = true
}

const closeEditFeatureValueDialog = () => {
  showEditFeatureValueDialog.value = false
  editingFeature.value = null
  editingFeatureValue.value = ''
}

const updateFeatureValue = async () => {
  if (!editingFeature.value || !plan.value) return

  try {
    updatingFeatureValue.value = true
    await removeFeatureApi(plan.value.id, editingFeature.value.id)
    const data: AssignFeatureData = {
      feature_id: editingFeature.value.id,
      value: editingFeatureValue.value || null
    }
    await assignFeature(plan.value.id, data)
    showEditFeatureValueDialog.value = false
    await loadFeatures()
    error.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update feature value'
  } finally {
    updatingFeatureValue.value = false
  }
}

const getFeatureValueTypeName = (featureId: number | null) => {
  if (!featureId) return 'Unknown'
  const feature = allFeatures.value.find(f => f.id === featureId)
  if (!feature) return 'Unknown'
  const typeId = feature.feature_value_type_id
  const types: Record<number, string> = {
    1: 'Boolean',
    2: 'Number',
    3: 'Text',
  }
  return types[typeId] || 'Unknown'
}

const getSelectedFeatureDescription = (featureId: number | null) => {
  if (!featureId) return 'No description'
  const feature = allFeatures.value.find(f => f.id === featureId)
  return feature?.description || 'No description'
}

const getFeatureValueTypeId = (featureId: number | null) => {
  if (!featureId) return null
  const feature = allFeatures.value.find(f => f.id === featureId)
  return feature?.feature_value_type_id || null
}

const getFeatureValuePlaceholder = (featureId: number | null) => {
  if (!featureId) return 'Enter value...'
  const feature = allFeatures.value.find(f => f.id === featureId)
  if (!feature) return 'Enter value...'
  const typeId = feature.feature_value_type_id
  const placeholders: Record<number, string> = {
    1: 'Select true or false',
    2: 'e.g., 10, 50, 100',
    3: 'e.g., custom text',
  }
  return placeholders[typeId] || 'Enter value...'
}

const getFeatureValueHint = (feature: any) => {
  if (!feature) return ''
  const typeId = feature.feature_value_type_id
  const hints: Record<number, string> = {
    1: 'Enter "true" or "false"',
    2: 'Enter a numeric value',
    3: 'Enter text value',
  }
  return hints[typeId] || 'Enter the feature value'
}

onMounted(async () => {
  await Promise.all([
    loadPlan(),
    loadFeatures(),
    loadAvailability(),
    loadPricing(),
    loadRoles(),
    loadDealers(),
    loadAllFeatures()
  ])
})
</script>

<style scoped>
.plan-detail {
  padding: 0;
}

/* Section Cards */
.plan-section-card {
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  background: #FAFAFA;
  transition: border-color 0.2s ease;
}

.plan-section-card:hover {
  border-color: #D0D0D0;
}

/* Section Header */
.section-header {
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
}

/* Section Divider */
.section-divider {
  border-color: #E5E5E5;
  opacity: 1;
}

/* Section Content */
.section-content {
  background: #FFFFFF;
}

/* Features List */
.features-list {
  padding-top: 8px;
  padding-bottom: 8px;
}

.feature-item {
  transition: background-color 0.2s ease;
  border-radius: 6px;
  border: 1px solid #E5E5E5;
  background: #FAFAFA;
  margin-bottom: 6px;
}

.feature-item:hover {
  background-color: #F0F0F0;
  border-color: #D0D0D0;
}

.feature-item:last-child {
  margin-bottom: 0;
}

/* Pricing Display */
.pricing-display {
  background: #FAFAFA;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  padding: 12px;
}

.pricing-item {
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
}

/* Compact Alert */
.compact-alert {
  border: 1px solid #E5E5E5;
  border-radius: 6px;
}

/* Dialog Styles */
.dialog-card {
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  background: #FAFAFA;
}

.dialog-card .section-header {
  background: #F5F5F5;
}

.dialog-card .section-content {
  background: #FFFFFF;
}

.dialog-actions {
  background: #F5F5F5;
  border-top: 1px solid #E5E5E5;
}

/* Feature Icon */
.feature-icon {
  color: #808080;
}

/* Compact Row Spacing */
.compact-row {
  margin: -4px;
}

.compact-row :deep(.v-col) {
  padding: 4px;
}

/* Compact spacing for form fields */
:deep(.v-text-field),
:deep(.v-textarea),
:deep(.v-select),
:deep(.v-autocomplete) {
  margin-bottom: 8px;
}

:deep(.v-text-field .v-field),
:deep(.v-textarea .v-field),
:deep(.v-select .v-field),
:deep(.v-autocomplete .v-field) {
  border-color: #E5E5E5;
  background-color: #FFFFFF;
}

:deep(.v-text-field .v-field:hover),
:deep(.v-textarea .v-field:hover),
:deep(.v-select .v-field:hover),
:deep(.v-autocomplete .v-field:hover) {
  border-color: #D0D0D0;
}

:deep(.v-text-field .v-field--focused),
:deep(.v-textarea .v-field--focused),
:deep(.v-select .v-field--focused),
:deep(.v-autocomplete .v-field--focused) {
  border-color: #B0B0B0;
}

/* Remove shadows from all elements */
:deep(.v-card) {
  box-shadow: none !important;
}

:deep(.v-btn) {
  box-shadow: none !important;
}

:deep(.v-chip) {
  box-shadow: none !important;
  border: 1px solid #E5E5E5;
  background: #FAFAFA;
}

:deep(.v-chip:hover) {
  background: #F0F0F0;
  border-color: #D0D0D0;
}
</style>
