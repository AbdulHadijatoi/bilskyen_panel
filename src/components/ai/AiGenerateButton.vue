<template>
  <div>
    <div v-if="aiEnabled" class="d-flex align-center gap-2 flex-wrap">
      <v-btn
        variant="outlined"
        color="secondary"
        size="small"
        :loading="loading && !dialogOpen"
        :disabled="disabled || quotaExhausted"
        prepend-icon="mdi-creation"
        @click="openDialog"
      >
        {{ label || t('dealer.views.ai.generate') }}
      </v-btn>
      <v-chip
        v-if="remainingRequests !== null"
        size="x-small"
        variant="tonal"
        :color="quotaExhausted ? 'error' : 'secondary'"
      >
        {{ t('dealer.views.ai.remainingRequests', { count: remainingRequests }) }}
      </v-chip>
    </div>

    <v-dialog v-model="dialogOpen" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ t('dealer.views.ai.previewTitle') }}</span>
          <v-btn icon variant="text" @click="dialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="showToneSelector || !autoGenerate" class="d-flex align-center gap-3 mb-4">
            <v-select
              v-if="showToneSelector"
              v-model="tone"
              :items="toneOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 180px"
              :label="t('dealer.views.ai.tone')"
            />
            <v-btn
              v-if="!autoGenerate || previewText"
              color="primary"
              variant="flat"
              :loading="loading"
              @click="runGenerate"
            >
              {{ previewText ? t('dealer.views.ai.regenerate') : t('dealer.views.ai.generate') }}
            </v-btn>
          </div>

          <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
          <v-alert v-if="slowLoading" type="info" variant="tonal" density="compact" class="mb-4">
            {{ t('dealer.views.ai.slowGeneration') }}
          </v-alert>
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
import { generateAdminAiContent } from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const props = withDefaults(defineProps<{
  task: string
  context: Record<string, unknown>
  locale?: string
  contextType?: string
  contextId?: number
  label?: string
  disabled?: boolean
  /** Dealer (default) or admin CMS generation */
  mode?: 'dealer' | 'admin'
  /** When true, generate immediately on dialog open (legacy). Default false so tone can be chosen first. */
  autoGenerate?: boolean
  /** Show tone selector (dealer tasks that support tone in context) */
  showToneSelector?: boolean
  /** Parse multi-field output (e.g. seo_meta Title/Description lines) */
  parseAccept?: (text: string) => Record<string, string>
}>(), {
  disabled: false,
  mode: 'dealer',
  autoGenerate: false,
  showToneSelector: true,
})

const emit = defineEmits<{
  accept: [text: string]
  'accept:parsed': [fields: Record<string, string>]
}>()

const { t, locale } = useI18n()

const aiEnabled = ref(props.mode === 'admin')
const dialogOpen = ref(false)
const loading = ref(false)
const slowLoading = ref(false)
const error = ref<string | null>(null)
const previewText = ref('')
const meta = ref<AiGenerateResult | null>(null)
const tone = ref('professional')
const remainingRequests = ref<number | null>(null)
let slowTimer: ReturnType<typeof setTimeout> | null = null

const toneOptions = computed(() => [
  { title: t('dealer.views.ai.toneProfessional'), value: 'professional' },
  { title: t('dealer.views.ai.toneFriendly'), value: 'friendly' },
])

const quotaExhausted = computed(() => remainingRequests.value !== null && remainingRequests.value <= 0)

async function loadConfig() {
  if (props.mode === 'admin') {
    aiEnabled.value = true
    return
  }
  try {
    const config = await getAiConfig()
    aiEnabled.value = config.enabled && config.tasks.includes(props.task)
    remainingRequests.value = config.remaining_requests
  } catch {
    aiEnabled.value = false
  }
}

function clearSlowTimer() {
  if (slowTimer) {
    clearTimeout(slowTimer)
    slowTimer = null
  }
  slowLoading.value = false
}

async function runGenerate() {
  error.value = null
  loading.value = true
  clearSlowTimer()
  slowTimer = setTimeout(() => {
    slowLoading.value = true
  }, 15000)

  try {
    const payload = {
      task: props.task,
      context: props.showToneSelector
        ? { ...props.context, tone: tone.value }
        : { ...props.context },
      locale: props.locale || locale.value,
      context_type: props.contextType,
      context_id: props.contextId,
    }

    const result = props.mode === 'admin'
      ? await generateAdminAiContent(payload)
      : await generateAiContent(payload)

    previewText.value = result.text
    meta.value = result

    if (props.mode === 'dealer' && remainingRequests.value !== null && remainingRequests.value > 0) {
      remainingRequests.value -= 1
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.ai.generateFailed')
  } finally {
    loading.value = false
    clearSlowTimer()
  }
}

async function openDialog() {
  dialogOpen.value = true
  error.value = null
  if (!props.autoGenerate) {
    return
  }
  previewText.value = ''
  meta.value = null
  await runGenerate()
}

function accept() {
  if (props.parseAccept) {
    emit('accept:parsed', props.parseAccept(previewText.value))
  }
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
