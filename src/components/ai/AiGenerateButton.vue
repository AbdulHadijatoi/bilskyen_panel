<template>
  <div>
    <v-btn
      v-if="aiEnabled"
      variant="outlined"
      color="secondary"
      size="small"
      :loading="loading"
      :disabled="disabled"
      prepend-icon="mdi-creation"
      @click="openDialog"
    >
      {{ label || t('dealer.views.ai.generate') }}
    </v-btn>

    <v-dialog v-model="dialogOpen" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ t('dealer.views.ai.previewTitle') }}</span>
          <v-btn icon variant="text" @click="dialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
          <v-textarea
            v-model="previewText"
            variant="outlined"
            rows="10"
            auto-grow
            :label="t('dealer.views.ai.generatedText')"
          />
          <p v-if="meta" class="text-caption text-medium-emphasis mt-2">
            {{ t('dealer.views.ai.generatedBy', { provider: meta.provider, model: meta.model }) }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-select
            v-model="tone"
            :items="toneOptions"
            density="compact"
            variant="outlined"
            hide-details
            class="mr-2"
            style="max-width: 160px"
            :label="t('dealer.views.ai.tone')"
          />
          <v-spacer />
          <v-btn variant="text" :disabled="!previewText" @click="copyToClipboard">
            {{ t('dealer.views.ai.copy') }}
          </v-btn>
          <v-btn variant="text" @click="dialogOpen = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!previewText" @click="accept">
            {{ t('dealer.views.ai.useText') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateAiContent, getAiConfig, type AiGenerateResult } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const props = withDefaults(defineProps<{
  task: string
  context: Record<string, unknown>
  locale?: string
  contextType?: string
  contextId?: number
  label?: string
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  accept: [text: string]
}>()

const { t, locale } = useI18n()

const aiEnabled = ref(false)
const dialogOpen = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const previewText = ref('')
const meta = ref<AiGenerateResult | null>(null)
const tone = ref('professional')

const toneOptions = computed(() => [
  { title: t('dealer.views.ai.toneProfessional'), value: 'professional' },
  { title: t('dealer.views.ai.toneFriendly'), value: 'friendly' },
])

async function loadConfig() {
  try {
    const config = await getAiConfig()
    aiEnabled.value = config.enabled && config.tasks.includes(props.task)
  } catch {
    aiEnabled.value = false
  }
}

async function openDialog() {
  dialogOpen.value = true
  error.value = null
  previewText.value = ''
  meta.value = null
  loading.value = true
  try {
    const result = await generateAiContent({
      task: props.task,
      context: { ...props.context, tone: tone.value },
      locale: props.locale || locale.value,
      context_type: props.contextType,
      context_id: props.contextId,
    })
    previewText.value = result.text
    meta.value = result
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.ai.generateFailed')
  } finally {
    loading.value = false
  }
}

function accept() {
  emit('accept', previewText.value)
  dialogOpen.value = false
}

async function copyToClipboard() {
  if (!previewText.value) return
  try {
    await navigator.clipboard.writeText(previewText.value)
  } catch {
    // ignore
  }
}

onMounted(loadConfig)
</script>
