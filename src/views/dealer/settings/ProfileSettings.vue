<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold">{{ t('dealer.views.profile.title') }}</h2>
      <p class="text-muted-foreground max-w-2xl">
        {{ t('dealer.views.profile.subtitle') }}
      </p>
    </div>

    <v-divider class="my-3" />

    <!-- Profile Form Card -->
    <v-card
      variant="flat"
      elevation="0"
      :style="{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
      }"
    >
      <v-card-text class="pa-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">{{ t('dealer.views.profile.loadingProfile') }}</p>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="loadError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
          @click:close="loadError = null"
        >
          {{ loadError }}
        </v-alert>

        <!-- Form -->
        <v-form
          v-else
          ref="formRef"
          v-model="formValid"
          @submit.prevent="handleSubmit"
        >
          <!-- User Details Section -->
          <div class="mb-6">
            <h3 class="text-h6 font-weight-semibold mb-1">
              <v-icon size="20" class="mr-2">mdi-account</v-icon>
              {{ t('dealer.views.profile.accountInformation') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('dealer.views.profile.accountDetails') }}
            </p>
          </div>

          <v-row dense>
            <!-- Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                :label="t('dealer.views.profile.fullName')"
                :placeholder="t('dealer.views.profile.placeholderFullName')"
                density="compact"
                variant="outlined"
                :rules="[rules.name]"
                hide-details="auto"
                prepend-inner-icon="mdi-account"
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                :label="t('dealer.views.profile.email')"
                :placeholder="t('dealer.views.profile.placeholderEmail')"
                type="email"
                density="compact"
                variant="outlined"
                :rules="[rules.email]"
                hide-details="auto"
                prepend-inner-icon="mdi-email"
              />
            </v-col>

            <!-- Phone -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.phone"
                :label="t('dealer.views.profile.phone')"
                :placeholder="t('dealer.views.profile.placeholderPhone')"
                density="compact"
                variant="outlined"
                hide-details="auto"
                prepend-inner-icon="mdi-phone"
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <!-- Dealer logo -->
          <div class="mb-6">
            <h3 class="text-h6 font-weight-semibold mb-1">
              <v-icon size="20" class="mr-2">mdi-image</v-icon>
              Dealer logo
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Upload or update your dealer logo. Used on your public dealer page.
            </p>
            <div class="d-flex align-center gap-4 flex-wrap">
              <div class="logo-preview rounded overflow-hidden" style="width: 100px; height: 100px; background: var(--v-border-color); flex-shrink: 0;">
                <img
                  v-if="profile?.logo"
                  :src="profile.logo"
                  alt="Dealer logo"
                  class="w-100 h-100 object-fit-cover"
                />
                <div v-else class="w-100 h-100 d-flex align-center justify-center text-medium-emphasis">
                  <v-icon size="40">mdi-storefront</v-icon>
                </div>
              </div>
              <div class="flex-grow-1" style="min-width: 200px;">
                <v-file-input
                  v-model="logoFile"
                  label="Choose logo image"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-upload"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hide-details
                  show-size
                  clearable
                  @update:model-value="onLogoFileSelected"
                />
                <v-btn
                  v-if="logoFile?.length"
                  color="primary"
                  size="small"
                  class="mt-2"
                  :loading="uploadingLogo"
                  @click="uploadLogo"
                >
                  Upload logo
                </v-btn>
              </div>
            </div>
            <v-alert v-if="logoUploadError" type="error" variant="tonal" density="compact" class="mt-2" closable @click:close="logoUploadError = null">
              {{ logoUploadError }}
            </v-alert>
          </div>

          <v-divider class="my-6" />

          <div class="mb-6">
            <h3 class="text-h6 font-weight-semibold mb-1">
              <v-icon size="20" class="mr-2">mdi-office-building</v-icon>
              {{ t('dealer.views.profile.businessInformation') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('dealer.views.profile.businessDetails') }}
            </p>
          </div>

          <v-row dense>
            <!-- CVR Number -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.cvr"
                :label="t('dealer.views.profile.cvr')"
                :placeholder="t('dealer.views.profile.placeholderCvr')"
                density="compact"
                variant="outlined"
                :rules="[rules.cvr]"
                :hint="t('dealer.views.profile.hintCvr')"
                persistent-hint
                hide-details="auto"
                prepend-inner-icon="mdi-identifier"
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="mb-6">
            <h3 class="text-h6 font-weight-semibold mb-1">
              <v-icon size="20" class="mr-2">mdi-map-marker</v-icon>
              Address Information
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Update your business address and location details
            </p>
          </div>

          <v-row dense>
            <!-- Address -->
            <v-col cols="12">
              <v-text-field
                v-model="form.address"
                :label="t('dealer.views.profile.streetAddress')"
                :placeholder="t('dealer.views.profile.placeholderStreet')"
                density="compact"
                variant="outlined"
                hide-details="auto"
                prepend-inner-icon="mdi-home"
              />
            </v-col>

            <!-- City -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.city"
                :label="t('dealer.views.profile.city')"
                :placeholder="t('dealer.views.profile.placeholderCity')"
                density="compact"
                variant="outlined"
                hide-details="auto"
                prepend-inner-icon="mdi-city"
              />
            </v-col>

            <!-- Postcode -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.postcode"
                :label="t('dealer.views.profile.postcode')"
                :placeholder="t('dealer.views.profile.placeholderPostcode')"
                density="compact"
                variant="outlined"
                hide-details="auto"
                prepend-inner-icon="mdi-mailbox"
              />
            </v-col>

            <!-- Country Code -->
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.country_code"
                :items="countryCodes"
                :label="t('dealer.views.profile.countryCode')"
                :placeholder="t('dealer.views.profile.placeholderCountry')"
                density="compact"
                variant="outlined"
                hide-details="auto"
                prepend-inner-icon="mdi-earth"
                item-title="name"
                item-value="code"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon>{{ item.raw.flag }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.code }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <v-chip size="small" variant="flat">
                    <v-icon start size="16">{{ item.raw.flag }}</v-icon>
                    {{ item.raw.code }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <!-- Submit Error -->
          <v-alert
            v-if="submitError"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-4"
            closable
            @click:close="submitError = null"
          >
            {{ submitError }}
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
              <strong>{{ t('dealer.views.profile.fixErrors') }}</strong>
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
            closable
            @click:close="showSuccess = false"
          >
            Profile updated successfully!
          </v-alert>

          <!-- Action Buttons -->
          <v-divider class="my-6" />
          <div class="d-flex justify-end gap-3">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              @click="resetForm"
              :disabled="submitting"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reset
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              :loading="submitting"
              :disabled="!formValid || submitting"
              @click="handleSubmit"
            >
              <v-icon start>{{ submitting ? 'mdi-loading' : 'mdi-content-save' }}</v-icon>
              {{ submitting ? t('dealer.views.profile.saving') : t('dealer.views.profile.saveChanges') }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProfile, updateProfile, uploadLogo as uploadLogoApi, type UpdateProfileData } from '@/api/dealer.api'
import { getCurrentUser } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth'
import type { DealerModel } from '@/models/dealer.model'

const { t } = useI18n()

const authStore = useAuthStore()

// Form state
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
const uploadingLogo = ref(false)
const logoUploadError = ref<string | null>(null)

// Form data
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

// Country codes list (common European countries)
const countryCodes = [
  { name: 'Denmark', code: 'DK', flag: 'mdi-flag' },
  { name: 'Sweden', code: 'SE', flag: 'mdi-flag' },
  { name: 'Norway', code: 'NO', flag: 'mdi-flag' },
  { name: 'Finland', code: 'FI', flag: 'mdi-flag' },
  { name: 'Germany', code: 'DE', flag: 'mdi-flag' },
  { name: 'Netherlands', code: 'NL', flag: 'mdi-flag' },
  { name: 'Belgium', code: 'BE', flag: 'mdi-flag' },
  { name: 'France', code: 'FR', flag: 'mdi-flag' },
  { name: 'United Kingdom', code: 'GB', flag: 'mdi-flag' },
  { name: 'Poland', code: 'PL', flag: 'mdi-flag' },
  { name: 'Spain', code: 'ES', flag: 'mdi-flag' },
  { name: 'Italy', code: 'IT', flag: 'mdi-flag' },
]

// Validation rules
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
    if (value.length > 20) return 'CVR number must be 20 characters or less'
    return true
  },
}

