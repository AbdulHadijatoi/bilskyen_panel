<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Vehicles</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage all vehicles from all dealers.
        </p>
      </div>
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
          :items="vehicles.docs"
          :items-per-page="vehicles.limit"
          :page="vehicles.page"
          @update:page="loadVehicles"
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
              @click="viewVehicle(item.id)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="deleteVehicle(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="vehicles.totalPages && vehicles.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="vehicles.totalPages"
            @update:model-value="loadVehicles"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVehicles, deleteVehicle as deleteVehicleApi } from '@/api/admin.api'
import type { PaginationModel, VehicleModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const vehicles = ref<PaginationModel<VehicleModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Registration', key: 'registration' },
  { title: 'Price', key: 'price' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadVehicles = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getVehicles({ page: currentPage.value, limit: 15 })
    vehicles.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load vehicles'
  } finally {
    loading.value = false
  }
}

const viewVehicle = (id: number) => {
  router.push({ name: 'admin.vehicles.detail', params: { id } })
}

const deleteVehicle = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this vehicle?')) return

  try {
    await deleteVehicleApi(id)
    await loadVehicles()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete vehicle'
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

onMounted(() => {
  loadVehicles()
})
</script>

