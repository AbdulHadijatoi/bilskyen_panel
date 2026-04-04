<template>
  <div class="subscription-change-requests">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">{{ t('admin.views.subscriptionChangeRequests.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">{{ t('admin.views.subscriptionChangeRequests.subtitle') }}</p>
      </div>
      <v-select
        v-model="statusFilter"
        :items="statusItems"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        style="min-width: 200px"
        @update:model-value="onStatusChange"
      />
    </div>

    <v-alert v-if="pageError" type="error" variant="tonal" class="mb-4" closable @click:close="pageError = null">
      {{ pageError }}
    </v-alert>

    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable @click:close="successMessage = null">
      {{ successMessage }}
    </v-alert>

    <v-card variant="outlined" class="border-none">
      <v-card-text class="pa-0">
        <div v-if="loading && rows.docs.length === 0" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>
        <v-data-table
          v-else
          :headers="headers"
          :items="rows.docs"
          :items-per-page="limit"
          :page="currentPage"
          :loading="loading"
          item-value="id"
          density="compact"
        >
          <template #item.dealer="{ item }">
            <div>
              <div class="text-body-2 font-weight-medium">
                {{ item.dealer?.owner?.name || item.dealer?.cvr || `Dealer #${item.dealer_id}` }}
              </div>
              <div class="text-caption text-medium-emphasis">{{ item.dealer?.owner?.email || '—' }}</div>
            </div>
          </template>
          <template #item.current_plan="{ item }">
            <span class="text-body-2">{{ item.current_subscription?.plan_name || t('admin.views.subscriptionChangeRequests.none') }}</span>
          </template>
          <template #item.requested_plan="{ item }">
            <span class="text-body-2 font-weight-medium">{{ item.requested_plan?.name || `Plan #${item.requested_plan_id}` }}</span>
          </template>
          <template #item.billing_cycle="{ item }">
            {{ item.billing_cycle === 'yearly' ? t('admin.views.plans.yearly') : t('admin.views.plans.monthly') }}
          </template>
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template #item.actions="{ item }">
            <div v-if="item.status === 'pending'" class="d-flex gap-1">
              <v-btn
                v-if="hasPermission('admin.subscription_change_requests.review')"
                color="success"
                variant="tonal"
                size="small"
                :loading="actionId === item.id && actionKind === 'approve'"
                @click="approve(item)"
              >
                {{ t('admin.views.subscriptionChangeRequests.approve') }}
              </v-btn>
              <v-btn
                v-if="hasPermission('admin.subscription_change_requests.review')"
                color="error"
                variant="tonal"
                size="small"
                :loading="actionId === item.id && actionKind === 'reject'"
                @click="openReject(item)"
              >
                {{ t('admin.views.subscriptionChangeRequests.reject') }}
              </v-btn>
            </div>
            <v-chip v-else size="small" variant="tonal">{{ statusLabel(item.status) }}</v-chip>
          </template>
        </v-data-table>
        <div v-if="rows.totalPages && rows.totalPages > 1" class="pa-4">
          <v-pagination v-model="currentPage" :length="rows.totalPages" @update:model-value="loadData" />
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="rejectDialog" max-width="480">
      <v-card>
        <v-card-title>{{ t('admin.views.subscriptionChangeRequests.rejectTitle') }}</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="rejectReason"
            :label="t('admin.views.subscriptionChangeRequests.rejectReasonOptional')"
            variant="outlined"
            rows="3"
            hide-details
            class="mt-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="rejectSubmitting" @click="confirmReject">
            {{ t('admin.views.subscriptionChangeRequests.reject') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getSubscriptionChangeRequests,
  approveSubscriptionChangeRequest,
  rejectSubscriptionChangeRequest,
  type SubscriptionChangeRequestModel,
} from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import { hasPermission } from '@/utils/permissions'
import type { ApiErrorModel } from '@/models/api-error.model'

const { t } = useI18n()

const loading = ref(false)
const pageError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const statusFilter = ref<string>('pending')
const currentPage = ref(1)
const limit = 15
const actionId = ref<number | null>(null)
const actionKind = ref<'approve' | 'reject' | null>(null)

const rejectDialog = ref(false)
const rejectReason = ref('')
const rejectSubmitting = ref(false)
const rejectTarget = ref<SubscriptionChangeRequestModel | null>(null)

const rows = ref<PaginationModel<SubscriptionChangeRequestModel>>({
  docs: [],
  limit,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
  totalDocs: 0,
  totalPages: 0,
})

const statusItems = computed(() => [
  { value: 'pending', label: t('admin.views.subscriptionChangeRequests.filterPending') },
  { value: 'all', label: t('admin.views.subscriptionChangeRequests.filterAll') },
  { value: 'approved', label: t('admin.views.subscriptionChangeRequests.filterApproved') },
  { value: 'rejected', label: t('admin.views.subscriptionChangeRequests.filterRejected') },
  { value: 'cancelled', label: t('admin.views.subscriptionChangeRequests.filterCancelled') },
])

const headers = computed(() => [
  { title: t('admin.views.subscriptions.dealer'), key: 'dealer', sortable: false },
  { title: t('admin.views.subscriptionChangeRequests.currentPlan'), key: 'current_plan', sortable: false },
  { title: t('admin.views.subscriptionChangeRequests.requestedPlan'), key: 'requested_plan', sortable: false },
  { title: t('admin.views.subscriptions.billingCycle'), key: 'billing_cycle', sortable: false },
  { title: t('admin.views.subscriptionChangeRequests.requestedAt'), key: 'created_at', sortable: false },
  { title: t('common.actions'), key: 'actions', sortable: false, width: 220 },
])

function formatDate(v?: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleString()
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    approved: t('admin.views.subscriptionChangeRequests.filterApproved'),
    rejected: t('admin.views.subscriptionChangeRequests.filterRejected'),
    cancelled: t('admin.views.subscriptionChangeRequests.filterCancelled'),
    pending: t('admin.views.subscriptionChangeRequests.filterPending'),
  }
  return map[status] || status
}

