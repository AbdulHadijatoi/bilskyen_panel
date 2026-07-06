<template>
  <section class="panel-section" :class="{ 'panel-section--divider': divider }">
    <div v-if="title || description || $slots.header" class="panel-section__header">
      <slot name="header">
        <div class="panel-section__title-row">
          <v-icon v-if="icon" size="18" class="panel-section__icon">{{ icon }}</v-icon>
          <h3 class="panel-section__title">{{ title }}</h3>
        </div>
        <p v-if="description" class="panel-section__description">{{ description }}</p>
      </slot>
    </div>
    <div class="panel-section__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
  divider?: boolean
}

withDefaults(defineProps<Props>(), {
  divider: true,
})
</script>

<style scoped>
.panel-section {
  margin-bottom: var(--space-6);
}

.panel-section--divider + .panel-section {
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}

.panel-section__header {
  margin-bottom: var(--space-5);
}

.panel-section__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.panel-section__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.4;
}

.panel-section__icon {
  color: var(--muted-foreground);
}

.panel-section__description {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  line-height: 1.5;
}
</style>
