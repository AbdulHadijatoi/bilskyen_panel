<template>
  <div class="featured-vehicles-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Featured Vehicles Management</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage featured vehicle listings and their display order
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showAddDialog = true"
          size="default"
        >
          Add Vehicle
        </v-btn>
      </div>
    </div>

    <!-- Stats Card -->
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
                <div class="stat-label">Total Featured</div>
                <div class="stat-value">{{ featuredVehicles.total || 0 }}</div>
              </div>
              <v-icon size="40" color="warning" class="stat-icon">mdi-star</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
      closable
      @click:close="error = null"
    >
      <v-alert-title>Error</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Featured Vehicles Table -->
    <v-card variant="flat" class="vehicles-card" elevation="0">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="featuredVehicles.docs"
          :loading="loading"
          :items-per-page="featuredVehicles.limit"
          :page="currentPage"
          @update:page="handlePageChange"
          class="featured-vehicles-table"
          item-value="id"
        >
          <template v-slot:item.image="{ item }">
            <v-avatar
              v-if="item.vehicle?.images?.[0]?.thumbnail_url || item.vehicle?.images?.[0]?.image_url"
              size="60"
              rounded
            >
              <v-img
                :src="item.vehicle.images[0].thumbnail_url || item.vehicle.images[0].image_url"
                :alt="item.vehicle.title || 'Vehicle'"
                cover
              />
            </v-avatar>
            <v-avatar v-else size="60" rounded color="grey-lighten-2">
              <v-icon>mdi-car</v-icon>
            </v-avatar>
          </template>

          <template v-slot:item.vehicle="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.vehicle?.title || `Vehicle #${item.vehicle_id}` }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.vehicle?.registration || 'No registration' }}
                <span v-if="item.vehicle?.vin"> • {{ item.vehicle.vin }}</span>
              </div>
            </div>
          </template>

          <template v-slot:item.price="{ item }">
            <span class="font-weight-medium">{{ formatPrice(item.vehicle?.price) }}</span>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.vehicle?.vehicle_list_status_id)"
              size="x-small"
              variant="flat"
            >
              {{ getStatusName(item.vehicle?.vehicle_list_status_id) }}
            </v-chip>
          </template>

          <template v-slot:item.dealer="{ item }">
            <span class="text-body-2">{{ item.vehicle?.dealer?.cvr || 'N/A' }}</span>
          </template>

          <template v-slot:item.sort_order="{ item }">
            <div class="d-flex align-center gap-2">
              <v-btn
                icon="mdi-chevron-up"
                size="x-small"
                variant="text"
                :disabled="item.sort_order === 1 || loading"
                @click="moveUp(item)"
              />
              <span class="text-body-2 font-weight-medium">{{ item.sort_order }}</span>
              <v-btn
                icon="mdi-chevron-down"
                size="x-small"
                variant="text"
                :disabled="item.sort_order === featuredVehicles.total || loading"
                @click="moveDown(item)"
              />
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex align-center gap-2">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewVehicle(item.vehicle_id)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmRemove(item)"
              />
            </div>
          </template>

          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-star-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis mb-2">No featured vehicles yet</p>
              <p class="text-caption text-medium-emphasis">Click "Add Vehicle" to feature a vehicle</p>
            </div>
          </template>
        </v-data-table>

        <!-- Pagination -->
        <div v-if="featuredVehicles.totalPages && featuredVehicles.totalPages > 1" class="d-flex justify-center pa-4">
          <v-pagination
            v-model="currentPage"
            :length="featuredVehicles.totalPages"
            @update:model-value="handlePageChange"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Add Vehicle Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-plus</v-icon>
          <span>Add Featured Vehicle</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showAddDialog = false" />
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="vehicleSearch"
            placeholder="Search vehicles by title, registration, or VIN..."
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="mb-4"
            hide-details
            clearable
            @update:model-value="searchVehicles"
          />
          <div v-if="loadingVehicles" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="availableVehicles.docs.length === 0" class="text-center py-8">
            <p class="text-body-2 text-medium-emphasis">No published vehicles found</p>
          </div>
          <v-list v-else class="vehicle-list" style="max-height: 400px; overflow-y: auto;">
            <v-list-item
              v-for="vehicle in availableVehicles.docs"
              :key="vehicle.id"
              :disabled="isVehicleFeatured(vehicle.id)"
              @click="selectVehicle(vehicle)"
              class="vehicle-list-item"
            >
              <template v-slot:prepend>
                <v-avatar
                  v-if="vehicle.images?.[0]?.thumbnail_url || vehicle.images?.[0]?.image_url"
                  size="50"
                  rounded
                >
                  <v-img
                    :src="vehicle.images[0].thumbnail_url || vehicle.images[0].image_url"
                    :alt="vehicle.title || 'Vehicle'"
                    cover
                  />
                </v-avatar>
                <v-avatar v-else size="50" rounded color="grey-lighten-2">
                  <v-icon>mdi-car</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>
                {{ vehicle.title || `Vehicle #${vehicle.id}` }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ vehicle.registration || 'No registration' }} • {{ formatPrice(vehicle.price) }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-chip
                  v-if="isVehicleFeatured(vehicle.id)"
                  size="x-small"
                  color="warning"
                  variant="flat"
                >
                  Already Featured
                </v-chip>
                <v-icon v-else>mdi-chevron-right</v-icon>
              </template>
            </v-list-item>
          </v-list>
          <div v-if="availableVehicles.totalPages > 1" class="d-flex justify-center mt-4">
            <v-pagination
              v-model="vehicleSearchPage"
              :length="availableVehicles.totalPages"
              @update:model-value="searchVehicles"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Remove Confirmation Dialog -->
    <v-dialog v-model="showRemoveDialog" max-width="400">
      <v-card>
        <v-card-title>Remove Featured Vehicle</v-card-title>
        <v-card-text>
          Are you sure you want to remove this vehicle from featured listings?
          <div v-if="vehicleToRemove" class="mt-3">
            <strong>{{ vehicleToRemove.vehicle?.title || `Vehicle #${vehicleToRemove.vehicle_id}` }}</strong>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showRemoveDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="removeVehicle"
            :loading="removing"
          >
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getFeaturedVehicles,
  addFeaturedVehicle,
  updateFeaturedVehicle,
  removeFeaturedVehicle,
  getVehicles,
  type FeaturedVehicleModel,
  type VehicleModel,
} from '@/api/admin.api'
import { VehicleStatus } from '@/models/vehicle.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const featuredVehicles = ref<PaginationModel<FeaturedVehicleModel>>({
  docs: [],
  limit: 15,
  page: 1,
  total: 0,
  totalPages: 0,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)

