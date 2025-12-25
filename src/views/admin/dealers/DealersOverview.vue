<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Dealers</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage all dealers in the system.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Dealer
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

        <v-data-table
          v-else
          :headers="headers"
          :items="dealers.docs"
          :items-per-page="dealers.limit"
          :page="dealers.page"
          @update:page="loadDealers"
        >
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="viewDealer(item.id)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="deleteDealer(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="dealers.totalPages && dealers.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="dealers.totalPages"
            @update:model-value="loadDealers"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Create Dealer Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create Dealer</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDealer.name"
            label="Name"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newDealer.email"
            label="Email (optional)"
            type="email"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newDealer.phone"
            label="Phone (optional)"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newDealer.address"
            label="Address (optional)"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createDealer"
            :loading="creating"
            :disabled="!newDealer.name"
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
import { getDealers, createDealer, deleteDealer as deleteDealerApi, type CreateDealerData } from '@/api/admin.api'
import type { PaginationModel, DealerModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const dealers = ref<PaginationModel<DealerModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)
const showCreateDialog = ref(false)
const creating = ref(false)
const newDealer = ref<CreateDealerData>({
  name: '',
  email: '',
  phone: '',
  address: '',
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadDealers = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getDealers({ page: currentPage.value, limit: 15 })
    dealers.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load dealers'
  } finally {
    loading.value = false
  }
}

const createDealer = async () => {
  try {
    creating.value = true
    await createDealer(newDealer.value)
    showCreateDialog.value = false
    newDealer.value = { name: '', email: '', phone: '', address: '' }
    await loadDealers()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create dealer'
  } finally {
    creating.value = false
  }
}

const viewDealer = (id: number) => {
  router.push({ name: 'admin.dealers.detail', params: { id } })
}

const deleteDealer = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this dealer?')) return

  try {
    await deleteDealerApi(id)
    await loadDealers()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete dealer'
  }
}

onMounted(() => {
  loadDealers()
})
</script>

