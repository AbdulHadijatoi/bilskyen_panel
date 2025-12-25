<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          class="mb-2"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h5 font-weight-bold mb-1">Feature Details</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and edit feature information.
        </p>
      </div>
      <v-btn
        v-if="feature"
        color="primary"
        prepend-icon="mdi-pencil"
        @click="editMode = !editMode"
      >
        {{ editMode ? 'Cancel' : 'Edit' }}
      </v-btn>
    </div>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal">
        {{ error }}
      </v-alert>
    </div>

    <v-card v-else-if="feature" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="featureData.name"
              label="Name"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="featureData.key"
              label="Key"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="featureData.description"
              label="Description"
              variant="outlined"
              :readonly="!editMode"
              rows="3"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" v-if="editMode">
            <v-btn
              color="primary"
              @click="updateFeature"
              :loading="updating"
            >
              Update Feature
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFeature, updateFeature as updateFeatureApi, type UpdateFeatureData, type FeatureModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const feature = ref<FeatureModel | null>(null)
const featureData = ref<UpdateFeatureData>({
  name: '',
  key: '',
  description: '',
})
const editMode = ref(false)
const updating = ref(false)

const loadFeature = async () => {
  const featureId = route.params.id as string
  if (!featureId) return

  try {
    loading.value = true
    error.value = null
    const loadedFeature = await getFeature(featureId)
    feature.value = loadedFeature
    featureData.value = {
      name: loadedFeature.name,
      key: loadedFeature.key,
      description: loadedFeature.description || '',
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load feature'
  } finally {
    loading.value = false
  }
}

const updateFeature = async () => {
  if (!feature.value) return

  try {
    updating.value = true
    const updatedFeature = await updateFeatureApi(feature.value.id, featureData.value)
    feature.value = updatedFeature
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update feature'
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  loadFeature()
})
</script>

