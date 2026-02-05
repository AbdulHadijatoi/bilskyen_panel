<template>
  <div class="translations-management-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Translation Management</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage all application translations and labels
          </p>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            color="success"
            prepend-icon="mdi-upload"
            size="default"
            @click="$router.push('/admin/translations/import')"
            variant="outlined"
          >
            Import
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            size="default"
            @click="exportTranslations"
            variant="outlined"
          >
            Export
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            size="default"
            @click="showCreateDialog = true"
            elevation="2"
          >
            Create Translation
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <v-card variant="flat" class="filters-card mb-4" elevation="1">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search translations"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="() => loadTranslations()"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedLocale"
              :items="locales"
              label="Filter by Locale"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="text"
              prepend-icon="mdi-refresh"
              @click="loadTranslations(true)"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Translations Table -->
    <v-card variant="flat" elevation="1">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="translations"
          :loading="loading"
          :items-per-page="pagination.limit"
          :page="pagination.page"
          @update:page="handlePageChange"
          @update:items-per-page="handleLimitChange"
          class="translations-table"
        >
          <template #item.key="{ item }">
            <code class="text-caption">{{ item.key }}</code>
          </template>

          <template #item.default_value="{ item }">
            <span class="text-body-2">{{ truncate(item.default_value, 50) }}</span>
          </template>

          <template #item.en="{ item }">
            <span class="text-body-2">{{ getTranslationValue(item, 'en') }}</span>
          </template>

          <template #item.da="{ item }">
            <span class="text-body-2">{{ getTranslationValue(item, 'da') }}</span>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon
              size="small"
              variant="text"
              @click="editTranslation(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingTranslation ? 'Edit Translation' : 'Create Translation' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="editForm.key"
              label="Translation Key"
              variant="outlined"
              density="compact"
              :disabled="!!editingTranslation"
              :rules="[rules.required]"
              class="mb-4"
            />

            <v-textarea
              v-model="editForm.default_value"
              label="Default Value (English)"
              variant="outlined"
              density="compact"
              rows="3"
              :rules="[rules.required]"
              class="mb-4"
            />

            <v-divider class="my-4" />

            <div class="text-subtitle-1 font-weight-semibold mb-3">Translations</div>

            <v-textarea
              v-model="editForm.translations.en"
              label="English (en)"
              variant="outlined"
              density="compact"
              rows="2"
              class="mb-4"
            />

            <v-textarea
              v-model="editForm.translations.da"
              label="Danish (da)"
              variant="outlined"
              density="compact"
              rows="2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeEditDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveTranslation" :loading="saving">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete the translation key
          <code>{{ deletingTranslation?.key }}</code>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteTranslation" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { translationService, type TranslationKey } from '@/services/translationService'

