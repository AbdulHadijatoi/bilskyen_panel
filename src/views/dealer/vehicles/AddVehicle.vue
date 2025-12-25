<template>
  <div class="d-flex flex-column w-100" style="gap: 1rem;">
    <div>
      <h2 class="text-h5 font-weight-bold mb-2">Add Vehicle</h2>
      <p class="text-body-2 text-medium-emphasis" style="max-width: 42rem;">
        Use the form below to add a new vehicle to your inventory. Ensure all
        details are accurate and complete.
      </p>
    </div>

    <v-divider class="my-3" />

    <div class="d-flex flex-column align-center justify-center w-100" style="gap: 1rem;">
      <v-alert
        v-if="submitError"
        type="error"
        variant="tonal"
        density="compact"
        class="w-100"
      >
        <v-alert-title>Create Vehicle Error</v-alert-title>
        <v-alert-text>{{ submitError }}</v-alert-text>
      </v-alert>

      <v-form ref="formRef" v-model="formValid" class="d-flex flex-column w-100" style="gap: 0.875rem;">
        <!-- Basic Information -->
        <div class="d-flex flex-column w-100" style="gap: 1rem;">
          <div class="d-flex align-center w-100 mb-2" style="gap: 1rem;">
            <v-divider style="flex: 1;" />
            <span class="text-caption text-medium-emphasis">Basic Information</span>
            <v-divider style="flex: 1;" />
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.inventoryDate"
                label="Inventory Date"
                type="datetime-local"
                density="compact"
                variant="outlined"
                hint="When was the vehicle added to lot?"
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              >
                <template #append-inner>
                  <v-icon>mdi-calendar</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.registrationNumber"
                label="Registration Number"
                placeholder="e.g., KL 10 AB 1234"
                density="compact"
                variant="outlined"
                hint="Enter the vehicle's registration number as per local regulations."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required, rules.registrationNumber]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.vin"
                label="Vehicle Identification Number (VIN)"
                placeholder="e.g., 1HGCM82633A123456"
                density="compact"
                variant="outlined"
                maxlength="17"
                hint="Enter the 17-character VIN for vehicle tracking."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required, rules.vin]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.engineNumber"
                label="Engine Number"
                placeholder="e.g., PJ12345U123456P"
                density="compact"
                variant="outlined"
                hint="Enter the engine number for identification."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required, rules.engineNumber]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.make"
                :items="makes"
                label="Vehicle Make"
                placeholder="e.g., Toyota"
                density="compact"
                variant="outlined"
                hint="Select the manufacturer of the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.model"
                label="Vehicle Model"
                placeholder="e.g., Corolla"
                density="compact"
                variant="outlined"
                hint="Enter the model name of the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.variant"
                label="Model Variant"
                placeholder="e.g., Classic Edition (CE)"
                density="compact"
                variant="outlined"
                hint="Enter the specific variant of the vehicle model."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model.number="form.year"
                :items="years"
                label="Model Year"
                placeholder="e.g., 2023"
                density="compact"
                variant="outlined"
                hint="Select the year the vehicle was manufactured."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.vehicleType"
                :items="vehicleTypes"
                label="Vehicle Type"
                placeholder="e.g., Sedan"
                density="compact"
                variant="outlined"
                hint="Choose the general classification of the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.odometer"
                label="Odometer Reading"
                placeholder="e.g., 75,000"
                type="number"
                density="compact"
                variant="outlined"
                hint="Enter the current mileage on the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required, rules.odometer]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.status"
                :items="statuses"
                label="Vehicle Status"
                placeholder="e.g., Available"
                density="compact"
                variant="outlined"
                hint="Select the current status of the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Specifications -->
        <div class="d-flex flex-column w-100" style="gap: 1rem;">
          <div class="d-flex align-center w-100 mb-2" style="gap: 1rem;">
            <v-divider style="flex: 1;" />
            <span class="text-caption text-medium-emphasis">Specifications</span>
            <v-divider style="flex: 1;" />
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.transmissionType"
                :items="transmissionTypes"
                label="Transmission Type"
                placeholder="e.g., Automatic"
                density="compact"
                variant="outlined"
                hint="Select the type of transmission."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.fuelType"
                :items="fuelTypes"
                label="Fuel Type"
                placeholder="e.g., Petrol"
                density="compact"
                variant="outlined"
                hint="Choose the fuel the vehicle uses."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.color"
                label="Color"
                placeholder="e.g., White"
                density="compact"
                variant="outlined"
                hint="Enter the exterior color of the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>
        </div>

        <!-- History -->
        <div class="d-flex flex-column w-100" style="gap: 1rem;">
          <div class="d-flex align-center w-100 mb-2" style="gap: 1rem;">
            <v-divider style="flex: 1;" />
            <span class="text-caption text-medium-emphasis">History</span>
            <v-divider style="flex: 1;" />
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.ownershipCount"
                label="Number of Ownerships"
                placeholder="e.g., 3"
                type="number"
                density="compact"
                variant="outlined"
                max="999"
                hint="Enter the number of previous owners of the vehicle. This helps in understanding the vehicle's history and potential wear and tear."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required, rules.ownershipCount]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <div class="d-flex align-center h-100">
                <v-checkbox
                  v-model="form.accidentHistory"
                  density="compact"
                  hide-details="auto"
                  class="accident-checkbox"
                >
                  <template #label>
                    <div class="d-flex flex-column">
                      <span class="font-weight-medium">Accident History</span>
                      <span class="text-caption text-medium-emphasis">
                        Has the vehicle been in any accidents?
                      </span>
                    </div>
                  </template>
                </v-checkbox>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.condition"
                :items="conditions"
                label="Vehicle Condition"
                placeholder="e.g., Good"
                density="compact"
                variant="outlined"
                hint="Rate the current condition of the vehicle."
                persistent-hint
                hide-details="auto"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox
                v-model="form.blacklistFlags"
                :items="blacklistTypes"
                label="Blacklist Issues"
                placeholder="Select blacklist issues"
                multiple
                chips
                density="compact"
                variant="outlined"
                hint="Select all applicable issues that may affect the vehicle's status."
                persistent-hint
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Display Details -->
        <div class="d-flex flex-column w-100" style="gap: 1rem;">
          <div class="d-flex align-center w-100 mb-4" style="gap: 1rem;">
            <v-divider style="flex: 1;" />
            <span class="text-caption text-medium-emphasis">Display Details</span>
            <v-divider style="flex: 1;" />
          </div>

          <v-text-field
            v-model.number="form.listingPrice"
            label="Listing Price"
            placeholder="e.g., 10,75,000"
            type="number"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-currency-inr"
            hint="Enter the price at which the vehicle is listed for sale."
            persistent-hint
            hide-details="auto"
            :rules="[rules.required, rules.price]"
          />

          <div>
            <v-label class="mb-2">Features</v-label>
            <div class="d-flex gap-2 mb-2">
              <v-text-field
                v-model="newFeature"
                placeholder="Select vehicle features"
                density="compact"
                variant="outlined"
                hide-details
                style="flex: 1;"
                @keyup.enter="addFeature"
              />
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addFeature"
                :disabled="!newFeature || form.features.length >= 30"
              >
                Add
              </v-btn>
            </div>
            <div v-if="form.features.length > 0" class="d-flex flex-wrap mb-2" style="gap: 0.5rem;">
              <v-chip
                v-for="(feature, index) in form.features"
                :key="`feature-${index}-${feature}`"
                closable
                size="small"
                @click:close="removeFeature(index)"
              >
                {{ feature }}
              </v-chip>
            </div>
            <div v-if="form.features.length === 0" class="text-caption text-error mb-2">
              At least one feature is required
            </div>
            <p class="text-caption text-medium-emphasis">
              Select all applicable features installed.
            </p>
          </div>

          <div>
            <v-label class="mb-2">Vehicle Photos</v-label>
            <v-file-input
              v-model="form.images"
              label="Upload Images"
              multiple
              accept="image/*"
              density="compact"
              variant="outlined"
              prepend-icon="mdi-camera"
              hint="Upload at least one clear image of the vehicle."
              persistent-hint
              hide-details="auto"
              :rules="[rules.requiredImages]"
            />
            <div v-if="form.images && form.images.length > 0" class="mt-3">
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
                <div
                  v-for="(image, index) in imagePreviews"
                  :key="`image-${index}-${form.images[index]?.name || index}`"
                  class="image-preview"
                >
                  <v-img
                    :src="image"
                    height="80"
                    cover
                    class="rounded-md"
                  />
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    color="error"
                    class="remove-image-btn"
                    @click="removeImage(index)"
                  >
                    <v-icon size="16">mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <v-textarea
            v-model="form.description"
            label="Vehicle Description"
            placeholder="e.g., Well-maintained, one-owner SUV with leather seats, backup camera, and new tires. Recently serviced with clean title."
            density="compact"
            variant="outlined"
            rows="6"
            hint="Provide a detailed description of the vehicle's condition, features, and selling points. Useful for online listings and contact information."
            persistent-hint
            hide-details="auto"
            :rules="[rules.required, rules.description]"
          />
        </div>

        <!-- For Dealer Only -->
        <div class="d-flex flex-column w-100" style="gap: 1rem;">
          <div class="d-flex align-center w-100 mb-4" style="gap: 1rem;">
            <v-divider style="flex: 1;" />
            <span class="text-caption text-medium-emphasis">For Dealer Only</span>
            <v-divider style="flex: 1;" />
          </div>

          <div>
            <v-label class="mb-2">Enter pending works on this vehicle.</v-label>
            <div class="d-flex mb-2" style="gap: 0.5rem;">
              <v-text-field
                v-model="newPendingWork"
                placeholder="Enter pending works (e.g., Replace brake pads, Change oil)"
                density="compact"
                variant="outlined"
                hide-details
                style="flex: 1;"
                @keyup.enter="addPendingWork"
              />
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addPendingWork"
                :disabled="!newPendingWork || form.pendingWorks.length >= 30"
              >
                Add
              </v-btn>
            </div>
            <div v-if="form.pendingWorks.length > 0" class="d-flex flex-wrap mb-2" style="gap: 0.5rem;">
              <v-chip
                v-for="(work, index) in form.pendingWorks"
                :key="`pending-work-${index}-${work}`"
                closable
                size="small"
                @click:close="removePendingWork(index)"
              >
                {{ work }}
              </v-chip>
            </div>
            <p class="text-caption text-medium-emphasis">
              Enter any pending works that need to be done on this vehicle.
            </p>
          </div>

          <v-textarea
            v-model="form.remarks"
            label="Vehicle Remarks"
            placeholder="e.g., This vehicle's left tyre is replaced recently."
            density="compact"
            variant="outlined"
            rows="3"
            hint="Enter any additional remarks or notes about the vehicle. This information is only visible to dealers for identification and other internal purposes."
            persistent-hint
            hide-details="auto"
          />
        </div>

        <!-- Actions -->
        <div class="d-flex w-100 align-center justify-end" style="gap: 0.75rem;">
          <v-btn
            variant="text"
            size="small"
            class="mr-auto"
            @click="resetForm"
          >
            Reset
          </v-btn>

          <v-btn
            variant="outlined"
            size="small"
            @click="saveAsDraft"
          >
            Save as Draft
          </v-btn>

          <v-btn
            color="primary"
            size="small"
            :loading="submitting"
            :disabled="!formValid"
            @click="submitForm"
          >
            {{ submitting ? 'Saving Vehicle...' : 'Save Vehicle' }}
          </v-btn>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { createVehicle } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const router = useRouter()

