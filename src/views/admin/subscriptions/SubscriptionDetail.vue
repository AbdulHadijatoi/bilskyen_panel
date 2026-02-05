<template>
  <div class="subscription-detail">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
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
        <h1 class="text-h5 font-weight-medium mb-1">Subscription Details</h1>
        <p class="text-body-2 text-medium-emphasis">
          View and manage subscription information
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-btn
          v-if="subscription && subscription.subscription_status_id === 3"
          color="success"
          variant="flat"
          prepend-icon="mdi-refresh"
          @click="renewSubscriptionAction"
          :loading="renewing"
          size="small"
        >
          Renew
        </v-btn>
        <v-btn
          v-if="subscription && subscription.subscription_status_id === 2"
          color="error"
          variant="flat"
          prepend-icon="mdi-cancel"
          @click="cancelSubscriptionAction"
          :loading="canceling"
          size="small"
        >
          Cancel
        </v-btn>
        <v-btn
          v-if="subscription"
          :color="editMode ? 'error' : 'primary'"
          variant="flat"
          prepend-icon="mdi-pencil"
          @click="editMode = !editMode"
          size="small"
        >
          {{ editMode ? 'Cancel' : 'Edit' }}
        </v-btn>
      </div>
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

    <!-- Subscription Content -->
    <div v-else-if="subscription">
      <!-- Stats Cards -->
      <v-row dense class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card variant="elevated" elevation="1" class="stat-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Status</div>
                  <div class="text-h6 font-weight-bold">{{ getStatusLabel(subscription.subscription_status_id) }}</div>
                </div>
                <v-avatar :color="getStatusColor(subscription.subscription_status_id)" size="40">
                  <v-icon color="white">{{ getStatusIcon(subscription.subscription_status_id) }}</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="elevated" elevation="1" class="stat-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Days Remaining</div>
                  <div class="text-h6 font-weight-bold">{{ getDaysRemaining() }}</div>
                </div>
                <v-avatar color="primary" size="40">
                  <v-icon color="white">mdi-calendar-clock</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="elevated" elevation="1" class="stat-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Billing Cycle</div>
                  <div class="text-h6 font-weight-bold">{{ (subscription as any).billing_cycle || 'N/A' }}</div>
                </div>
                <v-avatar color="info" size="40">
                  <v-icon color="white">mdi-repeat</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="elevated" elevation="1" class="stat-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">Auto Renew</div>
                  <div class="text-h6 font-weight-bold">{{ subscription.auto_renew ? 'Yes' : 'No' }}</div>
                </div>
                <v-avatar :color="subscription.auto_renew ? 'success' : 'grey'" size="40">
                  <v-icon color="white">{{ subscription.auto_renew ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <!-- Main Content -->
        <v-col cols="12" md="8">
          <!-- Subscription Details Card -->
          <v-card variant="elevated" elevation="1" class="subscription-section-card mb-4">
            <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
              Subscription Information
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <v-form ref="editFormRef" v-model="editFormValid">
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="editData.subscription_status_id"
                      :items="statusOptions"
                      item-title="label"
                      item-value="value"
                      label="Status *"
                      variant="outlined"
                      density="compact"
                      :readonly="!editMode"
                      :rules="[v => !!v || 'Status is required']"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-switch
                      v-model="editData.auto_renew"
                      label="Auto Renew"
                      color="primary"
                      density="compact"
                      :readonly="!editMode"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editData.starts_at"
                      label="Start Date *"
                      type="datetime-local"
                      variant="outlined"
                      density="compact"
                      :readonly="!editMode"
                      :rules="[v => !!v || 'Start date is required']"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editData.ends_at"
                      label="End Date"
                      type="datetime-local"
                      variant="outlined"
                      density="compact"
                      :readonly="!editMode"
                    />
                  </v-col>
                </v-row>

                <!-- Save Button -->
                <div v-if="editMode" class="mt-4">
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="updateSubscriptionAction"
                    :loading="updating"
                    :disabled="!editFormValid"
                    prepend-icon="mdi-check"
                    size="small"
                  >
                    Update Subscription
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Dealer & Plan Info -->
          <v-row dense>
            <v-col cols="12" md="6">
              <v-card variant="elevated" elevation="1" class="subscription-section-card mb-4">
                <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
                  <v-icon start size="small">mdi-store</v-icon>
                  Dealer
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                  <div v-if="subscription.dealer" class="d-flex align-center mb-3">
                    <v-avatar size="48" color="primary" class="mr-3">
                      <v-icon color="white">mdi-store</v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold">{{ subscription.dealer.cvr || 'N/A' }}</div>
                      <div class="text-caption text-medium-emphasis">{{ subscription.dealer.city || 'N/A' }}</div>
                    </div>
                  </div>
                  <v-btn
                    v-if="subscription.dealer"
                    variant="outlined"
                    prepend-icon="mdi-eye"
                    @click="viewDealer(subscription.dealer_id)"
                    size="small"
                    block
                  >
                    View Profile
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="elevated" elevation="1" class="subscription-section-card mb-4">
                <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
                  <v-icon start size="small">mdi-package-variant</v-icon>
                  Plan
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                  <div v-if="subscription.plan" class="mb-3">
                    <div class="text-subtitle-2 font-weight-bold mb-1">{{ subscription.plan.name }}</div>
                    <div class="text-caption text-medium-emphasis mb-2">{{ subscription.plan.slug }}</div>
                    <div class="text-body-2">{{ subscription.plan.description || 'No description' }}</div>
                  </div>
                  <v-btn
                    v-if="subscription.plan"
                    variant="outlined"
                    prepend-icon="mdi-eye"
                    @click="viewPlan(subscription.plan_id)"
                    size="small"
                    block
                  >
                    View Plan
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Plan Features -->
          <v-card v-if="subscription.plan?.features" variant="elevated" elevation="1" class="subscription-section-card">
            <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
              <v-icon start size="small">mdi-star</v-icon>
              Plan Features
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div v-if="subscription.plan.features.length === 0" class="text-center py-4 text-medium-emphasis">
                No features assigned to this plan
              </div>
              <v-row v-else dense>
                <v-col
                  v-for="feature in subscription.plan.features"
                  :key="feature.id"
                  cols="12"
                  sm="6"
                >
                  <v-card variant="elevated" elevation="1" class="subscription-feature-card">
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2" color="success" size="18">mdi-check</v-icon>
                        <div class="text-body-2 font-weight-medium">{{ feature.key }}</div>
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Value: <strong>{{ feature.pivot?.value || 'N/A' }}</strong>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Quick Info -->
          <v-card variant="elevated" elevation="1" class="subscription-section-card mb-4">
            <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
              Quick Info
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div class="info-item mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Subscription ID</div>
                <div class="text-body-2 font-weight-medium">#{{ subscription.id }}</div>
              </div>
              <v-divider class="my-3" />
              <div class="info-item mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Created At</div>
                <div class="text-body-2 font-weight-medium">{{ formatDateShort(subscription.created_at) }}</div>
              </div>
              <v-divider class="my-3" />
              <div class="info-item mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Start Date</div>
                <div class="text-body-2 font-weight-medium">{{ formatDateShort(subscription.starts_at) }}</div>
              </div>
              <v-divider class="my-3" />
              <div class="info-item mb-3">
                <div class="text-caption text-medium-emphasis mb-1">End Date</div>
                <div class="text-body-2 font-weight-medium">{{ subscription.ends_at ? formatDateShort(subscription.ends_at) : 'No end date' }}</div>
              </div>
              <v-divider class="my-3" />
              <div class="info-item">
                <div class="text-caption text-medium-emphasis mb-1">Duration</div>
                <div class="text-body-2 font-weight-medium">{{ getDuration() }}</div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card variant="elevated" elevation="1" class="subscription-section-card mb-4">
            <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
              Quick Actions
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-eye"
                @click="viewDealer(subscription.dealer_id)"
                size="small"
                block
                class="mb-2"
              >
                View Dealer
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-package-variant"
                @click="viewPlan(subscription.plan_id)"
                size="small"
                block
                class="mb-2"
              >
                View Plan
              </v-btn>
              <v-btn
                v-if="subscription.subscription_status_id === 3"
                color="success"
                variant="flat"
                prepend-icon="mdi-refresh"
                @click="renewSubscriptionAction"
                :loading="renewing"
                size="small"
                block
                class="mb-2"
              >
                Renew Subscription
              </v-btn>
              <v-btn
                v-if="subscription.subscription_status_id === 2"
                color="error"
                variant="flat"
                prepend-icon="mdi-cancel"
                @click="cancelSubscriptionAction"
                :loading="canceling"
                size="small"
                block
              >
                Cancel Subscription
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Status Info -->
          <v-card variant="elevated" elevation="1" class="subscription-section-card">
            <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
              Status Information
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar :color="getStatusColor(subscription.subscription_status_id)" size="32" class="mr-3">
                  <v-icon color="white" size="18">{{ getStatusIcon(subscription.subscription_status_id) }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">{{ getStatusLabel(subscription.subscription_status_id) }}</div>
                  <div class="text-caption text-medium-emphasis">{{ getStatusDescription(subscription.subscription_status_id) }}</div>
                </div>
              </div>
              <v-divider class="my-3" />
              <div class="text-caption text-medium-emphasis">
                <div class="mb-1"><strong>Next Action:</strong></div>
                <div>{{ getNextAction() }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  type UpdateSubscriptionData,
  type SubscriptionModel
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const subscription = ref<SubscriptionModel | null>(null)
const editData = ref<UpdateSubscriptionData>({})
const editMode = ref(false)
const updating = ref(false)
const renewing = ref(false)
const canceling = ref(false)
const editFormValid = ref(false)
const editFormRef = ref()

const statusOptions = [
  { label: 'Trial', value: 1 },
  { label: 'Active', value: 2 },
  { label: 'Expired', value: 3 },
  { label: 'Canceled', value: 4 },
  { label: 'Scheduled', value: 5 },
]

const getStatusColor = (statusId: number) => {
  const colors: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'error',
    4: 'warning',
    5: 'primary',
  }
  return colors[statusId] || 'grey'
}

const getStatusLabel = (statusId: number) => {
  const option = statusOptions.find(s => s.value === statusId)
  return option?.label || 'Unknown'
}

const getStatusIcon = (statusId: number) => {
  const icons: Record<number, string> = {
    1: 'mdi-clock-outline',
    2: 'mdi-check-circle',
    3: 'mdi-alert-circle',
    4: 'mdi-cancel',
    5: 'mdi-calendar-clock',
  }
  return icons[statusId] || 'mdi-help-circle'
}

const getStatusDescription = (statusId: number) => {
  const descriptions: Record<number, string> = {
    1: 'Subscription is in trial period',
    2: 'Subscription is active and running',
    3: 'Subscription has expired',
    4: 'Subscription has been canceled',
    5: 'Subscription is scheduled to start',
  }
  return descriptions[statusId] || 'Unknown status'
}

const getNextAction = () => {
  if (!subscription.value) return 'N/A'
  
  if (subscription.value.subscription_status_id === 3) {
    return 'Renew subscription to activate'
  }
  if (subscription.value.subscription_status_id === 2) {
    if (subscription.value.auto_renew) {
      return 'Will auto-renew on end date'
    }
    return 'Will expire on end date'
  }
  if (subscription.value.subscription_status_id === 1) {
    return 'Will activate on start date'
  }
  return 'No action required'
}

const getDaysRemaining = () => {
  if (!subscription.value?.ends_at) return 'N/A'
  const end = new Date(subscription.value.ends_at)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Today'
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateShort = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getDuration = () => {
  if (!subscription.value?.starts_at || !subscription.value?.ends_at) return 'N/A'
  const start = new Date(subscription.value.starts_at)
  const end = new Date(subscription.value.ends_at)
  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''}`
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`
}

const loadSubscription = async () => {
  const subscriptionId = route.params.id as string
  if (!subscriptionId) return

  try {
    loading.value = true
    error.value = null
    const loadedSubscription = await getSubscription(subscriptionId)
    subscription.value = loadedSubscription
    editData.value = {
      subscription_status_id: loadedSubscription.subscription_status_id,
      starts_at: loadedSubscription.starts_at ? new Date(loadedSubscription.starts_at).toISOString().slice(0, 16) : undefined,
      ends_at: loadedSubscription.ends_at ? new Date(loadedSubscription.ends_at).toISOString().slice(0, 16) : undefined,
      auto_renew: loadedSubscription.auto_renew,
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load subscription'
  } finally {
    loading.value = false
  }
}

const updateSubscriptionAction = async () => {
  if (!subscription.value || !editFormValid.value) return

  try {
    updating.value = true
    const updatedSubscription = await updateSubscription(subscription.value.id, editData.value)
    subscription.value = updatedSubscription
    editMode.value = false
    error.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update subscription'
  } finally {
    updating.value = false
  }
}

const cancelSubscriptionAction = async () => {
  if (!subscription.value) return
  if (!confirm('Are you sure you want to cancel this subscription?')) return

  try {
    canceling.value = true
    const updatedSubscription = await cancelSubscription(subscription.value.id)
    subscription.value = updatedSubscription
    error.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to cancel subscription'
  } finally {
    canceling.value = false
  }
}

const renewSubscriptionAction = async () => {
  if (!subscription.value) return

  try {
    renewing.value = true
    const updatedSubscription = await renewSubscription(subscription.value.id)
    subscription.value = updatedSubscription
    error.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to renew subscription'
  } finally {
    renewing.value = false
  }
}

const viewDealer = (dealerId: number) => {
  router.push({ name: 'admin.dealers.detail', params: { id: dealerId } })
}

const viewPlan = (planId: number) => {
  router.push({ name: 'admin.plans.detail', params: { id: planId } })
}

onMounted(() => {
  loadSubscription()
})
</script>

<style scoped>
.subscription-detail {
  padding: 0;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

.subscription-section-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subscription-section-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

.subscription-feature-card {
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.subscription-feature-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  transform: translateY(-2px);
}

.info-item {
  min-height: 40px;
}
</style>
