<template>
  <div class="settings-password-panel">
    <PanelSection
      :title="t('dealerComponents.changePasswordDialog.title')"
      :description="t('dealerComponents.changePasswordDialog.passwordMinHint')"
      icon="mdi-lock-reset"
      :divider="false"
    >
      <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.current_password"
          :label="t('dealerComponents.changePasswordDialog.currentPassword')"
          type="password"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-lock"
          class="mb-4"
          autocomplete="current-password"
        />

        <v-text-field
          v-model="form.password"
          :label="t('dealerComponents.changePasswordDialog.newPassword')"
          type="password"
          :rules="[rules.required, rules.password]"
          prepend-inner-icon="mdi-lock-outline"
          class="mb-4"
          autocomplete="new-password"
        />

        <v-text-field
          v-model="form.password_confirmation"
          :label="t('dealerComponents.changePasswordDialog.confirmNewPassword')"
          type="password"
          :rules="[rules.required, rules.passwordMatch]"
          prepend-inner-icon="mdi-lock-check"
          autocomplete="new-password"
        />

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
            <strong>{{ t('dealerComponents.changePasswordDialog.fixErrors') }}</strong>
          </div>
          <ul class="mb-0 pl-4">
            <li v-for="(errors, field) in validationErrors" :key="field">
              <strong>{{ field }}:</strong> {{ errors.join(', ') }}
            </li>
          </ul>
        </v-alert>

        <v-alert
          v-if="showSuccess"
          type="success"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          {{ t('dealerComponents.changePasswordDialog.passwordChangedSuccess') }}
        </v-alert>

        <div class="settings-password-panel__actions">
          <PanelButton
            variant="primary"
            icon="mdi-check"
            :loading="submitting"
            :disabled="!formValid || submitting"
            @click="handleSubmit"
          >
            {{ submitting ? t('dealerComponents.changePasswordDialog.changing') : t('dealerComponents.changePasswordDialog.changePassword') }}
          </PanelButton>
        </div>
      </v-form>
    </PanelSection>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { changePassword, type ChangePasswordData } from '@/api/auth.api'
import { changeOwnPassword, type ChangeOwnPasswordData } from '@/api/admin.api'
import { useAuthStore } from '@/stores/auth.store'
import PanelSection from '@/components/ui/PanelSection.vue'
import PanelButton from '@/components/ui/PanelButton.vue'

const { t } = useI18n()
const authStore = useAuthStore()

const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})
const showSuccess = ref(false)

const isAdmin = computed(() => authStore.user?.roles?.includes('admin') ?? false)

const form = reactive<ChangePasswordData>({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const rules = {
  required: (value: string) => !!value || t('dealerComponents.staff.thisFieldRequired'),
  password: (value: string) => {
    if (!value) return true
    if (value.length < 8) return t('dealerComponents.changePasswordDialog.passwordMinLength')
    return true
  },
  passwordMatch: (value: string) => {
    if (!value) return true
    if (value !== form.password) return t('dealerComponents.changePasswordDialog.passwordsDoNotMatch')
    return true
  },
}

async function handleSubmit() {
  if (!formValid.value) return

  submitting.value = true
  error.value = null
  validationErrors.value = {}
  showSuccess.value = false

  try {
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
    form.current_password = ''
    form.password = ''
    form.password_confirmation = ''
    formRef.value?.resetValidation()
  } catch (err: unknown) {
    const errorObj = err as { errors?: Record<string, string[]>; message?: string }
    if (errorObj?.errors && typeof errorObj.errors === 'object') {
      validationErrors.value = errorObj.errors
    } else {
      error.value = errorObj?.message || t('dealerComponents.changePasswordDialog.failedChangePassword')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.settings-password-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
</style>