// Form
const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const form = ref({
  inventoryDate: new Date().toISOString().slice(0, 16),
  registrationNumber: '',
  vin: '',
  engineNumber: '',
  make: '',
  model: '',
  variant: '',
  year: new Date().getFullYear(),
  vehicleType: '',
  odometer: 0,
  status: 'Pending Purchase',
  transmissionType: '',
  fuelType: '',
  color: '',
  ownershipCount: 1,
  accidentHistory: false,
  condition: '',
  blacklistFlags: [] as string[],
  listingPrice: 0,
  features: [] as string[],
  images: [] as File[],
  description: '',
  pendingWorks: [] as string[],
  remarks: '',
})

const newFeature = ref('')
const newPendingWork = ref('')

// Constants (from nextjs constants/vehicles.ts)
const makes = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge',
  'Donkervoort', 'DS', 'Ferrari', 'Fiat', 'Fisker', 'Ford', 'Genesis', 'GMC', 'Honda',
  'Hummer', 'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'KTM',
  'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
  'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercury', 'Mini', 'Mitsubishi', 'Nissan',
  'Opel', 'Pagani', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche', 'RAM', 'Renault',
  'Rolls-Royce', 'Saab', 'Saturn', 'Scion', 'Seat', 'Škoda', 'Smart', 'SsangYong',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Maruti Suzuki', 'Tata Motors',
  'Mahindra & Mahindra', 'Ashok Leyland', 'Force Motors', 'MG Motor', 'Skoda', 'BYD', 'VinFast',
]

