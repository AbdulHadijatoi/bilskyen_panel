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
        :items="vehicles"
        :search="search"
        :items-per-page="15"
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
                  prepend-icon="mdi-eye"
                  title="View"
                  class="text-caption"
                  @click="viewVehicle(item)"
                />
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Edit"
                  class="text-caption"
                  @click="editVehicle(item)"
                />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete"
                  class="text-caption text-error"
                  @click="deleteVehicle(item)"
                />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')

const headers = [
  { title: '#', key: 'slNo', sortable: false, width: '60px' },
  { title: 'Date', key: 'inventoryDate', width: '140px' },
  { title: 'Registration', key: 'registrationNumber', width: '150px' },
  { title: 'Status', key: 'status', width: '100px' },
  { title: 'Make', key: 'make', width: '100px' },
  { title: 'Model', key: 'model', width: '120px' },
  { title: 'Year', key: 'year', width: '80px' },
  { title: 'Price', key: 'listedPrice', width: '120px' },
  { title: '', key: 'actions', sortable: false, width: '60px', align: 'end' },
]

const vehicles = ref([
  {
    slNo: 1,
    inventoryDate: '15/01/2024, 10:00 AM',
    registrationNumber: 'KL-01-AB-1234',
    status: 'Available',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    listedPrice: '₹25,00,000',
  },
  {
    slNo: 2,
    inventoryDate: '14/01/2024, 2:30 PM',
    registrationNumber: 'KL-02-CD-5678',
    status: 'Pending',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    listedPrice: '₹18,50,000',
  },
])

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
</style>