// Load profile data
const loadProfile = async () => {
  loading.value = true
  loadError.value = null

  try {
    const data = await getProfile()
    profile.value = data

    // Populate form with existing data (owner fields - dealer himself is the owner)
    if (data.owner) {
      form.name = data.owner.name || ''
      form.email = data.owner.email || ''
      form.phone = data.owner.phone || ''
    }

    // Populate form with existing data (dealer fields)
    form.cvr = data.cvr || ''
    form.address = data.address || ''
    form.city = data.city || ''
    form.postcode = data.postcode || ''
    form.country_code = data.countryCode || ''
  } catch (error: any) {
    console.error('Failed to load profile:', error)
    loadError.value = error?.message || t('dealer.views.profile.failedLoadProfile')
  } finally {
    loading.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  if (profile.value) {
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
  }
  submitError.value = null
  validationErrors.value = {}
  showSuccess.value = false
}

// Handle form submission
const handleSubmit = async () => {
  if (!formValid.value) {
    return
  }

  submitting.value = true
  submitError.value = null
  validationErrors.value = {}
  showSuccess.value = false

  try {
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

    const updatedProfile = await updateProfile(updateData)
    profile.value = updatedProfile

    // Update form with new values (owner fields - dealer himself is the owner)
    if (updatedProfile.owner) {
      form.name = updatedProfile.owner.name || ''
      form.email = updatedProfile.owner.email || ''
      form.phone = updatedProfile.owner.phone || ''
    }

    // Update form with new values (dealer fields)
    form.cvr = updatedProfile.cvr || ''
    form.address = updatedProfile.address || ''
    form.city = updatedProfile.city || ''
    form.postcode = updatedProfile.postcode || ''
    form.country_code = updatedProfile.countryCode || ''

    // Refresh auth store to update user info in sidebar
    if (updateData.name || updateData.email || updateData.phone) {
      try {
        await getCurrentUser()
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }

    showSuccess.value = true

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
  } catch (error: any) {
    console.error('Failed to update profile:', error)

    // Handle validation errors
    if (error?.errors && typeof error.errors === 'object') {
      validationErrors.value = error.errors
    } else {
      submitError.value = error?.message || t('dealer.views.profile.failedUpdateProfile')
    }
  } finally {
    submitting.value = false
  }
}

function onLogoFileSelected() {
  logoUploadError.value = null
}

async function uploadLogo() {
  const file = logoFile.value?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    logoUploadError.value = 'Logo must be 2MB or less'
    return
  }
  try {
    uploadingLogo.value = true
    logoUploadError.value = null
    const updated = await uploadLogoApi(file)
    profile.value = updated
    logoFile.value = null
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } catch (err: any) {
    logoUploadError.value = err?.message || 'Failed to upload logo'
  } finally {
    uploadingLogo.value = false
  }
}

// Load profile on mount
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
:deep(.v-field__prepend-inner) {
  padding-top: 0 !important;
}
</style>
