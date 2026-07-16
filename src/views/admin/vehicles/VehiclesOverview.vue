<template>
  <div class="panel-page overview-page vehicles-overview-container">
    <PageHeader
      :title="t('admin.views.vehicles.title')"
      :subtitle="t('admin.views.vehicles.subtitle')"
    />

    <v-row class="mb-5">
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.vehicles.totalVehicles')" :value="vehicles.totalDocs || 0" icon="mdi-car-multiple" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.vehicles.published')" :value="publishedCount" icon="mdi-check-circle" color="success" value-tone="success" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.vehicles.draft')" :value="draftCount" icon="mdi-file-document-edit" color="warning" value-tone="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.vehicles.sold')" :value="soldCount" icon="mdi-check-all" color="info" value-tone="info" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('admin.views.vehicles.archived')" :value="archivedCount" icon="mdi-archive" color="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div style="cursor: pointer" @click="filterPendingReview">
          <OverviewStatCard :label="t('admin.views.vehicles.pendingReview')" :value="pendingReviewCount" icon="mdi-shield-check" color="warning" value-tone="warning" />
        </div>
      </v-col>
    </v-row>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="search"
            :placeholder="t('admin.views.vehicles.searchPlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.vehicles.filterByStatus') }}</span>
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            item-title="label"
            item-value="value"
            :placeholder="t('admin.views.vehicles.allStatuses')"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-filter-variant"
            hide-details
            clearable
            @update:model-value="loadVehicles"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.vehicles.colDealer') }}</span>
          <v-text-field
            v-model="dealerNameFilter"
            :placeholder="t('admin.views.vehicles.dealerNamePlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-store-outline"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('admin.views.vehicles.filterByUser') }}</span>
          <v-text-field
            v-model="userNameFilter"
            :placeholder="t('admin.views.vehicles.userNamePlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-account-outline"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__actions">
          <button
            type="button"
            class="panel-btn panel-btn--outline"
            :disabled="loading"
            @click="loadVehicles"
          >
            <v-icon size="16">mdi-refresh</v-icon>
            {{ t('common.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <div class="panel-table-card">
      <div
        v-if="selectedVehicleIds.length > 0"
        class="bulk-actions-bar d-flex align-center flex-wrap ga-3 px-4 py-3"
      >
        <span class="text-body-2 font-weight-medium">
          {{ t('common.selectedCount', { count: selectedVehicleIds.length }) }}
        </span>
        <button
          type="button"
          class="panel-btn panel-btn--danger"
          :disabled="deleting"
          @click="confirmBulkDelete"
        >
          <v-icon size="16">mdi-trash-can-outline</v-icon>
          {{ t('common.deleteSelected') }}
        </button>
        <button
          type="button"
          class="panel-btn panel-btn--outline"
          :disabled="deleting"
          @click="selectedVehicleIds = []"
        >
          {{ t('common.clearSelection') }}
        </button>
      </div>
      <div class="panel-table-card__body">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('admin.views.vehicles.loadingVehicles') }}</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>{{ t('admin.views.users.error') }}</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <v-data-table
          v-else
          v-model="selectedVehicleIds"
          show-select
          item-value="id"
          :headers="headers"
          :items="vehicles.docs"
          :items-per-page="vehicles.limit"
          :items-length="vehicles.totalDocs || 0"
          :page="currentPage"
          density="comfortable"
          class="panel-data-table"
          elevation="0"
          @update:page="handlePageChange"
        >
          <template #item.id="{ item }">
            <span class="panel-id-cell">#{{ item.id }}</span>
          </template>

          <template #item.title="{ item }">
            <div class="panel-vehicle-cell">
              <div class="panel-vehicle-cell__thumb">
                <v-img
                  v-if="item.images && item.images.length > 0 && item.images[0]"
                  :src="item.images[0]?.url || item.images[0]?.thumbnailUrl"
                  :alt="item.title"
                  cover
                  width="44"
                  height="44"
                />
                <div v-else class="d-flex align-center justify-center h-100">
                  <v-icon size="18" color="disabled">mdi-car</v-icon>
                </div>
              </div>
              <div class="min-w-0">
                <div class="panel-vehicle-cell__title text-truncate">{{ item.title || t('common.na') }}</div>
                <div class="panel-vehicle-cell__subtitle text-truncate">
                  {{ item.registration || t('common.noRegistration') }}
                </div>
              </div>
            </div>
          </template>

          <template #item.dealer="{ item }">
            <div v-if="item.dealer">
              <div class="panel-vehicle-cell__title">
                {{ getDealerDisplayName(
                  {
                    id: item.dealer.id,
                    name: item.dealer.name || item.dealer.owner?.name,
                    email: item.dealer.email || item.dealer.owner?.email,
                  },
                  t('admin.views.dealers.unnamedDealer'),
                ) }}
              </div>
              <div class="panel-vehicle-cell__subtitle d-flex align-center flex-wrap ga-1">
                <v-chip
                  v-if="!isValidCvr(item.dealer.cvr)"
                  size="x-small"
                  color="warning"
                  variant="tonal"
                >
                  {{ t('admin.views.dealers.pendingCvr') }}
                </v-chip>
                <span v-else>{{ item.dealer.cvr }}</span>
                <span>· {{ item.dealer.city || t('common.noLocation') }}</span>
              </div>
            </div>
            <span v-else class="panel-id-cell">{{ t('common.na') }}</span>
          </template>

          <template #item.price="{ item }">
            <span class="panel-price-cell">{{ formatPrice(item.price) }}</span>
          </template>

          <template #item.status="{ item }">
            <span class="panel-status-chip" :class="getListStatusChipClass(item)">
              {{ translateStatus(item.status || item.vehicleListStatusName, t, item.vehicleListStatusId) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="panel-row-actions">
              <button
                v-if="item.vehicleListStatusId === VEHICLE_LIST_STATUS_ID.PENDING_REVIEW"
                type="button"
                class="panel-icon-btn panel-icon-btn--success"
                :disabled="approvingId === item.id"
                :title="t('admin.views.vehicles.approveListing')"
                @click="approveListing(item.id)"
              >
                <v-progress-circular v-if="approvingId === item.id" indeterminate size="14" width="2" />
                <v-icon v-else size="16">mdi-check-decagram</v-icon>
              </button>
              <button
                type="button"
                class="panel-icon-btn panel-icon-btn--primary"
                :title="t('common.view')"
                @click="viewVehicle(item.id)"
              >
                <v-icon size="16">mdi-eye-outline</v-icon>
              </button>
              <button
                type="button"
                class="panel-icon-btn panel-icon-btn--danger"
                :title="t('common.delete')"
                @click="confirmDelete(item)"
              >
                <v-icon size="16">mdi-trash-can-outline</v-icon>
              </button>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ isBulkDelete ? t('common.bulkDeleteVehicles') : t('admin.views.vehicles.deleteVehicle') }}
        </v-card-title>
        <v-card-text>
          <p v-if="isBulkDelete" class="text-body-1">
            {{ t('common.confirmBulkDeleteVehicles', { count: selectedVehicleIds.length }) }}
          </p>
          <p v-else class="text-body-1">
            {{ t('common.confirmDeleteLead') }}<strong>{{ vehicleToDelete?.title || t('common.vehicleTitleFallback', { id: vehicleToDelete?.id }) }}</strong>{{ t('common.confirmDeleteTrail') }}
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            {{ t('common.softDeleteVehicleWarning') }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="error"
            @click="confirmDeleteAction"
            :loading="deleting"
          >
            {{ isBulkDelete ? t('common.deleteSelected') : t('admin.views.vehicles.deleteVehicle') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <PanelSnackbar :snackbar="snackbar" />
  </div>
</template>

<script setup lang="ts">
import { useSnackbar } from '@/composables/useSnackbar'
import PanelSnackbar from '@/components/panel/PanelSnackbar.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getVehicles, deleteVehicle as deleteVehicleApi, bulkDeleteVehicles, getConstantsData, approvePendingVehicle } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { VehicleModel } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import OverviewStatCard from '@/components/panel/OverviewStatCard.vue'
import {
  VEHICLE_LIST_STATUS_ID,
  listStatusCountFromPayload,
} from '@/constants/vehicle-list-status'
import { translateStatus } from '@/utils/vehicleLabels'
import { getDealerDisplayName, isValidCvr } from '@/utils/dealerDisplay'

const router = useRouter()
const { t } = useI18n()
const { snackbar, showError } = useSnackbar()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<number | null>(null)
const vehicleListStatuses = ref<Array<{ id: number; name: string }>>([])
const dealerNameFilter = ref('')
const userNameFilter = ref('')
const vehicles = ref<PaginationModel<VehicleModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
  totalDocs: 0,
})
const currentPage = ref(1)
const showDeleteDialog = ref(false)
const vehicleToDelete = ref<VehicleModel | null>(null)
const deleting = ref(false)
const approvingId = ref<number | null>(null)
const selectedVehicleIds = ref<number[]>([])
const isBulkDelete = ref(false)

const statusFilterOptions = computed(() => {
  const options: Array<{ label: string; value: number | null }> = [
    { label: t('admin.views.vehicles.allStatuses'), value: null },
  ]

  const pushIfFound = (match: string, label: string) => {
    const found = vehicleListStatuses.value.find((s) => String(s.name || '').toLowerCase() === match)
    if (found?.id != null) options.push({ label, value: found.id })
  }

  pushIfFound('draft', t('admin.views.vehicles.draft'))
  pushIfFound('published', t('admin.views.vehicles.published'))
  pushIfFound('sold', t('admin.views.vehicles.sold'))
  pushIfFound('archived', t('admin.views.vehicles.archived'))
  pushIfFound('pending_review', t('admin.views.vehicles.pendingReview'))
  if (!options.some((o) => o.value === VEHICLE_LIST_STATUS_ID.PENDING_REVIEW)) {
    options.push({ label: t('admin.views.vehicles.pendingReview'), value: VEHICLE_LIST_STATUS_ID.PENDING_REVIEW })
  }

  return options
})

const headers = computed(() => [
  { title: t('admin.views.vehicles.colId'), key: 'id', width: '88px', sortable: false },
  { title: t('admin.views.vehicles.colVehicle'), key: 'title', sortable: false },
  { title: t('admin.views.vehicles.colDealer'), key: 'dealer', sortable: false },
  { title: t('admin.views.vehicles.colPrice'), key: 'price', width: '128px', sortable: false },
  { title: t('admin.views.vehicles.colStatus'), key: 'status', width: '128px', sortable: false },
  { title: t('admin.views.vehicles.colActions'), key: 'actions', sortable: false, width: '140px', align: 'end' as const },
])

const publishedCount = computed(() =>
  listStatusCountFromPayload(vehicles.value.list_status_counts, VEHICLE_LIST_STATUS_ID.PUBLISHED)
)

const draftCount = computed(() =>
  listStatusCountFromPayload(vehicles.value.list_status_counts, VEHICLE_LIST_STATUS_ID.DRAFT)
)

const soldCount = computed(() =>
  listStatusCountFromPayload(vehicles.value.list_status_counts, VEHICLE_LIST_STATUS_ID.SOLD)
)

const archivedCount = computed(() =>
  listStatusCountFromPayload(vehicles.value.list_status_counts, VEHICLE_LIST_STATUS_ID.ARCHIVED)
)

const pendingReviewCount = computed(() =>
  listStatusCountFromPayload(vehicles.value.list_status_counts, VEHICLE_LIST_STATUS_ID.PENDING_REVIEW)
)

const filterPendingReview = () => {
  statusFilter.value = VEHICLE_LIST_STATUS_ID.PENDING_REVIEW
  currentPage.value = 1
  loadVehicles()
}

const loadVehicles = async () => {
  try {
    loading.value = true
    error.value = null
    const params: any = {
      page: currentPage.value,
      limit: 15,
    }
    if (statusFilter.value != null) {
      params.list_status_id = statusFilter.value
    }
    if (search.value) {
      params.search = search.value
    }
    if (dealerNameFilter.value) {
      params.dealer_name = dealerNameFilter.value
    }
    if (userNameFilter.value) {
      params.user_name = userNameFilter.value
    }
    const response = await getVehicles(params)
    vehicles.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicles.failedLoadVehicles')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadVehicles()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadVehicles()
}

const viewVehicle = (id: number) => {
  router.push({ name: 'admin.vehicles.detail', params: { id } })
}

const approveListing = async (id: number) => {
  try {
    approvingId.value = id
    await approvePendingVehicle(id)
    await loadVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('admin.views.vehicles.approveListing')
  } finally {
    approvingId.value = null
  }
}

const confirmDelete = (vehicle: VehicleModel) => {
  isBulkDelete.value = false
  vehicleToDelete.value = vehicle
  showDeleteDialog.value = true
}

const confirmBulkDelete = () => {
  if (selectedVehicleIds.value.length === 0) return
  isBulkDelete.value = true
  vehicleToDelete.value = null
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  isBulkDelete.value = false
  vehicleToDelete.value = null
}

const confirmDeleteAction = async () => {
  if (isBulkDelete.value) {
    await bulkDeleteSelected()
    return
  }
  await deleteVehicle()
}

const deleteVehicle = async () => {
  if (!vehicleToDelete.value) return
  const deletedId = vehicleToDelete.value.id

  try {
    deleting.value = true
    error.value = null
    await deleteVehicleApi(deletedId)
    closeDeleteDialog()
    selectedVehicleIds.value = selectedVehicleIds.value.filter((id) => id !== deletedId)
    await loadVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicles.failedDeleteVehicle')
  } finally {
    deleting.value = false
  }
}

const bulkDeleteSelected = async () => {
  if (selectedVehicleIds.value.length === 0) return

  try {
    deleting.value = true
    error.value = null
    await bulkDeleteVehicles(selectedVehicleIds.value)
    closeDeleteDialog()
    selectedVehicleIds.value = []
    await loadVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.failedBulkDeleteVehicles')
  } finally {
    deleting.value = false
  }
}

const getListStatusChipClass = (item: VehicleModel) => {
  const id = item.vehicleListStatusId
  if (id === VEHICLE_LIST_STATUS_ID.PUBLISHED) return 'panel-status-chip--success'
  if (id === VEHICLE_LIST_STATUS_ID.SOLD) return 'panel-status-chip--info'
  if (id === VEHICLE_LIST_STATUS_ID.ARCHIVED || id === VEHICLE_LIST_STATUS_ID.PENDING_REVIEW) {
    return 'panel-status-chip--warning'
  }
  if (id === VEHICLE_LIST_STATUS_ID.DRAFT) return 'panel-status-chip--neutral'
  const status = (item.status || item.vehicleListStatusName || '').toLowerCase()
  if (status === 'published') return 'panel-status-chip--success'
  if (status === 'sold') return 'panel-status-chip--info'
  if (status === 'archived' || status === 'pending_review') return 'panel-status-chip--warning'
  return 'panel-status-chip--neutral'
}

const formatPrice = (price?: number) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

onMounted(async () => {
  try {
    const data = await getConstantsData()
    vehicleListStatuses.value = data.vehicle_list_statuses || []
  } catch (err) {
    showError(t('common.failedToLoadData'))
  }
  await loadVehicles()
})
</script>

<style scoped>
.bulk-actions-bar {
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklch, var(--destructive, #dc2626) 6%, var(--card));
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
}
</style>
