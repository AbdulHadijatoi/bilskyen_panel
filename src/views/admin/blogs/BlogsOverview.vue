<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Manage Blogs</h2>
        <p class="text-body-2 text-medium-emphasis">
          View and manage blog posts.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Blog
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
          :items="blogs.docs"
          :items-per-page="blogs.limit"
          :page="blogs.page"
          @update:page="loadBlogs"
        >
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="viewBlog(item.id)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="deleteBlog(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <div v-if="blogs.totalPages && blogs.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="blogs.totalPages"
            @update:model-value="loadBlogs"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Create Blog Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Create Blog</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newBlog.title"
            label="Title"
            variant="outlined"
            class="mb-2"
          />
          <v-text-field
            v-model="newBlog.slug"
            label="Slug"
            variant="outlined"
            class="mb-2"
          />
          <v-textarea
            v-model="newBlog.content"
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
            @click="createBlog"
            :loading="creating"
            :disabled="!newBlog.title || !newBlog.slug"
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
import { getBlogs, createBlog, deleteBlog as deleteBlogApi, type CreateBlogData, type BlogModel } from '@/api/admin.api'
import type { PaginationModel } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const blogs = ref<PaginationModel<BlogModel>>({
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
const newBlog = ref<CreateBlogData>({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Slug', key: 'slug' },
  { title: 'Created', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadBlogs = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getBlogs({ page: currentPage.value, limit: 15 })
    blogs.value = response
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load blogs'
  } finally {
    loading.value = false
  }
}

const createBlog = async () => {
  try {
    creating.value = true
    await createBlog(newBlog.value)
    showCreateDialog.value = false
    newBlog.value = { title: '', slug: '', content: '', excerpt: '' }
    await loadBlogs()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to create blog'
  } finally {
    creating.value = false
  }
}

const viewBlog = (id: number) => {
  router.push({ name: 'admin.blogs.detail', params: { id } })
}

const deleteBlog = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this blog?')) return

  try {
    await deleteBlogApi(id)
    await loadBlogs()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete blog'
  }
}

onMounted(() => {
  loadBlogs()
})
</script>

