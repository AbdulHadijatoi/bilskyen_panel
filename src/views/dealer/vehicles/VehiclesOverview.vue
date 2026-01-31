<template>
  <div class="vehicles-overview-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
  <div>
          <h1 class="text-h4 font-weight-bold mb-1">Vehicle Management</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
          View and manage your vehicle inventory
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
          size="default"
        :to="{ name: 'dealer.vehicles.add' }"
      >
        Add Vehicle
      </v-btn>
    </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Total Vehicles</div>
                <div class="stat-value">{{ vehicles.totalDocs || 0 }}</div>
              </div>
              <v-icon size="40" color="primary" class="stat-icon">mdi-car-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Published</div>
                <div class="stat-value text-success">{{ publishedCount }}</div>
              </div>
              <v-icon size="40" color="success" class="stat-icon">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Draft</div>
                <div class="stat-value text-warning">{{ draftCount }}</div>
              </div>
              <v-icon size="40" color="warning" class="stat-icon">mdi-file-document-edit</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          variant="flat"
          class="stat-card"
          elevation="0"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="stat-label">Sold</div>
                <div class="stat-value text-info">{{ soldCount }}</div>
              </div>
              <v-icon size="40" color="info" class="stat-icon">mdi-check-all</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search Card -->
    <v-card
      variant="flat"
      class="filters-card mb-4"
      elevation="0"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-4 flex-wrap">
          <v-text-field
            v-model="search"
            placeholder="Search by title, registration, VIN..."
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="search-field flex-grow-1"
            style="max-width: 400px;"
            hide-details
            clearable
            @update:model-value="handleSearch"
          />
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            item-title="label"
            item-value="value"
            label="Filter by Status"
              variant="outlined" 
            density="comfortable"
            prepend-inner-icon="mdi-filter"
            style="max-width: 200px;"
            hide-details
            clearable
            @update:model-value="loadVehicles"
          />
          <v-spacer />
            <v-btn 
              variant="outlined" 
            prepend-icon="mdi-refresh"
            @click="loadVehicles"
            :loading="loading"
            size="default"
          >
            Refresh
            </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Vehicles Table Card -->
    <v-card
      variant="flat"
      class="table-card"
      elevation="0"
    >
      <v-card-title class="card-title">
        <v-icon class="mr-2">mdi-table</v-icon>
        Vehicles List
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          Showing {{ vehicles.docs.length }} of {{ vehicles.totalDocs || 0 }} vehicles
        </span>
      </v-card-title>

      <v-card-text class="pa-0">
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">Loading vehicles...</p>
        </div>

        <div v-else-if="error" class="error-container pa-6">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>Error</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

      <v-data-table
          v-else
        :headers="headers"
          :items="vehicles.docs"
          :items-per-page="vehicles.limit"
          :page="vehicles.page"
          density="comfortable"
        class="vehicles-table"
        :class="$style.dataTable"
        elevation="0"
          @update:page="handlePageChange"
      >
          <template #item.id="{ item }">
            <span class="text-medium-emphasis font-weight-medium">#{{ item.id }}</span>
          </template>
          
          <template #item.title="{ item }">
            <div class="d-flex align-center gap-2">
              <div v-if="item.images && item.images.length > 0 && item.images[0]" class="vehicle-thumbnail">
                <v-img
                  :src="item.images[0]?.url || item.images[0]?.thumbnailUrl"
                  :alt="item.title"
                  cover
                  width="40"
                  height="40"
                  style="border-radius: 4px;"
                />
              </div>
              <div>
                <div class="font-weight-medium">{{ item.title || 'N/A' }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.registration || 'No registration' }}
                </div>
              </div>
            </div>
          </template>
          
          <template #item.price="{ item }">
            <span class="font-weight-medium">
              {{ formatPrice(item.price) }}
            </span>
          </template>
          
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status || item.vehicleListStatusName)"
              size="small"
              variant="flat"
            >
              {{ item.status || item.vehicleListStatusName || 'N/A' }}
            </v-chip>
          </template>
          
          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-center gap-2">
                <v-btn 
                  icon 
                  variant="text" 
                size="small"
                color="primary"
                @click="viewVehicle(item.id)"
                title="View"
              >
                <v-icon size="20">mdi-eye</v-icon>
                </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(item)"
                  title="Delete"
              >
                <v-icon size="20">mdi-delete</v-icon>
              </v-btn>
                </div>
          </template>
        </v-data-table>

        <div v-if="vehicles.totalPages && vehicles.totalPages > 1" class="d-flex justify-center pa-4">
          <v-pagination
            v-model="currentPage"
            :length="vehicles.totalPages"
            density="comfortable"
            @update:model-value="handlePageChange"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Delete Vehicle
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">
            Are you sure you want to delete <strong>{{ vehicleToDelete?.title || `Vehicle #${vehicleToDelete?.id}` }}</strong>?
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            This action will soft delete the vehicle. The vehicle will no longer be visible in the system.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            @click="deleteVehicle"
            :loading="deleting"
          >
            Delete Vehicle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getVehicles, deleteVehicle as deleteVehicleApi } from '@/api/dealer.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { VehicleModel } from '@/models/vehicle.model'
