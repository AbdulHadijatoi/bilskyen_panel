<template>
  <div class="panel-field" :class="{ 'panel-field--disabled': disabled }">
    <label v-if="label" class="panel-field__label" :for="fieldId">
      {{ label }}
      <span v-if="required" class="panel-field__required">*</span>
    </label>
    <p v-if="description" class="panel-field__description">{{ description }}</p>
    <div class="panel-field__control">
      <slot :id="fieldId" />
    </div>
    <p v-if="hint && !error" class="panel-field__hint">{{ hint }}</p>
    <p v-if="error" class="panel-field__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label?: string
  description?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
})

const fieldId = useId()
</script>

<style scoped>
.panel-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.panel-field__label {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.4;
}

.panel-field__required {
  color: var(--destructive);
  margin-left: 2px;
}

.panel-field__description {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  margin: calc(var(--space-1) * -1) 0 0;
  line-height: 1.5;
}

.panel-field__hint,
.panel-field__error {
  font-size: var(--text-xs);
  margin: 0;
  line-height: 1.4;
}

.panel-field__hint {
  color: var(--muted-foreground);
}

.panel-field__error {
  color: var(--destructive);
}

.panel-field--disabled .panel-field__label {
  opacity: 0.6;
}
</style>
