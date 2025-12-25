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
        <h2 class="text-h5 font-weight-bold mb-1">Page Editor</h2>
        <p class="text-body-2 text-medium-emphasis">
          Edit page content and settings.
        </p>
      </div>
      <v-btn
        v-if="page"
        color="primary"
        @click="updatePage"
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

    <v-card v-else-if="page" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="pageData.title"
              label="Title"
              variant="outlined"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="pageData.slug"
              label="Slug"
              variant="outlined"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="pageData.content"
              label="Content"
              variant="outlined"
              rows="15"
              class="mb-2"
            />
          </v-col>
          <v-col cols="12">
            <v-btn
              color="success"
              @click="publishPage"
              :loading="publishing"
            >
              Publish
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
import { getPage, updatePage as updatePageApi, publishPage as publishPageApi, type UpdatePageData, type PageModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const page = ref<PageModel | null>(null)
const pageData = ref<UpdatePageData>({
  title: '',
  slug: '',
  content: '',
})
const updating = ref(false)
const publishing = ref(false)

const loadPage = async () => {
  const pageId = route.params.id as string
  if (!pageId) return

  try {
    loading.value = true
    error.value = null
    const loadedPage = await getPage(pageId)
    page.value = loadedPage
    pageData.value = {
      title: loadedPage.title,
      slug: loadedPage.slug,
      content: loadedPage.content || '',
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load page'
  } finally {
    loading.value = false
  }
}

const updatePage = async () => {
  if (!page.value) return

  try {
    updating.value = true
    const updatedPage = await updatePageApi(page.value.id, pageData.value)
    page.value = updatedPage
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update page'
  } finally {
    updating.value = false
  }
}

const publishPage = async () => {
  if (!page.value) return

  try {
    publishing.value = true
    const publishedPage = await publishPageApi(page.value.id)
    page.value = publishedPage
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to publish page'
  } finally {
    publishing.value = false
  }
}

onMounted(() => {
  loadPage()
})
</script>

