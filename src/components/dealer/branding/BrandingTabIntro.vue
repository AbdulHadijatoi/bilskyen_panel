<template>
  <div class="branding-tab-intro">
    <h2 class="branding-tab-intro__title">{{ title }}</h2>
    <PanelHelpHint :text="help" location="bottom start" :max-width="360" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import PanelHelpHint from '@/components/panel/PanelHelpHint.vue'

defineProps<{
  title: string
  help: string
  ariaLabel: string
}>()
</script>

<style scoped>
.branding-tab-intro {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.branding-tab-intro__title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.3;
}
</style>
