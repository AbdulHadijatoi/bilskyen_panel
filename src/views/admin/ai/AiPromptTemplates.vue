<template>
  <div>
    <div class="header-section mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">{{ t('admin.views.ai.promptsTitle') }}</h1>
      <p class="text-body-2 text-medium-emphasis">{{ t('admin.views.ai.promptsSubtitle') }}</p>
    </div>

    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t('admin.views.ai.promptPlaceholders') }}
    </v-alert>

    <v-expansion-panels v-if="templates.length" multiple>
      <v-expansion-panel v-for="template in templates" :key="template.id">
        <v-expansion-panel-title>
          <div class="d-flex align-center gap-2">
            <span class="font-weight-medium">{{ template.name }}</span>
            <v-chip size="x-small" variant="tonal">{{ template.key }}</v-chip>
            <v-chip v-if="!template.is_active" size="x-small" color="warning" variant="tonal">
              Inactive
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-text-field v-model="template.name" :label="t('common.name')" variant="outlined" density="compact" class="mb-3" />
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
          <v-switch v-model="template.is_active" label="Active" color="primary" class="mb-3" />
          <v-btn color="primary" :loading="savingId === template.id" @click="save(template)">
            {{ t('common.save') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-else-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAiPromptTemplates, updateAiPromptTemplate, type AiPromptTemplateModel } from '@/api/admin.api'

const { t } = useI18n()
const templates = ref<AiPromptTemplateModel[]>([])
const loading = ref(false)
const savingId = ref<number | null>(null)

async function load() {
  loading.value = true
  try {
    templates.value = await getAiPromptTemplates()
  } finally {
    loading.value = false
  }
}

async function save(template: AiPromptTemplateModel) {
  savingId.value = template.id
  try {
    await updateAiPromptTemplate(template.id, {
      name: template.name,
      system_prompt: template.system_prompt,
      user_prompt_template: template.user_prompt_template,
      is_active: template.is_active,
    })
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>
