<template>
  <div class="panel-page">
    <PageHeader
      title="Page Editor"
      subtitle="Edit page content and settings."
      show-back
    >
      <template #actions>
        <v-btn
          v-if="page"
          color="primary"
          @click="updatePage"
          :loading="updating"
        >
          Save Changes
        </v-btn>
      </template>
    </PageHeader>

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
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2">Content</span>
              <AiGenerateButton
                mode="admin"
                task="cms_rewrite"
                :context="cmsAiContext"
                :label="t('dealer.views.ai.rewriteCopy')"
                auto-generate
                :show-tone-selector="false"
                @accept="onCmsRewriteAccept"
              />
            </div>
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
import { useI18n } from 'vue-i18n'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPage, updatePage as updatePageApi, publishPage as publishPageApi, type UpdatePageData, type PageModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'
import AiGenerateButton from '@/components/ai/AiGenerateButton.vue'

const { t } = useI18n()
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

const cmsAiContext = computed(() => ({
  title: pageData.value.title,
  content: pageData.value.content,
}))

function onCmsRewriteAccept(text: string) {
  pageData.value.content = text
}

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
    error.value = (err as ApiErrorModel).message || t('admin.seoContent.failedLoadPage')
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