import type { VehicleStatus } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<VehicleStatus | null>(null)
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

const statusFilterOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Draft', value: 'draft' as VehicleStatus },
  { label: 'Published', value: 'published' as VehicleStatus },
  { label: 'Sold', value: 'sold' as VehicleStatus },
  { label: 'Archived', value: 'archived' as VehicleStatus },
]

const headers = [
  { title: 'ID', key: 'id', width: '100px', sortable: false },
  { title: 'Vehicle', key: 'title', sortable: false },
  { title: 'Price', key: 'price', width: '120px', sortable: false },
  { title: 'Status', key: 'status', width: '120px', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'center' as const },
]

// Status counts - fetch all vehicles for accurate counts
const statusCounts = ref({
  published: 0,
  draft: 0,
  sold: 0,
  archived: 0,
})

const publishedCount = computed(() => statusCounts.value.published)
const draftCount = computed(() => statusCounts.value.draft)
const soldCount = computed(() => statusCounts.value.sold)

// Load status counts separately
const loadStatusCounts = async () => {
  try {
    // Fetch all vehicles without pagination to get accurate counts
    const response = await getVehicles({ limit: 1000, page: 1 })
    
    // Count vehicles by status
    statusCounts.value = {
      published: response.docs.filter(v => {
        const status = v.status?.toLowerCase() || v.vehicleListStatusName?.toLowerCase() || ''
        return status === 'published'
      }).length,
      draft: response.docs.filter(v => {
        const status = v.status?.toLowerCase() || v.vehicleListStatusName?.toLowerCase() || ''
        return status === 'draft'
      }).length,
      sold: response.docs.filter(v => {
        const status = v.status?.toLowerCase() || v.vehicleListStatusName?.toLowerCase() || ''
        return status === 'sold'
      }).length,
      archived: response.docs.filter(v => {
        const status = v.status?.toLowerCase() || v.vehicleListStatusName?.toLowerCase() || ''
        return status === 'archived'
      }).length,
    }
  } catch (err) {
    console.error('Failed to load status counts:', err)
  }
}

const loadVehicles = async () => {
  try {
    loading.value = true
    error.value = null
    const params: any = {
      page: currentPage.value,
      limit: 15,
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (search.value) {
      params.search = search.value
    }
    const response = await getVehicles(params)
    vehicles.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load vehicles'
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
  vehicleToDelete.value = vehicle
  showDeleteDialog.value = true
}

const deleteVehicle = async () => {
  if (!vehicleToDelete.value) return

  try {
    deleting.value = true
    error.value = null
    await deleteVehicleApi(vehicleToDelete.value.id)
    showDeleteDialog.value = false
    vehicleToDelete.value = null
    await Promise.all([loadVehicles(), loadStatusCounts()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete vehicle'
  } finally {
    deleting.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    published: 'success',
    sold: 'info',
    archived: 'warning',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
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
  await Promise.all([loadVehicles(), loadStatusCounts()])
})
</script>

<style scoped>
.vehicles-overview-container {
  padding: 0;
}

.header-section {
  padding: 0;
}

.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-icon {
  opacity: 0.8;
}

.filters-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.table-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.card-title {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 1rem;
  font-weight: 600;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.vehicle-thumbnail {
  flex-shrink: 0;
}

.search-field :deep(.v-field) {
  box-shadow: none !important;
}
</style>

<style module>
.dataTable :global(.v-data-table__thead th) {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 20px !important;
  background-color: transparent !important;
  color: rgba(0, 0, 0, 0.6);
}

.dataTable :global(.v-data-table__tbody td) {
  font-size: 0.875rem !important;
  padding: 16px 20px !important;
  height: auto !important;
  background-color: transparent !important;
}

.dataTable :global(.v-data-table__tbody tr) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
  background-color: transparent !important;
}

.dataTable :global(.v-data-table__tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.dataTable :global(.v-data-table) {
  background-color: transparent !important;
}
</style>
