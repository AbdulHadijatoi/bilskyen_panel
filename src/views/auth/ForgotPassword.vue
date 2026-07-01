<template>
  <AuthLayout>
    <AuthCard title="Forgot Password" subtitle="Enter your email address to receive a password reset link.">
      <div v-if="success" class="auth-success">{{ success }}</div>
      <div v-if="error" class="auth-error">
        <div>
          <strong>Error</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="johndoe@mail.com" autocomplete="email" required :disabled="loading" class="auth-input" />
        </div>
        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Password Reset Email' }}
        </button>
      </form>

      <div class="auth-footer">
        Remember your password?
        <router-link to="/auth/login">Login</router-link>
      </div>
    </AuthCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { forgotPassword, type ApiError } from '@/services/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleSubmit = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address.'
    return
  }

  if (!/.+@.+\..+/.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    await forgotPassword(email.value)
    success.value = 'If an account exists with that email, we have sent a password reset link.'
  } catch (err: unknown) {
    const apiError = err as ApiError
    if (apiError.errors) {
      const errorMessages = Object.values(apiError.errors).flat()
      error.value = errorMessages.join(', ') || apiError.message || t('auth.forgotPassword.failedSend')
    } else {
      error.value = apiError.message || t('auth.forgotPassword.failedSend')
    }
  } finally {
    loading.value = false
  }
}
</script>
