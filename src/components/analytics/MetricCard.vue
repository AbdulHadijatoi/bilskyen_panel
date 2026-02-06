<template>
  <v-card variant="outlined" class="metric-card" :class="cardClass">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <v-icon :size="iconSize" :color="iconColor">{{ icon }}</v-icon>
        <v-chip
          v-if="trend !== undefined"
          :color="trend >= 0 ? 'success' : 'error'"
          size="x-small"
          variant="flat"
        >
          <v-icon start size="14">
            {{ trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
          </v-icon>
          {{ Math.abs(trend) }}%
        </v-chip>
        <v-chip
          v-else-if="badge"
          :color="badgeColor"
          size="x-small"
          variant="flat"
        >
          {{ badge }}
        </v-chip>
      </div>
      <div class="text-h4 font-weight-bold mb-1">
        {{ formattedValue }}
      </div>
      <div class="text-caption text-medium-emphasis mb-2">{{ title }}</div>
      <div v-if="subtitle" class="text-caption">
        <v-icon size="12" class="mr-1">{{ subtitleIcon }}</v-icon>
        {{ subtitle }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  icon: string
  iconColor?: string
  iconSize?: number | string
  trend?: number
  badge?: string
  badgeColor?: string
  subtitle?: string
  subtitleIcon?: string
  format?: 'number' | 'currency' | 'percentage' | 'none'
  cardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  iconSize: 40,
  subtitleIcon: 'mdi-information',
  badgeColor: 'primary',
  format: 'number',
  cardClass: '',
})

const formattedValue = computed(() => {
  if (props.format === 'none' || typeof props.value === 'string') {
    return props.value
  }

  if (props.format === 'currency') {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(props.value)
  }

  if (props.format === 'percentage') {
    return `${props.value}%`
  }

  return new Intl.NumberFormat('da-DK').format(props.value)
})
</script>

<style scoped>
.metric-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}
</style>
