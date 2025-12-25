<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Pages</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage CMS pages.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Page
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
          :items="pages.docs"
          :items-per-page="pages.limit"
          :page="pages.page"
          @update:page="loadPages"
        >
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              {{ item.status || 'N/A' }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="viewPage(item.id)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="deletePage(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="pages.totalPages && pages.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="pages.totalPages"
            @update:model-value="loadPages"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Create Page Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create Page</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newPage.title"
            label="Title"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newPage.slug"
            label="Slug"
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="newPage.content"
            label="Content (optional)"
            variant="outlined"
            rows="5"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createPage"
            :loading="creating"
            :disabled="!newPage.title || !newPage.slug"
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
import { getPages, createPage, deletePage as deletePageApi, type CreatePageData, type PageModel } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const pages = ref<PaginationModel<PageModel>>({
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
const newPage = ref<CreatePageData>({
  title: '',
  slug: '',
  content: '',
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Slug', key: 'slug' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadPages = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getPages({ page: currentPage.value, limit: 15 })
    pages.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load pages'
  } finally {
    loading.value = false
  }
}

const createPage = async () => {
  try {
    creating.value = true
    await createPage(newPage.value)
    showCreateDialog.value = false
    newPage.value = { title: '', slug: '', content: '' }
    await loadPages()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create page'
  } finally {
    creating.value = false
  }
}

const viewPage = (id: number) => {
  router.push({ name: 'admin.pages.detail', params: { id } })
}

const deletePage = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this page?')) return

  try {
    await deletePageApi(id)
    await loadPages()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete page'
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    published: 'success',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
}

onMounted(() => {
  loadPages()
})
</script>

