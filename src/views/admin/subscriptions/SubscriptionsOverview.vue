<template>
  <div class="subscriptions-overview">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">
          {{ totalSubscriptionsCount }} Subscriptions
        </h1>
        <p class="text-body-2 text-medium-emphasis">Manage all dealer subscriptions</p>
      </div>
      <v-btn
        v-if="hasPermission('admin.subscriptions.create')"
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        size="default"
      >
        Add Subscription
      </v-btn>
    </div>

    <!-- Summary Cards -->
    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-card
          variant="outlined"
          class="summary-card"
          :class="{ 'summary-card-active': selectedStatusTab === null }"
          @click="selectStatusTab(null)"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis mb-1">All</div>
            <div class="text-h5 font-weight-bold">{{ totalSubscriptionsCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-card
          variant="outlined"
          class="summary-card"
          :class="{ 'summary-card-active': selectedStatusTab === 2 }"
          @click="selectStatusTab(2)"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Active</div>
            <div class="text-h5 font-weight-bold">{{ statusCounts.active || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-card
          variant="outlined"
          class="summary-card"
          :class="{ 'summary-card-active': selectedStatusTab === 3 }"
          @click="selectStatusTab(3)"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Expired</div>
            <div class="text-h5 font-weight-bold">{{ statusCounts.expired || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-card
          variant="outlined"
          class="summary-card"
          :class="{ 'summary-card-active': selectedStatusTab === 4 }"
          @click="selectStatusTab(4)"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Canceled</div>
            <div class="text-h5 font-weight-bold">{{ statusCounts.canceled || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-card
          variant="outlined"
          class="summary-card"
          :class="{ 'summary-card-active': selectedStatusTab === 1 }"
          @click="selectStatusTab(1)"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Trial</div>
            <div class="text-h5 font-weight-bold">{{ statusCounts.trial || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-card
          variant="outlined"
          class="summary-card"
          :class="{ 'summary-card-active': selectedStatusTab === 5 }"
          @click="selectStatusTab(5)"
        >
          <v-card-text class="pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Scheduled</div>
            <div class="text-h5 font-weight-bold">{{ statusCounts.scheduled || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Plan Filter Tabs -->
    <v-card variant="flat" elevation="0">
      <v-card-text class="py-1 px-0 hover:border-none">
        <v-tabs
          v-model="selectedPlanTab"
          color="primary"
          density="compact"
          variant="flat"
          class="border-none"
          @update:model-value="handlePlanTabChange"
        >
          <v-tab value="all" class="plan-tab">
            All Plans
          </v-tab>
          <v-tab
            v-for="plan in plansList"
            :key="plan.id"
            :value="plan.id.toString()"
            class="plan-tab"
          >
            {{ plan.name }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <!-- Filters and Search Bar -->
    <v-card v-if="false" variant="flat">
      <v-card-text class="pa-4">
        <div class="d-flex flex-wrap gap-3 align-center">
          <!-- Filter Dropdowns -->
          <div class="filter-dropdown">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="outlined"
                  v-bind="props"
                  size="small"
                  class="filter-btn"
                  :class="{ 'filter-active': filters.dealer_id }"
                >
                  {{ filters.dealer_id ? getDealerName(filters.dealer_id!) : 'All dealers' }}
                  <v-icon end size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="filter-menu">
                <v-list-item @click="filters.dealer_id = null; loadSubscriptions()">
                  <v-list-item-title>All dealers</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="dealer in dealersForCreate"
                  :key="dealer.id"
                  @click="filters.dealer_id = dealer.id; loadSubscriptions()"
                >
                  <v-list-item-title>{{ dealer.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <div class="filter-dropdown">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="outlined"
                  v-bind="props"
                  size="small"
                  class="filter-btn"
                  :class="{ 'filter-active': filters.subscription_status_id }"
                >
                  {{ filters.subscription_status_id ? getStatusLabel(filters.subscription_status_id!) : 'All statuses' }}
                  <v-icon end size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="filter-menu">
                <v-list-item @click="filters.subscription_status_id = null; loadSubscriptions()">
                  <v-list-item-title>All statuses</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="status in statusOptions"
                  :key="status.value"
                  @click="filters.subscription_status_id = status.value; loadSubscriptions()"
                >
                  <v-list-item-title>{{ status.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <v-btn
            variant="outlined"
            size="small"
            prepend-icon="mdi-filter-variant"
            class="filter-btn"
            @click="showMoreFilters = !showMoreFilters"
          >
            More Filters
          </v-btn>

          <v-spacer />

          <!-- Search and Export -->
          <v-text-field
            v-model="searchQuery"
            placeholder="Search for a subscription"
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="search-field"
            style="max-width: 300px;"
            @update:model-value="handleSearch"
          />
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-download"
          >
            Export to CSV
          </v-btn>
        </div>

        <!-- More Filters Panel -->
        <v-expand-transition>
          <div v-if="showMoreFilters" class="mt-4 pt-4 border-t">
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="dateFilter.start"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="dateFilter.end"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="billingFilter"
                  :items="billingCycleOptions"
                  item-title="label"
                  item-value="value"
                  label="Billing Cycle"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Subscriptions Table -->
    <v-card variant="outlined" class="border-none">
      <v-card-text class="pa-0">
        <div v-if="loading && subscriptions.docs.length === 0" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>
        <v-data-table
          v-else
          :headers="headers"
          :items="subscriptions.docs"
          :items-per-page="15"
          :page="currentPage"
          :loading="loading"
          @click:row="viewSubscription"
          class="subscriptions-table"
          item-value="id"
          density="compact"
        >
          <template #item.dealer="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <v-icon color="white" size="18">mdi-store</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">{{ item.dealer?.cvr || `Dealer #${item.dealer_id}` }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.dealer?.city || 'N/A' }}</div>
              </div>
            </div>
          </template>
          <template #item.plan="{ item }">
            <div class="d-flex align-center">
              <v-icon size="18" color="primary" class="mr-2">mdi-file-document-outline</v-icon>
              <div>
                <div class="text-body-2 font-weight-medium subscription-link">{{ item.plan?.name || `Plan #${item.plan_id}` }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.plan?.slug || '' }}</div>
              </div>
            </div>
          </template>
          <template #item.subscription_status_id="{ item }">
            <v-chip
              :color="getStatusColor(item.subscription_status_id)"
              size="small"
              variant="tonal"
              :prepend-icon="getStatusIcon(item.subscription_status_id)"
            >
              {{ getStatusLabel(item.subscription_status_id) }}
            </v-chip>
          </template>
          <template #item.starts_at="{ item }">
            <div>
              <div class="text-body-2">{{ formatDate(item.starts_at) }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatRelativeTime(item.starts_at) }}</div>
            </div>
          </template>
          <template #item.ends_at="{ item }">
            <div v-if="item.ends_at">
              <div class="text-body-2">{{ formatDate(item.ends_at) }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatRelativeTime(item.ends_at) }}</div>
            </div>
            <span v-else class="text-body-2 text-medium-emphasis">—</span>
          </template>
          <template #item.auto_renew="{ item }">
            <v-chip
              :color="item.auto_renew ? 'success' : 'grey'"
              size="x-small"
              variant="tonal"
            >
              {{ item.auto_renew ? 'Yes' : 'No' }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon
                variant="text"
                size="small"
                @click.stop="viewSubscription(null, { item })"
                color="primary"
              >
                <v-icon size="small">mdi-eye</v-icon>
                <v-tooltip activator="parent">View Details</v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                @click.stop="editSubscription(item)"
                color="info"
              >
                <v-icon size="small">mdi-pencil</v-icon>
                <v-tooltip activator="parent">Edit</v-tooltip>
              </v-btn>
              <v-menu>
                <template #activator="{ props }">
            <v-btn
              icon
              variant="text"
              size="small"
                    v-bind="props"
                    color="secondary"
                    @click.stop
            >
                    <v-icon size="small">mdi-dots-vertical</v-icon>
                    <v-tooltip activator="parent">More Actions</v-tooltip>
            </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-if="item.subscription_status_id === 3"
                    @click="renewSubscriptionAction(item.id)"
                    prepend-icon="mdi-refresh"
                  >
                    Renew
                  </v-list-item>
                  <v-list-item
                    v-if="item.subscription_status_id === 2"
                    @click="cancelSubscriptionAction(item.id)"
                    prepend-icon="mdi-cancel"
                  >
                    Cancel
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>
        <div v-if="subscriptions.totalPages && subscriptions.totalPages > 1" class="pa-4">
          <v-pagination
            v-model="currentPage"
            :length="subscriptions.totalPages"
            @update:model-value="loadSubscriptions"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Create Subscription Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="700" scrollable persistent>
      <v-card>
        <v-card-title>Create New Subscription</v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="createFormRef" v-model="createFormValid">
            <v-autocomplete
              v-model="newSubscription.dealer_id"
              :items="dealersForCreate"
              item-title="name"
              item-value="id"
              label="Dealer *"
              variant="outlined"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
              :loading="loadingDealersForCreate"
              density="compact"
              clearable
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="undefined">
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.raw.email" class="text-medium-emphasis">
                    {{ item.raw.email }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <span>{{ item.raw.name }}</span>
                <span v-if="item.raw.email" class="text-medium-emphasis text-caption ml-1">({{ item.raw.email }})</span>
              </template>
            </v-autocomplete>
            <v-autocomplete
              v-model="newSubscription.plan_id"
              :items="plansList"
              item-title="name"
              item-value="id"
              label="Plan *"
              variant="outlined"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
              :loading="loadingPlans"
              density="compact"
            />
            <v-select
              v-model="newSubscription.subscription_status_id"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Status *"
            variant="outlined"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
              density="compact"
          />
            <v-row>
              <v-col cols="12" md="6">
          <v-text-field
                  v-model="newSubscription.starts_at"
                  label="Start Date *"
                  type="datetime-local"
            variant="outlined"
                  :rules="[v => !!v || 'Required']"
                  class="mb-4"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newSubscription.billing_cycle"
                  :items="billingCycleOptions"
                  item-title="label"
                  item-value="value"
                  label="Billing Cycle"
            variant="outlined"
                  class="mb-4"
                  density="compact"
          />
              </v-col>
            </v-row>
          <v-text-field
              v-model="newSubscription.ends_at"
              label="End Date (Optional)"
              type="datetime-local"
            variant="outlined"
              class="mb-4"
              density="compact"
            />
            <v-switch
              v-model="newSubscription.auto_renew"
              label="Auto Renew"
              color="primary"
              density="compact"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeCreateDialog" size="small">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createSubscription"
            :loading="creating"
            :disabled="!createFormValid"
            prepend-icon="mdi-check"
            size="small"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Override existing subscription confirmation -->
    <v-dialog v-model="showOverrideConfirmDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Replace existing subscription?
        </v-card-title>
        <v-card-text>
          This dealer already has an existing subscription. Creating this new subscription will replace it and the previous subscription will be removed. Do you want to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showOverrideConfirmDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmOverrideAndCreate" :loading="creating">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Subscription Dialog -->
    <v-dialog v-model="showEditDialog" max-width="700" scrollable persistent>
      <v-card>
        <v-card-title>Edit Subscription</v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="editFormRef" v-model="editFormValid">
          <v-select
              v-model="editData.subscription_status_id"
            :items="statusOptions"
            item-title="label"
            item-value="value"
              label="Status *"
              variant="outlined"
              :rules="[v => !!v || 'Required']"
              class="mb-4"
              density="compact"
            />
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.starts_at"
                  label="Start Date *"
                  type="datetime-local"
                  variant="outlined"
                  :rules="[v => !!v || 'Required']"
                  class="mb-4"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.ends_at"
                  label="End Date"
                  type="datetime-local"
            variant="outlined"
                  class="mb-4"
                  density="compact"
                />
              </v-col>
            </v-row>
            <v-switch
              v-model="editData.auto_renew"
              label="Auto Renew"
              color="primary"
              density="compact"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false" size="small">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="updateSubscriptionAction"
            :loading="updating"
            :disabled="!editFormValid"
            prepend-icon="mdi-check"
            size="small"
          >
            Update
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
  getSubscriptions,
  createSubscription as createSubscriptionApi,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  getDealersMinimal,
  getDealerSubscriptions,
  getPlans,
  type CreateSubscriptionData,
  type UpdateSubscriptionData,
  type SubscriptionModel
} from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const loadingDealersForCreate = ref(false)
const loadingPlans = ref(false)
const loadingStats = ref(false)
const error = ref<string | null>(null)
const subscriptions = ref<PaginationModel<SubscriptionModel>>({
  docs: [],
  limit: 15,
  page: 1,
  totalDocs: 0,
  total: 0,
  totalPages: 0,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null
})
const allSubscriptionsForStats = ref<SubscriptionModel[]>([])
const currentPage = ref(1)
const dealersForCreate = ref<Array<{ id: number; name: string; email?: string }>>([])
const plans = ref<any[]>([])
const plansList = computed(() => Array.isArray(plans.value) ? plans.value : [])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const updating = ref(false)
const createFormValid = ref(false)
const editFormValid = ref(false)
const createFormRef = ref()
const editFormRef = ref()
const selectedSubscription = ref<SubscriptionModel | null>(null)
const editData = ref<UpdateSubscriptionData>({})
const filters = ref({
  dealer_id: null as number | null,
  plan_id: null as number | null,
  subscription_status_id: null as number | null
})
const statusOptions = [
  { label: 'Trial', value: 1 },
  { label: 'Active', value: 2 },
  { label: 'Expired', value: 3 },
  { label: 'Canceled', value: 4 },
  { label: 'Scheduled', value: 5 }
]
const billingCycleOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
]
const newSubscription = ref<Omit<CreateSubscriptionData, 'dealer_id'> & { dealer_id: number | null }>({
  dealer_id: null,
  plan_id: 0,
  subscription_status_id: 2,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: undefined,
  auto_renew: false,
  billing_cycle: 'monthly'
})
const showOverrideConfirmDialog = ref(false)

const searchQuery = ref('')
const showMoreFilters = ref(false)
const dateFilter = ref({ start: '', end: '' })
const billingFilter = ref<string | null>(null)
const selectedPlanTab = ref<string>('all')
const selectedStatusTab = ref<number | null>(null)

const headers = [
  { title: 'ID', key: 'id', width: '80px', sortable: true },
  { title: 'DEALER', key: 'dealer', sortable: false },
  { title: 'PLAN', key: 'plan', sortable: false },
  { title: 'STATUS', key: 'subscription_status_id', width: '120px', sortable: true },
  { title: 'START DATE', key: 'starts_at', width: '180px', sortable: true },
  { title: 'END DATE', key: 'ends_at', width: '180px', sortable: true },
  { title: 'AUTO RENEW', key: 'auto_renew', width: '100px', align: 'center' as const, sortable: true },
  { title: '', key: 'actions', sortable: false, width: '140px', align: 'center' as const }
]

const totalSubscriptionsCount = computed(() => {
  return allSubscriptionsForStats.value.length
})

const statusCounts = computed(() => {
  const counts = {
    active: 0,
    expired: 0,
    canceled: 0,
    trial: 0,
    scheduled: 0
  }
  // Calculate counts from unfiltered data
  allSubscriptionsForStats.value.forEach((sub: SubscriptionModel) => {
    if (sub.subscription_status_id === 2) counts.active++
    else if (sub.subscription_status_id === 3) counts.expired++
    else if (sub.subscription_status_id === 4) counts.canceled++
    else if (sub.subscription_status_id === 1) counts.trial++
    else if (sub.subscription_status_id === 5) counts.scheduled++
  })
  return counts
})

const getStatusColor = (statusId: number) => {
  const colors: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'error',
    4: 'warning',
    5: 'primary'
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
    5: 'mdi-calendar-clock'
  }
  return icons[statusId] || 'mdi-help-circle'
}

const getDealerName = (dealerId: number) => {
  const dealer = dealersForCreate.value.find(d => d.id === dealerId)
  return dealer?.name ?? `Dealer #${dealerId}`
}

const getPlanName = (planId: number) => {
  const plan = plans.value.find(p => p.id === planId)
  return plan?.name || `Plan #${planId}`
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

const handleSearch = () => {
  // Implement search logic if needed
  loadSubscriptions()
}

const handlePlanTabChange = (value: string) => {
  if (value === 'all') {
    filters.value.plan_id = null
  } else {
    filters.value.plan_id = parseInt(value)
  }
  loadSubscriptions()
}

const selectStatusTab = (statusId: number | null) => {
  selectedStatusTab.value = statusId
  filters.value.subscription_status_id = statusId
  loadSubscriptions()
}

const loadSubscriptions = async () => {
  try {
    loading.value = true
    error.value = null
    const params: any = { page: currentPage.value, limit: 15 }
    if (filters.value.dealer_id) params.dealer_id = filters.value.dealer_id
    if (filters.value.plan_id) params.plan_id = filters.value.plan_id
    if (filters.value.subscription_status_id) params.subscription_status_id = filters.value.subscription_status_id
    const response = await getSubscriptions(params)
    subscriptions.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    loadingStats.value = true
    // Load all subscriptions without filters to calculate accurate stats
    const response = await getSubscriptions({ limit: 1000, page: 1 })
    allSubscriptionsForStats.value = response.docs || []
  } catch (err) {
    console.error('Failed to load stats:', err)
    allSubscriptionsForStats.value = []
  } finally {
    loadingStats.value = false
  }
}

const loadDealersForCreate = async () => {
  try {
    loadingDealersForCreate.value = true
    const list = await getDealersMinimal()
    dealersForCreate.value = list
  } catch (err) {
    console.error('Failed to load dealers:', err)
    dealersForCreate.value = []
  } finally {
    loadingDealersForCreate.value = false
  }
}

const loadPlans = async () => {
  try {
    loadingPlans.value = true
    const result = await getPlans()
    plans.value = Array.isArray(result) ? result : []
    // Sync selected tab with current filter
    if (filters.value.plan_id) {
      selectedPlanTab.value = filters.value.plan_id.toString()
    } else {
      selectedPlanTab.value = 'all'
    }
    // Sync selected status tab with current filter
    selectedStatusTab.value = filters.value.subscription_status_id
  } catch (err) {
    console.error('Failed to load plans:', err)
    plans.value = []
  } finally {
    loadingPlans.value = false
  }
}

const openCreateDialog = async () => {
  newSubscription.value = {
    dealer_id: null,
    plan_id: 0,
    subscription_status_id: 2,
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: undefined,
    auto_renew: false,
    billing_cycle: 'monthly'
  }
  showCreateDialog.value = true
  await loadDealersForCreate()
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  createFormRef.value?.reset()
}

const doCreateSubscription = async () => {
  const payload: CreateSubscriptionData = {
    ...newSubscription.value,
    dealer_id: newSubscription.value.dealer_id!
  }
  try {
    creating.value = true
    await createSubscriptionApi(payload)
    showCreateDialog.value = false
    showOverrideConfirmDialog.value = false
    await Promise.all([loadSubscriptions(), loadStats()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create subscription'
  } finally {
    creating.value = false
  }
}

const createSubscription = async () => {
  if (!createFormValid.value || newSubscription.value.dealer_id == null) return
  const dealerId = newSubscription.value.dealer_id
  try {
    const existing = await getDealerSubscriptions(dealerId)
    if (existing.length > 0) {
      showOverrideConfirmDialog.value = true
      return
    }
  } catch {
    // proceed with create if check fails
  }
  await doCreateSubscription()
}

const confirmOverrideAndCreate = () => {
  doCreateSubscription()
}

const viewSubscription = (event: any, row: { item: SubscriptionModel }) => {
  router.push({ name: 'admin.subscriptions.detail', params: { id: row.item.id } })
}

const editSubscription = (subscription: SubscriptionModel) => {
  selectedSubscription.value = subscription
  editData.value = {
    subscription_status_id: subscription.subscription_status_id,
    starts_at: subscription.starts_at ? new Date(subscription.starts_at).toISOString().slice(0, 16) : undefined,
    ends_at: subscription.ends_at ? new Date(subscription.ends_at).toISOString().slice(0, 16) : undefined,
    auto_renew: subscription.auto_renew
  }
  showEditDialog.value = true
}

const updateSubscriptionAction = async () => {
  if (!selectedSubscription.value || !editFormValid.value) return
  try {
    updating.value = true
    await updateSubscription(selectedSubscription.value.id, editData.value)
    showEditDialog.value = false
    selectedSubscription.value = null
    await Promise.all([loadSubscriptions(), loadStats()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update subscription'
  } finally {
    updating.value = false
  }
}

const cancelSubscriptionAction = async (id: number | string) => {
  if (!confirm('Are you sure you want to cancel this subscription?')) return
  try {
    await cancelSubscription(id)
    await Promise.all([loadSubscriptions(), loadStats()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to cancel subscription'
  }
}

const renewSubscriptionAction = async (id: number | string) => {
  try {
    await renewSubscription(id)
    await Promise.all([loadSubscriptions(), loadStats()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to renew subscription'
  }
}

onMounted(async () => {
  await Promise.all([loadSubscriptions(), loadDealersForCreate(), loadPlans(), loadStats()])
})
</script>

<style scoped>
.subscriptions-overview {
  padding: 0;
}

.summary-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

.summary-card-active {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2), 0 4px 16px rgba(var(--v-theme-primary), 0.15) !important;
  background: rgba(var(--v-theme-primary), 0.02);
}

.summary-card-active .text-h5 {
  color: rgb(var(--v-theme-primary));
}

/* Filter Dropdown Styles */
.filter-dropdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.filter-btn {
  min-width: 140px;
  text-transform: none;
  font-weight: 400;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  background: white;
  color: rgba(var(--v-theme-on-surface), 0.87);
  justify-content: space-between;
}

.filter-btn:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: rgba(var(--v-theme-primary), 0.02);
}

.filter-active {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background: rgba(var(--v-theme-primary), 0.05) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.filter-menu {
  max-height: 300px;
  overflow-y: auto;
}

.search-field {
  min-width: 250px;
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Table Styles - Override global styles */
.subscriptions-table.v-data-table :deep(.v-data-table__thead),
.subscriptions-table.v-data-table :deep(.v-data-table__thead tr),
.subscriptions-table.v-data-table :deep(.v-data-table__thead th),
.subscriptions-table.v-data-table :deep(.v-data-table__thead th *),
.subscriptions-table.v-data-table :deep(.v-data-table__wrapper > table > thead),
.subscriptions-table.v-data-table :deep(.v-data-table__wrapper > table > thead > tr),
.subscriptions-table.v-data-table :deep(.v-data-table__wrapper > table > thead > tr > th),
.subscriptions-table :deep(.v-data-table__thead),
.subscriptions-table :deep(.v-data-table__thead tr),
.subscriptions-table :deep(.v-data-table__thead th),
.subscriptions-table :deep(.v-data-table__thead th *),
.subscriptions-table :deep(.v-data-table__wrapper > table > thead),
.subscriptions-table :deep(.v-data-table__wrapper > table > thead > tr),
.subscriptions-table :deep(.v-data-table__wrapper > table > thead > tr > th) {
  background-color: #f5f5f5 !important;
  background: #f5f5f5 !important;
}

.subscriptions-table :deep(.v-data-table__thead th) {
  font-size: 9px !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  padding: 10px 12px !important;
  height: auto !important;
  white-space: nowrap !important;
}

.subscriptions-table :deep(.v-data-table__thead th .v-data-table-header__content) {
  font-size: 9px !important;
  white-space: nowrap !important;
}

.subscriptions-table :deep(.v-data-table__column-checkbox),
.subscriptions-table :deep(.v-data-table__column-checkbox *),
.subscriptions-table :deep(thead th:first-child),
.subscriptions-table :deep(tbody td:first-child) {
  display: none !important;
  width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  overflow: hidden !important;
}

.subscriptions-table :deep(.v-data-table__tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.subscriptions-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.02) !important;
}

.subscriptions-table :deep(.v-data-table__tbody tr:nth-child(even)) {
  background-color: rgba(var(--v-theme-on-surface), 0.01);
}

.subscriptions-table :deep(.v-data-table__tbody td) {
  padding: 12px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.subscription-link {
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  text-decoration: none;
}

.subscription-link:hover {
  text-decoration: underline;
}

/* Plan Tabs Styles */
.plan-tab {
  text-transform: none;
  font-weight: 500;
  min-width: 120px;
}

:deep(.v-tabs) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-tab--selected) {
  color: rgb(var(--v-theme-primary));
}

/* Button Styles */
:deep(.v-btn--variant-outlined) {
  border-radius: 6px;
}

:deep(.v-btn--variant-flat) {
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