const vehicleTypes = [
  'Sedan', 'SUV', 'Truck', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'Pickup Truck',
  'Crossover', 'Compact SUV', 'Compact Sedan', 'Micro Car', 'Station Wagon', 'MPV',
  'Crossover SUV', 'Coupe SUV', '4-Door Coupe', 'Sportback', 'Electric Car', 'Hybrid Car',
  'Mini SUV', 'Van', 'Minivan', 'Spyder', 'Cabriolet', 'Notchback', 'Fastback', 'Saloon',
  'Off-Roader', 'Luxury Sedan', 'Luxury SUV', 'Performance Car', 'Sports Car', 'CNG Car',
  'Diesel Car', 'Petrol Car',
]

const statuses = [
  'Available', 'Sold', 'Pending Sale', 'Pending Purchase', 'Reserved', 'In Service',
  'Under Maintenance', 'Not Available',
]

const transmissionTypes = [
  'Manual Transmission (MT)',
  'Automated Manual Transmission (AMT)',
  'Intelligent Manual Transmission (iMT)',
  'Continuously Variable Transmission (CVT)',
  'Dual-Clutch Transmission (DCT)',
  'Torque Converter Automatic Transmission',
  'Tiptronic Transmission',
]

const fuelTypes = [
  'Petrol', 'Diesel', 'Compressed Natural Gas (CNG)', 'Liquefied Petroleum Gas (LPG)',
  'Electric Vehicle (EV)', 'Hybrid Electric Vehicle (HEV)', 'Plug-in Hybrid Electric Vehicle (PHEV)',
]

