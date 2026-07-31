<template>
  <div class="panel-page faq-page-content-container">
    <PageHeader
      :title="t('admin.views.faqPageContent.title')"
      :subtitle="t('admin.views.faqPageContent.description')"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="saveContent"
        >
          {{ t('admin.views.faqPageContent.saveChanges') }}
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <div v-else class="form-wrapper space-y-4">
      <v-card variant="outlined" class="pa-4">
        <v-text-field
          v-model="headerTitle"
          :label="t('admin.views.faqPageContent.headerTitle')"
          variant="outlined"
          class="mb-4"
        />
        <v-textarea
          v-model="headerDescription"
          :label="t('admin.views.faqPageContent.headerDescription')"
          rows="2"
          variant="outlined"
        />
      </v-card>

      <div class="d-flex align-center justify-space-between mb-2">
        <h3 class="text-subtitle-1 font-weight-medium">{{ t('admin.views.faqPageContent.sections') }}</h3>
        <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addSection">
          {{ t('admin.views.faqPageContent.addSection') }}
        </v-btn>
      </div>

      <v-card
        v-for="(section, sIndex) in sections"
        :key="section.id"
        variant="outlined"
        class="pa-4 mb-4"
      >
        <div class="d-flex align-center gap-2 mb-4 flex-wrap">
          <v-text-field
            v-model="section.title"
            :label="t('admin.views.faqPageContent.sectionTitle')"
            variant="outlined"
            density="compact"
            hide-details
            class="flex-grow-1"
          />
          <v-btn
            icon="mdi-arrow-up"
            variant="text"
            size="small"
            :disabled="sIndex === 0"
            @click="moveSection(sIndex, -1)"
          />
          <v-btn
            icon="mdi-arrow-down"
            variant="text"
            size="small"
            :disabled="sIndex === sections.length - 1"
            @click="moveSection(sIndex, 1)"
          />
          <v-btn
            color="error"
            variant="text"
            size="small"
            prepend-icon="mdi-delete"
            @click="removeSection(sIndex)"
          >
            {{ t('admin.views.faqPageContent.deleteSection') }}
          </v-btn>
        </div>

        <div class="d-flex align-center justify-space-between mb-3">
          <p class="text-body-2 text-medium-emphasis mb-0">{{ t('admin.views.faqPageContent.faqItems') }}</p>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addItem(sIndex)">
            {{ t('admin.views.faqPageContent.addFaq') }}
          </v-btn>
        </div>

        <div
          v-for="(item, iIndex) in section.items"
          :key="item.id"
          class="faq-item mb-4 pb-4"
          :class="{ 'border-b': iIndex < section.items.length - 1 }"
        >
          <div class="d-flex align-start gap-2">
            <div class="flex-grow-1">
              <v-text-field
                v-model="item.question"
                :label="t('admin.views.faqPageContent.question')"
                variant="outlined"
                class="mb-2"
              />
              <v-textarea
                v-model="item.answer"
                :label="t('admin.views.faqPageContent.answer')"
                rows="3"
                variant="outlined"
              />
            </div>
            <div class="d-flex flex-column">
              <v-btn
                icon="mdi-arrow-up"
                variant="text"
                size="small"
                :disabled="iIndex === 0"
                @click="moveItem(sIndex, iIndex, -1)"
              />
              <v-btn
                icon="mdi-arrow-down"
                variant="text"
                size="small"
                :disabled="iIndex === section.items.length - 1"
                @click="moveItem(sIndex, iIndex, 1)"
              />
              <v-btn
                icon="mdi-delete"
                color="error"
                variant="text"
                size="small"
                @click="removeItem(sIndex, iIndex)"
              />
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      {{ t('admin.views.faqPageContent.successMessage') }}
    </v-snackbar>
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/panel/PageHeader.vue'
import { bulkUpdateFaqPageContent, getFaqPageContent } from '@/api/admin.api'

type FaqItem = { id: string; question: string; answer: string; order: number }
type FaqSection = { id: string; title: string; order: number; items: FaqItem[] }

