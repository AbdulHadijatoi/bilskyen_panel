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
        <h2 class="text-h5 font-weight-bold mb-1">Blog Editor</h2>
        <p class="text-body-2 text-medium-emphasis">
          Edit blog post content and settings.
        </p>
      </div>
      <v-btn
        v-if="blog"
        color="primary"
        @click="updateBlog"
        :loading="updating"
      >
        Save Changes
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

    <v-card v-else-if="blog" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogData.title"
              label="Title"
              variant="outlined"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogData.slug"
              label="Slug"
              variant="outlined"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="blogData.excerpt"
              label="Excerpt"
              variant="outlined"
              rows="2"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="blogData.content"
              label="Content"
              variant="outlined"
              rows="15"
              class="mb-2"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlog, updateBlog as updateBlogApi, type UpdateBlogData, type BlogModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const blog = ref<BlogModel | null>(null)
const blogData = ref<UpdateBlogData>({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
})
const updating = ref(false)

const loadBlog = async () => {
  const blogId = route.params.id as string
  if (!blogId) return

  try {
    loading.value = true
    error.value = null
    const loadedBlog = await getBlog(blogId)
    blog.value = loadedBlog
    blogData.value = {
      title: loadedBlog.title,
      slug: loadedBlog.slug,
      content: loadedBlog.content || '',
      excerpt: loadedBlog.excerpt || '',
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load blog'
  } finally {
    loading.value = false
  }
}

const updateBlog = async () => {
  if (!blog.value) return

  try {
    updating.value = true
    const updatedBlog = await updateBlogApi(blog.value.id, blogData.value)
    blog.value = updatedBlog
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update blog'
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  loadBlog()
})
</script>

