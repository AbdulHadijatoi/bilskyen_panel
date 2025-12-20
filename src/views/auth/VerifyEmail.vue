<template>
  <AuthLayout>
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h1 class="auth-form-title">Verify Your Email</h1>
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

      <div class="auth-form-content">
        <p class="mb-4">
          We've sent a verification email to your inbox when you signed up.
          Please check your email and follow the instructions to verify your
          account. The email might be further down in your inbox depending on when
          you signed up, so be sure to look carefully.
        </p>

        <p class="text-medium-emphasis mb-4">
          Didn't receive the email? Please check your spam or junk folder. If
          it has expired or hasn't arrived yet, you can request a new one
          {{ timer > 0 ? `in ${timer} seconds` : 'now' }}.
        </p>

        <v-btn
          v-if="timer <= 20"
          color="primary"
          block
          :loading="loading"
          :disabled="timer > 0 || loading"
          size="large"
          @click="handleResend"
        >
          {{ submitButtonText }}
        </v-btn>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'

const loading = ref(false)
const error = ref<{ status?: number; statusText?: string; message: string } | null>(null)
const timer = ref(30)

let timerInterval: ReturnType<typeof setInterval> | null = null

// Start timer on mount
if (timer.value > 0) {
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
}

const submitButtonText = computed(() => {
  if (loading.value) {
    return 'Resending Verification Email...'
  }
  if (timer.value > 0) {
    return `Resend in ${timer.value}s`
  }
  return 'Resend Verification Email'
})

const handleResend = async () => {
  loading.value = true
  error.value = null

  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    timer.value = 30
    // Restart timer
    if (timerInterval) {
      clearInterval(timerInterval)
    }
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
  } catch (err: any) {
    error.value = {
      status: err.status || 500,
      statusText: err.statusText || 'Error',
      message: err.message || 'An error occurred while sending verification email link. Please try again.',
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
  align-items: flex-start;
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

.auth-form-content {
  width: 100%;
}

.auth-form-content p {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--foreground);
}
</style>

