<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Features</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage subscription features.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Feature
      </v-btn>
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

        <div v-else-if="features.length === 0" class="text-center py-8">
          <p class="text-medium-emphasis">No features yet</p>
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <v-card
            v-for="feature in features"
            :key="feature.id"
            variant="outlined"
            class="cursor-pointer"
            @click="viewFeature(feature.id)"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold">{{ feature.name || feature.key || 'N/A' }}</div>
                  <div class="text-caption text-medium-emphasis">{{ feature.description || 'No description' }}</div>
                  <div class="text-caption mt-1">Key: {{ feature.key }}</div>
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click.stop="viewFeature(feature.id)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="deleteFeature(feature.id)"
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

    <!-- Create Feature Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create Feature</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newFeature.name"
            label="Name"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newFeature.key"
            label="Key"
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="newFeature.description"
            label="Description (optional)"
            variant="outlined"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createFeature"
            :loading="creating"
            :disabled="!newFeature.name || !newFeature.key"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFeatures, createFeature, deleteFeature as deleteFeatureApi, type CreateFeatureData, type FeatureModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const features = ref<FeatureModel[]>([])
const showCreateDialog = ref(false)
const creating = ref(false)
const newFeature = ref<CreateFeatureData>({
  name: '',
  key: '',
  description: '',
})

const loadFeatures = async () => {
  try {
    loading.value = true
    error.value = null
    const featuresList = await getFeatures()
    features.value = featuresList
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load features'
  } finally {
    loading.value = false
  }
}

const createFeature = async () => {
  try {
    creating.value = true
    await createFeature(newFeature.value)
    showCreateDialog.value = false
    newFeature.value = { name: '', key: '', description: '' }
    await loadFeatures()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create feature'
  } finally {
    creating.value = false
  }
}

const viewFeature = (id: number) => {
  router.push({ name: 'admin.features.detail', params: { id } })
}

const deleteFeature = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this feature?')) return

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
.cursor-pointer {
  cursor: pointer;
}
</style>

