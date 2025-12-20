<template>
  <AuthLayout>
    <div v-if="error" class="auth-form-container">
      <v-alert type="error" variant="tonal">
        <v-alert-title>{{ error }}</v-alert-title>
        <div>An error occurred. Please try again.</div>
      </v-alert>
    </div>
    <div v-else-if="!token" class="auth-form-container">
      <v-alert type="error" variant="tonal">
        <v-alert-title>Token Error</v-alert-title>
        <div>No token provided. Please check your link.</div>
      </v-alert>
    </div>
    <div v-else class="auth-form-container">
      <div class="auth-form-header">
        <h1 class="auth-form-title">Reset Password</h1>
        <p class="auth-form-description">
          Create a new, secure password for your account. This link can only be
          used once. After resetting, you can login with your new password.
        </p>
      </div>

      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="formError = null"
      >
        <v-alert-title>{{ formError.status }} : {{ formError.statusText }}</v-alert-title>
        <div>{{ formError.message }}</div>
      </v-alert>

      <v-form ref="formRef" @submit.prevent="handleSubmit" class="auth-form">
        <div class="mb-3">
          <label for="password" class="text-body-2 mb-2 d-block">New Password</label>
          <PasswordInput
            v-model="password"
            id="password"
            placeholder="New Password"
            autocomplete="new-password"
            :disabled="loading"
          />
          <div class="text-caption text-medium-emphasis mt-1">
            Enter your new password.
          </div>
        </div>

        <div class="mb-3">
          <label for="confirmPassword" class="text-body-2 mb-2 d-block">
            Confirm Password
          </label>
          <PasswordInput
            v-model="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm New Password"
            autocomplete="new-password"
            :disabled="loading"
          />
          <div class="text-caption text-medium-emphasis mt-1">
            Retype the new password to confirm.
          </div>
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading"
          size="large"
        >
          {{ loading ? 'Resetting Password...' : 'Reset Password' }}
        </v-btn>
      </v-form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AUTH_ROUTE_BASE } from '@/constants/app'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const formError = ref<{ status?: number; statusText?: string; message: string } | null>(null)

const token = computed(() => route.query.token as string | undefined)
const error = computed(() => route.query.error as string | undefined)

const handleSubmit = async () => {
  if (!password.value || !confirmPassword.value) {
    formError.value = {
      status: 400,
      statusText: 'Validation Error',
      message: 'Please fill in all fields',
    }
    return
  }

  if (password.value !== confirmPassword.value) {
    formError.value = {
      status: 400,
      statusText: 'Validation Error',
      message: 'Passwords do not match',
    }
    return
  }

  if (password.value.length < 8) {
    formError.value = {
      status: 400,
      statusText: 'Validation Error',
      message: 'Password must be at least 8 characters',
    }
    return
  }

  loading.value = true
  formError.value = null

  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Success - redirect to login
    router.push(`${AUTH_ROUTE_BASE}/login`)
  } catch (err: any) {
    formError.value = {
      status: err.status || 500,
      statusText: err.statusText || 'Error',
      message: err.message || 'An error occurred while resetting your password. Please try again.',
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (error.value) {
    formError.value = {
      status: 400,
      statusText: 'Error',
      message: error.value,
    }
  }
  if (!token.value) {
    formError.value = {
      status: 400,
      statusText: 'Token Error',
      message: 'No token provided. Please check your link.',
    }
  }
})
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
</style>

