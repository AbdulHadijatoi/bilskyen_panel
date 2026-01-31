<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-lock-reset</v-icon>
        Change Password
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <!-- Current Password -->
          <v-text-field
            v-model="form.current_password"
            label="Current Password"
            type="password"
            density="compact"
            variant="outlined"
            :rules="[rules.required]"
            hide-details="auto"
            prepend-inner-icon="mdi-lock"
            class="mb-4"
            autocomplete="current-password"
          />

          <!-- New Password -->
          <v-text-field
            v-model="form.password"
            label="New Password"
            type="password"
            density="compact"
            variant="outlined"
            :rules="[rules.required, rules.password]"
            hint="Password must be at least 8 characters"
            persistent-hint
            hide-details="auto"
            prepend-inner-icon="mdi-lock-outline"
            class="mb-4"
            autocomplete="new-password"
          />

          <!-- Confirm Password -->
          <v-text-field
            v-model="form.password_confirmation"
            label="Confirm New Password"
            type="password"
            density="compact"
            variant="outlined"
            :rules="[rules.required, rules.passwordMatch]"
            hide-details="auto"
            prepend-inner-icon="mdi-lock-check"
            autocomplete="new-password"
          />

          <!-- Error Message -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-4"
            closable
            @click:close="error = null"
          >
            {{ error }}
          </v-alert>

          <!-- Validation Errors -->
          <v-alert
            v-if="Object.keys(validationErrors).length > 0"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-4"
            closable
            @click:close="validationErrors = {}"
          >
            <div class="mb-2">
              <strong>Please fix the following errors:</strong>
            </div>
            <ul class="mb-0 pl-4">
              <li v-for="(errors, field) in validationErrors" :key="field">
                <strong>{{ field }}:</strong> {{ errors.join(', ') }}
              </li>
            </ul>
          </v-alert>

          <!-- Success Message -->
          <v-alert
            v-if="showSuccess"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            Password changed successfully!
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
          :disabled="submitting"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="submitting"
          :disabled="!formValid || submitting"
          @click="handleSubmit"
        >
          <v-icon start>{{ submitting ? 'mdi-loading' : 'mdi-check' }}</v-icon>
          {{ submitting ? 'Changing...' : 'Change Password' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { changePassword, type ChangePasswordData } from '@/api/auth.api'
import { changeOwnPassword, type ChangeOwnPasswordData } from '@/api/admin.api'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const authStore = useAuthStore()
const dialog = ref(props.modelValue)
const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})
const showSuccess = ref(false)

// Check if user is admin
const isAdmin = computed(() => {
  return authStore.user?.roles?.includes('admin') ?? false
})

const form = reactive<ChangePasswordData>({
  current_password: '',
  password: '',
  password_confirmation: '',
})

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (!newVal) {
    resetForm()
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetForm()
  }
})

// Validation rules
const rules = {
  required: (value: string) => !!value || 'This field is required',
  password: (value: string) => {
    if (!value) return true
    if (value.length < 8) return 'Password must be at least 8 characters'
    return true
  },
  passwordMatch: (value: string) => {
    if (!value) return true
    if (value !== form.password) return 'Passwords do not match'
    return true
  },
}

// Reset form
const resetForm = () => {
  form.current_password = ''
  form.password = ''
  form.password_confirmation = ''
  error.value = null
  validationErrors.value = {}
  showSuccess.value = false
  formRef.value?.resetValidation()
}

// Close dialog
const close = () => {
  dialog.value = false
}

// Handle form submission
const handleSubmit = async () => {
  if (!formValid.value) {
    return
  }

  submitting.value = true
  error.value = null
  validationErrors.value = {}
  showSuccess.value = false

  try {
    // Use admin API if user is admin, otherwise use regular auth API
    if (isAdmin.value) {
      const adminData: ChangeOwnPasswordData = {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      }
      await changeOwnPassword(adminData)
    } else {
      await changePassword(form)
    }
    
    showSuccess.value = true

    // Close dialog after 2 seconds
    setTimeout(() => {
      close()
    }, 2000)
  } catch (err: any) {
    console.error('Failed to change password:', err)

    // Handle validation errors
    if (err?.errors && typeof err.errors === 'object') {
      validationErrors.value = err.errors
    } else {
      error.value = err?.message || 'Failed to change password. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:deep(.v-field__prepend-inner) {
  padding-top: 0 !important;
}
</style>
