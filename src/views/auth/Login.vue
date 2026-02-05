<template>
  <AuthLayout>
    <div class="flex h-full w-full flex-col items-center justify-center gap-4">
      <div class="flex w-full flex-col space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">
          Login into your account
        </h1>
        <p class="text-sm text-muted-foreground">
          Enter your email and password to login to your account.
        </p>
      </div>

      <div
        v-if="error"
        class="w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
      >
        <div class="flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-2 h-5 w-5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="12"></line>
            <line x1="12" x2="12.01" y1="16" y2="16"></line>
          </svg>
          <div>
            <h3 class="font-semibold">Login Error</h3>
            <p class="mt-1 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="grid w-full gap-3.5">
        <div class="grid gap-2">
          <label
            for="email"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="johndoe@mail.com"
            autocomplete="email"
            tabindex="1"
            required
            :disabled="loading"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p id="email-error" class="hidden text-sm text-destructive"></p>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <label
              for="password"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
          </div>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Your Password"
              autocomplete="current-password"
              tabindex="2"
              required
              :disabled="loading"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              @click="togglePassword"
              :disabled="loading"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path
                  d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                ></path>
                <path
                  d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                ></path>
                <line x1="2" x2="22" y1="2" y2="22"></line>
              </svg>
            </button>
          </div>
          <p id="password-error" class="hidden text-sm text-destructive"></p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <router-link
            to="/auth/forgot-password"
            class="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Forgot password?
          </router-link>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-4 text-center text-sm space-y-2">
        <div>
          Don't have an account?
          <router-link to="/auth/register" class="underline">Sign up</router-link>
        </div>
        <!-- Staff login link - hidden for now -->
        <!-- <div>
          Staff member?
          <router-link to="/auth/staff-login" class="underline">Staff login</router-link>
        </div> -->
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, type ApiError } from '@/services/auth'
import { decryptUrlParam } from '@/utils/urlEncryption'
import { isAdmin } from '@/utils/permissions'
import AuthLayout from '@/components/auth/AuthLayout.vue'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  // Basic validation
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  if (!/.+@.+\..+/.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true
  error.value = null

  try {
    await login({
      email: email.value,
      password: password.value,
    })
    
    // Redirect to the original destination or dashboard based on role
    const redirectParam = route.query.redirect as string | undefined
    let redirectPath = '/'
    
    if (redirectParam) {
      // Decrypt the redirect parameter
      const decrypted = decryptUrlParam(redirectParam)
      if (decrypted) {
        redirectPath = decrypted
      }
    } else {
      // Redirect to appropriate dashboard based on user role
      if (isAdmin()) {
        redirectPath = '/admin'
      } else {
        redirectPath = '/'
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
/* Styles are handled by Tailwind classes */
</style>

