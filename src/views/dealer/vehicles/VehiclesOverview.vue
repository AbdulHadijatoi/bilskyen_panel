<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Vehicles</h2>
        <p class="text-body-2 text-medium-emphasis">
          Here you can manage your vehicles. You can add, edit, or delete
          vehicles as needed. Use the table below to view and manage your
          vehicle inventory.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :to="{ name: 'dealer.vehicles.add' }"
      >
        Add Vehicle
      </v-btn>
    </div>

    <v-card
      variant="outlined"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        borderColor: 'var(--border)',
      }"
    >
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <v-text-field
            v-model="search"
            placeholder="Search vehicles..."
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="max-w-sm"
            hide-details
          />
          <div class="d-flex gap-2">
            <v-btn variant="outlined" density="compact" prepend-icon="mdi-filter">
              Filter
            </v-btn>
            <v-btn variant="outlined" density="compact" prepend-icon="mdi-sort">
              Sort
            </v-btn>
          </div>
        </div>

        <v-data-table
          :headers="headers"
          :items="vehicles"
          :search="search"
          :items-per-page="10"
        >
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              {{ item.status }}
            </v-chip>
          </template>
          <template #item.actions>
            <v-btn icon variant="text" size="small">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

const headers = [
  { title: 'Sl No.', key: 'slNo', sortable: false },
  { title: 'Inventory Date', key: 'inventoryDate' },
  { title: 'Registration Number', key: 'registrationNumber' },
  { title: 'Status', key: 'status' },
  { title: 'Make', key: 'make' },
  { title: 'Model', key: 'model' },
  { title: 'Year', key: 'year' },
  { title: 'Listed Price', key: 'listedPrice' },
  { title: 'Actions', key: 'actions', sortable: false },
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
      return 'primary'
    case 'Pending':
      return 'secondary'
    default:
      return 'default'
  }
}
</script>
