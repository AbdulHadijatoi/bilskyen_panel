import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>({
    id: 1,
    name: 'Abdul Hadi',
    email: 'abdulhadijatoi@gmail.com',
    role: 'dealer',
  })
  const accessToken = ref<string | null>(null)
  const isAuthenticated = ref(true)

  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const setToken = (token: string) => {
    accessToken.value = token
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    setUser,
    setToken,
    logout,
  }
})

