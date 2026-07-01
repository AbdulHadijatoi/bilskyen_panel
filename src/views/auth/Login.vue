<template>
  <AuthLayout :show-sidebar="false">
    <AuthCard :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">

      <div v-if="error" class="auth-error">
        <div>
          <strong>{{ t('auth.login.errorTitle') }}</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="email">{{ t('auth.login.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="johndoe@mail.com"
            autocomplete="email"
            required
            :disabled="loading"
            class="auth-input"
          />
        </div>

        <div class="auth-field">
          <label for="password">{{ t('auth.login.password') }}</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.login.passwordPlaceholder')"
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

        <div class="auth-link-row">
          <router-link to="/auth/forgot-password">{{ t('auth.login.forgotPassword') }}</router-link>
        </div>

        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? t('auth.login.loggingIn') : t('auth.login.login') }}
        </button>
      </form>

      <div class="auth-footer">
        <div>{{ t('auth.login.noAccount') }} <router-link to="/auth/register">{{ t('auth.login.signUp') }}</router-link></div>
        <div style="margin-top: 0.5rem">
          {{ t('auth.login.staffMember') }}
          <router-link to="/auth/staff-login">{{ t('auth.login.staffLogin') }}</router-link>
        </div>
      </div>
    </AuthCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { login, type ApiError } from '@/services/auth'
import { decryptUrlParam } from '@/utils/urlEncryption'
import { isAdmin, isStaff } from '@/utils/permissions'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = t('auth.login.fillAllFields')
    return
  }

  if (!/.+@.+\..+/.test(email.value)) {
    error.value = t('auth.login.validEmail')
    return
  }

  loading.value = true
  error.value = null

  try {
    await login({ email: email.value, password: password.value })

    const redirectParam = route.query.redirect as string | undefined
    let redirectPath = '/'

    if (redirectParam) {
      const decrypted = decryptUrlParam(redirectParam)
      if (decrypted) redirectPath = decrypted
    } else if (isAdmin()) {
      redirectPath = '/admin'
    } else if (isStaff()) {
      redirectPath = '/staff'
    }

    router.push(redirectPath)
  } catch (err: unknown) {
    const apiError = err as ApiError
    if (apiError.errors) {
      const errorMessages = Object.values(apiError.errors).flat()
      error.value = errorMessages.join(', ') || apiError.message || t('auth.login.failedLogin')
    } else {
      error.value = apiError.message || t('auth.login.failedLogin')
    }
  } finally {
    loading.value = false
  }
}
</script>
