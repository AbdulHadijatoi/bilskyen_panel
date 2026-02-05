<template>
  <div>
    <h1 class="text-xl font-weight-bold mb-0" style="line-height: 1.5;">Home of Dealer</h1>
    <p class="text-lg mb-0" style="line-height: 1.5;">
      {{ greeting }}
      <span class="font-weight-semibold">{{ authStore.user?.name || 'Dealer' }}</span>!
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})
</script>

