<template>
  <div class="panel-page">
    <PageHeader :title="t('admin.views.ai.promptsTitle')" :subtitle="t('admin.views.ai.promptsSubtitle')" />

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('admin.views.ai.promptPlaceholders') }}
    </v-alert>

    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">{{ loadError }}</v-alert>

    <v-expansion-panels v-if="templates.length" multiple>
      <v-expansion-panel v-for="template in templates" :key="template.id">
        <v-expansion-panel-title>
          <div class="d-flex align-center gap-2">
            <span class="font-weight-medium">{{ template.name }}</span>
            <v-chip size="x-small" variant="tonal">{{ template.key }}</v-chip>
            <v-chip v-if="!template.is_active" size="x-small" color="warning" variant="tonal">
              {{ t('admin.views.ai.inactive') }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-text-field v-model="template.name" :label="t('common.name')" variant="outlined" density="compact" class="mb-3" />
          <v-textarea
            v-if="template.description != null"
            v-model="template.description"
            :label="t('common.description')"
            variant="outlined"
            rows="2"
            class="mb-3"
          />
          <v-textarea
            v-model="template.system_prompt"
            :label="t('admin.views.ai.systemPrompt')"
            variant="outlined"
            rows="4"
            class="mb-3"
          />
          <v-textarea
            v-model="template.user_prompt_template"
            :label="t('admin.views.ai.userPrompt')"
            variant="outlined"
            rows="6"
            class="mb-3"
          />
          <v-switch v-model="template.is_active" :label="t('admin.views.ai.active')" color="primary" class="mb-3" />
          <v-btn color="primary" :loading="savingId === template.id" @click="save(template)">
            {{ t('common.save') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-alert v-else-if="!loading" type="info" variant="tonal">
      {{ t('admin.views.ai.noTemplates') }}
    </v-alert>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAiPromptTemplates, updateAiPromptTemplate, type AiPromptTemplateModel } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import PageHeader from '@/components/panel/PageHeader.vue'

const { t } = useI18n()
const templates = ref<AiPromptTemplateModel[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const savingId = ref<number | null>(null)
const snackbar = ref({ show: false, text: '', color: 'success' as 'success' | 'error' })

async function load() {
  loading.value = true
  loadError.value = null
  try {
    templates.value = await getAiPromptTemplates()
  } catch (err) {
    loadError.value = (err as ApiErrorModel).message || t('admin.views.ai.promptsLoadFailed')
  } finally {
    loading.value = false
  }
}

async function save(template: AiPromptTemplateModel) {
  savingId.value = template.id
  try {
    await updateAiPromptTemplate(template.id, {
      name: template.name,
      description: template.description,
      system_prompt: template.system_prompt,
      user_prompt_template: template.user_prompt_template,
      is_active: template.is_active,
    })
    snackbar.value = { show: true, text: t('admin.views.ai.promptSaved'), color: 'success' }
  } catch (err) {
    snackbar.value = {
      show: true,
      text: (err as ApiErrorModel).message || t('admin.views.ai.promptSaveFailed'),
      color: 'error',
    }
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>
