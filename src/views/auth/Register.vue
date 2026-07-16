<template>
  <AuthLayout>
    <AuthCard :title="t('auth.register.title')" :subtitle="t('auth.register.subtitle')">
      <div v-if="error" class="auth-error">
        <div>
          <strong>{{ t('auth.register.errorTitle') }}</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="name">{{ t('auth.register.fullName') }}</label>
          <input
            id="name"
            v-model="name"
            type="text"
            :placeholder="t('auth.register.fullNamePlaceholder')"
            autocomplete="name"
            required
            :disabled="loading"
            class="auth-input"
          />
        </div>

        <div class="auth-field">
          <label for="email">{{ t('auth.register.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="t('auth.register.emailPlaceholder')"
            autocomplete="email"
            required
            :disabled="loading"
            class="auth-input"
          />
        </div>

        <div class="auth-field">
          <label for="password">{{ t('auth.register.password') }}</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.register.passwordPlaceholder')"
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
          <label for="confirmPassword">{{ t('auth.register.confirmPassword') }}</label>
          <div class="auth-input-wrap">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="t('auth.register.confirmPasswordPlaceholder')"
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
          {{ loading ? t('auth.register.creating') : t('auth.register.signUp') }}
        </button>
      </form>

      <div class="auth-footer">
        {{ t('auth.register.alreadyHaveAccount') }}
        <router-link to="/auth/login">{{ t('auth.register.login') }}</router-link>
      </div>
    </AuthCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, type ApiError } from '@/services/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const { t } = useI18n()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleSubmit = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = t('auth.register.fillAllFields')
    return
  }

  if (!/.+@.+\..+/.test(email.value)) {
    error.value = t('auth.register.validEmail')
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = t('auth.register.passwordsDoNotMatch')
    return
  }

  if (password.value.length < 8) {
    error.value = t('auth.register.passwordMinLength')
    return
  }

  loading.value = true
  error.value = null

  try {
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
      roles: ['dealer'],
    })

    router.push('/')
  } catch (err: unknown) {
    const apiError = err as ApiError
    if (apiError.errors) {
      const errorMessages = Object.values(apiError.errors).flat()
      error.value = errorMessages.join(', ') || apiError.message || t('auth.register.failed')
    } else {
      error.value = apiError.message || t('auth.register.failed')
    }
  } finally {
    loading.value = false
  }
}
</script>
