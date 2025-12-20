<template>
  <AuthLayout>
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h1 class="auth-form-title">Login into your account</h1>
        <p class="auth-form-description">
          Enter your email and password to login to your account.
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
        <v-alert-title>Login Error</v-alert-title>
        <div>{{ error }}</div>
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
          class="mb-3 auth-input"
          :style="{
            '--v-field-label-color': 'var(--muted-foreground)',
            '--v-field-input-color': 'var(--foreground)',
          }"
        />

        <div class="mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <label for="password" class="text-body-2">Password</label>
            <router-link
              :to="`${AUTH_ROUTE_BASE}/forgot-password`"
              class="text-body-2 text-decoration-underline"
            >
              Forgot your password?
            </router-link>
          </div>
          <PasswordInput
            v-model="password"
            id="password"
            placeholder="Your Password"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading"
          size="large"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </v-btn>
      </v-form>

      <div class="auth-form-footer">
        <div class="text-center text-body-2">
          Don't have an account?
          <router-link :to="`${AUTH_ROUTE_BASE}/signup`" class="text-decoration-underline">
            Signup
          </router-link>
        </div>
        <SeparatorWithText text="or" />
        <div class="text-center text-body-2">
          Without a password?
          <router-link
            :to="`${AUTH_ROUTE_BASE}/magic-link/login`"
            class="text-decoration-underline"
          >
            Email me a login link
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AUTH_ROUTE_BASE } from '@/constants/app'
import { login, type ApiError } from '@/services/auth'
import { decryptUrlParam } from '@/utils/urlEncryption'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import SeparatorWithText from '@/components/ui/SeparatorWithText.vue'

const router = useRouter()
const route = useRoute()

const formRef = ref()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = null

  try {
    await login({
      email: email.value,
      password: password.value,
    })
    
    // Redirect to the original destination or dashboard
    const redirectParam = route.query.redirect as string | undefined
    let redirectPath = '/'
    
    if (redirectParam) {
      // Decrypt the redirect parameter
      const decrypted = decryptUrlParam(redirectParam)
      if (decrypted) {
        redirectPath = decrypted
      }
    }
    
    router.push(redirectPath)
  } catch (err: any) {
    const apiError = err as ApiError
    if (apiError.errors) {
      // Handle validation errors
      const errorMessages = Object.values(apiError.errors).flat()
      error.value = errorMessages.join(', ') || apiError.message || 'Failed to login.'
    } else {
      error.value = apiError.message || 'Failed to login.'
    }
  } finally {
    loading.value = false
  }
}
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

.auth-form-footer {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>

