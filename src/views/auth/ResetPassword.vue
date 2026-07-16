<template>
  <AuthLayout>
    <AuthCard
      :title="t('auth.resetPassword.title')"
      :subtitle="t('auth.resetPassword.subtitle')"
    >
      <div v-if="error" class="auth-error">
        <div>
          <strong>{{ tokenError ? t('auth.resetPassword.tokenErrorTitle') : t('auth.resetPassword.errorTitle') }}</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <div v-if="!token" class="auth-error">
        <div>
          <strong>{{ t('auth.resetPassword.tokenErrorTitle') }}</strong>
          <p style="margin: 0.25rem 0 0">{{ t('auth.resetPassword.noToken') }}</p>
        </div>
      </div>

      <form v-else class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="password">{{ t('auth.resetPassword.newPassword') }}</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.resetPassword.newPasswordPlaceholder')"
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
          <label for="confirmPassword">{{ t('auth.resetPassword.confirmPassword') }}</label>
          <div class="auth-input-wrap">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="t('auth.resetPassword.confirmPasswordPlaceholder')"
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
          {{ loading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.resetPassword') }}
        </button>
      </form>
    </AuthCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resetPassword, type ApiError } from '@/services/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const { t } = useI18n()
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
    error.value = t('auth.resetPassword.noToken')
    return
  }

  if (!password.value || !confirmPassword.value) {
    error.value = t('auth.resetPassword.fillAllFields')
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = t('auth.resetPassword.passwordsDoNotMatch')
    return
  }

  if (password.value.length < 8) {
    error.value = t('auth.resetPassword.passwordMinLength')
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
      error.value = errorMessages.join(', ') || apiError.message || t('auth.resetPassword.failed')
    } else {
      error.value = apiError.message || t('auth.resetPassword.failed')
    }
  } finally {
    loading.value = false
  }
}
</script>
