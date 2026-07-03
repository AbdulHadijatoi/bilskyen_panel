<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
    @after-leave="clearViewer"
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
          <div ref="viewerHost" class="model-viewer-dialog__host" />
          <div v-if="loading" class="model-viewer-dialog__overlay">
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
import { computed, nextTick, ref, watch } from 'vue'
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

const viewerHost = ref<HTMLElement | null>(null)
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

function clearViewer() {
  viewerHost.value?.replaceChildren()
  loadError.value = null
}

async function renderViewer() {
  if (!viewerHost.value || !resolvedSrc.value) return

  clearViewer()
  loading.value = true

  try {
    await loadModelViewerScript()
    await nextTick()

    const viewer = document.createElement('model-viewer')
    viewer.setAttribute('src', resolvedSrc.value)
    viewer.setAttribute('camera-controls', '')
    viewer.setAttribute('auto-rotate', '')
    viewer.setAttribute('shadow-intensity', '1')
    viewer.setAttribute('crossorigin', 'anonymous')
    viewer.setAttribute('alt', props.title)
    viewer.style.width = '100%'
    viewer.style.height = 'min(70vh, 520px)'
    viewer.style.borderRadius = '8px'
    viewer.style.background = 'rgb(var(--v-theme-surface-variant))'

    viewerHost.value.appendChild(viewer)
  } catch {
    loadError.value = 'Unable to load 3D preview.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, resolvedSrc.value] as const,
  ([visible, src]) => {
    if (visible && src) {
      void renderViewer()
    } else if (!visible) {
      clearViewer()
    }
  }
)
</script>

<style scoped>
.model-viewer-dialog__wrapper {
  position: relative;
  min-height: min(70vh, 520px);
}

.model-viewer-dialog__host {
  min-height: min(70vh, 520px);
}

.model-viewer-dialog__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface));
}

.model-viewer-dialog__error {
  padding: 1rem;
  text-align: center;
}
</style>
