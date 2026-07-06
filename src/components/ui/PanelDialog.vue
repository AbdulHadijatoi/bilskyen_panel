<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="panel-dialog" :class="{ 'panel-dialog--flush': flush }">
      <div v-if="title || $slots.header" class="panel-dialog__header">
        <slot name="header">
          <div class="panel-dialog__title-row">
            <v-icon v-if="icon" size="20" class="panel-dialog__icon">{{ icon }}</v-icon>
            <h2 class="panel-dialog__title">{{ title }}</h2>
          </div>
        </slot>
        <button
          v-if="showClose"
          type="button"
          class="panel-dialog__close"
          :aria-label="closeLabel"
          @click="close"
        >
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <div class="panel-dialog__body" :class="{ 'panel-dialog__body--flush': flush }">
        <slot />
      </div>

      <div v-if="$slots.footer" class="panel-dialog__footer">
        <slot name="footer" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  icon?: string
  maxWidth?: number | string
  persistent?: boolean
  scrollable?: boolean
  showClose?: boolean
  closeLabel?: string
  flush?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 560,
  persistent: false,
  scrollable: true,
  showClose: true,
  closeLabel: 'Close',
  flush: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.panel-dialog {
  border-radius: var(--radius-xl) !important;
  overflow: hidden;
}

.panel-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
}

.panel-dialog__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.panel-dialog__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.3;
}

.panel-dialog__icon {
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.panel-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--card);
  color: var(--muted-foreground);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s, color 0.15s;
}

.panel-dialog__close:hover {
  background: var(--muted);
  color: var(--foreground);
}

.panel-dialog__body {
  padding: var(--space-5) var(--space-6);
  max-height: min(70vh, 640px);
  overflow-y: auto;
}

.panel-dialog__body--flush {
  padding: 0;
}

.panel-dialog--flush .panel-dialog__header {
  border-bottom: none;
}

.panel-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border);
}
</style>
