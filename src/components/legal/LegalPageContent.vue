<template>
  <div class="legal-page">
    <header class="legal-page__header">
      <h1>{{ title }}</h1>
      <p v-if="description" class="legal-page__description">{{ description }}</p>
    </header>

    <div v-if="loading" class="legal-page__state">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="legal-page__state legal-page__state--error">{{ error }}</div>
    <article v-else class="legal-page__content">
      <div
        v-if="bodyHtml"
        class="legal-page__body"
        v-html="bodyHtml"
      />
      <p v-else class="legal-page__empty">{{ emptyMessage }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PublicPageContent } from '@/api/public.api'

const props = defineProps<{
  title: string
  description?: string
  bodyKey: string
  emptyMessage: string
  loadContent: () => Promise<PublicPageContent>
}>()

const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const bodyHtml = ref('')

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    const content = await props.loadContent()
    bodyHtml.value = (content[props.bodyKey] ?? '').trim()
  } catch {
    error.value = t('common.failedToLoadData')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.legal-page {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.legal-page__header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.legal-page__description {
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0;
  line-height: 1.6;
}

.legal-page__state {
  margin-top: 2rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.legal-page__state--error {
  color: rgb(var(--v-theme-error));
}

.legal-page__content {
  margin-top: 2rem;
}

.legal-page__body :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
}

.legal-page__body :deep(p),
.legal-page__body :deep(li) {
  line-height: 1.7;
}

.legal-page__empty {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
