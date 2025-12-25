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
        <h2 class="text-h5 font-weight-bold mb-1">Dealer Details</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and edit dealer information.
        </p>
      </div>
      <v-btn
        v-if="dealer"
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

    <v-card v-else-if="dealer" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="dealerData.name"
              label="Name"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="dealerData.email"
              label="Email"
              type="email"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="dealerData.phone"
              label="Phone"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="dealerData.address"
              label="Address"
              variant="outlined"
              :readonly="!editMode"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" v-if="editMode">
            <v-btn
              color="primary"
              @click="updateDealer"
              :loading="updating"
            >
              Update Dealer
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
import { getDealer, updateDealer as updateDealerApi, type UpdateDealerData } from '@/api/admin.api'
import type { DealerModel } from '@/models/dealer.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const dealer = ref<DealerModel | null>(null)
const dealerData = ref<UpdateDealerData>({
  name: '',
  email: '',
  phone: '',
  address: '',
})
const editMode = ref(false)
const updating = ref(false)

const loadDealer = async () => {
  const dealerId = route.params.id as string
  if (!dealerId) return

  try {
    loading.value = true
    error.value = null
    const loadedDealer = await getDealer(dealerId)
    dealer.value = loadedDealer
    dealerData.value = {
      name: loadedDealer.name || '',
      email: loadedDealer.email || '',
      phone: loadedDealer.phone || '',
      address: loadedDealer.address || '',
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load dealer'
  } finally {
    loading.value = false
  }
}

const updateDealer = async () => {
  if (!dealer.value) return

  try {
    updating.value = true
    const updatedDealer = await updateDealerApi(dealer.value.id, dealerData.value)
    dealer.value = updatedDealer
    editMode.value = false
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update dealer'
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  loadDealer()
})
</script>

