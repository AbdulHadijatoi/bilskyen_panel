<template>
  <div class="panel-card" :class="{ 'panel-card--flush': flush }">
    <div v-if="title || $slots.header" class="panel-card__header">
      <slot name="header">
        <h3 class="panel-card__title">
          <v-icon v-if="icon" :size="18">{{ icon }}</v-icon>
          {{ title }}
        </h3>
      </slot>
      <div v-if="$slots.actions" class="panel-card__actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="panel-card__body" :class="{ 'panel-card__body--flush': flush }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  flush?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.panel-card--flush .panel-card__header {
  border-bottom: none;
}
</style>
