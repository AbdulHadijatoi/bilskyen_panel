<template>
  <div class="seo-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">{{ $t('admin.seoContent.title') }}</h2>
        <p class="page-description">
          {{ $t('admin.seoContent.description') }}
        </p>
      </div>
    </div>
    <div class="header-actions">
      <v-select
        v-model="filterPageType"
        :items="pageTypeOptions"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="compact"
        clearable
        :label="$t('admin.seoContent.pageType')"
        :placeholder="$t('admin.seoContent.filterByPageType')"
        class="filter-select"
        style="max-width: 220px;"
      />
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        variant="flat"
        class="mt-[2px]"
        @click="openCreate"
      >
        {{ $t('admin.seoContent.addSeoPage') }}
      </v-btn>
    </div>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-4">{{ $t('common.loading') }}</p>
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" prominent class="mb-4">
      <v-alert-title>{{ $t('admin.seoContent.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <v-card v-else>
      <v-data-table
        :headers="headers"
        :items="filteredPages"
        :items-length="filteredPages.length"
        class="elevation-0"
        hide-default-footer
      >
        <template #item.meta_title="{ item }">
          <span class="text-truncate d-inline-block" style="max-width: 220px;">{{ item.meta_title || item.title || '—' }}</span>
        </template>
        <template #item.updated_at="{ item }">
          {{ item.updated_at ? formatDate(item.updated_at) : '—' }}
        </template>
        <template #item.actions="{ item }">
          <v-btn icon variant="text" size="small" @click="openEdit(item)" title="Edit">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click="confirmDelete(item)" title="Delete">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="800" persistent scrollable>
      <v-card>
        <v-card-title>{{ isEdit ? $t('common.edit') : $t('admin.seoContent.addSeoPage') }}</v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <v-tabs v-model="formTab">
            <v-tab value="basic">{{ $t('admin.seoContent.tabBasic') }}</v-tab>
            <v-tab value="social">{{ $t('admin.seoContent.tabSocial') }}</v-tab>
            <v-tab value="schema">{{ $t('admin.seoContent.tabSchema') }}</v-tab>
            <v-tab value="content">{{ $t('admin.seoContent.tabContent') }}</v-tab>
          </v-tabs>
          <v-window v-model="formTab" class="pt-5">
            <v-window-item value="basic">
              <v-select
                v-model="form.page_type"
                :items="PAGE_TYPE_OPTIONS"
                item-title="label"
                item-value="value"
                :label="$t('admin.seoContent.pageType')"
                :hint="$t('admin.seoContent.hintPageType')"
                persistent-hint
                variant="outlined"
                density="compact"
                class="mb-2"
                :readonly="isEdit"
              />
              <v-select
                v-model="form.page_key"
                :items="formPageKeyOptions"
                item-title="label"
                item-value="value"
                :label="$t('admin.seoContent.pageKey')"
                :hint="$t('admin.seoContent.hintPageKey')"
                persistent-hint
                variant="outlined"
                density="compact"
                class="mb-2"
                :readonly="isEdit"
                :loading="loadingPageKeyOptions"
                :disabled="!form.page_type || loadingPageKeyOptions"
              />
              <v-text-field v-model="form.title" :label="$t('admin.seoContent.title')" :hint="$t('admin.seoContent.hintTitle')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-text-field v-model="form.meta_title" :label="$t('admin.seoContent.metaTitle')" :hint="$t('admin.seoContent.hintMetaTitle')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-textarea v-model="form.meta_description" :label="$t('admin.seoContent.metaDescription')" :hint="$t('admin.seoContent.hintMetaDescription')" persistent-hint variant="outlined" density="compact" rows="2" class="mb-2" />
              <v-textarea v-model="form.meta_keywords" :label="$t('admin.seoContent.metaKeywords')" :hint="$t('admin.seoContent.hintMetaKeywords')" persistent-hint variant="outlined" density="compact" rows="2" class="mb-2" />
              <v-text-field v-model="form.canonical_url" :label="$t('admin.seoContent.canonicalUrl')" :hint="$t('admin.seoContent.hintCanonicalUrl')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-text-field v-model="form.robots" :label="$t('admin.seoContent.robots')" :hint="$t('admin.seoContent.hintRobots')" persistent-hint variant="outlined" density="compact" />
            </v-window-item>
            <v-window-item value="social">
              <v-text-field v-model="form.og_title" :label="$t('admin.seoContent.ogTitle')" :hint="$t('admin.seoContent.hintOgTitle')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-textarea v-model="form.og_description" :label="$t('admin.seoContent.ogDescription')" :hint="$t('admin.seoContent.hintOgDescription')" persistent-hint variant="outlined" density="compact" rows="2" class="mb-2" />
              <v-text-field v-model="form.og_image" :label="$t('admin.seoContent.ogImage')" :hint="$t('admin.seoContent.hintOgImage')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-text-field v-model="form.twitter_title" :label="$t('admin.seoContent.twitterTitle')" :hint="$t('admin.seoContent.hintTwitterTitle')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-textarea v-model="form.twitter_description" :label="$t('admin.seoContent.twitterDescription')" :hint="$t('admin.seoContent.hintTwitterDescription')" persistent-hint variant="outlined" density="compact" rows="2" class="mb-2" />
              <v-text-field v-model="form.twitter_image" :label="$t('admin.seoContent.twitterImage')" :hint="$t('admin.seoContent.hintTwitterImage')" persistent-hint variant="outlined" density="compact" />
            </v-window-item>
            <v-window-item value="schema">
              <v-text-field v-model="form.schema_type" :label="$t('admin.seoContent.schemaType')" :hint="$t('admin.seoContent.hintSchemaType')" persistent-hint variant="outlined" density="compact" class="mb-2" />
              <v-textarea v-model="schemaJsonText" :label="$t('admin.seoContent.schemaJson')" :hint="$t('admin.seoContent.hintSchemaJson')" persistent-hint variant="outlined" density="compact" rows="8" class="font-monospace mb-2" />
            </v-window-item>
            <v-window-item value="content">
              <v-textarea v-model="form.content_html" :label="$t('admin.seoContent.contentHtml')" :hint="$t('admin.seoContent.hintContentHtml')" persistent-hint variant="outlined" density="compact" rows="4" class="mb-2" />
              <v-textarea v-model="faqJsonText" :label="$t('admin.seoContent.faqJson')" :hint="$t('admin.seoContent.hintFaqJson')" persistent-hint variant="outlined" density="compact" rows="4" class="mb-2 font-monospace" />
              <v-textarea v-model="breadcrumbsJsonText" :label="$t('admin.seoContent.breadcrumbsJson')" :hint="$t('admin.seoContent.hintBreadcrumbsJson')" persistent-hint variant="outlined" density="compact" rows="4" class="font-monospace" />
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveForm">{{ $t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialogOpen" max-width="400" persistent>
      <v-card>
        <v-card-title>{{ $t('common.confirmDelete') }}</v-card-title>
        <v-card-text>
          {{ $t('admin.seoContent.confirmDeleteMessage') }} ({{ itemToDelete?.page_type }} / {{ itemToDelete?.page_key }})
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="doDelete">{{ $t('common.delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      {{ successMessage }}
      <template #actions><v-btn variant="text" @click="showSuccess = false">{{ $t('common.close') }}</v-btn></template>
    </v-snackbar>
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      {{ errorMessage }}
      <template #actions><v-btn variant="text" @click="showError = false">{{ $t('common.close') }}</v-btn></template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getSeoPages,
  getSeoPage,
  getSeoPageKeyOptions,
  createSeoPage,
  updateSeoPage,
  deleteSeoPage,
  type SeoPageModel,
  type CreateSeoPageData,
  type UpdateSeoPageData,
  type SeoPageKeyOption,
} from '@/api/admin.api'

const { t: $t } = useI18n()

// Page types that match defined routes (for form dropdown)
const PAGE_TYPE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'listing', label: 'Vehicles listing' },
  { value: 'static', label: 'Static page' },
  { value: 'vehicle', label: 'Vehicle detail' },
  { value: 'dealer', label: 'Dealer page' },
] as const

// Page keys for fixed route types (home, listing, static)
const PAGE_KEY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  home: [{ value: 'home', label: 'Home' }],
  listing: [{ value: 'vehicles', label: 'Vehicles' }],
  static: [
    { value: 'about', label: 'About' },
    { value: 'contact', label: 'Contact' },
    { value: 'privacy-policy', label: 'Privacy Policy' },
    { value: 'terms-of-service', label: 'Terms of Service' },
  ],
}

// For filter in list view (same + optional extras)
const pageTypeOptions = [...PAGE_TYPE_OPTIONS]

const headers = [
  { title: 'Page Type', key: 'page_type', sortable: true },
  { title: 'Page Key', key: 'page_key', sortable: true },
  { title: 'Meta Title', key: 'meta_title' },
  { title: 'Updated', key: 'updated_at' },
  { title: '', key: 'actions', sortable: false, width: '100' },
]

const loading = ref(false)
const error = ref<string | null>(null)
const pages = ref<SeoPageModel[]>([])
const filterPageType = ref<string | null>(null)
const dialogOpen = ref(false)
const formTab = ref('basic')
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const deleteDialogOpen = ref(false)
const itemToDelete = ref<SeoPageModel | null>(null)
const deleting = ref(false)

const form = ref<CreateSeoPageData & { id?: number }>({
  page_type: '',
  page_key: '',
  title: null,
  meta_title: null,
  meta_description: null,
  meta_keywords: null,
  canonical_url: null,
  robots: null,
  og_title: null,
  og_description: null,
  og_image: null,
  twitter_title: null,
  twitter_description: null,
  twitter_image: null,
  schema_type: null,
  schema_json: null,
  content_html: null,
  faq_json: null,
  breadcrumbs_json: null,
})

const schemaJsonText = ref('')
const faqJsonText = ref('')
const breadcrumbsJsonText = ref('')

// Dynamic page_key options for vehicle/dealer (loaded when needed)
const vehicleSlugOptions = ref<SeoPageKeyOption[]>([])
const dealerSlugOptions = ref<SeoPageKeyOption[]>([])
const loadingPageKeyOptions = ref(false)

const formPageKeyOptions = computed(() => {
  const type = form.value.page_type
  if (PAGE_KEY_OPTIONS[type]) return PAGE_KEY_OPTIONS[type]
  if (type === 'vehicle') return vehicleSlugOptions.value
  if (type === 'dealer') return dealerSlugOptions.value
  return []
})

async function loadDynamicPageKeyOptions() {
  const type = form.value.page_type
  if (type !== 'vehicle' && type !== 'dealer') return
  loadingPageKeyOptions.value = true
  try {
    const options = await getSeoPageKeyOptions(type)
    if (type === 'vehicle') vehicleSlugOptions.value = options
    else dealerSlugOptions.value = options
  } catch {
    if (type === 'vehicle') vehicleSlugOptions.value = []
    else dealerSlugOptions.value = []
  } finally {
    loadingPageKeyOptions.value = false
  }
}

const filteredPages = computed(() => {
  let list = pages.value
  if (filterPageType.value) {
    list = list.filter((p) => p.page_type === filterPageType.value)
  }
  return list
})

function formatDate(val: string | undefined): string {
  if (!val) return '—'
  try {
    const d = new Date(val)
    return d.toLocaleDateString()
  } catch {
    return val
  }
}

function resetForm() {
  form.value = {
    page_type: 'static',
    page_key: '',
    title: null,
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    canonical_url: null,
    robots: null,
    og_title: null,
    og_description: null,
    og_image: null,
    twitter_title: null,
    twitter_description: null,
    twitter_image: null,
    schema_type: null,
    schema_json: null,
    content_html: null,
    faq_json: null,
    breadcrumbs_json: null,
  }
  schemaJsonText.value = ''
  faqJsonText.value = ''
  breadcrumbsJsonText.value = ''
  editingId.value = null
  isEdit.value = false
  formTab.value = 'basic'
}

function parseJsonSafe(str: string): Record<string, unknown> | unknown[] | null {
  if (!str || !str.trim()) return null
  try {
    return JSON.parse(str) as Record<string, unknown> | unknown[]
  } catch {
    return null
  }
}

watch([schemaJsonText, faqJsonText, breadcrumbsJsonText], () => {
  form.value.schema_json = parseJsonSafe(schemaJsonText.value) as Record<string, unknown> | null
  form.value.faq_json = parseJsonSafe(faqJsonText.value) as unknown[] | null
  form.value.breadcrumbs_json = parseJsonSafe(breadcrumbsJsonText.value) as unknown[] | null
})

watch(
  () => form.value.page_type,
  (newType, oldType) => {
    if (newType !== oldType) {
      if (newType === 'home') form.value.page_key = 'home'
      else if (newType === 'listing') form.value.page_key = 'vehicles'
      else if (newType === 'static') form.value.page_key = 'about'
      else form.value.page_key = ''
      if (newType === 'vehicle' || newType === 'dealer') loadDynamicPageKeyOptions()
    }
  }
)

async function loadPages() {
  loading.value = true
  error.value = null
  try {
    pages.value = await getSeoPages()
  } catch (err: any) {
    error.value = err.message || 'Failed to load SEO pages'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  form.value.page_type = 'home'
  form.value.page_key = 'home'
  dialogOpen.value = true
}

async function openEdit(item: SeoPageModel) {
  resetForm()
  editingId.value = item.id
  isEdit.value = true
  try {
    const full = await getSeoPage(item.id)
    if (full.page_type === 'vehicle' || full.page_type === 'dealer') await loadDynamicPageKeyOptions()
    form.value = {
      page_type: full.page_type,
      page_key: full.page_key,
      title: full.title ?? null,
      meta_title: full.meta_title ?? null,
      meta_description: full.meta_description ?? null,
      meta_keywords: full.meta_keywords ?? null,
      canonical_url: full.canonical_url ?? null,
      robots: full.robots ?? null,
      og_title: full.og_title ?? null,
      og_description: full.og_description ?? null,
      og_image: full.og_image ?? null,
      twitter_title: full.twitter_title ?? null,
      twitter_description: full.twitter_description ?? null,
      twitter_image: full.twitter_image ?? null,
      schema_type: full.schema_type ?? null,
      schema_json: full.schema_json ?? null,
      content_html: full.content_html ?? null,
      faq_json: full.faq_json ?? null,
      breadcrumbs_json: full.breadcrumbs_json ?? null,
    }
    schemaJsonText.value = full.schema_json ? JSON.stringify(full.schema_json, null, 2) : ''
    faqJsonText.value = full.faq_json ? JSON.stringify(full.faq_json, null, 2) : ''
    breadcrumbsJsonText.value = full.breadcrumbs_json ? JSON.stringify(full.breadcrumbs_json, null, 2) : ''
    dialogOpen.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load SEO page'
    showError.value = true
  }
}

async function saveForm() {
  if (!form.value.page_type || !form.value.page_key) {
    errorMessage.value = 'Page type and page key are required'
    showError.value = true
    return
  }
  saving.value = true
  errorMessage.value = ''
  showError.value = false
  try {
    if (isEdit.value && editingId.value != null) {
      const payload: UpdateSeoPageData = { ...form.value }
      delete (payload as any).id
      await updateSeoPage(editingId.value, payload)
      successMessage.value = 'SEO page updated successfully.'
    } else {
      await createSeoPage(form.value as CreateSeoPageData)
      successMessage.value = 'SEO page created successfully.'
    }
    showSuccess.value = true
    dialogOpen.value = false
    await loadPages()
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save'
    showError.value = true
  } finally {
    saving.value = false
  }
}

function confirmDelete(item: SeoPageModel) {
  itemToDelete.value = item
  deleteDialogOpen.value = true
}

async function doDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await deleteSeoPage(itemToDelete.value.id)
    successMessage.value = 'SEO page deleted.'
    showSuccess.value = true
    deleteDialogOpen.value = false
    itemToDelete.value = null
    await loadPages()
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to delete'
    showError.value = true
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadPages()
})
</script>

<style scoped>
.seo-content-container {
  padding: 16px;
  background-color: #fafafa;
  min-height: 100vh;
}
.page-header {
  margin-bottom: 8px;
  padding-bottom: 12px;
}
.header-content { flex: 1; }
.page-title { font-size: 18px; font-weight: 600; color: rgba(0, 0, 0, 0.9); margin: 0 0 4px 0; }
.page-description { font-size: 12px; color: rgba(0, 0, 0, 0.6); margin: 0; line-height: 1.4; }
.header-actions {
  display: flex;
  gap: 12px;
  /* align-items: center; */
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.filter-select { flex-shrink: 0; }
.font-monospace { font-family: ui-monospace, monospace; }
@media (max-width: 768px) {
  .header-actions .filter-select { max-width: 100% !important; }
}
</style>
