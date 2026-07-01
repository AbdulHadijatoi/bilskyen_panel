<template>
  <div class="panel-mini-stat">
    <div class="panel-mini-stat__header">
      <v-icon :size="18" :color="iconColor">{{ icon }}</v-icon>
      <span class="panel-mini-stat__label">{{ label }}</span>
    </div>
    <div class="panel-mini-stat__value">{{ value }}</div>
    <div v-if="subtitle" class="panel-mini-stat__sub">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  iconColor?: string
  label: string
  value: string | number
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
})
</script>
