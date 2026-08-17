<template>
  <div class="settings-profile-panel">
    <div v-if="loading" class="settings-profile-panel__loading">
      <v-progress-circular indeterminate color="primary" size="40" />
      <p>{{ t('dealer.views.profile.loadingProfile') }}</p>
    </div>

    <v-alert
      v-else-if="loadError"
      type="error"
      variant="tonal"
      density="compact"
      closable
      @click:close="loadError = null"
    >
      {{ loadError }}
    </v-alert>

    <v-form
      v-else
      ref="formRef"
      v-model="formValid"
      @submit.prevent="handleSubmit"
    >
      <PanelSection
        :title="t('dealer.views.profile.accountInformation')"
        :description="t('dealer.views.profile.accountDetails')"
        icon="mdi-account"
        :divider="false"
      >
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.name"
              :label="t('dealer.views.profile.fullName')"
              :placeholder="t('dealer.views.profile.placeholderFullName')"
              :rules="[rules.name]"
              prepend-inner-icon="mdi-account"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.email"
              :label="t('dealer.views.profile.email')"
              :placeholder="t('dealer.views.profile.placeholderEmail')"
              type="email"
              :rules="[rules.email]"
              prepend-inner-icon="mdi-email"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.phone"
              :label="t('dealer.views.profile.phone')"
              :placeholder="t('dealer.views.profile.placeholderPhone')"
              prepend-inner-icon="mdi-phone"
            />
          </v-col>
        </v-row>
      </PanelSection>

      <PanelSection
        v-if="isDealerRole"
        :title="t('dealer.views.profile.dealerLogo')"
        :description="t('dealer.views.profile.logoSubtitle')"
        icon="mdi-image"
      >
        <div class="settings-profile-panel__logo-row">
          <div class="settings-profile-panel__logo-preview">
            <img
              v-if="profile?.logo"
              :key="logoCacheBuster"
              :src="profile.logo + (profile.logo.includes('?') ? '&' : '?') + 't=' + logoCacheBuster"
              :alt="t('dealer.views.profile.dealerLogo')"
            />
            <v-icon v-else size="40">mdi-storefront</v-icon>
          </div>
          <v-file-input
            v-model="logoFile"
            :label="t('dealer.views.profile.chooseLogoOptional')"
            prepend-inner-icon="mdi-upload"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hide-details
            show-size
            clearable
            @update:model-value="onLogoFileSelected"
          />
        </div>
      </PanelSection>

      <PanelSection
        v-if="isDealerRole"
        :title="t('dealer.views.profile.businessInformation')"
        :description="t('dealer.views.profile.businessDetails')"
        icon="mdi-office-building"
      >
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.cvr"
              :label="t('dealer.views.profile.cvr')"
              :placeholder="t('dealer.views.profile.placeholderCvr')"
              :rules="[rules.cvr]"
              :hint="t('dealer.views.profile.hintCvr')"
              persistent-hint
              prepend-inner-icon="mdi-identifier"
            />
          </v-col>
        </v-row>
      </PanelSection>

      <PanelSection
        v-if="isDealerRole"
        :title="t('dealer.views.profile.addressInformation')"
        :description="t('dealer.views.profile.addressSubtitle')"
        icon="mdi-map-marker"
      >
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="form.address"
              :label="t('dealer.views.profile.streetAddress')"
              :placeholder="t('dealer.views.profile.placeholderStreet')"
              prepend-inner-icon="mdi-home"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.city"
              :label="t('dealer.views.profile.city')"
              :placeholder="t('dealer.views.profile.placeholderCity')"
              prepend-inner-icon="mdi-city"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.postcode"
              :label="t('dealer.views.profile.postcode')"
              :placeholder="t('dealer.views.profile.placeholderPostcode')"
              prepend-inner-icon="mdi-mailbox"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.country_code"
              :items="countryCodes"
              :label="t('dealer.views.profile.countryCode')"
              :placeholder="t('dealer.views.profile.placeholderCountry')"
              prepend-inner-icon="mdi-earth"
              item-title="name"
              item-value="code"
            />
          </v-col>
        </v-row>
      </PanelSection>

      <v-alert
        v-if="submitError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        closable
        @click:close="submitError = null"
      >
        {{ submitError }}
      </v-alert>

      <v-alert
        v-if="Object.keys(validationErrors).length > 0"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        closable
        @click:close="validationErrors = {}"
      >
        <div class="mb-2"><strong>{{ t('dealer.views.profile.fixErrors') }}</strong></div>
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
        class="mb-4"
        closable
        @click:close="showSuccess = false"
      >
        {{ t('dealer.views.profile.profileUpdated') }}
      </v-alert>

      <div class="settings-profile-panel__actions">
        <PanelButton variant="outline" icon="mdi-refresh" :disabled="submitting" @click="resetForm">
          {{ t('dealer.views.profile.reset') }}
        </PanelButton>
        <PanelButton
          variant="primary"
          icon="mdi-content-save"
          :loading="submitting"
          :disabled="!formValid || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? t('dealer.views.profile.saving') : t('dealer.views.profile.saveChanges') }}
        </PanelButton>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProfile, updateProfile, type UpdateProfileData } from '@/api/dealer.api'
import { getCurrentUser, updateUser } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { DealerModel } from '@/models/dealer.model'
import PanelSection from '@/components/ui/PanelSection.vue'
import PanelButton from '@/components/ui/PanelButton.vue'
import { isDealer } from '@/utils/permissions'

const { t } = useI18n()
const authStore = useAuthStore()

