<template>
  <div class="live-preview">
    <div class="live-preview__toolbar">
      <span class="text-caption text-medium-emphasis">{{ t('admin.cms.builder.livePreview') }}</span>
      <div class="d-flex gap-1">
        <v-btn
          size="x-small"
          :variant="device === 'desktop' ? 'flat' : 'text'"
          :color="device === 'desktop' ? 'primary' : undefined"
          icon="mdi-monitor"
          @click="device = 'desktop'"
        />
        <v-btn
          size="x-small"
          :variant="device === 'mobile' ? 'flat' : 'text'"
          :color="device === 'mobile' ? 'primary' : undefined"
          icon="mdi-cellphone"
          @click="device = 'mobile'"
        />
        <v-btn size="x-small" variant="text" icon="mdi-refresh" :loading="loading" @click="refresh" />
      </div>
    </div>
    <div class="live-preview__frame-wrap" :class="{ 'live-preview__frame-wrap--mobile': device === 'mobile' }">
      <div v-if="loading" class="live-preview__loading">{{ t('admin.cms.builder.previewLoading') }}</div>
      <iframe
        ref="frame"
        class="live-preview__iframe"
        title="CMS preview"
        sandbox="allow-same-origin allow-scripts"
        :srcdoc="html"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  payload: Record<string, unknown>
  fetcher: (data: Record<string, unknown>) => Promise<string>
}>()

const { t } = useI18n()
const html = ref('<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;color:#64748b">Preview</body></html>')
const loading = ref(false)
const device = ref<'desktop' | 'mobile'>('desktop')
let timer: ReturnType<typeof setTimeout> | null = null
let seq = 0

async function refresh() {
  const my = ++seq
  loading.value = true
  try {
    const result = await props.fetcher(props.payload)
    if (my === seq) html.value = result
  } catch {
    if (my === seq) {
      html.value = '<!DOCTYPE html><html><body style="padding:24px;font-family:sans-serif;color:#b91c1c">Preview failed</body></html>'
    }
  } finally {
    if (my === seq) loading.value = false
  }
}

watch(
  () => JSON.stringify(props.payload),
  () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(refresh, 400)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.live-preview {
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  height: 100%;
  min-height: 520px;
  display: flex;
  flex-direction: column;
}
.live-preview__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #e5e7eb);
  background: #fafafa;
}
.live-preview__frame-wrap {
  flex: 1;
  position: relative;
  background: #e5e7eb;
  display: flex;
  justify-content: center;
  min-height: 480px;
}
.live-preview__frame-wrap--mobile .live-preview__iframe {
  max-width: 390px;
}
.live-preview__iframe {
  width: 100%;
  height: 100%;
  min-height: 480px;
  border: 0;
  background: #fff;
}
.live-preview__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  z-index: 2;
  font-size: 13px;
  color: #6b7280;
}
</style>
