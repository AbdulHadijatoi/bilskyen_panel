<template>
  <div class="terms-page-content-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">Terms of Service Content Management</h2>
        <p class="page-description">
          Edit the terms of service page content below. Use the toolbar for headings, lists, bold, italic, and links. Changes are saved to the database and cache is automatically cleared.
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
          Save Changes
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-4">Loading terms of service content...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>Error Loading Content</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- WYSIWYG Editor -->
    <div v-else class="editor-wrapper">
      <RichTextEditor
        v-model="termsBody"
        placeholder="Write your terms of service content here…"
      />
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      Terms of service content updated successfully!
      <template #actions>
        <v-btn variant="text" @click="showSuccess = false">Close</v-btn>
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
        <v-btn variant="text" @click="showError = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getTermsPageContent,
  bulkUpdateTermsPageContent,
} from '@/api/admin.api'
import RichTextEditor from '@/components/admin/RichTextEditor.vue'

const BODY_KEY = 'terms_body'

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const termsBody = ref('')

async function loadContent() {
  loading.value = true
  error.value = null
  try {
    const sections = await getTermsPageContent('terms')
    const bodySection = sections.find((s) => s.sectionKey === BODY_KEY)
    termsBody.value = bodySection?.content ?? ''
  } catch (err: any) {
    error.value = err.message || 'Failed to load terms of service content'
    console.error('Error loading terms of service content:', err)
  } finally {
    loading.value = false
  }
}

async function saveContent() {
  saving.value = true
  errorMessage.value = ''
  showError.value = false
  try {
    await bulkUpdateTermsPageContent({ [BODY_KEY]: termsBody.value || null }, 'terms')
    showSuccess.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save terms of service content'
    showError.value = true
    console.error('Error saving terms of service content:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.terms-page-content-container {
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

.editor-wrapper {
  max-width: 900px;
  margin: 0 auto;
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