const conditions = ['Excellent', 'Good', 'Fair', 'Needs Work']

const blacklistTypes = [
  'Unpaid traffic fines',
  'Road tax not paid',
  'No insurance',
  'Pollution rule break',
  'Loan not paid',
  'Fake or wrong papers',
  'Bad accident (total loss)',
  'Illegal changes to vehicle',
  'Import duty not paid',
]

const years = Array.from(
  { length: new Date().getFullYear() - 1885 },
  (_, i) => new Date().getFullYear() - i,
)

// Validation rules
const rules = {
  required: (v: any) => !!v || 'This field is required',
  registrationNumber: (v: string) => {
    if (!v) return true
    return /^[A-Z0-9\-/\s]+$/i.test(v) || 'Registration number can only contain letters, numbers, hyphens, slashes, or spaces'
  },
  vin: (v: string) => {
    if (!v) return true
    if (v.length !== 17) return 'VIN must be exactly 17 characters'
    return /^[A-HJ-NPR-Z0-9]+$/i.test(v) || 'VIN can only contain letters (except I, O, Q) and numbers'
  },
  engineNumber: (v: string) => {
    if (!v) return true
    return /^[A-Z0-9\-/]+$/i.test(v) || 'Engine number can only contain letters, numbers, hyphens or slashes'
  },
  odometer: (v: number) => {
    if (v === null || v === undefined) return true
    return (v >= 0 && v <= 12000000000000) || 'Odometer must be between 0 and 12,000,000,000,000'
  },
  ownershipCount: (v: number) => {
    if (v === null || v === undefined) return true
    return (v >= 1 && v <= 20) || 'Ownership count must be between 1 and 20'
  },
  price: (v: number) => {
    if (v === null || v === undefined) return true
    return (v >= 0 && v <= 999999999) || 'Price must be between 0 and 999,999,999'
  },
  description: (v: string) => {
    if (!v) return true
    return (v.length >= 1 && v.length <= 5000) || 'Description must be between 1 and 5000 characters'
  },
  requiredImages: (v: File[]) => {
    return (v && v.length >= 1 && v.length <= 20) || 'Please upload at least 1 and at most 20 images'
  },
}

// Image previews with proper cleanup
const imagePreviews = ref<string[]>([])

// Update image previews and cleanup old URLs
watch(
  () => form.value.images,
  (newImages, oldImages) => {
    // Revoke all old URLs
    imagePreviews.value.forEach((url) => {
      URL.revokeObjectURL(url)
    })

    // Create new URLs for new images
    imagePreviews.value = newImages.map((file) => URL.createObjectURL(file))
  },
  { immediate: true }
)

// Cleanup on unmount
onBeforeUnmount(() => {
  imagePreviews.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  imagePreviews.value = []
})

// SeparatorWithText component (inline)

// Methods
const addFeature = () => {
  if (newFeature.value && form.value.features.length < 30) {
    form.value.features.push(newFeature.value.trim())
    newFeature.value = ''
  }
}

