<template>
  <div class="social-links-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">{{ t('admin.views.socialLinks.title') }}</h2>
        <p class="page-description">
          {{ t('admin.views.socialLinks.description') }}
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
          {{ t('admin.views.socialLinks.saveChanges') }}
        </v-btn>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-4">{{ t('admin.views.socialLinks.loading') }}</p>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
    >
      <v-alert-title>{{ t('admin.views.socialLinks.errorLoading') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <div v-else class="form-wrapper">
      <v-card variant="outlined" class="pa-4">
        <v-text-field
          v-model="instagramUrl"
          :label="t('admin.views.socialLinks.instagram')"
          :placeholder="t('admin.views.socialLinks.instagramPlaceholder')"
          variant="outlined"
          hide-details
          class="mb-4"
        />
        <v-text-field
          v-model="facebookUrl"
          :label="t('admin.views.socialLinks.facebook')"
          :placeholder="t('admin.views.socialLinks.facebookPlaceholder')"
          variant="outlined"
          hide-details
          class="mb-4"
        />
        <v-text-field
          v-model="twitterUrl"
          :label="t('admin.views.socialLinks.twitter')"
          :placeholder="t('admin.views.socialLinks.twitterPlaceholder')"
          variant="outlined"
          hide-details
          class="mb-4"
        />
        <v-text-field
          v-model="linkedinUrl"
          :label="t('admin.views.socialLinks.linkedin')"
          :placeholder="t('admin.views.socialLinks.linkedinPlaceholder')"
          variant="outlined"
          hide-details
        />
      </v-card>
    </div>

    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      {{ t('admin.views.socialLinks.successMessage') }}
      <template #actions>
        <v-btn variant="text" @click="showSuccess = false">{{ t('common.close') }}</v-btn>
      </template>
    </v-snackbar>

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
import { getHomePageContent, bulkUpdateHomePageContent } from '@/api/admin.api'

const { t } = useI18n()

const INSTAGRAM_KEY = 'footer_social_instagram_url'
const FACEBOOK_KEY = 'footer_social_facebook_url'
const TWITTER_KEY = 'footer_social_twitter_url'
const LINKEDIN_KEY = 'footer_social_linkedin_url'

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

const instagramUrl = ref('')
const facebookUrl = ref('')
const twitterUrl = ref('')
const linkedinUrl = ref('')

async function loadContent() {
  loading.value = true
  error.value = null

  try {
    const sections = await getHomePageContent('home')
    instagramUrl.value = sections.find((s) => s.sectionKey === INSTAGRAM_KEY)?.content ?? ''
    facebookUrl.value = sections.find((s) => s.sectionKey === FACEBOOK_KEY)?.content ?? ''
    twitterUrl.value = sections.find((s) => s.sectionKey === TWITTER_KEY)?.content ?? ''
    linkedinUrl.value = sections.find((s) => s.sectionKey === LINKEDIN_KEY)?.content ?? ''
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    error.value = message || t('admin.views.socialLinks.failedLoad')
  } finally {
    loading.value = false
  }
}

async function saveContent() {
  saving.value = true
  errorMessage.value = ''
  showError.value = false

  try {
    await bulkUpdateHomePageContent(
      {
        [INSTAGRAM_KEY]: instagramUrl.value?.trim() || null,
        [FACEBOOK_KEY]: facebookUrl.value?.trim() || null,
        [TWITTER_KEY]: twitterUrl.value?.trim() || null,
        [LINKEDIN_KEY]: linkedinUrl.value?.trim() || null,
      },
      'home'
    )
    showSuccess.value = true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    errorMessage.value = message || t('admin.views.socialLinks.failedSave')
    showError.value = true
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.social-links-container {
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
  max-width: 800px;
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
