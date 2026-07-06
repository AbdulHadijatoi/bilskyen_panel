<template>
  <div class="panel-toggle" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="tab"
      class="panel-toggle__option"
      :class="{ 'panel-toggle__option--active': modelValue === option.value }"
      :aria-selected="modelValue === option.value"
      @click="select(option.value)"
    >
      {{ option.label }}
      <PanelBadge
        v-if="option.badge"
        :label="option.badge"
        variant="primary"
        size="sm"
        class="panel-toggle__badge"
      />
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import PanelBadge from './PanelBadge.vue'

export interface PanelToggleOption<T extends string | number = string> {
  label: string
  value: T
  badge?: string
}

interface Props {
  modelValue: T
  options: PanelToggleOption<T>[]
  ariaLabel?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

function select(value: T) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.panel-toggle {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--muted);
  gap: 0.125rem;
}

.panel-toggle__option {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4375rem 1rem;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--muted-foreground);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
}

.panel-toggle__option--active {
  color: var(--foreground);
  background: var(--card);
  box-shadow: var(--shadow-sm);
}

.panel-toggle__option:hover:not(.panel-toggle__option--active) {
  color: var(--foreground);
}

.panel-toggle__badge {
  margin-left: 0.125rem;
}
</style>
