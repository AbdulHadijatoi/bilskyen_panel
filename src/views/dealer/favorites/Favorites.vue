<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Favorites</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage your favorite vehicles.
        </p>
      </div>
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
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="error" class="text-center py-8">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="favorites.docs.length === 0" class="text-center py-8">
          <p class="text-medium-emphasis">No favorite vehicles yet</p>
        </div>

        <div v-else class="d-flex flex-column gap-4">
          <v-row>
            <v-col
              v-for="vehicle in favorites.docs"
              :key="vehicle.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                variant="outlined"
                :style="{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }"
              >
                <v-card-title>{{ vehicle.title || vehicle.registration || 'Untitled' }}</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Price</div>
                    <div class="font-weight-medium">{{ formatPrice(vehicle.price) }}</div>
                  </div>
                  <div v-if="vehicle.year" class="mb-2">
                    <div class="text-caption text-medium-emphasis">Year</div>
                    <div>{{ vehicle.year }}</div>
                  </div>
                  <div v-if="vehicle.mileage" class="mb-2">
                    <div class="text-caption text-medium-emphasis">Mileage</div>
                    <div>{{ formatMileage(vehicle.mileage) }}</div>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    variant="text"
                    color="error"
                    prepend-icon="mdi-heart-remove"
                    @click="removeFavorite(vehicle.id)"
                  >
                    Remove
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="viewVehicle(vehicle.id)"
                  >
                    View
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <div v-if="favorites.totalPages && favorites.totalPages > 1" class="d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="favorites.totalPages"
              @update:model-value="loadFavorites"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFavorites, removeFavorite as removeFavoriteApi } from '@/api/dealer.api'
import type { PaginationModel, VehicleModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const favorites = ref<PaginationModel<VehicleModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)

const loadFavorites = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getFavorites({ page: currentPage.value, limit: 15 })
    favorites.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load favorites'
  } finally {
    loading.value = false
  }
}

const removeFavorite = async (vehicleId: number) => {
  try {
    await removeFavoriteApi(vehicleId)
    await loadFavorites()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to remove favorite'
  }
}

const viewVehicle = (vehicleId: number) => {
  router.push({ name: 'dealer.vehicles.overview' })
}

const formatPrice = (price?: number) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
  }).format(price)
}

const formatMileage = (mileage?: number) => {
  if (!mileage) return 'N/A'
  return new Intl.NumberFormat('da-DK').format(mileage) + ' km'
}

onMounted(() => {
  loadFavorites()
})
</script>

