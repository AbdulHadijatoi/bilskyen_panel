<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold">Profile Settings</h2>
      <p class="text-muted-foreground max-w-2xl">
        Update your dealer profile information including business details and location.
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
          <p class="text-body-2 text-medium-emphasis mt-4">Loading profile information...</p>
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
              Account Information
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Update your personal account details
            </p>
          </div>

          <v-row dense>
            <!-- Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                placeholder="Enter your full name"
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
                label="Email"
                placeholder="Enter your email"
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
                label="Phone Number"
                placeholder="Enter your phone number"
                density="compact"
                variant="outlined"
                hide-details="auto"
                prepend-inner-icon="mdi-phone"
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="mb-6">
            <h3 class="text-h6 font-weight-semibold mb-1">
              <v-icon size="20" class="mr-2">mdi-office-building</v-icon>
              Business Information
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Update your business registration and contact details
            </p>
          </div>

          <v-row dense>
            <!-- CVR Number -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.cvr"
                label="CVR Number"
                placeholder="Enter your CVR number"
                density="compact"
                variant="outlined"
                :rules="[rules.cvr]"
                hint="Company registration number (max 20 characters)"
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
                label="Street Address"
                placeholder="Enter your street address"
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
                label="City"
                placeholder="Enter your city"
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
                label="Postcode"
                placeholder="Enter your postcode"
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
                label="Country Code"
                placeholder="Select country code"
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
              {{ submitting ? 'Saving...' : 'Save Changes' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getProfile, updateProfile, type UpdateProfileData } from '@/api/dealer.api'
import { getCurrentUser } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth'
import type { DealerModel } from '@/models/dealer.model'

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
    if (value.length < 2) return 'Name must be at least 2 characters'
    if (value.length > 100) return 'Name must be 100 characters or less'
    return true
  },
  email: (value: string) => {
    if (!value) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
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
    loadError.value = error?.message || 'Failed to load profile information. Please try again.'
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
      submitError.value = error?.message || 'Failed to update profile. Please try again.'
    }
  } finally {
    submitting.value = false
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
