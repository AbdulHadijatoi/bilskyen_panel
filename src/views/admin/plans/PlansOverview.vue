<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Plans</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage subscription plans.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Plan
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

        <div v-else-if="plans.length === 0" class="text-center py-8">
          <p class="text-medium-emphasis">No plans yet</p>
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <v-card
            v-for="plan in plans"
            :key="plan.id"
            variant="outlined"
            class="cursor-pointer"
            @click="viewPlan(plan.id)"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold">{{ plan.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ plan.description || 'No description' }}</div>
                  <div class="text-caption mt-1">Price: {{ formatPrice(plan.price) }}</div>
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click.stop="viewPlan(plan.id)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="deletePlan(plan.id)"
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

    <!-- Create Plan Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create Plan</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newPlan.name"
            label="Name"
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="newPlan.description"
            label="Description (optional)"
            variant="outlined"
            rows="3"
            class="mb-2"
          />
          <v-text-field
            v-model.number="newPlan.price"
            label="Price"
            type="number"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newPlan.interval"
            label="Interval (monthly/yearly)"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createPlan"
            :loading="creating"
            :disabled="!newPlan.name || !newPlan.price"
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
import { getPlans, createPlan, deletePlan as deletePlanApi, type CreatePlanData, type PlanModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const plans = ref<PlanModel[]>([])
const showCreateDialog = ref(false)
const creating = ref(false)
const newPlan = ref<CreatePlanData>({
  name: '',
  description: '',
  price: 0,
  interval: 'monthly',
})

const loadPlans = async () => {
  try {
    loading.value = true
    error.value = null
    const plansList = await getPlans()
    plans.value = plansList
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load plans'
  } finally {
    loading.value = false
  }
}

const createPlan = async () => {
  try {
    creating.value = true
    await createPlan(newPlan.value)
    showCreateDialog.value = false
    newPlan.value = { name: '', description: '', price: 0, interval: 'monthly' }
    await loadPlans()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create plan'
  } finally {
    creating.value = false
  }
}

const viewPlan = (id: number) => {
  router.push({ name: 'admin.plans.detail', params: { id } })
}

const deletePlan = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this plan?')) return

  try {
    await deletePlanApi(id)
    await loadPlans()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete plan'
  }
}

const formatPrice = (price?: number) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
  }).format(price)
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

