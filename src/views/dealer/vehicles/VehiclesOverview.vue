<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-3">
      <div>
        <h2 class="text-h6 font-weight-bold mb-1">Manage Vehicles</h2>
        <p class="text-caption text-medium-emphasis">
          View and manage your vehicle inventory
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        :to="{ name: 'dealer.vehicles.add' }"
      >
        Add Vehicle
      </v-btn>
    </div>

    <!-- Filters Card -->
    <v-card
      variant="flat"
      class="filters-card mb-3"
      elevation="0"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
      }"
    >
      <v-card-text class="pa-3">
        <div class="d-flex justify-space-between align-center">
          <v-text-field
            v-model="search"
            placeholder="Search vehicles..."
            density="compact"
            variant="plain"
            prepend-inner-icon="mdi-magnify"
            class="search-field"
            hide-details
            style="max-width: 300px;"
          />
          <div class="d-flex gap-2">
            <v-btn 
              variant="outlined" 
              density="compact" 
              size="small"
              prepend-icon="mdi-filter-variant"
              class="action-btn"
            >
              Filter
            </v-btn>
            <v-btn 
              variant="outlined" 
              density="compact" 
              size="small"
              prepend-icon="mdi-sort"
              class="action-btn"
            >
              Sort
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3"
      closable
      @click:close="loadError = null"
    >
      {{ loadError }}
    </v-alert>

    <!-- Table Card -->
    <v-card
      variant="flat"
      class="vehicles-table-card"
      elevation="0"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
      }"
    >
      <v-data-table
        :headers="headers"
        :items="tableVehicles"
        :search="search"
        :items-per-page="15"
        :loading="loading"
        show-expand
        item-value="id"
        density="compact"
        class="vehicles-table"
        :class="$style.dataTable"
        elevation="0"
      >
          <template #item.slNo="{ index }">
            <span style="font-size: 0.75rem;">{{ index + 1 }}</span>
          </template>
          
          <template #item.inventoryDate="{ item }">
            <span style="font-size: 0.75rem;">{{ item.inventoryDate }}</span>
          </template>
          
          <template #item.registrationNumber="{ item }">
            <span style="font-size: 0.75rem; font-weight: 500;">{{ item.registrationNumber }}</span>
          </template>
          
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="x-small"
              variant="flat"
              style="font-size: 0.6875rem;"
            >
              {{ item.status }}
            </v-chip>
          </template>
          
          <template #item.make="{ item }">
            <span style="font-size: 0.75rem;">{{ item.make }}</span>
          </template>
          
          <template #item.model="{ item }">
            <span style="font-size: 0.75rem;">{{ item.model }}</span>
          </template>
          
          <template #item.year="{ item }">
            <span style="font-size: 0.75rem;">{{ item.year }}</span>
          </template>
          
          <template #item.listedPrice="{ item }">
            <span style="font-size: 0.75rem; font-weight: 500;">{{ item.listedPrice }}</span>
          </template>
          
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn 
                  icon 
                  variant="text" 
                  size="x-small"
                  v-bind="props"
                  class="text-medium-emphasis"
                >
                  <v-icon size="16">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="pa-1">
                <v-list-item
                  prepend-icon="mdi-image-multiple"
                  title="Images"
                  class="text-caption"
                  @click="openImageGallery(item.original)"
                />
                <v-list-item
                  prepend-icon="mdi-eye"
                  title="View"
                  class="text-caption"
                  @click="viewVehicle(item.original)"
                />
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Edit"
                  class="text-caption"
                  @click="editVehicle(item.original)"
                />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete"
                  class="text-caption text-error"
                  @click="deleteVehicle(item.original)"
                />
              </v-list>
            </v-menu>
          </template>
          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <div class="pa-3 text-body-2">
                  <div class="mb-2 text-caption text-medium-emphasis">Vehicle Summary</div>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <div><strong>Vehicle:</strong> {{ item.original.title ?? '-' }}</div>
                      <div><strong>Make:</strong> {{ item.original.brandName ?? '-' }}</div>
                      <div><strong>Model:</strong> {{ item.original.modelName ?? '-' }}</div>
                      <div><strong>Model Year:</strong> {{ item.original.modelYearName ?? '-' }}</div>
                      <div><strong>Registration:</strong> {{ item.original.registration ?? '-' }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div><strong>Status:</strong> {{ item.original.vehicleListStatusName ?? item.original.status ?? '-' }}</div>
                      <div><strong>Price:</strong> {{ formatPrice(item.original.price) }}</div>
                      <div><strong>Mileage:</strong> {{ item.original.kmDriven ?? '-' }}</div>
                      <div><strong>Listed On:</strong> {{ formatDateTime(item.original.createdAt) }}</div>
                      <div><strong>Last Updated:</strong> {{ formatDateTime(item.original.updatedAt) }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div><strong>Fuel Type:</strong> {{ item.original.fuelType?.name ?? item.original.fuelTypeName ?? '-' }}</div>
                      <div><strong>Transmission:</strong> {{ item.original.gearTypeName ?? '-' }}</div>
                      <div><strong>Engine Power:</strong> {{ item.original.enginePower ?? '-' }}</div>
                      <div><strong>Towing Capacity:</strong> {{ item.original.towingWeight ?? '-' }}</div>
                      <div><strong>Listing Type:</strong> {{ item.original.listingTypeName ?? '-' }}</div>
                      <div><strong>Published:</strong> {{ formatDateTime(item.original.publishedAt) }}</div>
                    </v-col>
                    <v-col cols="12">
                      <div class="mt-2"><strong>Description:</strong> {{ item.original.description ?? '-' }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mt-2"><strong>Equipment:</strong></div>
                      <div class="text-body-2">
                        {{
                          Array.isArray(item.original.equipment) && item.original.equipment.length > 0
                            ? item.original.equipment.map((eq: any) => eq.name ?? eq).join(', ')
                            : 'No equipment listed'
                        }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mt-2"><strong>Additional Info:</strong></div>
                      <div class="text-body-2">
                        {{
                          item.original.details
                            ? [
                                item.original.details?.color_name ? `Color: ${item.original.details.color_name}` : null,
                                item.original.details?.body_type_name ? `Body Type: ${item.original.details.body_type_name}` : null,
                                item.original.details?.fuel_efficiency ? `Fuel Efficiency: ${item.original.details.fuel_efficiency}` : null,
                                item.original.details?.co2_emissions ? `CO₂: ${item.original.details.co2_emissions}` : null,
                              ]
                                .filter(Boolean)
                                .join(', ') || '-'
                            : '-'
                        }}
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
    </v-card>

    <v-dialog v-model="imageDialog" max-width="900">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-semibold">
          {{ selectedVehicleTitle }}
        </v-card-title>
        <v-card-text>
          <div v-if="selectedVehicleImages.length === 0" class="text-body-2 text-medium-emphasis">
            No images available for this vehicle.
          </div>
          <v-carousel
            v-else
            v-model="selectedImageIndex"
            hide-delimiters
            height="400"
          >
            <v-carousel-item
              v-for="(image, index) in selectedVehicleImages"
              :key="image.id ?? index"
            >
              <v-img
                :src="image.url"
                height="400"
                cover
              />
            </v-carousel-item>
          </v-carousel>
          <v-row v-if="selectedVehicleImages.length > 1" dense class="mt-3">
            <v-col
              v-for="(image, index) in selectedVehicleImages"
              :key="`thumb-${image.id ?? index}`"
              cols="4"
              sm="3"
              md="2"
            >
              <v-img
                :src="image.url"
                height="70"
                cover
                class="rounded-sm"
                style="cursor: pointer;"
                @click="selectedImageIndex = index"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="imageDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getVehicles } from '@/api/dealer.api'
import type { VehicleImageModel, VehicleModel } from '@/models/vehicle.model'

const router = useRouter()
const search = ref('')
const loading = ref(false)
const loadError = ref<string | null>(null)

const headers = [
  { title: '#', key: 'slNo', sortable: false, width: '60px' },
  { title: 'Date', key: 'inventoryDate', width: '140px' },
  { title: 'Registration', key: 'registrationNumber', width: '150px' },
  { title: 'Status', key: 'status', width: '100px' },
  { title: 'Make', key: 'make', width: '100px' },
  { title: 'Model', key: 'model', width: '120px' },
  { title: 'Year', key: 'year', width: '80px' },
  { title: 'Price', key: 'listedPrice', width: '120px' },
  { title: '', key: 'actions', sortable: false, width: '60px', align: 'end' as const },
]

const vehicles = ref<VehicleModel[]>([])
const imageDialog = ref(false)
const selectedVehicleImages = ref<VehicleImageModel[]>([])
const selectedVehicleTitle = ref('')
const selectedImageIndex = ref(0)

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatPrice = (value?: number) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(value)
}


const tableVehicles = computed(() =>
  vehicles.value.map((vehicle, index) => ({
    id: vehicle.id,
    slNo: index + 1,
    inventoryDate: formatDateTime(vehicle.createdAt),
    registrationNumber: vehicle.registration ?? '-',
    status: vehicle.vehicleListStatusName ?? vehicle.status ?? '-',
    make: vehicle.brandName ?? '-',
    model: vehicle.modelName ?? '-',
    year: vehicle.modelYearName ?? '-',
    listedPrice: formatPrice(vehicle.price),
    images: vehicle.images ?? [],
    original: vehicle,
  }))
)

const openImageGallery = (vehicle: VehicleModel) => {
  selectedVehicleImages.value = vehicle.images ?? []
  selectedVehicleTitle.value = vehicle.title ?? 'Vehicle Images'
  selectedImageIndex.value = 0
  imageDialog.value = true
}

const loadVehicles = async () => {
  try {
    loading.value = true
    loadError.value = null
    const response = await getVehicles({ limit: 50, page: 1, search: search.value || undefined })
    vehicles.value = response.docs
  } catch (error: any) {
    loadError.value = error?.message || 'Failed to load vehicles'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadVehicles()
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'Sold':
      return 'default'
    default:
      return 'default'
  }
}

const viewVehicle = (item: any) => {
  // Navigate to vehicle detail page
  console.log('View vehicle:', item)
}

const editVehicle = (item: any) => {
  // Navigate to edit vehicle page
  console.log('Edit vehicle:', item)
}

const deleteVehicle = (item: any) => {
  if (confirm(`Are you sure you want to delete ${item.registrationNumber}?`)) {
    console.log('Delete vehicle:', item)
  }
}
</script>

<style module>
.dataTable :global(.v-data-table__thead th) {
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px !important;
  background-color: transparent !important;
  color: var(--muted-foreground);
}

.dataTable :global(.v-data-table__tbody td) {
  font-size: 0.75rem !important;
  padding: 8px 12px !important;
  height: auto !important;
  background-color: transparent !important;
}

.dataTable :global(.v-data-table__tbody tr) {
  border-bottom: none;
  background-color: transparent !important;
}

.dataTable :global(.v-data-table__tbody tr:hover) {
  background-color: transparent !important;
}

.dataTable :global(.v-data-table) {
  background-color: transparent !important;
}
</style>

<style scoped>
.filters-card {
  box-shadow: none !important;
}

.vehicles-table-card {
  box-shadow: none !important;
  overflow: hidden;
}

.vehicles-table-card :deep(.v-data-table) {
  box-shadow: none !important;
  border: none !important;
}

.action-btn {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  border-radius: 6px !important;
  text-transform: none !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
  min-width: auto !important;
  padding: 6px 12px !important;
  height: 32px !important;
}

.action-btn :deep(.v-btn__prepend) {
  margin-inline-end: 6px !important;
}

.action-btn :deep(.v-icon) {
  font-size: 16px !important;
}

.action-btn:hover {
  background-color: var(--muted) !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
}

.search-field :deep(.v-field) {
  box-shadow: none !important;
  border: none !important;
}

.search-field :deep(.v-field__input) {
  font-size: 0.8125rem;
  padding: 4px 8px;
}

.search-field :deep(.v-field__prepend-inner) {
  padding: 0 8px;
}

.vehicles-table :deep(.v-data-table-footer) {
  font-size: 0.6875rem;
  padding: 12px 16px;
  border-top: none !important;
  background-color: transparent !important;
}

.vehicles-table :deep(.v-data-table-footer__items-per-page) {
  font-size: 0.6875rem;
}

.vehicles-table :deep(.v-data-table-footer__pagination) {
  font-size: 0.6875rem;
}

.vehicles-table :deep(.v-data-table__thead) {
  border-bottom: none !important;
}

.vehicles-table :deep(.v-data-table__thead th) {
  padding: 12px 16px !important;
}

.vehicles-table :deep(.v-data-table__tbody td) {
  padding: 12px 16px !important;
}

.details-pre {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  padding: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.75rem;
}
</style>
