<template>
  <div class="panel-page-header" :class="headerClasses">
    <div class="panel-page-header__main">
      <button
        v-if="showBack"
        type="button"
        class="panel-page-header__back"
        :aria-label="backLabel"
        @click="handleBack"
      >
        <v-icon size="18">mdi-arrow-left</v-icon>
      </button>
      <div class="panel-page-header__text">
        <h1 class="panel-page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="panel-page-header__subtitle">{{ subtitle }}</p>
        <slot name="subtitle" />
      </div>
    </div>
    <div v-if="$slots.actions" class="panel-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'

interface Props {
  title: string
  subtitle?: string
  showBack?: boolean
  centered?: boolean
  backLabel?: string
  backTo?: RouteLocationRaw
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  centered: false,
  backLabel: 'Go back',
})

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()

const headerClasses = computed(() => ({
  'panel-page-header--with-back': props.showBack,
  'panel-page-header--centered': props.centered,
}))

function handleBack() {
  emit('back')
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.panel-page-header__main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.panel-page-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-top: 0.125rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--card);
  color: var(--foreground);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s, border-color 0.15s;
}

.panel-page-header__back:hover {
  background: var(--muted);
  border-color: color-mix(in oklch, var(--border) 80%, var(--foreground));
}

.panel-page-header__text {
  min-width: 0;
}

.panel-page-header--with-back .panel-page-header__title {
  font-size: 1.375rem;
}
</style>
