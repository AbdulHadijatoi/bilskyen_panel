<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    class="panel-btn"
    :class="buttonClasses"
    v-bind="$attrs"
    @click="handleClick"
  >
    <v-progress-circular
      v-if="loading"
      indeterminate
      size="16"
      width="2"
      class="panel-btn__spinner"
    />
    <v-icon v-else-if="icon && iconPosition === 'start'" :size="iconSize">{{ icon }}</v-icon>
    <span v-if="$slots.default || label" class="panel-btn__label">
      <slot>{{ label }}</slot>
    </span>
    <v-icon v-if="!loading && icon && iconPosition === 'end'" :size="iconSize">{{ icon }}</v-icon>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface Props {
  variant?: Variant
  size?: Size
  label?: string
  icon?: string
  iconPosition?: 'start' | 'end'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  to?: RouteLocationRaw
  href?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconPosition: 'start',
  loading: false,
  disabled: false,
  block: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const tag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const buttonClasses = computed(() => [
  `panel-btn--${props.variant === 'secondary' ? 'outline' : props.variant}`,
  {
    'panel-btn--sm': props.size === 'sm',
    'panel-btn--block': props.block,
    'panel-btn--loading': props.loading,
  },
])

const iconSize = computed(() => (props.size === 'sm' ? 16 : 18))

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style scoped>
.panel-btn__spinner {
  flex-shrink: 0;
}

.panel-btn--loading {
  pointer-events: none;
  opacity: 0.85;
}

a.panel-btn {
  text-decoration: none;
}
</style>
