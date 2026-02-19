<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Saved Searches</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage your saved search filters for quick access.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Save Search
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
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="error" class="text-center py-8">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="savedSearches.length === 0" class="text-center py-8">
          <p class="text-medium-emphasis">No saved searches yet</p>
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <v-card
            v-for="search in savedSearches.filter(s => s && s.id)"
            :key="search.id"
            variant="outlined"
            :style="{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold mb-1">{{ search.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatFilters(search.filters) }}
                  </div>
                  <div v-if="search.createdAt" class="text-caption text-medium-emphasis mt-1">
                    Saved {{ formatDate(search.createdAt) }}
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="applySearch(search)"
                  >
                    Apply
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="deleteSearch(search.id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Create Saved Search Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Save Search</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSearchName"
            label="Search Name"
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="newSearchFilters"
            label="Filters (JSON)"
            variant="outlined"
            rows="5"
            hint="Enter search filters as JSON"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createSearch"
            :loading="creating"
            :disabled="!newSearchName.trim()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  type SavedSearchModel,
  type CreateSavedSearchData,
} from '@/api/staff.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const savedSearches = ref<SavedSearchModel[]>([])
const showCreateDialog = ref(false)
const newSearchName = ref('')
const newSearchFilters = ref('')
const creating = ref(false)

const loadSearches = async () => {
  try {
    loading.value = true
    error.value = null
    const searches = await getSavedSearches()
    savedSearches.value = searches
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load saved searches'
  } finally {
    loading.value = false
  }
}

const createSearch = async () => {
  if (!newSearchName.value.trim()) return

  try {
    creating.value = true
    let filters: Record<string, any> = {}
    if (typeof newSearchFilters.value === 'string' && newSearchFilters.value.trim()) {
      try {
        filters = JSON.parse(newSearchFilters.value)
      } catch (e) {
        error.value = 'Invalid JSON format for filters'
        return
      }
    }

    await saveSearch({
      name: newSearchName.value,
      filters,
    })
    showCreateDialog.value = false
    newSearchName.value = ''
    newSearchFilters.value = ''
    await loadSearches()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to save search'
  } finally {
    creating.value = false
  }
}

const deleteSearch = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this saved search?')) return

  try {
    await deleteSavedSearch(id)
    await loadSearches()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete search'
  }
}

const applySearch = (search: SavedSearchModel) => {
  // Navigate to vehicles with filters applied
  router.push({
    name: 'staff.vehicles.overview',
    query: search.filters,
  })
}

const formatFilters = (filters: Record<string, any>) => {
  if (!filters || Object.keys(filters).length === 0) return 'No filters'
  return Object.entries(filters)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadSearches()
})
</script>

