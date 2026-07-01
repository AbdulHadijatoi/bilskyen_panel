<template>
  <div class="panel-stat-card">
    <div class="panel-stat-card__top">
      <div class="panel-stat-card__icon" :class="`panel-stat-card__icon--${iconColor}`">
        <v-icon :size="20">{{ icon }}</v-icon>
      </div>
      <span v-if="badge" class="panel-stat-card__badge" :class="`panel-stat-card__badge--${badge.variant}`">
        <v-icon v-if="badge.icon" :size="12">{{ badge.icon }}</v-icon>
        {{ badge.text }}
      </span>
    </div>
    <div class="panel-stat-card__value">{{ value }}</div>
    <div class="panel-stat-card__label">{{ label }}</div>
    <div v-if="footer" class="panel-stat-card__footer">
      <v-icon v-if="footer.icon" :size="12">{{ footer.icon }}</v-icon>
      <span>{{ footer.text }}</span>
    </div>
    <router-link v-if="safeDetailLink" :to="safeDetailLink.to" class="panel-stat-card__link">
      {{ safeDetailLink.label }}
      <v-icon size="12">mdi-arrow-right</v-icon>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'

type BadgeVariant = 'success' | 'error' | 'info' | 'warning' | 'neutral'
type IconColor = 'primary' | 'success' | 'info' | 'warning'

interface Props {
  icon: string
  iconColor?: IconColor
  value: string | number
  label: string
  badge?: {
    text: string
    variant: BadgeVariant
    icon?: string
  }
  footer?: {
    text: string
    icon?: string
  }
  detailLink?: {
    to: RouteLocationRaw
    label: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
})

const router = useRouter()

const safeDetailLink = computed(() => {
  if (!props.detailLink) return null
  try {
    const resolved = router.resolve(props.detailLink.to)
    if (resolved.matched.length > 0) return props.detailLink
  } catch {
    // Invalid route — hide link rather than crash the dashboard
  }
  return null
})
</script>
