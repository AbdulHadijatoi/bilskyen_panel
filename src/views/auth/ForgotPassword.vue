<template>
  <AuthLayout>
    <AuthCard :title="t('auth.forgotPassword.title')" :subtitle="t('auth.forgotPassword.subtitle')">
      <div v-if="success" class="auth-success">{{ success }}</div>
      <div v-if="error" class="auth-error">
        <div>
          <strong>{{ t('auth.forgotPassword.errorTitle') }}</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="email">{{ t('auth.forgotPassword.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="t('auth.forgotPassword.emailPlaceholder')"
            autocomplete="email"
            required
            :disabled="loading"
            class="auth-input"
          />
        </div>
        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendResetEmail') }}
        </button>
      </form>

      <div class="auth-footer">
        {{ t('auth.forgotPassword.rememberPassword') }}
        <router-link to="/auth/login">{{ t('auth.forgotPassword.login') }}</router-link>
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
    error.value = t('auth.forgotPassword.enterEmail')
    return
  }

  if (!/.+@.+\..+/.test(email.value)) {
    error.value = t('auth.forgotPassword.validEmail')
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    await forgotPassword(email.value)
    success.value = t('auth.forgotPassword.resetLinkSent')
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