const showAddDialog = ref(false)
const loadingVehicles = ref(false)
const vehicleSearch = ref('')
const vehicleSearchPage = ref(1)
const availableVehicles = ref<PaginationModel<VehicleModel>>({
  docs: [],
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 0,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})

const showRemoveDialog = ref(false)
const vehicleToRemove = ref<FeaturedVehicleModel | null>(null)
const removing = ref(false)

const headers = [
  { title: 'Image', key: 'image', sortable: false, width: '80px' },
  { title: 'Vehicle', key: 'vehicle', sortable: false },
  { title: 'Price', key: 'price', sortable: false, width: '120px' },
  { title: 'Status', key: 'status', sortable: false, width: '100px' },
  { title: 'Dealer', key: 'dealer', sortable: false, width: '120px' },
  { title: 'Order', key: 'sort_order', sortable: false, width: '120px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', align: 'end' },
]

const loadFeaturedVehicles = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getFeaturedVehicles({
      page: currentPage.value,
      limit: 15,
    })
    featuredVehicles.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load featured vehicles'
  } finally {
    loading.value = false
  }
}

const searchVehicles = async () => {
  try {
    loadingVehicles.value = true
    const params: PaginationParams & { status?: VehicleStatus; search?: string } = {
      page: vehicleSearchPage.value,
      limit: 10,
      status: VehicleStatus.PUBLISHED,
    }
    if (vehicleSearch.value) {
      params.search = vehicleSearch.value
    }
    const response = await getVehicles(params)
    availableVehicles.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to search vehicles'
  } finally {
    loadingVehicles.value = false
  }
}

const isVehicleFeatured = (vehicleId: number): boolean => {
  return featuredVehicles.value.docs.some(fv => fv.vehicle_id === vehicleId)
}

const selectVehicle = async (vehicle: VehicleModel) => {
  if (isVehicleFeatured(vehicle.id)) return

  try {
    loading.value = true
    error.value = null
    await addFeaturedVehicle({
      vehicle_id: vehicle.id,
    })
    showAddDialog.value = false
    vehicleSearch.value = ''
    vehicleSearchPage.value = 1
    await loadFeaturedVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to add featured vehicle'
  } finally {
    loading.value = false
  }
}

const moveUp = async (item: FeaturedVehicleModel) => {
  if (item.sort_order <= 1) return

  try {
    loading.value = true
    error.value = null
    await updateFeaturedVehicle(item.id, {
      sort_order: item.sort_order - 1,
    })
    await loadFeaturedVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update sort order'
  } finally {
    loading.value = false
  }
}

const moveDown = async (item: FeaturedVehicleModel) => {
  if (item.sort_order >= featuredVehicles.value.total) return

  try {
    loading.value = true
    error.value = null
    await updateFeaturedVehicle(item.id, {
      sort_order: item.sort_order + 1,
    })
    await loadFeaturedVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update sort order'
  } finally {
    loading.value = false
  }
}

const confirmRemove = (item: FeaturedVehicleModel) => {
  vehicleToRemove.value = item
  showRemoveDialog.value = true
}

const removeVehicle = async () => {
  if (!vehicleToRemove.value) return

  try {
    removing.value = true
    error.value = null
    await removeFeaturedVehicle(vehicleToRemove.value.id)
    showRemoveDialog.value = false
    vehicleToRemove.value = null
    await loadFeaturedVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to remove featured vehicle'
  } finally {
    removing.value = false
  }
}

const viewVehicle = (vehicleId: number) => {
  router.push({ name: 'admin.vehicles.detail', params: { id: vehicleId } })
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFeaturedVehicles()
}

const getStatusColor = (statusId?: number) => {
  const colors: Record<number, string> = {
    1: 'warning', // Draft
    2: 'success', // Published
    3: 'info', // Sold
    4: 'grey', // Archived
  }
  return colors[statusId || 0] || 'grey'
}

const getStatusName = (statusId?: number) => {
  const names: Record<number, string> = {
    1: 'Draft',
    2: 'Published',
    3: 'Sold',
    4: 'Archived',
  }
  return names[statusId || 0] || 'Unknown'
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

onMounted(() => {
  loadFeaturedVehicles()
  searchVehicles()
})
</script>

<style scoped>
.featured-vehicles-container {
  padding: 0;
}

.header-section {
  padding: 0;
}

.stat-card {
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 1);
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-icon {
  opacity: 0.8;
}

.vehicles-card {
  border-radius: 8px;
}

.featured-vehicles-table :deep(.v-data-table__thead) {
  background-color: rgba(var(--v-theme-surface), 1);
}

.vehicle-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.vehicle-list-item:hover:not(.v-list-item--disabled) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.vehicle-list-item.v-list-item--disabled {
  opacity: 0.6;
}
</style>
