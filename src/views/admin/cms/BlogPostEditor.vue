<template>
  <div class="panel-page pa-4">
    <CmsWizardShell
      v-model="step"
      :title="editing ? t('admin.cms.blog.editPost') : t('admin.cms.blog.addPost')"
      :subtitle="t('admin.cms.blog.editorSubtitle')"
      :back-to="{ name: 'admin.cms.blog' }"
      :steps="steps"
      :saving="saving"
      @save-draft="save('draft')"
      @publish="save('published')"
    >
      <v-window v-model="step">
        <v-window-item :value="0">
          <v-card variant="outlined" class="pa-4">
            <LayoutPicker
              v-model="form.layout"
              :layouts="BLOG_LAYOUTS"
              :style-id="form.style"
              :hint="t('admin.cms.builder.pickBlogLayoutHint')"
              @update:model-value="onLayoutChange"
            />
          </v-card>
        </v-window-item>

        <v-window-item :value="1">
          <v-card variant="outlined" class="pa-4 mb-4">
            <p class="text-subtitle-2 mb-2">{{ t('admin.cms.blog.content') }}</p>
            <div class="d-flex justify-end mb-2">
              <AiGenerateButton
                mode="admin"
                task="cms_rewrite"
                :context="{ title: form.title, excerpt: form.excerpt, content: form.content_html }"
                :label="t('dealer.views.ai.rewriteCopy')"
                auto-generate
                :show-tone-selector="false"
                @accept="form.content_html = $event"
              />
            </div>
            <RichTextEditor v-model="form.content_html" />
          </v-card>
          <v-card variant="outlined" class="pa-4">
            <p class="text-subtitle-2 mb-3">{{ t('admin.cms.builder.chromeSections') }}</p>
            <SectionStackEditor
              v-model:blocks="form.sections"
              :section-types="BLOG_SECTION_TYPES"
              :style-id="form.style"
              blog
            >
              <template #editor="{ block }">
                <SectionFieldsEditor :block="block" />
              </template>
            </SectionStackEditor>
          </v-card>
        </v-window-item>

        <v-window-item :value="2">
          <v-card variant="outlined" class="pa-4">
            <StylePicker v-model="form.style" :hint="t('admin.cms.builder.pickStyleHint')" />
          </v-card>
        </v-window-item>

        <v-window-item :value="3">
          <v-row>
            <v-col cols="12" md="5">
              <v-card variant="outlined" class="pa-4 mb-4">
                <v-text-field v-model="form.title" :label="t('admin.cms.blog.postTitle')" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
                <v-text-field v-model="form.slug" :label="t('admin.cms.blog.slug')" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
                <v-select
                  v-model="form.status"
                  :items="statusOptions"
                  :label="t('admin.cms.blog.status')"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                  hide-details="auto"
                />
                <v-select
                  v-model="form.category_id"
                  :items="categoryOptions"
                  item-title="name"
                  item-value="id"
                  clearable
                  :label="t('admin.cms.blog.category')"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                  hide-details="auto"
                />
                <v-select
                  v-model="form.featured_media_id"
                  :items="mediaOptions"
                  item-title="label"
                  item-value="id"
                  clearable
                  :label="t('admin.cms.blog.featuredMedia')"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                  hide-details="auto"
                />
                <v-textarea v-model="form.excerpt" :label="t('admin.cms.blog.excerpt')" rows="2" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
                <v-text-field v-model="form.meta_title" :label="t('admin.seoContent.metaTitle')" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
                <v-textarea v-model="form.meta_description" :label="t('admin.seoContent.metaDescription')" rows="2" density="compact" variant="outlined" hide-details="auto" />
              </v-card>

              <v-card variant="outlined" class="pa-4 mb-4">
                <p class="text-subtitle-2 mb-2">{{ t('admin.cms.blog.content') }}</p>
                <RichTextEditor v-model="form.content_html" />
              </v-card>

              <v-card variant="outlined" class="pa-4">
                <p class="text-subtitle-2 mb-3">{{ t('admin.cms.builder.chromeSections') }}</p>
                <SectionStackEditor
                  v-model:blocks="form.sections"
                  :section-types="BLOG_SECTION_TYPES"
                  :style-id="form.style"
                  blog
                >
                  <template #editor="{ block }">
                    <SectionFieldsEditor :block="block" />
                  </template>
                </SectionStackEditor>
              </v-card>
            </v-col>
            <v-col cols="12" md="7">
              <LivePreviewFrame :payload="previewPayload" :fetcher="previewBlogPostHtml" />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </CmsWizardShell>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  createCmsPost,
  getCmsMedia,
  getCmsPost,
  getCmsPostCategories,
  previewBlogPostHtml,
  updateCmsPost,
} from '@/api/admin.api'
import {
  BLOG_LAYOUTS,
  BLOG_SECTION_TYPES,
  getBlogLayout,
  seedBlocksFromLayout,
  type CmsBlock,
} from '@/constants/cms'
import CmsWizardShell from '@/components/cms/builder/CmsWizardShell.vue'
import LayoutPicker from '@/components/cms/builder/LayoutPicker.vue'
import StylePicker from '@/components/cms/builder/StylePicker.vue'
import SectionStackEditor from '@/components/cms/builder/SectionStackEditor.vue'
import LivePreviewFrame from '@/components/cms/builder/LivePreviewFrame.vue'
import SectionFieldsEditor from '@/components/cms/sections/SectionFieldsEditor.vue'
import RichTextEditor from '@/components/admin/RichTextEditor.vue'
import AiGenerateButton from '@/components/ai/AiGenerateButton.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const step = ref(0)
const saving = ref(false)
const editing = ref(false)
const editId = ref<number | null>(null)
const seededOnce = ref(false)
const categories = ref<any[]>([])
const media = ref<any[]>([])

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content_html: '',
  layout: 'classic',
  style: 'brand',
  sections: [] as CmsBlock[],
  status: 'draft',
  category_id: null as number | null,
  featured_media_id: null as number | null,
  meta_title: '',
  meta_description: '',
})