async function loadData() {
  if (!hasPermission('admin.subscription_change_requests.view')) {
    pageError.value = t('admin.views.subscriptionChangeRequests.noPermission')
    return
  }
  loading.value = true
  pageError.value = null
  try {
    const data = await getSubscriptionChangeRequests({
      page: currentPage.value,
      limit,
      status: statusFilter.value,
    })
    rows.value = data
  } catch (e) {
    pageError.value = (e as ApiErrorModel).message || t('admin.views.subscriptionChangeRequests.loadFailed')
  } finally {
    loading.value = false
  }
}

function onStatusChange() {
  currentPage.value = 1
  loadData()
}

async function approve(item: SubscriptionChangeRequestModel) {
  actionId.value = item.id
  actionKind.value = 'approve'
  pageError.value = null
  try {
    await approveSubscriptionChangeRequest(item.id)
    successMessage.value = t('admin.views.subscriptionChangeRequests.approvedOk')
    await loadData()
  } catch (e) {
    pageError.value = (e as ApiErrorModel).message || t('admin.views.subscriptionChangeRequests.approveFailed')
  } finally {
    actionId.value = null
    actionKind.value = null
  }
}

function openReject(item: SubscriptionChangeRequestModel) {
  rejectTarget.value = item
  rejectReason.value = ''
  rejectDialog.value = true
}

async function confirmReject() {
  if (!rejectTarget.value) return
  rejectSubmitting.value = true
  pageError.value = null
  try {
    await rejectSubscriptionChangeRequest(rejectTarget.value.id, {
      rejection_reason: rejectReason.value || undefined,
    })
    successMessage.value = t('admin.views.subscriptionChangeRequests.rejectedOk')
    rejectDialog.value = false
    rejectTarget.value = null
    await loadData()
  } catch (e) {
    pageError.value = (e as ApiErrorModel).message || t('admin.views.subscriptionChangeRequests.rejectFailed')
  } finally {
    rejectSubmitting.value = false
    actionId.value = null
    actionKind.value = null
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.subscription-change-requests {
  padding: 0;
}
</style>
