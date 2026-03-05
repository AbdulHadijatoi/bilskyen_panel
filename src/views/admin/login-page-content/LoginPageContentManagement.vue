<template>
  <div class="login-page-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">{{ t('admin.views.loginPageContent.title') }}</h2>
        <p class="page-description">
          {{ t('admin.views.loginPageContent.description') }}
        </p>
      </div>
      <div class="header-actions">
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          variant="flat"
          :loading="saving"
          :disabled="saving"
          @click="saveContent"
          class="save-button"
        >
          {{ t('admin.views.loginPageContent.saveChanges') }}
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-4">{{ t('admin.views.loginPageContent.loading') }}</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>{{ t('admin.views.loginPageContent.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Form -->
    <div v-else class="form-wrapper">
      <v-card variant="outlined" class="pa-4">
        <v-textarea
          v-model="testimonialQuote"
          :label="t('admin.views.loginPageContent.testimonialQuote')"
          :placeholder="t('admin.views.loginPageContent.testimonialQuotePlaceholder')"
          rows="4"
          variant="outlined"
          hide-details
          class="mb-4"
        />
        <v-text-field
          v-model="testimonialAuthor"
          :label="t('admin.views.loginPageContent.testimonialAuthor')"
          :placeholder="t('admin.views.loginPageContent.testimonialAuthorPlaceholder')"
          variant="outlined"
          hide-details
        />
      </v-card>
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      {{ t('admin.views.loginPageContent.successMessage') }}
      <template #actions>
        <v-btn variant="text" @click="showSuccess = false">{{ t('common.close') }}</v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn variant="text" @click="showError = false">{{ t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getLoginPageContent,
  bulkUpdateLoginPageContent,
} from '@/api/admin.api'

const { t } = useI18n()
const TESTIMONIAL_QUOTE_KEY = 'testimonial_quote'
const TESTIMONIAL_AUTHOR_KEY = 'testimonial_author'

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const testimonialQuote = ref('')
const testimonialAuthor = ref('')

async function loadContent() {
  loading.value = true
  error.value = null
  try {
    const sections = await getLoginPageContent('login')
    const quoteSection = sections.find((s) => s.sectionKey === TESTIMONIAL_QUOTE_KEY)
    const authorSection = sections.find((s) => s.sectionKey === TESTIMONIAL_AUTHOR_KEY)
    testimonialQuote.value = quoteSection?.content ?? ''
    testimonialAuthor.value = authorSection?.content ?? ''
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    error.value = message || t('admin.views.loginPageContent.failedLoad')
    console.error('Error loading login page content:', err)
  } finally {
    loading.value = false
  }
}

async function saveContent() {
  saving.value = true
  errorMessage.value = ''
  showError.value = false
  try {
    await bulkUpdateLoginPageContent(
      {
        [TESTIMONIAL_QUOTE_KEY]: testimonialQuote.value?.trim() || null,
        [TESTIMONIAL_AUTHOR_KEY]: testimonialAuthor.value?.trim() || null,
      },
      'login'
    )
    showSuccess.value = true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    errorMessage.value = message || t('admin.views.loginPageContent.failedSave')
    showError.value = true
    console.error('Error saving login page content:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.login-page-content-container {
  padding: 16px;
  background-color: #fafafa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.page-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.save-button {
  flex-shrink: 0;
}

.form-wrapper {
  max-width: 640px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .save-button {
    width: 100%;
  }
}
</style>