const isDealerRole = computed(() => isDealer())

const formRef = ref()
const formValid = ref(false)
const loading = ref(false)
const submitting = ref(false)
const loadError = ref<string | null>(null)
const submitError = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})
const showSuccess = ref(false)
const profile = ref<DealerModel | null>(null)
const logoFile = ref<File[] | null>(null)
const logoFileToUpload = ref<File | null>(null)
const logoCacheBuster = ref(0)

const form = reactive<UpdateProfileData>({
  name: '',
  email: '',
  phone: '',
  cvr: '',
  address: '',
  city: '',
  postcode: '',
  country_code: '',
})

const countryCodes = [
  { name: 'Denmark', code: 'DK' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Norway', code: 'NO' },
  { name: 'Finland', code: 'FI' },
  { name: 'Germany', code: 'DE' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Belgium', code: 'BE' },
  { name: 'France', code: 'FR' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Poland', code: 'PL' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
]

const rules = {
  name: (value: string) => {
    if (!value) return true
    if (value.length < 2) return t('dealer.views.profile.validationNameMin')
    if (value.length > 100) return t('dealer.views.profile.validationNameMax')
    return true
  },
  email: (value: string) => {
    if (!value) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return t('dealer.views.profile.validationEmail')
    return true
  },
  cvr: (value: string) => {
    if (!value) return true
    if (value.length > 20) return t('dealer.views.profile.validationCvrMax')
    return true
  },
}

async function loadProfile() {
  loading.value = true
  loadError.value = null

  try {
    if (isDealerRole.value) {
      const data = await getProfile()
      profile.value = data
      if (data.owner) {
        form.name = data.owner.name || ''
        form.email = data.owner.email || ''
        form.phone = data.owner.phone || ''
      }
      form.cvr = data.cvr || ''
      form.address = data.address || ''
      form.city = data.city || ''
      form.postcode = data.postcode || ''
      form.country_code = data.countryCode || ''
    } else if (authStore.user) {
      form.name = authStore.user.name || ''
      form.email = authStore.user.email || ''
      form.phone = authStore.user.phone || ''
    }
  } catch (error: unknown) {
    const err = error as { message?: string }
    loadError.value = err?.message || t('dealer.views.profile.failedLoadProfile')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  if (profile.value && isDealerRole.value) {
    if (profile.value.owner) {
      form.name = profile.value.owner.name || ''
      form.email = profile.value.owner.email || ''
      form.phone = profile.value.owner.phone || ''
    }
    form.cvr = profile.value.cvr || ''
    form.address = profile.value.address || ''
    form.city = profile.value.city || ''
    form.postcode = profile.value.postcode || ''
    form.country_code = profile.value.countryCode || ''
  } else if (authStore.user) {
    form.name = authStore.user.name || ''
    form.email = authStore.user.email || ''
    form.phone = authStore.user.phone || ''
  }
  logoFile.value = null
  logoFileToUpload.value = null
  submitError.value = null
  validationErrors.value = {}
  showSuccess.value = false
}

async function handleSubmit() {
  if (!formValid.value) return

  const logoFileToSend = logoFileToUpload.value ?? logoFile.value?.[0]
  if (logoFileToSend instanceof File && logoFileToSend.size > 2 * 1024 * 1024) {
    submitError.value = t('dealer.views.profile.logoSizeError')
    return
  }

  submitting.value = true
  submitError.value = null
  validationErrors.value = {}
  showSuccess.value = false

  try {
    if (isDealerRole.value) {
      const updateData: UpdateProfileData = {
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        cvr: form.cvr || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        postcode: form.postcode || undefined,
        country_code: form.country_code || undefined,
      }
      const updatedProfile = await updateProfile(updateData, logoFileToSend instanceof File ? logoFileToSend : null)
      profile.value = updatedProfile
      if (updatedProfile.owner) {
        form.name = updatedProfile.owner.name || ''
        form.email = updatedProfile.owner.email || ''
        form.phone = updatedProfile.owner.phone || ''
      }
      form.cvr = updatedProfile.cvr || ''
      form.address = updatedProfile.address || ''
      form.city = updatedProfile.city || ''
      form.postcode = updatedProfile.postcode || ''
      form.country_code = updatedProfile.countryCode || ''
      logoFile.value = null
      logoFileToUpload.value = null
      logoCacheBuster.value = Date.now()
    } else {
      const updatedUser = await updateUser({
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
      })
      form.name = updatedUser.name || ''
      form.email = updatedUser.email || ''
      form.phone = updatedUser.phone || ''
    }

    if (form.name || form.email || form.phone) {
      try {
        await getCurrentUser()
      } catch {
        /* ignore refresh errors */
      }
    }

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
  } catch (error: unknown) {
    const err = error as { errors?: Record<string, string[]>; message?: string }
    if (err?.errors && typeof err.errors === 'object') {
      validationErrors.value = err.errors
    } else {
      submitError.value = err?.message || t('dealer.views.profile.failedUpdateProfile')
    }
  } finally {
    submitting.value = false
  }
}

function onLogoFileSelected(files: File | File[] | null) {
  const list = files == null ? null : Array.isArray(files) ? files : [files]
  const file = list?.[0]
  logoFileToUpload.value = file instanceof File ? file : null
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.settings-profile-panel__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) 0;
  color: var(--muted-foreground);
  font-size: var(--text-sm);
}

.settings-profile-panel__logo-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.settings-profile-panel__logo-preview {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.settings-profile-panel__logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings-profile-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
</style>
