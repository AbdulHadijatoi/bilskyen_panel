<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <v-card class="w-full max-w-md" elevation="2">
      <v-card-title class="text-2xl font-bold text-center pt-6">
        Dealer Panel Login
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
            class="mb-4"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            class="mb-4"
          />
          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  // Mock login - replace with actual API call
  setTimeout(() => {
    authStore.setUser({
      id: 1,
      name: 'Abdul Hadi',
      email: email.value,
      role: 'dealer',
    })
    authStore.setAccessToken('mock-access-token')
    router.push('/')
    loading.value = false
  }, 1000)
}
</script>

