<template>
  <PanelDialog
    v-model="dialog"
    title="Add Staff Member"
    icon="mdi-account-plus"
    :max-width="600"
    persistent
  >
    <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="form.name"
        label="Full Name"
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
        label="Email Address (Optional)"
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
        label="Phone (Optional)"
        density="compact"
        variant="outlined"
        :rules="rules.phone"
        hide-details="auto"
        prepend-inner-icon="mdi-phone"
        class="mb-4"
      />

      <v-text-field
        v-model="form.password"
        label="Password"
        type="password"
        density="compact"
        variant="outlined"
        :rules="rules.password"
        hide-details="auto"
        prepend-inner-icon="mdi-lock"
        class="mb-4"
        required
      />

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
    </v-form>

    <template #footer>
      <PanelButton variant="ghost" :disabled="submitting" @click="close">
        Cancel
      </PanelButton>
      <PanelButton
        variant="primary"
        :loading="submitting"
        :disabled="!formValid || submitting"
        @click="handleSubmit"
      >
        {{ submitting ? 'Creating...' : 'Create Staff' }}
      </PanelButton>
    </template>
  </PanelDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, reactive, watch } from 'vue'
import { addStaff, type AddStaffData } from '@/api/staff.api'
import PanelDialog from '@/components/ui/PanelDialog.vue'
import PanelButton from '@/components/ui/PanelButton.vue'

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

const rules = {
  required: (value: any) => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required'
    }
    return true
  },
  name: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Name is required'
      }
      if (value.length < 2) {
        return 'Name must be at least 2 characters'
      }
      return true
    },
  ],
  email: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return true
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address'
      }
      return true
    },
  ],
  phone: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return true
      }
      return true
    },
  ],
  password: [
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Password is required'
      }
      if (value.length < 8) {
        return 'Password must be at least 8 characters'
      }
      return true
    },
  ],
}

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

const close = () => {
  dialog.value = false
}

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

    if (result.username) {
      successMessage.value = `Staff member created successfully! Username: ${result.username}`
    } else {
      successMessage.value = 'Staff member created successfully!'
    }

    setTimeout(() => {
      emit('success')
      close()
    }, 2000)
  } catch (err: any) {
    console.error('Failed to add staff:', err)

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
