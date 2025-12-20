<template>
  <AuthLayout>
    <div class="auth-form-container">
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        <v-alert-title>Verification Error</v-alert-title>
        <div>{{ error }}</div>
      </v-alert>
      <div v-else class="text-center">
        <h1 class="auth-form-title mb-4">Verifying your magic link...</h1>
        <v-progress-circular indeterminate color="primary" />
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AUTH_ROUTE_BASE } from '@/constants/app'
import AuthLayout from '@/components/auth/AuthLayout.vue'

const route = useRoute()
const router = useRouter()

const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.query.token as string | undefined
  
  if (!token) {
    error.value = 'No token provided. Please check your link.'
    return
  }

  try {
    // TODO: Replace with actual API call to verify magic link
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // On success, redirect to dashboard
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Failed to verify magic link. Please try again.'
  }
})
</script>

<style scoped>
.auth-form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

.auth-form-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--foreground);
}
</style>

