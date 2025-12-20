<template>
  <AuthLayout>
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h1 class="auth-form-title">Create a new account</h1>
        <p class="auth-form-description">
          Enter your details below to create a new account.
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
        <v-alert-title>Signup Error</v-alert-title>
        <div>{{ error }}</div>
      </v-alert>

      <v-alert
        v-if="successMsg"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        <v-alert-title>Signup Successful</v-alert-title>
        <div>{{ successMsg }}</div>
      </v-alert>

      <v-form ref="formRef" @submit.prevent="handleSubmit" class="auth-form">
        <v-text-field
          v-model="name"
          label="Full Name"
          placeholder="John Doe"
          :rules="nameRules"
          required
          variant="outlined"
          density="compact"
          class="mb-3"
        />

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
          class="mb-3"
        />

        <div class="mb-3">
          <label for="password" class="text-body-2 mb-2 d-block">Password</label>
          <PasswordInput
            v-model="password"
            id="password"
            placeholder="Your Password"
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <div class="mb-3">
          <label for="confirmPassword" class="text-body-2 mb-2 d-block">
            Confirm Password
          </label>
          <PasswordInput
            v-model="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm Your Password"
            autocomplete="new-password"
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
          {{ loading ? 'Signing up...' : 'Signup' }}
        </v-btn>
      </v-form>

      <div class="auth-form-footer">
        <div class="text-center text-body-2">
          Already have an account?
          <router-link :to="`${AUTH_ROUTE_BASE}/login`" class="text-decoration-underline">
            Login
          </router-link>
        </div>
        <SeparatorWithText text="or" />
        <div class="text-center text-body-2">
          Without a password?
          <router-link
            :to="`${AUTH_ROUTE_BASE}/magic-link/signup`"
            class="text-decoration-underline"
          >
            Email me a signup link
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AUTH_ROUTE_BASE } from '@/constants/app'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import SeparatorWithText from '@/components/ui/SeparatorWithText.vue'

const router = useRouter()

const formRef = ref()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
]

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = null
  successMsg.value = null

  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    successMsg.value = 'Please verify your email address to continue. Check your inbox for the verification link.'
    
    // Redirect to login after a delay
    setTimeout(() => {
      router.push(`${AUTH_ROUTE_BASE}/login`)
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to signup.'
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
  gap: 1rem;
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

