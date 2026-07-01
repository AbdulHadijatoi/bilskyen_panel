<template>
  <AuthLayout>
    <AuthCard :title="t('auth.staffLogin.title')" :subtitle="t('auth.staffLogin.subtitle')">
      <div v-if="error" class="auth-error">
        <div>
          <strong>{{ t('auth.staffLogin.errorTitle') }}</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="username">{{ t('auth.staffLogin.username') }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            :placeholder="t('auth.staffLogin.usernamePlaceholder')"
            autocomplete="username"
            required
            :disabled="loading"
            class="auth-input"
          />
        </div>

        <div class="auth-field">
          <label for="password">{{ t('auth.staffLogin.password') }}</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.staffLogin.passwordPlaceholder')"
              autocomplete="current-password"
              required
              :disabled="loading"
              class="auth-input"
            />
            <button type="button" class="auth-input-toggle" :disabled="loading" @click="togglePassword">
              <v-icon size="16">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </button>
          </div>
        </div>

        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? t('auth.staffLogin.loggingIn') : t('auth.staffLogin.login') }}
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/auth/login">{{ t('auth.staffLogin.dealerLoginInstead') }}</router-link>
      </div>
    </AuthCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { staffLogin } from '@/api/auth.api'
import { decryptUrlParam } from '@/utils/urlEncryption'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    error.value = t('auth.staffLogin.fillAllFields')
    return
  }

  loading.value = true
  error.value = null

  try {
    await staffLogin({ username: username.value, password: password.value })

    const redirectParam = route.query.redirect as string | undefined
    let redirectPath = '/staff'

    if (redirectParam) {
      const decrypted = decryptUrlParam(redirectParam)
      if (decrypted) redirectPath = decrypted
    }

    router.push(redirectPath)
  } catch (err: unknown) {
    const apiErr = err as { errors?: Record<string, string[]>; message?: string }
    if (apiErr?.errors) {
      const errorMessages = Object.values(apiErr.errors).flat()
      error.value = errorMessages.join(', ') || apiErr.message || t('auth.staffLogin.failedLogin')
    } else {
      error.value = apiErr.message || t('auth.staffLogin.failedLogin')
    }
  } finally {
    loading.value = false
  }
}
</script>
