<template>
  <div class="features-overview">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Features</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage subscription plan features with different value types.
        </p>
      </div>
    </div>

    <!-- Features Grid -->
    <v-card variant="elevated" elevation="1" class="features-section-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Features ({{ validFeatures.length }})</span>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="loadFeatures"
          :loading="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-0">
        <div v-if="loading && validFeatures.length === 0" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="text-body-1 text-medium-emphasis mt-4">Loading features...</p>
        </div>

        <div v-else-if="error" class="pa-4">
          <v-alert type="error" variant="tonal" prominent>
            <v-alert-title>Error</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="validFeatures.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-feature-search</v-icon>
          <p class="text-h6 text-medium-emphasis mb-2">No features found</p>
          <p class="text-body-2 text-medium-emphasis">Features are managed through database migrations.</p>
        </div>

        <v-row v-else class="pa-4">
          <v-col
            v-for="feature in validFeatures"
            :key="feature.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card
              variant="elevated"
              elevation="1"
              class="feature-card h-100"
              :class="{ 'cursor-pointer': true }"
              @click="viewFeature(feature.id)"
            >
              <v-card-text>
                <div class="d-flex align-center mb-3">
                  <v-avatar
                    :color="getValueTypeColor(feature.feature_value_type_id)"
                    size="48"
                    class="mr-3"
                  >
                    <v-icon color="white">{{ getValueTypeIcon(feature.feature_value_type_id) }}</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-h6 font-weight-bold">{{ feature.key }}</div>
                    <v-chip
                      :color="getValueTypeColor(feature.feature_value_type_id)"
                      size="x-small"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ getValueTypeName(feature.feature_value_type_id) }}
                    </v-chip>
                  </div>
                </div>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  {{ feature.description || 'No description provided' }}
                </p>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">
                    ID: {{ feature.id }}
                  </span>
                  <div class="d-flex gap-1">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="viewFeature(feature.id)"
                      color="primary"
                    >
                      <v-icon size="small">mdi-eye</v-icon>
                      <v-tooltip activator="parent">View Details</v-tooltip>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="deleteFeature(feature.id)"
                      color="error"
                    >
                      <v-icon size="small">mdi-delete</v-icon>
                      <v-tooltip activator="parent">Delete</v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getFeatures,
  deleteFeature as deleteFeatureApi,
  type FeatureModel
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const features = ref<FeatureModel[]>([])

// Computed property to ensure we only have valid features with IDs
const validFeatures = computed(() => {
  return features.value.filter(f => f != null && f.id != null && typeof f.id === 'number')
})


const getValueTypeColor = (typeId: number) => {
  const colors: Record<number, string> = {
    1: 'success',  // Boolean
    2: 'primary',  // Number
    3: 'info',     // Text
  }
  return colors[typeId] || 'grey'
}

const getValueTypeIcon = (typeId: number) => {
  const icons: Record<number, string> = {
    1: 'mdi-toggle-switch',
    2: 'mdi-numeric',
    3: 'mdi-text',
  }
  return icons[typeId] || 'mdi-help-circle'
}

const getValueTypeName = (typeId: number) => {
  const types: Record<number, string> = {
    1: 'Boolean',
    2: 'Number',
    3: 'Text',
  }
  return types[typeId] || 'Unknown'
}

const loadFeatures = async () => {
  try {
    loading.value = true
    error.value = null
    const featuresList = await getFeatures()
    // Filter out any null/undefined values and ensure it's an array
    features.value = Array.isArray(featuresList) 
      ? featuresList.filter(f => f != null && f.id != null)
      : []
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load features'
    features.value = []
  } finally {
    loading.value = false
  }
}

const viewFeature = (id: number) => {
  router.push({ name: 'admin.features.detail', params: { id } })
}

const deleteFeature = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this feature? This action cannot be undone.')) return

  try {
    await deleteFeatureApi(id)
    await loadFeatures()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete feature'
  }
}

onMounted(() => {
  loadFeatures()
})
</script>

<style scoped>
.features-overview {
  padding: 0;
}

.features-section-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.features-section-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

.feature-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
