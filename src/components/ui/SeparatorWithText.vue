<template>
  <div class="separator-with-text">
    <div class="separator-line" />
    <span class="separator-text">{{ text }}</span>
    <div class="separator-line" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '',
})
</script>

<style scoped>
.separator-with-text {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.separator-line {
  flex: 1;
  height: 1px;
  background-color: var(--border);
}

.separator-text {
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: nowrap;
}
</style>

