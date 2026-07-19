<template>
  <div class="panel-page overview-page vehicles-overview-container">
    <PageHeader
      :title="t('dealer.views.vehicles.title')"
      :subtitle="t('dealer.views.vehicles.subtitle')"
    >
      <template #actions>
        <div class="d-flex gap-2 flex-wrap">
          <v-menu v-if="hasPermission('dealer.feeds.export')">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="panel-btn panel-btn--outline" :disabled="exporting">
                <v-icon size="16">mdi-download</v-icon>
                {{ t('dealer.views.vehicles.exportStock') }}
              </button>
            </template>
            <v-list density="compact">
              <v-list-item @click="exportStock('csv')">{{ t('dealer.views.vehicles.exportCsv') }}</v-list-item>
              <v-list-item @click="exportStock('xlsx')">{{ t('dealer.views.vehicles.exportExcel') }}</v-list-item>
            </v-list>
          </v-menu>
          <button
            v-if="hasPermission('dealer.vehicles.create')"
            type="button"
            class="panel-btn panel-btn--outline"
            @click="showImportDialog = true"
          >
            <v-icon size="16">mdi-upload</v-icon>
            {{ t('dealer.views.vehicles.import.bulkImport') }}
          </button>
          <button
            v-if="hasPermission('dealer.vehicles.create')"
            type="button"
            class="panel-btn panel-btn--outline"
            @click="showUrlImportDialog = true"
          >
            <v-icon size="16">mdi-link-variant</v-icon>
            {{ t('dealer.views.vehicles.urlImport.importFromUrl') }}
          </button>
          <button
            v-if="canBulkPriceUpdate"
            type="button"
            class="panel-btn panel-btn--outline"
            @click="showBulkPriceDialog = true"
          >
            <v-icon size="16">mdi-currency-usd</v-icon>
            {{ t('dealer.views.bulkPrice.button') }}
          </button>
          <router-link
            v-if="hasPermission('dealer.vehicles.create')"
            :to="{ name: 'dealer.vehicles.add' }"
            class="panel-btn panel-btn--primary"
          >
            <v-icon size="16">mdi-plus</v-icon>
            {{ t('dealer.views.vehicles.addVehicle') }}
          </router-link>
        </div>
      </template>
    </PageHeader>

    <v-row class="mb-5">
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('dealer.views.vehicles.totalVehicles')" :value="vehicles.totalDocs || 0" icon="mdi-car-multiple" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('dealer.views.vehicles.published')" :value="publishedCount" icon="mdi-check-circle" color="success" value-tone="success" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('dealer.views.vehicles.draft')" :value="draftCount" icon="mdi-file-document-edit" color="warning" value-tone="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <OverviewStatCard :label="t('dealer.views.vehicles.sold')" :value="soldCount" icon="mdi-check-all" color="info" value-tone="info" />
      </v-col>
    </v-row>

    <div class="panel-filters-card">
      <div class="panel-filters-grid">
        <div class="panel-filters-grid__search">
          <span class="panel-filters-card__label">{{ t('common.search') }}</span>
          <v-text-field
            v-model="search"
            :placeholder="t('dealer.views.vehicles.searchPlaceholder')"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
        </div>
        <div class="panel-filters-grid__field">
          <span class="panel-filters-card__label">{{ t('dealer.views.vehicles.filterByStatus') }}</span>
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            item-title="label"
            item-value="value"
            :placeholder="t('dealer.views.vehicles.allStatuses')"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-filter-variant"
            hide-details
            clearable
            @update:model-value="loadVehicles"
          />
        </div>
        <div class="panel-filters-grid__actions panel-filters-grid__actions--trailing">
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
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('dealer.views.vehicles.loadingVehicles') }}</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>{{ t('dealer.views.vehicles.error') }}</v-alert-title>
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

          <template #item.price="{ item }">
            <span class="panel-price-cell">{{ formatPrice(item.price) }}</span>
          </template>

          <template #item.status="{ item }">
            <span class="panel-status-chip" :class="getListStatusChipClass(item)">
              {{ formatListStatusLabel(item) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="panel-row-actions">
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
          {{ isBulkDelete ? t('common.bulkDeleteVehicles') : t('dealer.views.vehicles.deleteVehicle') }}
        </v-card-title>
        <v-card-text>
          <p v-if="isBulkDelete" class="text-body-1">
            {{ t('common.confirmBulkDeleteVehicles', { count: selectedVehicleIds.length }) }}
          </p>
          <p v-else class="text-body-1">
            {{ t('dealer.views.vehicles.confirmDeleteMessage', { name: vehicleToDelete?.title || `Vehicle #${vehicleToDelete?.id}` }) }}
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            {{ t('dealer.views.vehicles.deleteVehicleDescription') }}
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
            {{ isBulkDelete ? t('common.deleteSelected') : t('dealer.views.vehicles.deleteVehicle') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <VehicleBulkImportDialog
      v-model="showImportDialog"
      @imported="onImportCompleted"
    />
    <VehicleUrlImportDialog
      v-model="showUrlImportDialog"
      @imported="onUrlImportCompleted"
    />

    <BulkPriceUpdateDialog
      v-model="showBulkPriceDialog"
      @completed="loadVehicles"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="6000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getVehicles, deleteVehicle as deleteVehicleApi, bulkDeleteVehicles, exportVehicleStock } from '@/api/dealer.api'
import VehicleBulkImportDialog from '@/components/dealer/vehicles/VehicleBulkImportDialog.vue'
import VehicleUrlImportDialog from '@/components/dealer/vehicles/VehicleUrlImportDialog.vue'
import BulkPriceUpdateDialog from '@/components/dealer/vehicles/BulkPriceUpdateDialog.vue'
import { hasPermission } from '@/utils/permissions'
import { FeatureKey, hasFeature } from '@/utils/subscriptionFeatures'
import { useSnackbar } from '@/composables/useSnackbar'
import type { PaginationModel } from '@/models/pagination.model'
import type { VehicleModel } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import OverviewStatCard from '@/components/panel/OverviewStatCard.vue'
import {
  VEHICLE_LIST_STATUS_ID,
  formatListStatusLabel,
  listStatusCountFromPayload,
} from '@/constants/vehicle-list-status'

const router = useRouter()
const { t } = useI18n()
const { snackbar, showSnackbar } = useSnackbar()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<number | null>(null)
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
const showImportDialog = ref(false)
const showUrlImportDialog = ref(false)
const showBulkPriceDialog = ref(false)
const showDeleteDialog = ref(false)
const vehicleToDelete = ref<VehicleModel | null>(null)
const deleting = ref(false)
const exporting = ref(false)
const selectedVehicleIds = ref<number[]>([])
const isBulkDelete = ref(false)
const canBulkPriceUpdate = hasFeature(FeatureKey.BULK_PRICE_UPDATE)

const statusFilterOptions = computed(() => [
  { label: t('dealer.views.vehicles.allStatuses'), value: null },
  { label: t('dealer.views.vehicles.draft'), value: VEHICLE_LIST_STATUS_ID.DRAFT },
  { label: t('dealer.views.vehicles.published'), value: VEHICLE_LIST_STATUS_ID.PUBLISHED },
  { label: t('dealer.views.vehicles.sold'), value: VEHICLE_LIST_STATUS_ID.SOLD },
  { label: t('dealer.views.vehicles.archived'), value: VEHICLE_LIST_STATUS_ID.ARCHIVED },
])

const headers = computed(() => [
  { title: 'ID', key: 'id', width: '88px', sortable: false },
  { title: t('dealer.views.vehicles.vehicle'), key: 'title', sortable: false },
  { title: t('dealer.views.vehicles.price'), key: 'price', width: '128px', sortable: false },
  { title: t('common.status'), key: 'status', width: '128px', sortable: false },
  { title: t('common.actions'), key: 'actions', sortable: false, width: '120px', align: 'end' as const },
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
  router.push({ name: 'dealer.vehicles.detail', params: { id } })
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

const onImportCompleted = async () => {
  await loadVehicles()
}

const onUrlImportCompleted = async (_vehicleId: number, warnings: string[] = []) => {
  await loadVehicles()
  if (warnings.length > 0) {
    showSnackbar(
      t('dealer.views.vehicles.urlImport.publishSuccessWithWarnings', {
        warnings: warnings.slice(0, 3).join(' '),
      }),
      'warning',
    )
  } else {
    showSnackbar(t('dealer.views.vehicles.urlImport.publishSuccess'), 'success')
  }
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

const formatPrice = (price?: number) => {
  if (!price) return t('common.na')
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
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

const exportStock = async (format: 'csv' | 'xlsx') => {
  try {
    exporting.value = true
    await exportVehicleStock({
      format,
      list_status_id: statusFilter.value ?? undefined,
    })
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicles.exportFailed')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadVehicles()
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
