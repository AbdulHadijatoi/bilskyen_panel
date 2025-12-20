<template>
  <AuthLayout>
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h1 class="auth-form-title">Forgot Password</h1>
        <p class="auth-form-description">
          Enter your email address to receive a password reset link.
        </p>
      </div>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="error = null"
      >
        <v-alert-title>{{ error.status }} : {{ error.statusText }}</v-alert-title>
        <div>{{ error.message }}</div>
      </v-alert>

      <v-form ref="formRef" @submit.prevent="handleSubmit" class="auth-form">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          placeholder="johndoe@mail.com"
          autocomplete="email"
          :rules="emailRules"
          required
          variant="outlined"
          density="compact"
          class="mb-3"
        />

        <v-btn
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading || timer > 0"
          size="large"
        >
          {{ submitButtonText }}
        </v-btn>
      </v-form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { AUTH_ROUTE_BASE } from '@/constants/app'
import AuthLayout from '@/components/auth/AuthLayout.vue'

const formRef = ref()
const email = ref('')
const loading = ref(false)
const error = ref<{ status?: number; statusText?: string; message: string } | null>(null)
const timer = ref(0)

let timerInterval: ReturnType<typeof setInterval> | null = null

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const submitButtonText = computed(() => {
  if (loading.value) {
    return 'Sending Password Reset Email...'
  }
  if (timer.value > 0) {
    return `Resend in ${timer.value}s`
  }
  return 'Send Password Reset Email'
})

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  timer.value = 30
  loading.value = true
  error.value = null

  // Start timer
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }, 1000)

  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Success - show message (in real app, this would come from API)
    // For now, we'll just clear the error
  } catch (err: any) {
    error.value = {
      status: err.status || 500,
      statusText: err.statusText || 'Error',
      message: err.message || 'An error occurred while sending password reset email. Please try again.',
    }
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
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

.auth-form-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
}

.auth-form-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: var(--foreground);
}

.auth-form-description {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--muted-foreground);
}

.auth-form {
  display: grid;
  width: 100%;
  gap: 0.875rem;
}
</style>

