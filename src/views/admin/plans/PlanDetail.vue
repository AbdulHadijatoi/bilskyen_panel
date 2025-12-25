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
        <h2 class="text-h5 font-weight-bold mb-1">Plan Details</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and edit plan information and features.
        </p>
      </div>
      <v-btn
        v-if="plan"
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

    <div v-else-if="plan" class="d-flex flex-column gap-4">
      <v-card variant="outlined">
        <v-card-title>Plan Information</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="planData.name"
                label="Name"
                variant="outlined"
                :readonly="!editMode"
                class="mb-2"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="planData.price"
                label="Price"
                type="number"
                variant="outlined"
                :readonly="!editMode"
                class="mb-2"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="planData.description"
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
                @click="updatePlan"
                :loading="updating"
              >
                Update Plan
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title>Features</v-card-title>
        <v-card-text>
          <div v-if="loadingFeatures" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="small" />
          </div>
          <div v-else-if="features.length === 0" class="text-center text-medium-emphasis py-4">
            No features assigned
          </div>
          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="feature in features"
              :key="feature.id"
              variant="outlined"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="font-weight-medium">{{ feature.name || feature.key || 'N/A' }}</div>
                    <div class="text-caption text-medium-emphasis">
                      Value: {{ feature.value || 'N/A' }}
                    </div>
                  </div>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click="removeFeature(feature.id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
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
import { getPlan, updatePlan as updatePlanApi, getPlanFeatures, removeFeature as removeFeatureApi, type UpdatePlanData, type PlanModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingFeatures = ref(false)
const error = ref<string | null>(null)
const plan = ref<PlanModel | null>(null)
const planData = ref<UpdatePlanData>({
  name: '',
  description: '',
  price: 0,
})
const features = ref<any[]>([])
const editMode = ref(false)
const updating = ref(false)

const loadPlan = async () => {
  const planId = route.params.id as string
  if (!planId) return

  try {
    loading.value = true
    error.value = null
    const loadedPlan = await getPlan(planId)
    plan.value = loadedPlan
    planData.value = {
      name: loadedPlan.name,
      description: loadedPlan.description || '',
      price: loadedPlan.price,
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load plan'
  } finally {
    loading.value = false
  }
}

const loadFeatures = async () => {
  const planId = route.params.id as string
  if (!planId) return

  try {
    loadingFeatures.value = true
    const featuresList = await getPlanFeatures(planId)
    features.value = featuresList
  } catch (err) {
    console.error('Failed to load features:', err)
  } finally {
    loadingFeatures.value = false
  }
}

const updatePlan = async () => {
  if (!plan.value) return

  try {
    updating.value = true
    const updatedPlan = await updatePlanApi(plan.value.id, planData.value)
    plan.value = updatedPlan
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update plan'
  } finally {
    updating.value = false
  }
}

const removeFeature = async (featureId: number | string) => {
  if (!plan.value) return

  try {
    await removeFeatureApi(plan.value.id, featureId)
    await loadFeatures()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to remove feature'
  }
}

onMounted(async () => {
  await Promise.all([loadPlan(), loadFeatures()])
})
</script>

