<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      variant="flat"
      elevation="0"
      :style="{ border: '1px solid rgba(0, 0, 0, 0.12)' }"
    >
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2">mdi-account-edit</v-icon>
        {{ t('dealerComponents.staff.editStaffMember') }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <!-- Username (Read-only with copy) -->
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('dealerComponents.staff.username') }}</div>
            <div class="d-flex align-center">
              <div class="text-body-2 font-weight-medium mr-2">{{ staffMember?.username || t('common.na') }}</div>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="copyUsername"
                :disabled="!staffMember?.username"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
              <v-snackbar v-model="copiedSnackbar" timeout="2000" color="success">
                {{ t('dealer.views.staff.usernameCopied') }}
              </v-snackbar>
            </div>
          </div>

          <!-- Email (Read-only) -->
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('dealerComponents.staff.email') }}</div>
            <div class="text-body-2 font-weight-medium">{{ staffMember?.email || t('common.na') }}</div>
          </div>

          <v-divider class="my-4" />

          <!-- Editable Fields -->
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
            v-model="form.phone"
            :label="t('dealer.views.profile.phone')"
            density="compact"
            variant="outlined"
            :rules="rules.phone"
            hide-details="auto"
            prepend-inner-icon="mdi-phone"
            class="mb-4"
          />

          <!-- Password Change Toggle -->
          <v-checkbox
            v-model="changePassword"
            :label="t('dealerComponents.staff.changePassword')"
            density="compact"
            hide-details="auto"
            class="mb-2"
          />

          <v-text-field
            v-if="changePassword"
            v-model="form.password"
            :label="t('dealerComponents.staff.newPassword')"
            type="password"
            density="compact"
            variant="outlined"
            :rules="rules.password"
            hide-details="auto"
            prepend-inner-icon="mdi-lock"
            class="mb-4"
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
          {{ submitting ? t('dealerComponents.staff.updating') : t('dealerComponents.staff.update') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateStaff, type UpdateStaffData } from '@/api/dealer.api'

const { t } = useI18n()

export interface StaffMember {
  id: number
  name: string
  email?: string
  username: string
  phone?: string
}

const props = defineProps<{
  modelValue: boolean
  staffMember: StaffMember | null
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
const validationErrors = ref<Record<string, string[]>>({})
const changePassword = ref(false)
const copiedSnackbar = ref(false)

const form = reactive<{
  name: string
  phone?: string
  password?: string
}>({
  name: '',
  phone: undefined,
  password: undefined,
})

// Validation rules
const rules = {
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
      if (!changePassword.value) {
        return true // Not required if checkbox is unchecked
      }
      if (!value || value.trim().length === 0) {
        return t('dealerComponents.staff.passwordRequiredWhenChanging')
      }
      if (value.length < 8) {
        return t('dealerComponents.staff.passwordMinLength')
      }
      return true
    },
  ],
}

// Copy username to clipboard
const copyUsername = async () => {
  if (!props.staffMember?.username) return
  
  try {
    await navigator.clipboard.writeText(props.staffMember.username)
    copiedSnackbar.value = true
  } catch (err) {
    console.error('Failed to copy username:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.staffMember!.username
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      copiedSnackbar.value = true
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
    document.body.removeChild(textArea)
  }
}

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal && props.staffMember) {
    form.name = props.staffMember.name
    form.phone = props.staffMember.phone || undefined
    form.password = undefined
    changePassword.value = false
  } else if (!newVal) {
    resetForm()
  }
})

watch(() => props.staffMember, (newVal) => {
  if (newVal && dialog.value) {
    form.name = newVal.name
    form.phone = newVal.phone || undefined
    form.password = undefined
    changePassword.value = false
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetForm()
  } else if (props.staffMember) {
    form.name = props.staffMember.name
    form.phone = props.staffMember.phone || undefined
    form.password = undefined
    changePassword.value = false
  }
})

// Watch changePassword to update password validation
watch(changePassword, () => {
  if (!changePassword.value) {
    form.password = undefined
  }
  formRef.value?.validate()
})

// Reset form
const resetForm = () => {
  form.name = ''
  form.phone = undefined
  form.password = undefined
  changePassword.value = false
  error.value = null
  validationErrors.value = {}
  formRef.value?.resetValidation()
}

// Close dialog
const close = () => {
  dialog.value = false
}

// Handle form submission
const handleSubmit = async () => {
  if (!formValid.value || !props.staffMember) {
    return
  }

  submitting.value = true
  error.value = null
  validationErrors.value = {}

  try {
    const data: UpdateStaffData = {
      name: form.name.trim(),
      phone: form.phone?.trim() || undefined,
    }

    // Only include password if changePassword is checked
    if (changePassword.value && form.password) {
      data.password = form.password
    }

    await updateStaff(props.staffMember.id, data)

    emit('success')
    close()
  } catch (err: any) {
    console.error('Failed to update staff:', err)

    // Handle validation errors
    if (err?.errors && typeof err.errors === 'object') {
      validationErrors.value = err.errors
    } else {
      error.value = err?.message || t('dealerComponents.staff.failedUpdateStaff')
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
