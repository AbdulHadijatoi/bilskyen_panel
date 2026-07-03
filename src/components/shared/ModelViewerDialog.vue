<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
    @after-enter="handleDialogOpened"
    @after-leave="handleDialogClosed"
  >
    <v-card>
      <v-card-title class="d-flex align-center text-subtitle-1">
        <v-icon size="18" class="mr-2">mdi-rotate-3d</v-icon>
        {{ title }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </v-card-title>
      <v-card-text class="pa-3 pt-0">
        <div class="model-viewer-dialog__wrapper">
          <model-viewer
            v-if="showViewer && resolvedSrc"
            :key="resolvedSrc"
            :src="resolvedSrc"
            :alt="title"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            class="model-viewer-dialog__viewer"
            @error="onViewerError"
          />
          <div v-else-if="loading" class="model-viewer-dialog__overlay">
            <v-progress-circular indeterminate color="primary" size="40" />
          </div>
          <div v-else-if="loadError" class="model-viewer-dialog__overlay model-viewer-dialog__error text-body-2 text-error">
            {{ loadError }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { resolveStorageAssetUrl } from '@/utils/storageUrl'

const MODEL_VIEWER_SCRIPT =
  'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js'

const props = defineProps<{
  modelValue: boolean
  src: string
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const resolvedSrc = computed(() => resolveStorageAssetUrl(props.src) ?? '')

const showViewer = ref(false)
const loading = ref(false)
const loadError = ref<string | null>(null)

let scriptLoadPromise: Promise<void> | null = null

function loadModelViewerScript(): Promise<void> {
  if (customElements.get('model-viewer')) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = MODEL_VIEWER_SCRIPT
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load 3D viewer'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

function onViewerError() {
  loadError.value = 'Unable to load 3D preview.'
  showViewer.value = false
}

function handleDialogClosed() {
  showViewer.value = false
  loadError.value = null
  loading.value = false
}

async function handleDialogOpened() {
  if (!resolvedSrc.value) {
    loadError.value = 'No 3D model URL available.'
    return
  }

  loading.value = true
  loadError.value = null
  showViewer.value = false

  try {
    await loadModelViewerScript()
    await customElements.whenDefined('model-viewer')
    await nextTick()
    showViewer.value = true
  } catch {
    loadError.value = 'Unable to load 3D viewer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.model-viewer-dialog__wrapper {
  position: relative;
  min-height: 520px;
}

.model-viewer-dialog__viewer {
  display: block;
  width: 100%;
  height: 520px;
  border-radius: 8px;
  background: rgb(var(--v-theme-surface-variant));
}

.model-viewer-dialog__overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520px;
  background: rgb(var(--v-theme-surface));
}

.model-viewer-dialog__error {
  padding: 1rem;
  text-align: center;
}
</style>
