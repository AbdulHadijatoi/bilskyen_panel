<template>
  <div class="panel-page pricing-page-content-container">
    <PageHeader
      :title="t('admin.views.pricingPageContent.title')"
      :subtitle="t('admin.views.pricingPageContent.description')"
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
          {{ t('admin.views.pricingPageContent.saveChanges') }}
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <div v-else class="form-wrapper space-y-4">
      <v-card variant="outlined" class="pa-4">
        <v-text-field v-model="headerTitle" :label="t('admin.views.pricingPageContent.headerTitle')" variant="outlined" class="mb-4" />
        <v-textarea v-model="headerDescription" :label="t('admin.views.pricingPageContent.headerDescription')" rows="2" variant="outlined" class="mb-4" />
        <v-text-field v-model="faqTitle" :label="t('admin.views.pricingPageContent.faqTitle')" variant="outlined" class="mb-4" />
        <v-textarea v-model="footnote" :label="t('admin.views.pricingPageContent.footnote')" rows="2" variant="outlined" class="mb-4" />
        <v-switch v-model="showEnterpriseCard" :label="t('admin.views.pricingPageContent.showEnterpriseCard')" color="primary" hide-details />
      </v-card>

      <v-card variant="outlined" class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <h3 class="text-subtitle-1 font-weight-medium">{{ t('admin.views.pricingPageContent.faqItems') }}</h3>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addFaqItem">{{ t('admin.views.pricingPageContent.addFaq') }}</v-btn>
        </div>
        <div v-for="(item, index) in faqItems" :key="index" class="faq-item mb-4 pb-4 border-b">
          <v-text-field v-model="item.question" :label="t('admin.views.pricingPageContent.question')" variant="outlined" class="mb-2" />
          <v-textarea v-model="item.answer" :label="t('admin.views.pricingPageContent.answer')" rows="3" variant="outlined" />
          <v-btn size="small" color="error" variant="text" @click="removeFaqItem(index)">{{ t('common.delete') }}</v-btn>
        </div>
      </v-card>
    </div>

    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      {{ t('admin.views.pricingPageContent.successMessage') }}
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
import { bulkUpdatePricingPageContent, getPricingPageContent } from '@/api/admin.api'

type FaqItem = { question: string; answer: string }

const { t } = useI18n()
const PAGE_NAME = 'dealer-pricing'

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

const headerTitle = ref('')
const headerDescription = ref('')
const faqTitle = ref('')
const footnote = ref('')
const showEnterpriseCard = ref(true)
const faqItems = ref<FaqItem[]>([])

function sectionMap(sections: { sectionKey: string; content?: string | null }[]) {
  return Object.fromEntries(sections.map((s) => [s.sectionKey, s.content ?? '']))
}

async function loadContent() {
  loading.value = true
  error.value = null
  try {
    const sections = await getPricingPageContent(PAGE_NAME)
    const map = sectionMap(sections)
    headerTitle.value = map.pricing_header_title ?? ''
    headerDescription.value = map.pricing_header_description ?? ''
    faqTitle.value = map.pricing_faq_title ?? ''
    footnote.value = map.pricing_footnote ?? ''
    showEnterpriseCard.value = map.show_enterprise_card !== 'false'
    const parsed = map.pricing_faq_json ? JSON.parse(map.pricing_faq_json) : []
    faqItems.value = Array.isArray(parsed) ? parsed : []
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('admin.views.pricingPageContent.failedLoad')
  } finally {
    loading.value = false
  }
}

function addFaqItem() {
  faqItems.value.push({ question: '', answer: '' })
}

function removeFaqItem(index: number) {
  faqItems.value.splice(index, 1)
}

async function saveContent() {
  saving.value = true
  showError.value = false
  try {
    await bulkUpdatePricingPageContent(
      {
        pricing_header_title: headerTitle.value.trim() || null,
        pricing_header_description: headerDescription.value.trim() || null,
        pricing_faq_title: faqTitle.value.trim() || null,
        pricing_footnote: footnote.value.trim() || null,
        show_enterprise_card: showEnterpriseCard.value ? 'true' : 'false',
        pricing_faq_json: JSON.stringify(
          faqItems.value.filter((item) => item.question.trim() !== '')
        ),
      },
      PAGE_NAME
    )
    showSuccess.value = true
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : t('admin.views.pricingPageContent.failedSave')
    showError.value = true
  } finally {
    saving.value = false
  }
}

onMounted(loadContent)
</script>

<style scoped>
.pricing-page-content-container {
  padding: 16px;
  min-height: 100vh;
}

.form-wrapper {
  max-width: 800px;
}

.faq-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>
