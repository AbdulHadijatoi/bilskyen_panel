<template>
  <div class="panel-recent-feed">
    <header class="panel-recent-feed__header">
      <div class="panel-recent-feed__heading">
        <div class="panel-recent-feed__icon" :class="`panel-recent-feed__icon--${iconColor}`">
          <v-icon :size="18">{{ icon }}</v-icon>
        </div>
        <div class="panel-recent-feed__titles">
          <h3 class="panel-recent-feed__title">{{ title }}</h3>
          <p v-if="subtitle" class="panel-recent-feed__subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <router-link
        v-if="safeViewAllLink"
        :to="safeViewAllLink.to"
        class="panel-recent-feed__view-all"
      >
        {{ viewAllLabel }}
        <v-icon size="14">mdi-arrow-right</v-icon>
      </router-link>
    </header>

    <div class="panel-recent-feed__body">
      <slot v-if="hasItems" />
      <div v-else class="panel-recent-feed__empty">
        <div class="panel-recent-feed__empty-icon" :class="`panel-recent-feed__icon--${iconColor}`">
          <v-icon :size="22">{{ emptyIcon || icon }}</v-icon>
        </div>
        <p class="panel-recent-feed__empty-text">{{ emptyText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'

type IconColor = 'primary' | 'success' | 'info' | 'warning'

interface Props {
  title: string
  subtitle?: string
  icon: string
  iconColor?: IconColor
  viewAllTo?: RouteLocationRaw
  viewAllLabel?: string
  emptyText: string
  emptyIcon?: string
  hasItems?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  hasItems: false,
})

const router = useRouter()

const safeViewAllLink = computed(() => {
  if (!props.viewAllTo || !props.viewAllLabel) return null
  try {
    const resolved = router.resolve(props.viewAllTo)
    if (resolved.matched.length > 0) {
      return { to: props.viewAllTo, label: props.viewAllLabel }
    }
  } catch {
    // hide invalid routes
  }
  return null
})
</script>