const statusOptions = ['draft', 'scheduled', 'published']

const steps = computed(() => [
  { key: 'layout', label: t('admin.cms.builder.stepLayout') },
  { key: 'content', label: t('admin.cms.builder.stepBody') },
  { key: 'style', label: t('admin.cms.builder.stepStyle') },
  { key: 'preview', label: t('admin.cms.builder.stepContent') },
])

const categoryOptions = computed(() => categories.value)
const mediaOptions = computed(() =>
  media.value.map((m: any) => ({
    id: m.id,
    label: m.alt_text || m.filename || m.path || `#${m.id}`,
  })),
)

const previewPayload = computed(() => ({
  title: form.value.title || 'Untitled post',
  slug: form.value.slug || 'preview',
  excerpt: form.value.excerpt,
  content_html: form.value.content_html,
  layout: form.value.layout,
  style: form.value.style,
  sections: form.value.sections,
  category_id: form.value.category_id,
  featured_media_id: form.value.featured_media_id,
  meta_title: form.value.meta_title,
  meta_description: form.value.meta_description,
}))

function onLayoutChange(layoutId: string) {
  const layout = getBlogLayout(layoutId)
  if (!form.value.sections.length || !seededOnce.value) {
    form.value.sections = seedBlocksFromLayout(layout.seed, true)
    seededOnce.value = true
    return
  }
  if (layout.seed.length && confirm(t('admin.cms.builder.confirmReseedChrome'))) {
    form.value.sections = seedBlocksFromLayout(layout.seed, true)
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function load() {
  const [cats, mediaList] = await Promise.all([
    getCmsPostCategories().catch(() => []),
    getCmsMedia({ page: 1 }).catch(() => []),
  ])
  categories.value = (cats as any[]) ?? []
  const mediaData = mediaList as any
  media.value = Array.isArray(mediaData) ? mediaData : (mediaData?.data ?? mediaData?.items ?? [])

  const id = route.params.id
  if (!id || id === 'new') {
    editing.value = false
    form.value.sections = seedBlocksFromLayout(getBlogLayout('classic').seed, true)
    seededOnce.value = true
    return
  }
  editing.value = true
  editId.value = Number(id)
  const post = (await getCmsPost(editId.value)) as any
  form.value = {
    title: post.title ?? '',
    slug: post.slug ?? '',
    excerpt: post.excerpt ?? '',
    content_html: post.content_html ?? '',
    layout: post.layout ?? 'classic',
    style: post.style ?? 'brand',
    sections: (post.sections ?? []).map((b: any) => ({
      id: b.id ?? crypto.randomUUID(),
      type: b.type,
      variant: b.variant ?? 'default',
      content: b.content ?? {},
    })),
    status: post.status ?? 'draft',
    category_id: post.category_id ?? null,
    featured_media_id: post.featured_media_id ?? null,
    meta_title: post.meta_title ?? '',
    meta_description: post.meta_description ?? '',
  }
  seededOnce.value = true
}

async function save(forceStatus?: string) {
  saving.value = true
  try {
    if (!form.value.slug && form.value.title) {
      form.value.slug = slugify(form.value.title)
    }
    const payload = {
      ...form.value,
      status: forceStatus ?? form.value.status,
    }
    if (editing.value && editId.value) {
      await updateCmsPost(editId.value, payload)
    } else {
      const created = (await createCmsPost(payload)) as any
      editId.value = created?.id ?? created?.data?.id
      editing.value = true
    }
    await router.push({ name: 'admin.cms.blog' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
