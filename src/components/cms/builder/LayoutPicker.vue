<template>
  <div class="layout-picker">
    <p class="text-medium-emphasis mb-4">{{ hint }}</p>
    <div class="layout-picker__grid">
      <button
        v-for="layout in layouts"
        :key="layout.id"
        type="button"
        class="layout-picker__card"
        :class="{ 'layout-picker__card--selected': modelValue === layout.id }"
        @click="$emit('update:modelValue', layout.id)"
      >
        <TemplateMiniPreview kind="layout" :layout-id="layout.id" :style-id="styleId" />
        <div class="layout-picker__meta">
          <strong>{{ layout.label }}</strong>
          <span>{{ layout.description }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CmsLayoutDef } from '@/constants/cms'
import TemplateMiniPreview from './TemplateMiniPreview.vue'

defineProps<{
  layouts: CmsLayoutDef[]
  modelValue: string
  styleId?: string
  hint?: string
}>()

defineEmits<{ 'update:modelValue': [string] }>()
</script>

<style scoped>
.layout-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.layout-picker__card {
  text-align: left;
  border: 2px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 10px;
  background: var(--card, #fff);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.layout-picker__card:hover {
  border-color: color-mix(in srgb, var(--primary, #03418b) 40%, #e5e7eb);
}
.layout-picker__card--selected {
  border-color: var(--primary, #03418b);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #03418b) 18%, transparent);
}
.layout-picker__meta {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.layout-picker__meta strong {
  font-size: 14px;
  color: var(--foreground, #111);
}
.layout-picker__meta span {
  font-size: 12px;
  color: var(--muted-foreground, #6b7280);
  line-height: 1.4;
}
</style>
