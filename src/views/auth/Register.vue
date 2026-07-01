<template>
  <AuthLayout>
    <AuthCard title="Create an account" subtitle="Enter your information to create your account.">
      <div v-if="error" class="auth-error">
        <div>
          <strong>Validation Error</strong>
          <p style="margin: 0.25rem 0 0">{{ error }}</p>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label for="name">Full Name</label>
          <input id="name" v-model="name" type="text" placeholder="John Doe" autocomplete="name" required :disabled="loading" class="auth-input" />
        </div>

        <div class="auth-field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="johndoe@mail.com" autocomplete="email" required :disabled="loading" class="auth-input" />
        </div>

        <div class="auth-field">
          <label for="password">Password</label>
          <div class="auth-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Your Password"
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
              placeholder="Confirm Your Password"
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
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <div class="auth-footer">
        Already have an account?
        <router-link to="/auth/login">Login</router-link>
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
    error.value = 'Please fill in all fields.'
    return
  }

  if (!/.+@.+\..+/.test(email.value)) {
    error.value = 'Please enter a valid email address.'
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
