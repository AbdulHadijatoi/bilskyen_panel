<template>
  <span class="panel-badge" :class="badgeClasses">
    <v-icon v-if="icon" :size="12" class="panel-badge__icon">{{ icon }}</v-icon>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'

interface Props {
  label?: string
  variant?: BadgeVariant
  icon?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const badgeClasses = computed(() => [
  `panel-badge--${props.variant}`,
  `panel-badge--${props.size}`,
])
</script>

<style scoped>
.panel-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.panel-badge--sm {
  padding: 0.125rem 0.5rem;
  font-size: var(--text-xs);
}

.panel-badge--md {
  padding: 0.25rem 0.625rem;
  font-size: var(--text-sm);
}

.panel-badge--default {
  background: var(--muted);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.panel-badge--primary {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid color-mix(in oklch, var(--primary) 28%, var(--border));
}

.panel-badge--success {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid color-mix(in oklch, var(--success) 35%, var(--border));
}

.panel-badge--warning {
  background: var(--warning-light);
  color: var(--warning);
  border: 1px solid color-mix(in oklch, var(--warning) 35%, var(--border));
}

.panel-badge--danger {
  background: color-mix(in oklch, var(--destructive) 12%, var(--card));
  color: var(--destructive);
  border: 1px solid color-mix(in oklch, var(--destructive) 30%, var(--border));
}

.panel-badge--muted {
  background: var(--muted);
  color: var(--muted-foreground);
  border: 1px solid var(--border);
}

.panel-badge__icon {
  flex-shrink: 0;
}
</style>
