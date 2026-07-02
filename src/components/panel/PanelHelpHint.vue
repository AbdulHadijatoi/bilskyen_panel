<template>
  <v-tooltip
    :location="location"
    :max-width="maxWidth"
    open-on-hover
    open-on-click
    :open-delay="openDelay"
    close-delay="120"
    :eager="false"
  >
    <template #activator="{ props: tooltipProps }">
      <button
        type="button"
        class="panel-help-hint"
        :class="size === 'sm' ? 'panel-help-hint--sm' : undefined"
        v-bind="tooltipProps"
        :aria-label="ariaLabel || text"
        @click.stop.prevent
      >
        <span class="panel-help-hint__mark" aria-hidden="true">!</span>
      </button>
    </template>
    <span class="panel-help-hint__tooltip">{{ text }}</span>
  </v-tooltip>
</template>

<script setup lang="ts">
interface Props {
  text: string
  ariaLabel?: string
  size?: 'sm' | 'md'
  location?: 'top' | 'bottom' | 'start' | 'end' | 'top start' | 'top end' | 'bottom start' | 'bottom end'
  maxWidth?: number | string
  openDelay?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  location: 'top',
  maxWidth: 320,
  openDelay: 150,
})
</script>
