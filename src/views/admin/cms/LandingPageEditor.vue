<template>
  <div class="panel-page pa-4">
    <CmsWizardShell
      v-model="step"
      :title="editing ? t('admin.cms.landing.editPage') : t('admin.cms.landing.addPage')"
      :subtitle="t('admin.cms.landing.editorSubtitle')"
      :back-to="{ name: 'admin.cms.landing-pages' }"
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
              :layouts="LANDING_LAYOUTS"
              :style-id="form.style"
              :hint="t('admin.cms.builder.pickLayoutHint')"
              @update:model-value="onLayoutChange"
            />
          </v-card>
        </v-window-item>

        <v-window-item :value="1">
          <v-card variant="outlined" class="pa-4">
            <SectionStackEditor
              v-model:blocks="form.blocks"
              :section-types="LANDING_SECTION_TYPES"
              :style-id="form.style"
            >
              <template #editor="{ block }">
                <SectionFieldsEditor :block="block" />
              </template>
            </SectionStackEditor>
          </v-card>
        </v-window-item>

        <v-window-item :value="2">
          <v-card variant="outlined" class="pa-4">
            <StylePicker
              v-model="form.style"
              :hint="t('admin.cms.builder.pickStyleHint')"
            />
          </v-card>
        </v-window-item>

        <v-window-item :value="3">
          <v-row>
            <v-col cols="12" md="5">
              <v-card variant="outlined" class="pa-4 mb-4">
                <v-text-field v-model="form.title" :label="t('admin.cms.landing.pageTitle')" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
                <v-text-field
                  v-model="form.slug"
                  :label="t('admin.cms.landing.slug')"
                  hint="/lp/{slug}"
                  persistent-hint
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                />
                <v-select
                  v-model="form.status"
                  :items="statusOptions"
                  :label="t('admin.cms.blog.status')"
                  density="compact"
                  variant="outlined"
                  class="mb-2"
                  hide-details="auto"
                />
                <v-text-field v-model="form.meta_title" :label="t('admin.seoContent.metaTitle')" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
                <v-textarea v-model="form.meta_description" :label="t('admin.seoContent.metaDescription')" rows="2" density="compact" variant="outlined" hide-details="auto" />
              </v-card>

              <v-card variant="outlined" class="pa-4">
                <p class="text-subtitle-2 mb-3">{{ t('admin.cms.builder.sectionContent') }}</p>
                <SectionStackEditor
                  v-model:blocks="form.blocks"
                  :section-types="LANDING_SECTION_TYPES"
                  :style-id="form.style"
                >
                  <template #editor="{ block }">
                    <SectionFieldsEditor :block="block" />
                  </template>
                </SectionStackEditor>
              </v-card>
            </v-col>
            <v-col cols="12" md="7">
              <LivePreviewFrame :payload="previewPayload" :fetcher="previewLandingPageHtml" />
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
  createLandingPage,
  getLandingPage,
  previewLandingPageHtml,
  updateLandingPage,
} from '@/api/admin.api'
import {
  LANDING_LAYOUTS,
  LANDING_SECTION_TYPES,
  getLandingLayout,
  seedBlocksFromLayout,
  type CmsBlock,
} from '@/constants/cms'
import CmsWizardShell from '@/components/cms/builder/CmsWizardShell.vue'
import LayoutPicker from '@/components/cms/builder/LayoutPicker.vue'
import StylePicker from '@/components/cms/builder/StylePicker.vue'
import SectionStackEditor from '@/components/cms/builder/SectionStackEditor.vue'
import LivePreviewFrame from '@/components/cms/builder/LivePreviewFrame.vue'
import SectionFieldsEditor from '@/components/cms/sections/SectionFieldsEditor.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const step = ref(0)
const saving = ref(false)
const editing = ref(false)
const editId = ref<number | null>(null)
const seededOnce = ref(false)

const form = ref({
  title: '',
  slug: '',
  layout: 'guide',
  style: 'brand',
  blocks: [] as CmsBlock[],
  status: 'draft',
  meta_title: '',
  meta_description: '',
})

const statusOptions = ['draft', 'scheduled', 'published']

const steps = computed(() => [
  { key: 'layout', label: t('admin.cms.builder.stepLayout') },
  { key: 'sections', label: t('admin.cms.builder.stepSections') },
  { key: 'style', label: t('admin.cms.builder.stepStyle') },
  { key: 'content', label: t('admin.cms.builder.stepContent') },
])

const previewPayload = computed(() => ({
  title: form.value.title || 'Untitled page',
  slug: form.value.slug || 'preview',
  layout: form.value.layout,
  style: form.value.style,
  blocks: form.value.blocks,
  meta_title: form.value.meta_title,
  meta_description: form.value.meta_description,
}))

function onLayoutChange(layoutId: string) {
  const layout = getLandingLayout(layoutId)
  if (!form.value.blocks.length || !seededOnce.value) {
    form.value.blocks = seedBlocksFromLayout(layout.seed)
    seededOnce.value = true
    return
  }
  if (confirm(t('admin.cms.builder.confirmReseed'))) {
    form.value.blocks = seedBlocksFromLayout(layout.seed)
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
  const id = route.params.id
  if (!id || id === 'new') {
    editing.value = false
    form.value.blocks = seedBlocksFromLayout(getLandingLayout('guide').seed)
    seededOnce.value = true
    return
  }
  editing.value = true
  editId.value = Number(id)
  const page = (await getLandingPage(editId.value)) as any
  form.value = {
    title: page.title ?? '',
    slug: page.slug ?? '',
    layout: page.layout ?? 'guide',
    style: page.style ?? 'brand',
    blocks: (page.blocks ?? []).map((b: any) => ({
      id: b.id ?? crypto.randomUUID(),
      type: b.type,
      variant: b.variant ?? 'default',
      content: b.content ?? {},
    })),
    status: page.status ?? 'draft',
    meta_title: page.meta_title ?? '',
    meta_description: page.meta_description ?? '',
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
      await updateLandingPage(editId.value, payload)
    } else {
      const created = (await createLandingPage(payload)) as any
      editId.value = created?.id ?? created?.data?.id
      editing.value = true
    }
    await router.push({ name: 'admin.cms.landing-pages' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
