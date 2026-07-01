<template>
  <AuthLayout>
    <AuthCard
      title="Reset Password"
      subtitle="Create a new, secure password for your account. This link can only be used once."
    >
      <div v-if="error" class="auth-error">
        <div>
          <strong>{{ tokenError ? 'Token Error' : 'Validation Error' }}</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <div v-if="!token" class="auth-error">
        <div>
          <strong>Token Error</strong>
          <p style="margin: 0.25rem 0 0">No token provided. Please check your link.</p>
        </div>
      </div>

      <form v-else class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="password">New Password</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="New Password"
              autocomplete="new-password"
              required
              :disabled="loading"
              class="auth-input"
            />
            <button type="button" class="auth-input-toggle" :disabled="loading" @click="togglePassword">
              <v-icon size="16">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </button>
          </div>
        </div>

        <div class="auth-field">
          <label for="confirmPassword">Confirm Password</label>
          <div class="auth-input-wrap">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm New Password"
              autocomplete="new-password"
              required
              :disabled="loading"
              class="auth-input"
            />
            <button type="button" class="auth-input-toggle" :disabled="loading" @click="toggleConfirmPassword">
              <v-icon size="16">{{ showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </button>
          </div>
        </div>

        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? 'Resetting password...' : 'Reset Password' }}
        </button>
      </form>
    </AuthCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { resetPassword, type ApiError } from '@/services/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const token = computed(() => route.query.token as string | undefined)
const email = computed(() => route.query.email as string | undefined)
const tokenError = computed(() => !token.value)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleSubmit = async () => {
  if (!token.value) {
    error.value = 'No token provided. Please check your link.'
    return
  }

  if (!password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long.'
    return
  }

  loading.value = true
  error.value = null

  try {
    await resetPassword({
      token: token.value,
      email: email.value || '',
      password: password.value,
      password_confirmation: confirmPassword.value,
    })

    router.push({ path: '/auth/login', query: { reset: 'success' } })
  } catch (err: unknown) {
    const apiError = err as ApiError
    if (apiError.errors) {
      const errorMessages = Object.values(apiError.errors).flat()
      error.value = errorMessages.join(', ') || apiError.message || 'Failed to reset password.'
    } else {
      error.value = apiError.message || 'Failed to reset password.'
    }
  } finally {
    loading.value = false
  }
}
</script>
