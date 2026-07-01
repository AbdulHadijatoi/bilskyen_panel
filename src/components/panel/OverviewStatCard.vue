<template>
  <div class="overview-stat-card">
    <div class="overview-stat-card__body">
      <div class="overview-stat-card__label">{{ label }}</div>
      <div class="overview-stat-card__value" :class="valueClass">{{ value }}</div>
    </div>
    <div class="overview-stat-card__icon" :class="`overview-stat-card__icon--${color}`">
      <v-icon :size="22">{{ icon }}</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  icon: string
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error'
  valueTone?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  valueTone: 'default',
})

const valueClass = computed(() => {
  if (props.valueTone === 'default') return ''
  return `overview-stat-card__value--${props.valueTone}`
})
</script>