const { t } = useI18n()
const PAGE_NAME = 'faq'

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

const headerTitle = ref('')
const headerDescription = ref('')
const sections = ref<FaqSection[]>([])

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function sectionMap(apiSections: { sectionKey: string; content?: string | null }[]) {
  return Object.fromEntries(apiSections.map((s) => [s.sectionKey, s.content ?? '']))
}

function normalizeSections(raw: unknown): FaqSection[] {
  if (!Array.isArray(raw)) return []
  return raw.map((section, sIndex) => {
    const s = (section ?? {}) as Record<string, unknown>
    const itemsRaw = Array.isArray(s.items) ? s.items : []
    const items = itemsRaw.map((item, iIndex) => {
      const it = (item ?? {}) as Record<string, unknown>
      return {
        id: String(it.id ?? newId('faq')),
        question: String(it.question ?? ''),
        answer: String(it.answer ?? ''),
        order: typeof it.order === 'number' ? it.order : iIndex,
      }
    })
    items.sort((a, b) => a.order - b.order)
    return {
      id: String(s.id ?? newId('section')),
      title: String(s.title ?? ''),
      order: typeof s.order === 'number' ? s.order : sIndex,
      items,
    }
  }).sort((a, b) => a.order - b.order)
}

async function loadContent() {
  loading.value = true
  error.value = null
  try {
    const apiSections = await getFaqPageContent(PAGE_NAME)
    const map = sectionMap(apiSections)
    headerTitle.value = map.faq_header_title ?? ''
    headerDescription.value = map.faq_header_description ?? ''
    const parsed = map.faq_sections_json ? JSON.parse(map.faq_sections_json) : []
    sections.value = normalizeSections(parsed)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('admin.views.faqPageContent.failedLoad')
  } finally {
    loading.value = false
  }
}

function addSection() {
  sections.value.push({
    id: newId('section'),
    title: '',
    order: sections.value.length,
    items: [],
  })
}

function removeSection(index: number) {
  sections.value.splice(index, 1)
  reindexSections()
}

function moveSection(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= sections.value.length) return
  const copy = [...sections.value]
  const moved = copy.splice(index, 1)[0]
  if (!moved) return
  copy.splice(target, 0, moved)
  sections.value = copy
  reindexSections()
}

function addItem(sectionIndex: number) {
  const section = sections.value[sectionIndex]
  if (!section) return
  section.items.push({
    id: newId('faq'),
    question: '',
    answer: '',
    order: section.items.length,
  })
}

function removeItem(sectionIndex: number, itemIndex: number) {
  const section = sections.value[sectionIndex]
  if (!section) return
  section.items.splice(itemIndex, 1)
  reindexItems(sectionIndex)
}

function moveItem(sectionIndex: number, itemIndex: number, delta: number) {
  const section = sections.value[sectionIndex]
  if (!section) return
  const items = section.items
  const target = itemIndex + delta
  if (target < 0 || target >= items.length) return
  const copy = [...items]
  const moved = copy.splice(itemIndex, 1)[0]
  if (!moved) return
  copy.splice(target, 0, moved)
  section.items = copy
  reindexItems(sectionIndex)
}

function reindexSections() {
  sections.value.forEach((s, i) => {
    s.order = i
  })
}

function reindexItems(sectionIndex: number) {
  const section = sections.value[sectionIndex]
  if (!section) return
  section.items.forEach((item, i) => {
    item.order = i
  })
}

async function saveContent() {
  saving.value = true
  showError.value = false
  try {
    reindexSections()
    sections.value.forEach((_, i) => reindexItems(i))
    await bulkUpdateFaqPageContent(
      {
        faq_header_title: headerTitle.value,
        faq_header_description: headerDescription.value,
        faq_sections_json: JSON.stringify(sections.value),
      },
      PAGE_NAME
    )
    showSuccess.value = true
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : t('admin.views.faqPageContent.failedSave')
    showError.value = true
  } finally {
    saving.value = false
  }
}

onMounted(loadContent)
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.flex-grow-1 {
  flex: 1 1 auto;
  min-width: 12rem;
}
</style>
