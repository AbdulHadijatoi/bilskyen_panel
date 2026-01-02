<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Subscriptions</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage all dealer subscriptions.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Subscription
      </v-btn>
    </div>

    <v-card variant="outlined">
      <v-card-text>
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="error" class="text-center py-8">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="subscriptions.docs"
          :items-per-page="subscriptions.limit"
          :page="subscriptions.page"
          @update:page="() => loadSubscriptions()"
        >
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              {{ item.status || 'N/A' }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="editSubscription(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="subscriptions.totalPages && subscriptions.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="subscriptions.totalPages"
            @update:model-value="loadSubscriptions"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Create Subscription Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create Subscription</v-card-title>
        <v-card-text>
          <v-text-field
            v-model.number="newSubscription.dealer_id"
            label="Dealer ID"
            type="number"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model.number="newSubscription.plan_id"
            label="Plan ID"
            type="number"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newSubscription.start_date"
            label="Start Date"
            type="date"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newSubscription.end_date"
            label="End Date (optional)"
            type="date"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createSubscription"
            :loading="creating"
            :disabled="!newSubscription.dealer_id || !newSubscription.plan_id"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Subscription Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600">
      <v-card>
        <v-card-title>Update Subscription Status</v-card-title>
        <v-card-text>
          <v-select
            v-model="editStatus"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="updateSubscription"
            :loading="updating"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSubscriptions, createSubscription as createSubscriptionApi, updateSubscriptionStatus, type CreateSubscriptionData, type SubscriptionModel, type UpdateSubscriptionStatusData } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const error = ref<string | null>(null)
const subscriptions = ref<PaginationModel<SubscriptionModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const updating = ref(false)
const selectedSubscription = ref<SubscriptionModel | null>(null)
const editStatus = ref<string>('')
const newSubscription = ref<CreateSubscriptionData>({
  dealer_id: 0,
  plan_id: 0,
  start_date: '',
  end_date: '',
})

const statusOptions = [
  { label: 'Trial', value: 'trial' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Scheduled', value: 'scheduled' },
]

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Dealer ID', key: 'dealer_id' },
  { title: 'Plan ID', key: 'plan_id' },
  { title: 'Status', key: 'status' },
  { title: 'Start Date', key: 'starts_at' },
  { title: 'End Date', key: 'ends_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadSubscriptions = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getSubscriptions({ page: currentPage.value, limit: 15 })
    subscriptions.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

const createSubscription = async () => {
  try {
    creating.value = true
    await createSubscriptionApi(newSubscription.value)
    showCreateDialog.value = false
    newSubscription.value = { dealer_id: 0, plan_id: 0, start_date: '', end_date: '' }
    await loadSubscriptions()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create subscription'
  } finally {
    creating.value = false
  }
}

const editSubscription = (subscription: SubscriptionModel) => {
  selectedSubscription.value = subscription
  editStatus.value = subscription.status || 'active'
  showEditDialog.value = true
}

const updateSubscription = async () => {
  if (!selectedSubscription.value) return

  try {
    updating.value = true
    await updateSubscriptionStatus(selectedSubscription.value.id, { status: editStatus.value as any })
    showEditDialog.value = false
    selectedSubscription.value = null
    editStatus.value = ''
    await loadSubscriptions()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update subscription'
  } finally {
    updating.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    trial: 'info',
    active: 'success',
    expired: 'error',
    canceled: 'warning',
    scheduled: 'primary',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
}

onMounted(() => {
  loadSubscriptions()
})
</script>

