<template>
  <div>
    <div class="mb-4">
      <h2 class="text-h5 font-weight-bold mb-1">Audit Logs</h2>
      <p class="text-body-2 text-medium-emphasis">
        View system audit logs and activity history.
      </p>
    </div>

    <v-card variant="outlined">
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <v-text-field
            v-model="search"
            placeholder="Search audit logs..."
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            class="max-w-sm"
            hide-details
          />
          <div class="d-flex gap-2">
            <v-btn variant="outlined" density="compact" prepend-icon="mdi-filter">
              Filter
            </v-btn>
          </div>
        </div>

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
          :items="auditLogs.docs"
          :items-per-page="auditLogs.limit"
          :page="auditLogs.page"
          @update:page="loadAuditLogs"
        >
          <template #item.action="{ item }">
            <v-chip size="small" variant="flat">
              {{ item.action }}
            </v-chip>
          </template>
          <template #item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
        </v-data-table>

        <div v-if="auditLogs.totalPages && auditLogs.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="auditLogs.totalPages"
            @update:model-value="loadAuditLogs"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuditLogs, type AuditLogModel } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const loading = ref(false)
const error = ref<string | null>(null)
const auditLogs = ref<PaginationModel<AuditLogModel>>({
  docs: [],
  limit: 15,
  page: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})
const currentPage = ref(1)
const search = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'User ID', key: 'user_id' },
  { title: 'Action', key: 'action' },
  { title: 'Resource Type', key: 'resource_type' },
  { title: 'Resource ID', key: 'resource_id' },
  { title: 'Date', key: 'createdAt' },
]

const loadAuditLogs = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getAuditLogs({ page: currentPage.value, limit: 15 })
    auditLogs.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load audit logs'
  } finally {
    loading.value = false
  }
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadAuditLogs()
})
</script>