const removeFeature = (index: number) => {
  form.value.features.splice(index, 1)
}

const addPendingWork = () => {
  if (newPendingWork.value && form.value.pendingWorks.length < 30) {
    form.value.pendingWorks.push(newPendingWork.value.trim())
    newPendingWork.value = ''
  }
}

const removePendingWork = (index: number) => {
  form.value.pendingWorks.splice(index, 1)
}

const removeImage = (index: number) => {
  // Revoke the object URL before removing
  if (imagePreviews.value[index]) {
    URL.revokeObjectURL(imagePreviews.value[index])
  }
  form.value.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const saveAsDraft = () => {
  // Save form data to localStorage
  const draftData = { ...form.value, images: [] }
  localStorage.setItem('add-vehicle-form', JSON.stringify(draftData))
  // Show toast message (you can use a toast library)
  console.log('Form saved as draft locally.')
}

const resetForm = () => {
  // Cleanup image preview URLs
  imagePreviews.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  imagePreviews.value = []

  form.value = {
    inventoryDate: new Date().toISOString().slice(0, 16),
    registrationNumber: '',
    vin: '',
    engineNumber: '',
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    vehicleType: '',
    odometer: 0,
    status: 'Pending Purchase',
    transmissionType: '',
    fuelType: '',
    color: '',
    ownershipCount: 1,
    accidentHistory: false,
    condition: '',
    blacklistFlags: [],
    listingPrice: 0,
    features: [],
    images: [],
    description: '',
    pendingWorks: [],
    remarks: '',
  }
  newFeature.value = ''
  newPendingWork.value = ''
  formRef.value?.resetValidation()
}

const submitForm = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Validate features
  if (form.value.features.length === 0) {
    submitError.value = 'Please add at least one feature'
    return
  }

  // Validate images
  if (!form.value.images || form.value.images.length === 0) {
    submitError.value = 'Please upload at least one image'
    return
  }

  try {
    submitting.value = true
    submitError.value = null

    // Convert form data to API format (matching StoreVehicleRequest)
    const vehicleData: any = {
      registration_number: form.value.registrationNumber,
      vin: form.value.vin,
      engine_number: form.value.engineNumber,
      make: form.value.make,
      model: form.value.model,
      variant: form.value.variant,
      year: form.value.year,
      vehicle_type: form.value.vehicleType,
      odometer: form.value.odometer,
      status: form.value.status,
      transmission_type: form.value.transmissionType,
      fuel_type: form.value.fuelType,
      color: form.value.color,
      condition: form.value.condition,
      ownership_count: form.value.ownershipCount,
      accident_history: form.value.accidentHistory,
      inventory_date: new Date(form.value.inventoryDate).toISOString().split('T')[0],
      listing_price: form.value.listingPrice,
      features: form.value.features,
      description: form.value.description,
      images: form.value.images,
    }

    // Add optional fields only if they have values
    if (form.value.blacklistFlags.length > 0) {
      vehicleData.blacklist_flags = form.value.blacklistFlags
    }
    if (form.value.pendingWorks.length > 0) {
      vehicleData.pending_works = form.value.pendingWorks
    }
    if (form.value.remarks) {
      vehicleData.remarks = form.value.remarks
    }

    await createVehicle(vehicleData)

    // Clear draft
    localStorage.removeItem('add-vehicle-form')

    // Redirect to vehicles overview
    router.push({ name: 'dealer.vehicles.overview' })
  } catch (error) {
    submitError.value = (error as ApiErrorModel).message || 'Failed to create vehicle'
  } finally {
    submitting.value = false
  }
}

// Load draft on mount
const loadDraft = () => {
  const draft = localStorage.getItem('add-vehicle-form')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      form.value = { ...form.value, ...draftData, images: [] }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

loadDraft()
</script>

<style scoped>
.image-preview {
  position: relative;
  display: inline-block;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: white;
  border-radius: 50%;
}

.accident-checkbox {
  background-color: rgba(var(--v-theme-input), 0.3);
  border-radius: 6px;
  border: 1px solid var(--border);
  padding: 16px;
  width: 100%;
}

.accident-checkbox :deep(.v-label) {
  width: 100%;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .sm\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid {
    display: grid;
  }

  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md\:grid-cols-6 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-8 {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

@media (min-width: 1536px) {
  .2xl\:grid-cols-10 {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }
}

/* Form section styling */
.form-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 960px) {
  .form-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
