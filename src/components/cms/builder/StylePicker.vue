<template>
  <div class="style-picker">
    <p class="text-medium-emphasis mb-4">{{ hint }}</p>
    <div class="style-picker__grid">
      <button
        v-for="style in styles"
        :key="style.id"
        type="button"
        class="style-picker__card"
        :class="{ 'style-picker__card--selected': modelValue === style.id }"
        @click="$emit('update:modelValue', style.id)"
      >
        <TemplateMiniPreview kind="style" :style-id="style.id" />
        <div class="style-picker__meta">
          <strong>{{ style.label }}</strong>
          <span>{{ style.description }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CMS_STYLES } from '@/constants/cms'
import TemplateMiniPreview from './TemplateMiniPreview.vue'

defineProps<{
  modelValue: string
  hint?: string
}>()

defineEmits<{ 'update:modelValue': [string] }>()

const styles = CMS_STYLES
</script>

<style scoped>
.style-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.style-picker__card {
  text-align: left;
  border: 2px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 10px;
  background: var(--card, #fff);
  cursor: pointer;
}
.style-picker__card--selected {
  border-color: var(--primary, #03418b);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #03418b) 18%, transparent);
}
.style-picker__meta {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.style-picker__meta strong { font-size: 14px; }
.style-picker__meta span { font-size: 12px; color: var(--muted-foreground, #6b7280); line-height: 1.4; }
</style>