const headers = [
  { title: 'Key', key: 'key', sortable: true },
  { title: 'Default Value', key: 'default_value', sortable: false },
  { title: 'English', key: 'en', sortable: false },
  { title: 'Danish', key: 'da', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const translations = ref<TranslationKey[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedLocale = ref<string | null>(null)
const locales = ref<string[]>(['en', 'da'])

const pagination = ref({
  page: 1,
  limit: 15,
  totalDocs: 0,
  totalPages: 0,
})

const showEditDialog = ref(false)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingTranslation = ref<TranslationKey | null>(null)
const deletingTranslation = ref<TranslationKey | null>(null)
const saving = ref(false)
const deleting = ref(false)

const editForm = ref({
  key: '',
  default_value: '',
  translations: {
    en: '',
    da: '',
  },
})

const rules = {
  required: (v: any) => !!v || 'This field is required',
}

const editingTranslationComputed = computed(() => {
  return showEditDialog.value && (editingTranslation.value || showCreateDialog.value)
})

watch(editingTranslationComputed, (val) => {
  if (val) {
    showEditDialog.value = true
  }
})

onMounted(() => {
  loadLocales()
  loadTranslations()
})

async function loadLocales() {
  try {
    const result = await translationService.getLocales()
    if (result.success) {
      locales.value = result.data
    }
  } catch (error) {
    console.error('Error loading locales:', error)
  }
}

async function loadTranslations(force = false) {
  loading.value = true
  try {
    const result = await translationService.getTranslations({
      search: searchQuery.value || undefined,
      limit: pagination.value.limit,
      page: pagination.value.page,
    })

    if (result.success && result.data) {
      translations.value = result.data.docs || []
      pagination.value.totalDocs = result.data.totalDocs || 0
      pagination.value.totalPages = result.data.totalPages || 0
    }
  } catch (error) {
    console.error('Error loading translations:', error)
  } finally {
    loading.value = false
  }
}

function getTranslationValue(item: TranslationKey, locale: string): string {
  const value = item.values?.find((v) => v.locale === locale)
  return value?.value || item.default_value || '-'
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

function editTranslation(item: TranslationKey) {
  editingTranslation.value = item
  editForm.value = {
    key: item.key,
    default_value: item.default_value,
    translations: {
      en: item.values?.find((v) => v.locale === 'en')?.value || '',
      da: item.values?.find((v) => v.locale === 'da')?.value || '',
    },
  }
  showCreateDialog.value = false
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  showCreateDialog.value = false
  editingTranslation.value = null
  editForm.value = {
    key: '',
    default_value: '',
    translations: {
      en: '',
      da: '',
    },
  }
}

async function saveTranslation() {
  if (!editForm.value.key || !editForm.value.default_value) {
    return
  }

  saving.value = true
  try {
    if (editingTranslation.value) {
      // Update existing
      await translationService.updateTranslation(editingTranslation.value.id, {
        key: editForm.value.key,
        default_value: editForm.value.default_value,
      })

      // Update translations
      if (editForm.value.translations.en) {
        await translationService.updateTranslationValue(
          editingTranslation.value.id,
          'en',
          editForm.value.translations.en
        )
      }
      if (editForm.value.translations.da) {
        await translationService.updateTranslationValue(
          editingTranslation.value.id,
          'da',
          editForm.value.translations.da
        )
      }
    } else {
      // Create new
      await translationService.createTranslation({
        key: editForm.value.key,
        default_value: editForm.value.default_value,
        translations: [
          { locale: 'en', value: editForm.value.translations.en || editForm.value.default_value },
          { locale: 'da', value: editForm.value.translations.da },
        ].filter((t) => t.value),
      })
    }

    closeEditDialog()
    loadTranslations(true)
  } catch (error) {
    console.error('Error saving translation:', error)
  } finally {
    saving.value = false
  }
}

function confirmDelete(item: TranslationKey) {
  deletingTranslation.value = item
  showDeleteDialog.value = true
}

async function deleteTranslation() {
  if (!deletingTranslation.value) return

  deleting.value = true
  try {
    await translationService.deleteTranslation(deletingTranslation.value.id)
    showDeleteDialog.value = false
    deletingTranslation.value = null
    loadTranslations(true)
  } catch (error) {
    console.error('Error deleting translation:', error)
  } finally {
    deleting.value = false
  }
}


async function exportTranslations() {
  try {
    const result = await translationService.exportTranslations()
    if (result.success && result.data) {
      // Convert to CSV
      const headers = ['key', 'default_value', 'en', 'da']
      const csv = [
        headers.join(','),
        ...result.data.map((row) =>
          headers.map((h) => `"${(row[h as keyof typeof row] || '').toString().replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `translations_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error exporting translations:', error)
  }
}

function handlePageChange(page: number) {
  pagination.value.page = page
  loadTranslations()
}

function handleLimitChange(limit: number) {
  pagination.value.limit = limit
  pagination.value.page = 1
  loadTranslations()
}
</script>

<script lang="ts">
export default {
  name: 'TranslationsManagement',
}
</script>

<style scoped>
.translations-management-container {
  padding: 24px;
}

.header-section {
  margin-bottom: 24px;
}

.filters-card {
  margin-bottom: 16px;
}

.translations-table :deep(.v-data-table__td) {
  padding: 12px 16px;
}
</style>
