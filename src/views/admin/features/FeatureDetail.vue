<template>
  <div class="feature-detail">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <v-btn icon variant="text" @click="router.back()" class="mb-2"><v-icon>mdi-arrow-left</v-icon></v-btn>
        <h2 class="text-h5 font-weight-bold mb-1">Feature Details</h2>
        <p class="text-body-2 text-medium-emphasis">View and edit feature information.</p>
      </div>
      <v-btn v-if="feature" color="primary" prepend-icon="mdi-pencil" @click="editMode = !editMode">{{ editMode ? 'Cancel' : 'Edit' }}</v-btn>
    </div>

    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-body-1 text-medium-emphasis mt-4">Loading feature...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <v-alert type="error" variant="tonal" prominent><v-alert-title>Error</v-alert-title>{{ error }}</v-alert>
    </div>

    <div v-else-if="feature" class="d-flex flex-column gap-4">
      <v-card variant="elevated" elevation="1" class="feature-section-card">
        <v-card-title class="d-flex align-center">
          <v-avatar :color="getValueTypeColor(feature.feature_value_type_id)" size="40" class="mr-3">
            <v-icon color="white">{{ getValueTypeIcon(feature.feature_value_type_id) }}</v-icon>
          </v-avatar>
          Feature Information
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="editFormRef" v-model="editFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="featureData.key" label="Feature Key *" variant="outlined" :readonly="true" :rules="[v => !!v || 'Required', v => !v || /^[a-z0-9_-]+$/.test(v) || 'Invalid format']" prepend-inner-icon="mdi-key" class="mb-4" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="featureData.feature_value_type_id" :items="valueTypeOptions" item-title="label" item-value="value" label="Value Type *" variant="outlined" :readonly="!editMode" :rules="[v => !!v || 'Required']" prepend-inner-icon="mdi-format-list-bulleted-type" class="mb-4" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="featureData.description" label="Description *" variant="outlined" :readonly="!editMode" :rules="[v => !!v || 'Required']" rows="4" prepend-inner-icon="mdi-text" class="mb-4" />
              </v-col>
            </v-row>
            <v-row v-if="!editMode">
              <v-col cols="12" md="6">
                <v-card variant="tonal" color="info" class="pa-3">
                  <div class="text-caption text-medium-emphasis mb-1">Feature ID</div>
                  <div class="text-h6 font-weight-bold">{{ feature.id }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="tonal" color="primary" class="pa-3">
                  <div class="text-caption text-medium-emphasis mb-1">Created At</div>
                  <div class="text-h6 font-weight-bold">{{ formatDate(feature.created_at) }}</div>
                </v-card>
              </v-col>
            </v-row>
            <div v-if="editMode" class="mt-4">
              <v-btn color="primary" @click="updateFeature" :loading="updating" :disabled="!editFormValid" prepend-icon="mdi-check" size="large">Update Feature</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>

      <v-card variant="elevated" elevation="1" class="feature-section-card">
        <v-card-title><v-icon start>mdi-package-variant</v-icon> Plans Using This Feature</v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="loadingPlans" class="text-center py-4"><v-progress-circular indeterminate color="primary" size="small" /></div>
          <div v-else-if="plansUsingFeature.length === 0" class="text-center py-4 text-medium-emphasis">No plans are using this feature yet</div>
          <div v-else class="d-flex flex-column gap-2">
            <v-card v-for="plan in plansUsingFeature" :key="plan.id" variant="elevated" elevation="1" class="cursor-pointer feature-plan-card" @click="viewPlan(plan.id)">
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="font-weight-medium">{{ plan.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ plan.slug }}</div>
                    <div class="text-caption mt-1">Value: <strong>{{ plan.pivot?.value || 'N/A' }}</strong></div>
                  </div>
                  <v-icon>mdi-chevron-right</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFeature, updateFeature as updateFeatureApi, getPlans, type UpdateFeatureData, type FeatureModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const loadingPlans = ref(false)
const error = ref<string | null>(null)
const feature = ref<FeatureModel | null>(null)
const plansUsingFeature = ref<any[]>([])
const featureData = ref<UpdateFeatureData>({ key: '', feature_value_type_id: 0, description: '' })
const editMode = ref(false)
const updating = ref(false)
const editFormValid = ref(false)
const editFormRef = ref()
const valueTypeOptions = [
  { label: 'Boolean', value: 1, description: 'True/False values' },
  { label: 'Number', value: 2, description: 'Numeric values' },
  { label: 'Text', value: 3, description: 'Text values' },
]

const getValueTypeColor = (typeId: number) => {
  const colors: Record<number, string> = { 1: 'success', 2: 'primary', 3: 'info' }
  return colors[typeId] || 'grey'
}
const getValueTypeIcon = (typeId: number) => {
  const icons: Record<number, string> = { 1: 'mdi-toggle-switch', 2: 'mdi-numeric', 3: 'mdi-text' }
  return icons[typeId] || 'mdi-help-circle'
}
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const loadFeature = async () => {
  const featureId = route.params.id as string
  if (!featureId) return
  try {
    loading.value = true
    error.value = null
    const loadedFeature = await getFeature(featureId)
    feature.value = loadedFeature
    featureData.value = { key: loadedFeature.key, feature_value_type_id: loadedFeature.feature_value_type_id, description: loadedFeature.description || '' }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load feature'
  } finally {
    loading.value = false
  }
}
const loadPlansUsingFeature = async () => {
  if (!feature.value) return
  try {
    loadingPlans.value = true
    const allPlans = await getPlans()
    plansUsingFeature.value = allPlans.filter((plan: any) => plan.features?.some((f: any) => f.id === feature.value?.id)).map((plan: any) => {
      const planFeature = plan.features?.find((f: any) => f.id === feature.value?.id)
      return { ...plan, pivot: planFeature?.pivot }
    })
  } catch (err) {
    console.error('Failed to load plans:', err)
  } finally {
    loadingPlans.value = false
  }
}
const updateFeature = async () => {
  if (!feature.value || !editFormValid.value) return
  try {
    updating.value = true
    // Don't send the key field - it should never be changed
    const { key, ...updateData } = featureData.value
    const updatedFeature = await updateFeatureApi(feature.value.id, updateData)
    feature.value = updatedFeature
    editMode.value = false
    error.value = null
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update feature'
  } finally {
    updating.value = false
  }
}
const viewPlan = (id: number) => {
  router.push({ name: 'admin.plans.detail', params: { id } })
}

onMounted(async () => {
  await loadFeature()
  await loadPlansUsingFeature()
})
</script>

<style scoped>
.feature-detail {
  padding: 0;
}

.feature-section-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-section-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
}

.feature-plan-card {
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-plan-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  transform: translateY(-2px);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
