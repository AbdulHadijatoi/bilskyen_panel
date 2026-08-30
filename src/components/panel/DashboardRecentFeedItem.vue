<template>
  <component
    :is="linkComponent"
    v-bind="linkProps"
    class="panel-recent-feed-item"
    :class="{ 'panel-recent-feed-item--interactive': isInteractive }"
  >
    <div class="panel-recent-feed-item__prepend">
      <v-avatar
        v-if="avatarText"
        size="34"
        :color="avatarColor || 'primary'"
        variant="flat"
      >
        <span class="panel-recent-feed-item__avatar-text">{{ avatarText }}</span>
      </v-avatar>
      <div
        v-else
        class="panel-recent-feed-item__icon"
        :class="prependIconColor ? `panel-recent-feed-item__icon--${prependIconColor}` : undefined"
      >
        <v-icon :size="18">{{ prependIcon }}</v-icon>
      </div>
    </div>

    <div class="panel-recent-feed-item__content">
      <div class="panel-recent-feed-item__title-row">
        <span class="panel-recent-feed-item__title" :title="title">{{ title }}</span>
        <time v-if="time" class="panel-recent-feed-item__time">{{ time }}</time>
      </div>
      <p v-if="subtitle" class="panel-recent-feed-item__subtitle" :title="subtitle">{{ subtitle }}</p>
      <div v-if="chips?.length" class="panel-recent-feed-item__chips">
        <v-chip
          v-for="chip in chips"
          :key="chip.text"
          size="x-small"
          variant="flat"
          :color="chip.color"
        >
          {{ chip.text }}
        </v-chip>
      </div>
    </div>

    <div v-if="isInteractive" class="panel-recent-feed-item__chevron">
      <v-icon size="16">mdi-chevron-right</v-icon>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

type PrependColor = 'primary' | 'success' | 'info' | 'warning'

interface FeedChip {
  text: string
  color?: string
}

interface Props {
  title: string
  subtitle?: string
  time?: string
  to?: RouteLocationRaw
  prependIcon?: string
  prependIconColor?: PrependColor
  avatarText?: string
  avatarColor?: string
  chips?: FeedChip[]
}

const props = defineProps<Props>()

const isInteractive = computed(() => Boolean(props.to))

const linkComponent = computed(() => (props.to ? RouterLink : 'div'))

const linkProps = computed(() => {
  if (props.to) {
    return { to: props.to }
  }
  return {}
})
</script>

<style scoped>
.panel-recent-feed-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid color-mix(in oklch, var(--border) 80%, transparent);
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s ease;
}

.panel-recent-feed-item:last-child {
  border-bottom: none;
}

.panel-recent-feed-item--interactive {
  cursor: pointer;
}

.panel-recent-feed-item--interactive:hover {
  background: var(--muted);
}

.panel-recent-feed-item--interactive:hover .panel-recent-feed-item__chevron {
  opacity: 1;
  transform: translateX(2px);
}

.panel-recent-feed-item__prepend {
  flex-shrink: 0;
}

.panel-recent-feed-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border-radius: var(--radius-md);
  background: var(--muted);
  color: var(--muted-foreground);
}

.panel-recent-feed-item__icon--primary {
  background: var(--primary-light);
  color: var(--primary);
}

.panel-recent-feed-item__icon--success {
  background: var(--success-light);
  color: var(--success);
}

.panel-recent-feed-item__icon--info {
  background: var(--info-light);
  color: var(--info);
}

.panel-recent-feed-item__icon--warning {
  background: var(--warning-light);
  color: var(--warning);
}

.panel-recent-feed-item__avatar-text {
  font-size: 0.8125rem;
  font-weight: 600;
}

.panel-recent-feed-item__content {
  flex: 1;
  min-width: 0;
}

.panel-recent-feed-item__title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.panel-recent-feed-item__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-recent-feed-item__time {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--muted-foreground);
  white-space: nowrap;
}

.panel-recent-feed-item__subtitle {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-recent-feed-item__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.375rem;
}

.panel-recent-feed-item__chevron {
  flex-shrink: 0;
  align-self: center;
  color: var(--muted-foreground);
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
</style>
