<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      variant="flat"
      elevation="0"
      :style="{ border: '1px solid rgba(0, 0, 0, 0.12)' }"
    >
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2">mdi-account-plus</v-icon>
        {{ t('dealerComponents.staff.addStaffMember') }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.name"
            :label="t('dealerComponents.staff.fullName')"
            density="compact"
            variant="outlined"
            :rules="rules.name"
            hide-details="auto"
            prepend-inner-icon="mdi-account"
            class="mb-4"
            required
          />

          <v-text-field
            v-model="form.email"
            :label="t('dealerComponents.staff.emailOptional')"
            type="email"
            density="compact"
            variant="outlined"
            :rules="rules.email"
            hide-details="auto"
            prepend-inner-icon="mdi-email"
            class="mb-4"
          />

          <v-text-field
            v-model="form.phone"
            :label="t('dealerComponents.staff.phoneOptional')"
            density="compact"
            variant="outlined"
            :rules="rules.phone"
            hide-details="auto"
            prepend-inner-icon="mdi-phone"
            class="mb-4"
          />

          <v-text-field
            v-model="form.password"
            :label="t('dealerComponents.staff.password')"
            type="password"
            density="compact"
            variant="outlined"
            :rules="rules.password"
            hide-details="auto"
            prepend-inner-icon="mdi-lock"
            class="mb-4"
            required
          />

          <!-- Success Message (when username is generated) -->
          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-4"
            closable
            @click:close="successMessage = null"
          >
            {{ successMessage }}
          </v-alert>

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
              <strong>{{ t('dealerComponents.staff.fixErrors') }}</strong>
            </div>
            <ul class="mb-0 pl-4">
              <li v-for="(errors, field) in validationErrors" :key="field">
                <strong>{{ field }}:</strong> {{ errors.join(', ') }}
              </li>
            </ul>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="close"
          :disabled="submitting"
        >
          {{ t('dealerComponents.staff.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          :loading="submitting"
          :disabled="!formValid || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? t('dealerComponents.staff.creating') : t('dealerComponents.staff.createStaff') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { addStaff, type AddStaffData } from '@/api/dealer.api'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const dialog = ref(props.modelValue)
const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})

const form = reactive<{
  name: string
  email?: string
  phone?: string
  password: string
}>({
  name: '',
  email: undefined,
  phone: undefined,
  password: '',
})

// Validation rules
const rules = {
  required: (value: any) => {
    if (value === undefined || value === null || value === '') {
      return t('dealerComponents.staff.thisFieldRequired')
    }
    return true
  },
  name: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return t('dealerComponents.staff.nameRequired')
      }
      if (value.length < 2) {
        return t('dealerComponents.staff.nameMinLength')
      }
      return true
    },
  ],
  email: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return true // Optional field
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return t('dealerComponents.staff.emailInvalid')
      }
      return true
    },
  ],
  phone: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return true // Optional field
      }
      return true
    },
  ],
  password: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return t('dealerComponents.staff.passwordRequired')
      }
      if (value.length < 8) {
        return t('dealerComponents.staff.passwordMinLength')
      }
      return true
    },
  ],
}

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

// Reset form
const resetForm = () => {
  form.name = ''
  form.email = undefined
  form.phone = undefined
  form.password = ''
  error.value = null
  successMessage.value = null
  validationErrors.value = {}
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
  successMessage.value = null
  validationErrors.value = {}

  try {
    const data: AddStaffData = {
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      password: form.password,
    }

    const result = await addStaff(data)
    
    // Show success message with username
    if (result.username) {
      successMessage.value = t('dealerComponents.staff.staffCreatedWithUsername', { username: result.username })
    } else {
      successMessage.value = t('dealerComponents.staff.staffCreatedSuccess')
    }

    // Wait a bit before closing to show the success message
    setTimeout(() => {
      emit('success')
      close()
    }, 2000)
  } catch (err: any) {
    console.error('Failed to add staff:', err)

    // Handle validation errors
    if (err?.errors && typeof err.errors === 'object') {
      validationErrors.value = err.errors
    } else {
      error.value = err?.message || t('dealerComponents.staff.failedCreateStaff')
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
