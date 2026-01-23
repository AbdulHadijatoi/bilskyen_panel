<template>
  <v-container class="pa-4" max-width="1400">
    <!-- Header with Actions -->
    <div class="d-flex justify-space-between align-center flex-wrap mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Add Vehicle</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Complete all tabs to add a new vehicle to your inventory
        </p>
      </div>
      <div class="d-flex align-center gap-2">
        <v-chip
          v-if="draftSaved"
          size="small"
          color="success"
          variant="tonal"
          prepend-icon="mdi-content-save"
        >
          Draft saved
        </v-chip>
      </div>
    </div>

    <!-- License Plate Lookup Section (Outside Tabs) -->
    <v-card variant="flat" elevation="1" class="mb-4">
      <v-card-text class="pa-6">
        <div class="mb-2">
          <h3 class="text-h6 font-weight-semibold mb-2">Vehicle Lookup</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Enter license plate to auto-fill vehicle information
          </p>

          <v-row class="align-center">
            <v-col cols="12" md="8">
              <v-text-field
                v-model="lookupForm.registrationNumber"
                label="License Plate"
                placeholder="e.g., AB 12 345"
                variant="outlined"
                :disabled="lookupLoading || showFormFields"
                hide-details="auto"
                @keyup.enter="performLookup"
              />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center" style="height: 56px;">
              <v-btn
                v-if="!showFormFields"
                color="primary"
                variant="elevated"
                :loading="lookupLoading"
                :disabled="!lookupForm.registrationNumber"
                @click="performLookup"
                class="mr-2"
                style="height: 56px;"
              >
                <v-icon start>mdi-magnify</v-icon>
                Find A Vehicle
              </v-btn>
              <v-btn
                v-if="!showFormFields"
                variant="outlined"
                color="grey-darken-1"
                @click="manualEntryMode = true"
                style="height: 56px;"
              >
                <v-icon start>mdi-pencil</v-icon>
                Enter Manually
              </v-btn>
              <v-btn
                v-if="showFormFields"
                variant="outlined"
                color="grey-darken-1"
                @click="manualEntryMode = false; lookupSuccess = false; lookupData = null"
                style="height: 56px;"
              >
                <v-icon start>mdi-refresh</v-icon>
                Start Over
              </v-btn>
            </v-col>
          </v-row>

          <v-alert
            v-if="lookupError"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-3"
            closable
            @click:close="lookupError = null"
          >
            {{ lookupError }}
          </v-alert>

          <v-alert
            v-if="lookupSuccess"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            Vehicle data fetched successfully
          </v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- Main Tabs Container -->
    <v-expand-transition>
      <v-card v-if="showFormFields" variant="flat" elevation="1">
        <v-tabs
          v-model="currentStep"
          color="primary"
          bg-color="grey-lighten-5"
          slider-color="primary"
        >
          <v-tab
            v-for="(step, index) in steps"
            :key="index"
            :value="index"
            class="text-caption"
          >
            {{ step.label }}
          </v-tab>
        </v-tabs>

        <v-window v-model="currentStep">
        <v-window-item
          v-for="(step, index) in steps"
          :key="index"
          :value="index"
        >
          <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <!-- Step 1: Vehicle Lookup and Pre Fill -->
              <template v-if="index === 0">
                <div>
                <!-- Form Fields - Shown after lookup or manual entry -->
                <v-expand-transition>
                  <div v-if="showFormFields">
                    <div class="mb-6">
                      <h3 class="text-h6 font-weight-semibold mb-2">Vehicle Information</h3>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        Complete the vehicle details below
                      </p>
                    </div>

                    <v-divider class="my-6" />
                    <div class="mb-4">
                      <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                        <v-icon size="20" class="mr-2">mdi-car-info</v-icon>
                        Basic Information
                      </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="form.make"
                  :items="brands.map(b => b.name)"
                  label="Make"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :readonly="!!lookupData?.make"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.model"
                  label="Model"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :readonly="!!lookupData?.model"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.variant"
                  label="Variant"
                  density="compact"
                  variant="outlined"
                    hint="Required - manual entry"
                  persistent-hint
                  :rules="[rules.required]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="form.fuelType"
                  :items="fuelTypes.map(f => f.name)"
                  label="Fuel Type"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :readonly="!!lookupData?.fuelType"
                    hide-details="auto"
                />
              </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.vin"
                    label="VIN"
                    density="compact"
                    variant="outlined"
                    maxlength="17"
                    :rules="[rules.required, rules.vin]"
                    :readonly="!!lookupData?.vin"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <MonthYearPicker
                    v-model="form.registrationDate"
                    label="Registration"
                    :rules="[rules.required]"
                    :readonly="!!lookupData?.registrationDate"
                  />
                </v-col>
              </v-row>
            </div>

                    <v-divider class="my-6" />
                    <div class="mb-4">
                      <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                        <v-icon size="20" class="mr-2">mdi-gauge</v-icon>
                        Performance & Emissions (Optional)
                      </h4>
                      <v-row dense>
                        <v-col cols="12" md="3">
                          <v-text-field
                            v-model.number="form.powerHp"
                            label="Power (HP)"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hint="Calculated from kW"
                            persistent-hint
                            hide-details="auto"
                            readonly
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field
                            v-model.number="form.powerKw"
                            label="Power (kW)"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field
                            v-model.number="form.co2Emissions"
                            label="CO2 Emissions (g/km)"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field
                            v-model.number="form.fuelConsumptionWltp"
                            label="Fuel Consumption WLTP (L/100km)"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="form.fuelConsumptionNedc"
                            label="Fuel Consumption NEDC (L/100km)"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </v-expand-transition>
                </div>
              </template>

          <!-- Step 2: Core Vehicle Details -->
              <template v-if="index === 1">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Vehicle Details</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Registration, mileage, and usage information
                  </p>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-calendar-check</v-icon>
                    Registration & Identity
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <MonthYearPicker
                  v-model="form.firstRegistrationDate"
                  label="First Registration"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MonthYearPicker
                  v-model="form.productionDate"
                  label="Production"
                  hint="Optional"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.registrationNumber"
                  label="License Plate"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MonthYearPicker
                  v-model="form.lastInspectionDate"
                  label="Last Inspection"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="form.isImport"
                    label="Import Vehicle"
                  density="compact"
                  color="primary"
                    hide-details
                  />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="form.isFactoryNew"
                  label="Factory New"
                  density="compact"
                  color="primary"
                    hide-details
                  />
              </v-col>
            </v-row>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-speedometer</v-icon>
                    Mileage & Usage
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.odometer"
                  label="Current Mileage"
                  type="number"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required, rules.odometer]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.previousUsage"
                  :items="vehicleUses.map(u => u.name)"
                  label="Previous Usage"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                    hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>
                </div>
              </template>

          <!-- Step 3: Technical and Environmental Data -->
              <template v-if="index === 2">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Technical Specifications</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Engine, transmission, and environmental data
                  </p>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-engine</v-icon>
                    Engine & Drivetrain
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.engineType"
                  label="Engine Type"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.transmissionType"
                  :items="fuelTypes.map(f => f.name)"
                  label="Transmission"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.drivetrain"
                  :items="drivetrainTypes.map(d => d.value)"
                  label="Drivetrain"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                    hide-details="auto"
                />
              </v-col>
            </v-row>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-leaf</v-icon>
                    Consumption & Emissions
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.fuelConsumption"
                  :label="fuelConsumptionLabel"
                  :hint="fuelConsumptionHint"
                  persistent-hint
                  type="number"
                  step="any"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.euroEmissionClass"
                  label="Euro Emission Class"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
            </v-row>
          </div>
                </div>
              </template>

          <!-- Step 4: Equipment and Features -->
              <template v-if="index === 3">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Equipment & Features</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Select all applicable equipment and features
                  </p>
                </div>

            <div
              v-for="(equipmentType, typeIndex) in equipmentTypes"
              :key="typeIndex"
              class="mb-3"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <h4 class="text-subtitle-1 font-weight-semibold mb-0">
                  <!-- <v-icon size="20" class="mr-2">{{ getCategoryIcon(equipmentType.name) }}</v-icon> -->
                  {{ equipmentType.name }}
                  </h4>
                <v-chip
                  v-if="equipmentType.equipments?.length"
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="text-caption"
                >
                  {{
                    form.equipment.filter(id =>
                      equipmentType.equipments.some(eq => eq.id.toString() === id)
                    ).length
                  }} selected
                </v-chip>
              </div>
              <v-row dense class="ma-n1">
                <v-col
                  v-for="(equipment, equipmentIndex) in equipmentType.equipments"
                  :key="equipmentIndex"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                  class="pa-1"
                >
                  <v-checkbox
                    v-model="form.equipment"
                    :value="equipment.id.toString()"
                    color="primary"
                    density="compact"
                    hide-details
                    class="equipment-checkbox"
                  >
                    <template #label>
                      <span class="text-body-2 equipment-label">{{ equipment.name }}</span>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-divider v-if="typeIndex < equipmentTypes.length - 1" class="mt-3 mb-1" />
            </div>
          </div>
              </template>

          <!-- Step 5: Pricing and Sales Configuration -->
              <template v-if="index === 4">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Pricing & Sales</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Configure pricing, sales type, and optional leasing options
                  </p>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-tag-outline</v-icon>
                    Sales Type
                  </h4>
              <v-radio-group v-model="form.salesType" inline hide-details class="mt-0">
                <v-radio label="Retail Sale" value="retail" density="compact" />
                <v-radio label="Commission Sale" value="commission" density="compact" />
                <v-radio label="Brokerage Sale" value="brokerage" density="compact" />
                </v-radio-group>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-currency-usd</v-icon>
                    Pricing
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.retailPrice"
                    label="Retail Price"
                  type="number"
                  density="compact"
                  variant="outlined"
                  prefix="kr"
                    hint="Including delivery"
                    persistent-hint
                  :rules="[rules.price]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.wholesalePrice"
                  label="Wholesale Price"
                  type="number"
                  density="compact"
                  variant="outlined"
                  prefix="kr"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.priceWithoutTax"
                  label="Price Without Tax"
                  type="number"
                  density="compact"
                  variant="outlined"
                  prefix="kr"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.internalCostPrice"
                    label="Internal Cost Price"
                  type="number"
                  density="compact"
                  variant="outlined"
                  prefix="kr"
                    hint="Dealer only"
                    persistent-hint
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="form.wholesalePriceIncludesDelivery"
                  label="Wholesale price includes delivery"
                  density="compact"
                  color="primary"
                    hide-details
                />
              </v-col>
            </v-row>
            </div>

            <v-expand-transition>
              <div v-if="form.leasingEnabled" class="form-section mt-4">
                <div class="section-title mb-3">
                  <v-icon size="18" class="mr-2">mdi-calendar-clock</v-icon>
                  <span class="text-subtitle-2 font-weight-medium">Leasing Details</span>
                </div>
                <v-row dense>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.leasingType"
                    :items="leasingTypes"
                    label="Leasing Type"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.leasingCustomerType"
                    :items="leasingCustomerTypes"
                    label="Customer Type"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="form.leasingMonthlyPayment"
                    label="Monthly Payment"
                    type="number"
                    density="compact"
                    variant="outlined"
                    prefix="kr"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="form.leasingFirstPayment"
                    label="First Payment"
                    type="number"
                    density="compact"
                    variant="outlined"
                    prefix="kr"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="form.leasingResidualValue"
                    label="Residual Value"
                    type="number"
                    density="compact"
                    variant="outlined"
                    prefix="kr"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="form.leasingDuration"
                      label="Duration (months)"
                    type="number"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="form.leasingAnnualMileage"
                    label="Annual Mileage"
                    type="number"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.leasingTotalCost"
                    label="Total Cost Over Term"
                    type="number"
                    density="compact"
                    variant="outlined"
                    prefix="kr"
                      hide-details="auto"
                  />
                </v-col>
            </v-row>
          </div>
            </v-expand-transition>

            <div class="form-section mt-4">
              <v-switch
                v-model="form.leasingEnabled"
                label="Enable Leasing"
                density="compact"
                color="primary"
                hide-details
              />
            </div>
                </div>
              </template>

          <!-- Step 6: Media Management -->
              <template v-if="index === 5">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Media & Description</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Upload images and provide a detailed description
                  </p>
                </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-image-multiple</v-icon>
                    Vehicle Images
                    <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">
                      {{ imagePreviews.length }}/20
                    </v-chip>
                  </h4>
                <v-file-input
                  :model-value="[]"
                  @update:model-value="handleImageUpload"
                label="Upload Images"
                  multiple
                  accept="image/*"
                  density="compact"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                hint="Upload 1-20 images. First image will be used as cover."
                  persistent-hint
                  :error="form.images.length === 0"
                  :error-messages="form.images.length === 0 ? ['Please upload at least 1 image'] : []"
                hide-details="auto"
                class="mb-4"
              />

              <v-row v-if="imagePreviews.length > 0" dense class="mt-4">
                <v-col
                  v-for="(image, imgIndex) in imagePreviews"
                  :key="`image-${imgIndex}`"
                  cols="6"
                  sm="4"
                  md="3"
                  lg="2"
                >
                  <v-card
                    :variant="form.coverImageIndex === imgIndex ? 'outlined' : 'flat'"
                    :color="form.coverImageIndex === imgIndex ? 'primary' : undefined"
                    class="position-relative image-drag-item"
                    :class="{ 
                      'dragging': draggedImageIndex === imgIndex,
                      'drag-over': dragOverIndex === imgIndex
                    }"
                    draggable="true"
                    @dragstart="handleDragStart(imgIndex, $event)"
                    @dragover.prevent="handleDragOver($event)"
                    @dragenter.prevent="handleDragEnter(imgIndex, $event)"
                    @dragleave="handleDragLeave($event)"
                    @drop="handleDrop(imgIndex, $event)"
                    @dragend="handleDragEnd"
                  >
                    <v-chip
                      size="x-small"
                      color="black"
                      variant="flat"
                      class="position-absolute"
                      style="top: 4px; left: 4px; z-index: 2;"
                    >
                      {{ imgIndex + 1 }}
                    </v-chip>
                    <v-hover v-slot="{ isHovering, props }">
                  <v-img
                        v-bind="props"
                    :src="image"
                        height="100%"
                    cover
                      >
                        <v-overlay
                          :model-value="!!isHovering"
                          contained
                          class="d-flex align-center justify-center"
                        >
                    <v-btn
                      icon
                            size="small"
                            variant="flat"
                            :color="form.coverImageIndex === imgIndex ? 'primary' : 'default'"
                            @click="setCoverImage(imgIndex)"
                            class="mr-1"
                          >
                            <v-icon size="18">{{ form.coverImageIndex === imgIndex ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                            size="small"
                            variant="flat"
                      color="error"
                            @click="removeImage(imgIndex)"
                    >
                            <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                        </v-overlay>
                      </v-img>
                    </v-hover>
                    <v-chip
                      v-if="form.coverImageIndex === imgIndex"
                      size="x-small"
                      color="primary"
                      class="position-absolute"
                      style="bottom: 4px; left: 4px; z-index: 2;"
                    >
                      <v-icon size="14" start>mdi-star</v-icon>
                    Cover
                    </v-chip>
                  </v-card>
                </v-col>
              </v-row>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-text</v-icon>
                    Description
                  </h4>
                <v-textarea
                  v-model="form.description"
                  label="Vehicle Description"
                  density="compact"
                  variant="outlined"
                  rows="6"
                hint="Description will be auto-generated based on vehicle information. You can edit it manually."
                  persistent-hint
                  :rules="[rules.required, rules.description]"
                hide-details="auto"
                @input="isDescriptionManuallyEdited = true"
                />
          </div>
              </div>
              </template>
        </v-form>

      <!-- Error Display -->
      <v-alert
        v-if="submitError"
        type="error"
        variant="tonal"
        density="compact"
        class="ma-4"
        closable
        @click:close="submitError = null"
      >
        {{ submitError }}
      </v-alert>

      <!-- Validation Errors Display -->
      <v-alert
        v-if="Object.keys(validationErrors).length > 0"
        type="error"
        variant="tonal"
        density="compact"
        class="ma-4"
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

      <!-- Wizard Navigation -->
      <v-divider class="mt-8 mb-4" />
      <div class="d-flex justify-space-between align-center flex-wrap pa-4">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          :disabled="currentStep === 0"
          @click="previousStep"
        >
          <v-icon start>mdi-chevron-left</v-icon>
          Previous
        </v-btn>

        <div class="d-flex">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            class="mr-2"
            @click="saveAsDraft"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            Save Draft
          </v-btn>

          <v-btn
            v-if="currentStep < steps.length - 1"
            color="primary"
            variant="elevated"
            @click="nextStep"
          >
            Next
            <v-icon end>mdi-chevron-right</v-icon>
          </v-btn>

          <v-btn
            v-else
            color="primary"
            variant="elevated"
            :loading="submitting"
            :disabled="!formValid || !imagesValid"
            @click="submitForm"
          >
            <v-icon start>{{ submitting ? 'mdi-loading' : 'mdi-check-circle' }}</v-icon>
            {{ submitting ? 'Saving...' : 'Save Vehicle' }}
          </v-btn>
        </div>
      </div>
          </v-card-text>
        </v-window-item>
      </v-window>
      </v-card>
    </v-expand-transition>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { createVehicle, getLookupConstants, lookupVehicleByRegistration } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import MonthYearPicker from '@/components/ui/MonthYearPicker.vue'

const router = useRouter()

// Wizard state
const currentStep = ref(0)
const visitedSteps = ref<Set<number>>(new Set([0])) // Track visited steps
const steps = [
  { label: 'Vehicle Lookup', key: 'lookup' },
  { label: 'Vehicle Details', key: 'details' },
  { label: 'Technical Data', key: 'technical' },
  { label: 'Equipment & Features', key: 'equipment' },
  { label: 'Pricing & Sales', key: 'pricing' },
  { label: 'Media', key: 'media' },
]

// Form state
const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const draftSaved = ref(false)
const submitError = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})

// Computed property to check if images are valid
const imagesValid = computed(() => {
  return form.value.images && form.value.images.length >= 1 && form.value.images.length <= 20
})

// Lookup state
const lookupForm = ref({
  registrationNumber: '',
})
const lookupLoading = ref(false)
const lookupError = ref<string | null>(null)
const lookupSuccess = ref(false)
const lookupData = ref<any>(null)
const manualEntryMode = ref(false)

// Computed property to check if form fields should be shown
const showFormFields = computed(() => {
  return lookupSuccess.value || manualEntryMode.value
})

// Computed property for fuel consumption label based on fuel type
const fuelConsumptionLabel = computed(() => {
  const fuelTypeName = form.value.fuelType?.toLowerCase() || ''
  
  // Electric fuel types
  if (fuelTypeName.includes('electric') && !fuelTypeName.includes('hybrid')) {
    return 'Electric Range (km)'
  }
  
  // Hybrid fuel types
  if (fuelTypeName.includes('hybrid')) {
    return 'Electric Range / KM/L'
  }
  
  // Default for Petrol, Diesel, etc.
  return 'KM/L'
})

// Computed property for fuel consumption hint
const fuelConsumptionHint = computed(() => {
  const fuelTypeName = form.value.fuelType?.toLowerCase() || ''
  
  // Electric fuel types
  if (fuelTypeName.includes('electric') && !fuelTypeName.includes('hybrid')) {
    return 'Electric range in kilometers'
  }
  
  // Hybrid fuel types
  if (fuelTypeName.includes('hybrid')) {
    return 'Electric range in km (for EV mode) or fuel efficiency in km/l'
  }
  
  // Default for Petrol, Diesel, etc.
  return 'Fuel efficiency in kilometers per liter'
})

// Helper to calculate power in HP from kW (rounded to nearest whole number, e.g. 149.6 -> 150)
const calculatePowerHp = (powerKw: number | null | undefined): number | null => {
  if (powerKw === null || powerKw === undefined) return null
  return Math.round(powerKw * 1.36)
}

// Track if description was manually edited by user
const isDescriptionManuallyEdited = ref(false)

// Generate description based on vehicle information and equipment
const generateDescription = (): string => {
  const parts: string[] = []
  
  // Basic vehicle info
  if (form.value.make && form.value.model) {
    let vehicleTitle = form.value.make
    if (form.value.model) {
      vehicleTitle += ` ${form.value.model}`
    }
    if (form.value.variant) {
      vehicleTitle += ` ${form.value.variant}`
    }
    parts.push(vehicleTitle)
  }
  
  // Year/Registration date
  if (form.value.firstRegistrationDate) {
    const year = form.value.firstRegistrationDate.split('-')[0]
    if (year) {
      parts.push(`from ${year}`)
    }
  }
  
  // Fuel type
  if (form.value.fuelType) {
    parts.push(`with ${form.value.fuelType} engine`)
  }
  
  // Power
  if (form.value.powerKw) {
    const powerHp = calculatePowerHp(form.value.powerKw)
    if (powerHp) {
      parts.push(`${form.value.powerKw} kW (${powerHp} HP)`)
    } else {
      parts.push(`${form.value.powerKw} kW`)
    }
  }
  
  // Mileage
  if (form.value.odometer) {
    parts.push(`with ${form.value.odometer.toLocaleString()} km on the odometer`)
  }
  
  // Transmission
  if (form.value.transmissionType) {
    parts.push(`${form.value.transmissionType} transmission`)
  }
  
  // Equipment
  if (form.value.equipment && form.value.equipment.length > 0) {
    const equipmentNames: string[] = []
    form.value.equipment.forEach((equipmentId: string) => {
      equipmentTypes.value.forEach(type => {
        const equipment = type.equipments.find(eq => eq.id.toString() === equipmentId)
        if (equipment) {
          equipmentNames.push(equipment.name)
        }
      })
    })
    
    if (equipmentNames.length > 0) {
      // Limit to top 10 most important equipment items
      const topEquipment = equipmentNames.slice(0, 10)
      if (topEquipment.length > 0) {
        parts.push(`equipped with ${topEquipment.join(', ')}`)
        if (equipmentNames.length > 10) {
          parts.push(`and ${equipmentNames.length - 10} more features`)
        }
      }
    }
  }
  
  // Combine parts into a readable description
  let description = parts.join(', ')
  
  // Add a closing statement
  if (description) {
    description += '.'
  }
  
  return description
}

// Form data
const form = ref({
  // Step 1
  make: '',
  model: '',
  variant: '',
  fuelType: '',
  powerHp: null as number | null,
  powerKw: null as number | null,
  registrationDate: '',
  vin: '',
  co2Emissions: null as number | null,
  fuelConsumptionNedc: null as number | null,
  fuelConsumptionWltp: null as number | null,
  
  // Step 2
  firstRegistrationDate: null,
  productionDate: '',
  registrationNumber: '',
  lastInspectionDate: '',
  isImport: false,
  isFactoryNew: false,
  odometer: 0,
  previousUsage: '',
  
  // Step 3
  engineType: '',
  transmissionType: '',
  drivetrain: '',
  fuelConsumption: null as number | null,
  euroEmissionClass: '',
  
  // Step 4
  equipment: [] as string[],
  
  // Step 5
  salesType: 'retail',
  retailPrice: null as number | null,
  wholesalePrice: null as number | null,
  wholesalePriceIncludesDelivery: false,
  priceWithoutTax: null as number | null,
  internalCostPrice: null as number | null,
  leasingEnabled: false,
  leasingType: '',
  leasingCustomerType: '',
  leasingMonthlyPayment: null as number | null,
  leasingFirstPayment: null as number | null,
  leasingResidualValue: null as number | null,
  leasingDuration: null as number | null,
  leasingAnnualMileage: null as number | null,
  leasingTotalCost: null as number | null,
  
  // Step 6 (Media)
  images: [] as File[],
  coverImageIndex: 0,
  description: '',
})

// Lookup data state
const brands = ref<Array<{id: number, name: string}>>([])
const fuelTypes = ref<Array<{id: number, name: string}>>([])
const gearTypes = ref<Array<{id: number, name: string}>>([])
const vehicleUses = ref<Array<{id: number, name: string}>>([])
const drivetrainTypes = ref<Array<{value: string, title: string}>>([])
const equipmentTypes = ref<Array<{id: number, name: string, equipments: Array<{id: number, name: string}>}>>([])

// Image previews
const imagePreviews = ref<string[]>([])
const draggedImageIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Constants (static data that doesn't come from API)
const leasingTypes = [
  'Financial', 'Operational',
]

const leasingCustomerTypes = [
  'Private', 'Business (excluding VAT)',
]

// Load lookup data function
const loadLookupData = async () => {
  try {
    const data = await getLookupConstants()
    
    brands.value = data.brands || []
    fuelTypes.value = data.fuel_types || []
    gearTypes.value = data.gear_types || []
    vehicleUses.value = data.vehicle_uses || []
    drivetrainTypes.value = data.drivetrain_types || []
    equipmentTypes.value = data.equipment_types || []
  } catch (error) {
    console.error('Failed to load lookup data:', error)
  }
}

// Validation rules
const rules = {
  required: (v: any) => !!v || 'This field is required',
  vin: (v: string) => {
    if (!v) return 'This field is required'
    if (v.length !== 17) return 'VIN must be exactly 17 characters'
    return /^[A-HJ-NPR-Z0-9]+$/i.test(v) || 'VIN can only contain letters (except I, O, Q) and numbers'
  },
  odometer: (v: number) => {
    if (v === null || v === undefined) return 'This field is required'
    return (v >= 0 && v <= 12000000000000) || 'Odometer must be between 0 and 12,000,000,000,000'
  },
  price: (v: number) => {
    if (v === null || v === undefined) return true
    return (v >= 0 && v <= 999999999) || 'Price must be between 0 and 999,999,999'
  },
  description: (v: string) => {
    if (!v) return 'This field is required'
    return (v.length >= 1 && v.length <= 5000) || 'Description must be between 1 and 5000 characters'
  },
  requiredImages: (v: File[]) => {
    // This rule is not used anymore - validation is done via computed property
    return true
  },
}

// Methods
const performLookup = async () => {
  if (!lookupForm.value.registrationNumber) {
    lookupError.value = 'Please enter a license plate number'
    return
  }

  lookupLoading.value = true
  lookupError.value = null
  lookupSuccess.value = false
  // Reset manual edit flag when starting new lookup
  isDescriptionManuallyEdited.value = false

  try {
    const data = await lookupVehicleByRegistration(
      lookupForm.value.registrationNumber,
      true // advanced = true
    )
    
    // Clear any previous errors
    lookupError.value = null
    lookupData.value = data

    // Auto-fill form with lookup data
    // Map brand (make) - handle both object and string formats
    const brandName = data.brand?.name || data.brand_name || data.brand
    if (brandName) {
      const brand = brands.value.find(b => 
        b.name.toLowerCase() === (typeof brandName === 'string' ? brandName : brandName.name || '').toLowerCase()
      )
      if (brand) form.value.make = brand.name
    }

    // Map model - handle both object and string formats
    const modelName = data.model?.name || data.model_name || data.model
    if (modelName) {
      form.value.model = typeof modelName === 'string' ? modelName : modelName.name || ''
    }

    // Map variant - handle both object and string formats, also check for 'version' field
    const variantName = data.variant?.name || data.version?.name || data.version || data.variant
    if (variantName) {
      form.value.variant = typeof variantName === 'string' ? variantName : variantName.name || ''
    }

    // Map fuel type and transmission type (both from fuel_type) - handle both object and string formats
    const fuelTypeName = data.fuel_type?.name || data.fuel_type_name || data.fuel_type
    if (fuelTypeName) {
      const fuelType = fuelTypes.value.find(f => 
        f.name.toLowerCase() === (typeof fuelTypeName === 'string' ? fuelTypeName : fuelTypeName.name || '').toLowerCase()
      )
      if (fuelType) {
        form.value.fuelType = fuelType.name
        form.value.transmissionType = fuelType.name
      }
    }

    // Map power
    if (data.engine_power) {
      form.value.powerKw = data.engine_power
      form.value.powerHp = calculatePowerHp(data.engine_power)
    }

    // Map dates (extract month/year)
    if (data.first_registration_date) {
      try {
        const date = new Date(data.first_registration_date)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          form.value.registrationDate = `${year}-${month}`
          form.value.firstRegistrationDate = `${year}-${month}`
        }
      } catch (e) {
        console.warn('Failed to parse first_registration_date:', data.first_registration_date)
      }
    }

    if (data.last_inspection_date) {
      try {
        const date = new Date(data.last_inspection_date)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          form.value.lastInspectionDate = `${year}-${month}`
        }
      } catch (e) {
        console.warn('Failed to parse last_inspection_date:', data.last_inspection_date)
      }
    }

    // Map odometer
    if (data.last_inspection_odometer) {
      form.value.odometer = data.last_inspection_odometer
    }

    // Map previous usage
    if (data.use?.name) {
      const use = vehicleUses.value.find(u => 
        u.name.toLowerCase() === data.use.name.toLowerCase()
      )
      if (use) form.value.previousUsage = use.name
    }

    // Map euro emission class - handle both object and string formats
    const euronormName = data.euronorm?.name || data.euronorm
    if (euronormName) {
      form.value.euroEmissionClass = typeof euronormName === 'string' ? euronormName : euronormName.name || ''
    }

    // Map fuel consumption (convert km/L to L/100km)
    if (data.fuel_efficiency) {
      form.value.fuelConsumption = Math.round((100 / data.fuel_efficiency) * 100) / 100
    }

    // Map drivetrain - handle both string and number formats
    const driveAxles = data.drive_axles
    if (driveAxles !== null && driveAxles !== undefined) {
      const driveAxlesNum = typeof driveAxles === 'string' ? parseInt(driveAxles, 10) : driveAxles
      if (driveAxlesNum === 1) {
        form.value.drivetrain = 'FWD'
      } else if (driveAxlesNum === 2) {
        form.value.drivetrain = 'AWD' // or determine RWD vs AWD from other data
      }
    }

    // Map equipment
    if (data.equipment && Array.isArray(data.equipment)) {
      const equipmentIds: string[] = []
      data.equipment.forEach((apiEquipment: any) => {
        // Find matching equipment in database by name
        equipmentTypes.value.forEach(type => {
          type.equipments.forEach(dbEquipment => {
            if (dbEquipment.name.toLowerCase() === apiEquipment.name.toLowerCase()) {
              equipmentIds.push(dbEquipment.id.toString())
            }
          })
        })
      })
      form.value.equipment = equipmentIds
    }

    // Map VIN
    if (data.vin) form.value.vin = data.vin

    form.value.registrationNumber = lookupForm.value.registrationNumber
    
    // Generate description after all data is mapped
    if (!isDescriptionManuallyEdited.value) {
      const autoDescription = generateDescription()
      if (autoDescription) {
        form.value.description = autoDescription
      }
    }
    
    // Set success flag only after all mapping is complete
    lookupSuccess.value = true
  } catch (error: any) {
    // Clear success flag on error
    lookupSuccess.value = false
    lookupError.value = error.response?.data?.message || error.message || 'Failed to fetch vehicle data. Please check the license plate and try again.'
  } finally {
    lookupLoading.value = false
  }
}

const nextStep = async () => {
  if (currentStep.value < steps.length - 1) {
      currentStep.value++
    visitedSteps.value.add(currentStep.value)
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    visitedSteps.value.add(currentStep.value)
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToStep = (index: number) => {
  if (index >= 0 && index < steps.length) {
    currentStep.value = index
    visitedSteps.value.add(index)
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const isStepCompleted = (index: number): boolean => {
  return visitedSteps.value.has(index) && index < currentStep.value
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  // Only handle if not typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  if (event.key === 'ArrowLeft' && event.ctrlKey) {
    event.preventDefault()
    previousStep()
  } else if (event.key === 'ArrowRight' && event.ctrlKey) {
    event.preventDefault()
    nextStep()
  }
}

// Add keyboard event listener and load lookup data
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  loadLookupData()
})

// Cleanup will be handled in the combined onBeforeUnmount below

const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    'Interior': 'mdi-seat',
    'Exterior': 'mdi-car-side',
    'Comfort': 'mdi-air-conditioner',
    'Multimedia': 'mdi-speaker',
    'Assistance and Safety': 'mdi-shield-check',
  }
  return iconMap[categoryName] || 'mdi-checkbox-marked-circle'
}

const setCoverImage = (index: number) => {
  form.value.coverImageIndex = index
}

const handleImageUpload = (newFiles: File[]) => {
  if (!newFiles || newFiles.length === 0) return
  
  const currentCount = form.value.images.length
  const remainingSlots = 20 - currentCount
  
  if (remainingSlots <= 0) {
    // Already at max, don't add more
    return
  }
  
  // Add only as many as we can fit (up to 20 total)
  const filesToAdd = newFiles.slice(0, remainingSlots)
  form.value.images = [...form.value.images, ...filesToAdd]
}

const removeImage = (index: number) => {
  if (imagePreviews.value[index]) {
    URL.revokeObjectURL(imagePreviews.value[index])
  }
  form.value.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
  if (form.value.coverImageIndex >= form.value.images.length) {
    form.value.coverImageIndex = Math.max(0, form.value.images.length - 1)
  }
}

// Drag and drop handlers for image reordering
const handleDragStart = (index: number, event: DragEvent) => {
  draggedImageIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', index.toString())
  }
}

const handleDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragEnter = (index: number, event: DragEvent) => {
  if (draggedImageIndex.value !== null && draggedImageIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!target.contains(relatedTarget)) {
    dragOverIndex.value = null
  }
}

const handleDrop = (dropIndex: number, event: DragEvent) => {
  event.preventDefault()
  dragOverIndex.value = null
  
  if (draggedImageIndex.value === null || draggedImageIndex.value === dropIndex) {
    return
  }

  const fromIndex = draggedImageIndex.value
  const toIndex = dropIndex

  // Reorder images array
  const imagesArray = [...form.value.images]
  const [movedImage] = imagesArray.splice(fromIndex, 1)
  imagesArray.splice(toIndex, 0, movedImage)
  form.value.images = imagesArray

  // Reorder previews array
  const previewsArray = [...imagePreviews.value]
  const [movedPreview] = previewsArray.splice(fromIndex, 1)
  previewsArray.splice(toIndex, 0, movedPreview)
  imagePreviews.value = previewsArray

  // Update cover image index if it was affected
  if (form.value.coverImageIndex === fromIndex) {
    form.value.coverImageIndex = toIndex
  } else if (form.value.coverImageIndex === toIndex && fromIndex < toIndex) {
    form.value.coverImageIndex = toIndex - 1
  } else if (form.value.coverImageIndex === toIndex && fromIndex > toIndex) {
    form.value.coverImageIndex = toIndex + 1
  } else if (fromIndex < form.value.coverImageIndex && toIndex >= form.value.coverImageIndex) {
    form.value.coverImageIndex = form.value.coverImageIndex - 1
  } else if (fromIndex > form.value.coverImageIndex && toIndex <= form.value.coverImageIndex) {
    form.value.coverImageIndex = form.value.coverImageIndex + 1
  }
}

const handleDragEnd = () => {
  draggedImageIndex.value = null
  dragOverIndex.value = null
}

const saveAsDraft = () => {
  const draftData = { ...form.value, images: [] }
  localStorage.setItem('add-vehicle-form-draft', JSON.stringify(draftData))
  draftSaved.value = true
  setTimeout(() => {
    draftSaved.value = false
  }, 3000)
}

const submitForm = async () => {
  if (!formRef.value) return

  // Handle form ref - it's an array when multiple forms share the same ref
  const forms = Array.isArray(formRef.value) ? formRef.value : [formRef.value]
  
  // Validate all forms (all steps)
  let allValid = true
  for (const form of forms) {
    if (form && typeof form.validate === 'function') {
      const { valid } = await form.validate()
      if (!valid) {
        allValid = false
        break
      }
    }
  }
  
  if (!allValid) return

  if (!imagesValid.value) {
    submitError.value = 'Please upload at least 1 image (maximum 20 images)'
    // Scroll to media step
    currentStep.value = 5
    return
  }

  try {
    submitting.value = true
    submitError.value = null
    validationErrors.value = {}

    // Convert form data to API format
    // Find brand_id from make name
    const brand = brands.value.find(b => b.name === form.value.make)
    if (!brand) {
      submitError.value = 'Please select a valid make/brand'
      currentStep.value = 0
      return
    }

    // Find fuel_type_id from fuel type name
    const fuelType = fuelTypes.value.find(f => f.name === form.value.fuelType)
    if (!fuelType) {
      submitError.value = 'Please select a valid fuel type'
      currentStep.value = 0
      return
    }

    // Generate title from make, model, variant
    const titleParts = [form.value.make, form.value.model, form.value.variant].filter(Boolean)
    const title = titleParts.join(' ') || `${form.value.make} ${form.value.model}`

    // Start with Nummerplade API data if available (user data will override)
    const nummerpladeData = lookupData.value || {}
    
    const vehicleData: any = {
      title: title,
      registration: form.value.registrationNumber || nummerpladeData.registration,
      vin: form.value.vin || nummerpladeData.vin,
      brand_id: brand.id,
      brand_name: form.value.make, // Also send name for auto-creation if needed
      model_name: form.value.model || nummerpladeData.model_name || nummerpladeData.model, // Send model name for auto-creation
      version: form.value.variant || nummerpladeData.version || nummerpladeData.variant, // variant maps to version in Vehicle model
      fuel_type_id: fuelType.id,
      price: form.value.retailPrice || 0,
      km_driven: form.value.odometer || nummerpladeData.last_inspection_odometer,
      description: form.value.description,
      images: form.value.images,
      equipment: form.value.equipment.map(id => parseInt(id)), // Convert to numbers
      vehicle_list_status_id: 1, // Default to draft/unpublished - adjust as needed
    }

    // Add model_year from Nummerplade API if available
    if (nummerpladeData.model_year) {
      vehicleData.model_year = nummerpladeData.model_year
      vehicleData.model_year_name = String(nummerpladeData.model_year)
    }

    // Add towing_weight from Nummerplade API if available
    if (nummerpladeData.towing_weight) {
      vehicleData.towing_weight = nummerpladeData.towing_weight
    }

    // Add fuel_efficiency from Nummerplade API if available (convert km/L to L/100km if needed)
    if (nummerpladeData.fuel_efficiency) {
      // Nummerplade returns km/L, but we might have already converted it in the form
      // Only use API value if form doesn't have it
      if (!form.value.fuelConsumption) {
        vehicleData.fuel_efficiency = nummerpladeData.fuel_efficiency
      }
    }

    // Convert month/year dates to full dates (use first day of month)
    // Use form data first, fall back to Nummerplade API data
    if (form.value.firstRegistrationDate) {
      const [year, month] = form.value.firstRegistrationDate.split('-')
      vehicleData.first_registration_date = `${year}-${month}-01`
    } else if (nummerpladeData.first_registration_date) {
      // Use full date from API
      vehicleData.first_registration_date = nummerpladeData.first_registration_date
    }
    
    // Note: registrationDate is not a field in Vehicle model, only first_registration_date
    if (form.value.productionDate) {
      const [year, month] = form.value.productionDate.split('-')
      vehicleData.production_date = `${year}-${month}-01`
    }
    
    // Last inspection date - use form data or API data
    if (form.value.lastInspectionDate) {
      const [year, month] = form.value.lastInspectionDate.split('-')
      vehicleData.last_inspection_date = `${year}-${month}-01`
    } else if (nummerpladeData.last_inspection_date) {
      vehicleData.last_inspection_date = nummerpladeData.last_inspection_date
    }

    // Add optional fields
    if (form.value.powerKw) {
      vehicleData.engine_power = Math.round(form.value.powerKw) // Convert kW to integer
    }
    
    // Transmission type - find gear_type_id if transmissionType matches a gear type
    if (form.value.transmissionType) {
      const gearType = gearTypes.value.find(g => g.name === form.value.transmissionType)
      if (gearType) {
        vehicleData.gear_type_id = gearType.id
      }
    }

    // Previous usage - find use_id from form or Nummerplade API
    if (form.value.previousUsage) {
      const vehicleUse = vehicleUses.value.find(u => u.name === form.value.previousUsage)
      if (vehicleUse) {
        vehicleData.use_id = vehicleUse.id
      }
    } else if (nummerpladeData.use?.id) {
      vehicleData.use_id = nummerpladeData.use.id
    } else if (nummerpladeData.use?.name) {
      const vehicleUse = vehicleUses.value.find(u => 
        u.name.toLowerCase() === nummerpladeData.use.name.toLowerCase()
      )
      if (vehicleUse) {
        vehicleData.use_id = vehicleUse.id
      }
    }

    // Additional optional fields that go to vehicle_details
    if (form.value.co2Emissions) {
      vehicleData.co2_emissions = form.value.co2Emissions
    }
    if (form.value.fuelConsumptionWltp) {
      vehicleData.fuel_consumption_wltp = form.value.fuelConsumptionWltp
    }
    if (form.value.fuelConsumptionNedc) {
      vehicleData.fuel_consumption_nedc = form.value.fuelConsumptionNedc
    }
    if (form.value.fuelConsumption) {
      vehicleData.fuel_efficiency = form.value.fuelConsumption
    }
    if (form.value.euroEmissionClass) {
      vehicleData.euronorm = form.value.euroEmissionClass
    }
    if (form.value.engineType) {
      vehicleData.engine_type = form.value.engineType
    }
    if (form.value.drivetrain) {
      vehicleData.drive_axles = form.value.drivetrain === 'FWD' ? 1 : (form.value.drivetrain === 'AWD' ? 2 : null)
    }
    if (form.value.salesType) {
      // Find sales_type_id from sales type name if needed
      vehicleData.sales_type = form.value.salesType
    }
    if (form.value.wholesalePrice) {
      vehicleData.wholesale_price = form.value.wholesalePrice
    }
    if (form.value.internalCostPrice) {
      vehicleData.internal_cost_price = form.value.internalCostPrice
    }
    if (form.value.isImport !== undefined) {
      vehicleData.is_import = form.value.isImport
    }
    if (form.value.isFactoryNew !== undefined) {
      vehicleData.is_factory_new = form.value.isFactoryNew
    }
    if (form.value.coverImageIndex !== undefined) {
      vehicleData.cover_image_index = form.value.coverImageIndex
    }

    // ============================================
    // Map all Nummerplade API data to vehicle_details
    // User-provided form data takes precedence
    // ============================================
    
    // Vehicle external ID (Nummerplade's vehicle_id)
    if (nummerpladeData.vehicle_id) {
      vehicleData.vehicle_external_id = nummerpladeData.vehicle_id
    }

    // VIN location
    if (nummerpladeData.vin_location) {
      vehicleData.vin_location = nummerpladeData.vin_location
    }

    // Type and type_name
    if (nummerpladeData.type) {
      vehicleData.type_name = nummerpladeData.type
    }
    if (nummerpladeData.type_name) {
      vehicleData.type_name = nummerpladeData.type_name
    }

    // Registration status and dates
    if (nummerpladeData.registration_status) {
      vehicleData.registration_status = nummerpladeData.registration_status
    }
    if (nummerpladeData.registration_status_updated_date) {
      vehicleData.registration_status_updated_date = nummerpladeData.registration_status_updated_date
    }
    if (nummerpladeData.expire_date) {
      vehicleData.expire_date = nummerpladeData.expire_date
    }
    if (nummerpladeData.status_updated_date) {
      vehicleData.status_updated_date = nummerpladeData.status_updated_date
    }

    // Weight fields
    if (nummerpladeData.total_weight) {
      vehicleData.total_weight = nummerpladeData.total_weight
    }
    if (nummerpladeData.vehicle_weight !== undefined) {
      vehicleData.vehicle_weight = nummerpladeData.vehicle_weight
    }
    if (nummerpladeData.technical_total_weight) {
      vehicleData.technical_total_weight = nummerpladeData.technical_total_weight
    }
    if (nummerpladeData.coupling !== undefined) {
      vehicleData.coupling = nummerpladeData.coupling
    }
    if (nummerpladeData.towing_weight_brakes) {
      vehicleData.towing_weight_brakes = nummerpladeData.towing_weight_brakes
    }
    if (nummerpladeData.minimum_weight) {
      vehicleData.minimum_weight = nummerpladeData.minimum_weight
    }
    if (nummerpladeData.gross_combination_weight) {
      vehicleData.gross_combination_weight = nummerpladeData.gross_combination_weight
    }

    // Engine details
    if (nummerpladeData.engine_displacement) {
      vehicleData.engine_displacement = nummerpladeData.engine_displacement
    }
    if (nummerpladeData.engine_cylinders) {
      vehicleData.engine_cylinders = nummerpladeData.engine_cylinders
    }
    if (nummerpladeData.engine_code) {
      vehicleData.engine_code = nummerpladeData.engine_code
    }

    // Category
    if (nummerpladeData.category) {
      vehicleData.category = nummerpladeData.category
    }

    // Last inspection details
    if (nummerpladeData.last_inspection_result) {
      vehicleData.last_inspection_result = nummerpladeData.last_inspection_result
    }
    if (nummerpladeData.last_inspection_odometer && !form.value.odometer) {
      vehicleData.last_inspection_odometer = nummerpladeData.last_inspection_odometer
    }

    // Type approval code
    if (nummerpladeData.type_approval_code) {
      vehicleData.type_approval_code = nummerpladeData.type_approval_code
    }

    // Top speed
    if (nummerpladeData.top_speed) {
      vehicleData.top_speed = nummerpladeData.top_speed
    }

    // Doors and seats
    if (nummerpladeData.doors) {
      vehicleData.doors = nummerpladeData.doors
    }
    if (nummerpladeData.minimum_seats) {
      vehicleData.minimum_seats = nummerpladeData.minimum_seats
    }
    if (nummerpladeData.maximum_seats) {
      vehicleData.maximum_seats = nummerpladeData.maximum_seats
    }

    // Wheels
    if (nummerpladeData.wheels) {
      vehicleData.wheels = nummerpladeData.wheels
    }

    // Extra equipment
    if (nummerpladeData.extra_equipment) {
      vehicleData.extra_equipment = nummerpladeData.extra_equipment
    }

    // Axles (convert string to int if needed)
    if (nummerpladeData.axles) {
      vehicleData.axles = typeof nummerpladeData.axles === 'string' 
        ? parseInt(nummerpladeData.axles, 10) 
        : nummerpladeData.axles
    }

    // Drive axles (already handled above, but ensure it's set from API if not in form)
    if (!form.value.drivetrain && nummerpladeData.drive_axles !== undefined) {
      const driveAxlesNum = typeof nummerpladeData.drive_axles === 'string' 
        ? parseInt(nummerpladeData.drive_axles, 10) 
        : nummerpladeData.drive_axles
      vehicleData.drive_axles = driveAxlesNum
    }

    // Wheelbase
    if (nummerpladeData.wheelbase) {
      vehicleData.wheelbase = nummerpladeData.wheelbase
    }

    // Color - send ID if available from Nummerplade API
    // Note: Nummerplade API IDs might not match our database IDs, so we send the ID
    // and let the backend handle validation. If ID doesn't exist, backend will ignore it.
    if (nummerpladeData.color?.id) {
      vehicleData.color_id = nummerpladeData.color.id
    }

    // Body type - send ID if available from Nummerplade API
    // Note: Nummerplade API IDs might not match our database IDs, so we send the ID
    // and let the backend handle validation. If ID doesn't exist, backend will ignore it.
    if (nummerpladeData.body_type?.id) {
      vehicleData.body_type_id = nummerpladeData.body_type.id
    }

    // Safety features
    if (nummerpladeData.ncap_five !== undefined) {
      vehicleData.ncap_five = nummerpladeData.ncap_five
    }
    if (nummerpladeData.airbags !== undefined) {
      vehicleData.airbags = nummerpladeData.airbags
    }
    if (nummerpladeData.integrated_child_seats !== undefined) {
      vehicleData.integrated_child_seats = nummerpladeData.integrated_child_seats
    }
    if (nummerpladeData.seat_belt_alarms !== undefined) {
      vehicleData.seat_belt_alarms = nummerpladeData.seat_belt_alarms
    }

    // Euro norm - send as euronorm string
    // The backend VehicleService doesn't currently handle euronorm -> euronom_id conversion
    // in createVehicle, but we send it anyway. The field will go to vehicle_details as-is
    // or backend can be updated later to handle the conversion
    if (nummerpladeData.euronorm) {
      vehicleData.euronorm = nummerpladeData.euronorm
    }

    // Permits - convert array to JSON string
    if (nummerpladeData.permits && Array.isArray(nummerpladeData.permits)) {
      vehicleData.permits = JSON.stringify(nummerpladeData.permits)
    }

    // Dispensations - convert array to JSON string
    if (nummerpladeData.dispensations && Array.isArray(nummerpladeData.dispensations)) {
      vehicleData.dispensations = JSON.stringify(nummerpladeData.dispensations)
    }

    // Leasing period
    if (nummerpladeData.leasing_period_start) {
      vehicleData.leasing_period_start = nummerpladeData.leasing_period_start
    }
    if (nummerpladeData.leasing_period_end) {
      vehicleData.leasing_period_end = nummerpladeData.leasing_period_end
    }

    await createVehicle(vehicleData)

    localStorage.removeItem('add-vehicle-form-draft')
    router.push({ name: 'dealer.vehicles.overview' })
  } catch (error: any) {
    console.error('Failed to create vehicle:', error)
    
    // Handle API errors
    const apiError = error as ApiErrorModel
    
    if (apiError.errors) {
      // Validation errors - map to form fields
      validationErrors.value = apiError.errors
      
      // Try to navigate to the first step with errors
      // Map common field names to step indices
      const fieldToStepMap: Record<string, number> = {
        'make': 0,
        'model': 0,
        'variant': 0,
        'fuel_type': 0,
        'vin': 0,
        'registration_date': 0,
        'first_registration_date': 1,
        'registration_number': 1,
        'odometer': 1,
        'previous_usage': 1,
        'transmission_type': 2,
        'drivetrain': 2,
        'equipment': 3,
        'retail_price': 4,
        'listing_price': 4,
        'images': 5,
        'description': 5,
      }
      
      // Find the first error field and navigate to its step
      const firstErrorField = Object.keys(apiError.errors)[0]
      const stepIndex = fieldToStepMap[firstErrorField.toLowerCase()] ?? 0
      currentStep.value = stepIndex
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // General error
      submitError.value = apiError.message || 'Failed to create vehicle. Please try again.'
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } finally {
    submitting.value = false
  }
}

// Watch for powerKw changes to auto-calculate powerHp
watch(
  () => form.value.powerKw,
  (newPowerKw) => {
    form.value.powerHp = calculatePowerHp(newPowerKw)
  }
)

// Auto-update description when relevant fields change (only if not manually edited)
watch(
  () => [
    form.value.make,
    form.value.model,
    form.value.variant,
    form.value.fuelType,
    form.value.powerKw,
    form.value.odometer,
    form.value.transmissionType,
    form.value.firstRegistrationDate,
    form.value.equipment,
  ],
  () => {
    if (!isDescriptionManuallyEdited.value) {
      const newDescription = generateDescription()
      if (newDescription) {
        form.value.description = newDescription
      }
    }
  },
  { deep: true }
)

// Watch for image changes
watch(
  () => form.value.images,
  (newImages, oldImages) => {
    imagePreviews.value.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    imagePreviews.value = newImages.map((file) => URL.createObjectURL(file))
  },
  { immediate: true }
)

// Watch for step changes to scroll to top and track visited steps
watch(
  () => currentStep.value,
  (newStep) => {
    visitedSteps.value.add(newStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
)

// Auto-save draft on form changes (debounced)
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null
watch(
  () => form.value,
  () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    autoSaveTimeout = setTimeout(() => {
      const draftData = { ...form.value, images: [] }
      localStorage.setItem('add-vehicle-form-draft', JSON.stringify(draftData))
    }, 2000) // Auto-save after 2 seconds of inactivity
  },
  { deep: true }
)

// Cleanup on unmount
onBeforeUnmount(() => {
  // Cleanup keyboard listener
  window.removeEventListener('keydown', handleKeydown)
  
  // Cleanup auto-save timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  
  // Cleanup image previews
  imagePreviews.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  imagePreviews.value = []
})

// Load draft on mount
const loadDraft = () => {
  const draft = localStorage.getItem('add-vehicle-form-draft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      Object.assign(form.value, { ...draftData, images: [] })
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

loadDraft()
</script>

<style scoped>
/* Equipment checkbox layout - compact and readable */
.equipment-checkbox :deep(.v-selection-control) {
  align-items: center;
  margin-bottom: 0;
}

.equipment-checkbox :deep(.v-selection-control__wrapper) {
  margin-top: 0;
}

.equipment-label {
  white-space: normal;
  line-height: 1.2;
}

/* Image drag and drop styles */
.image-drag-item {
  cursor: move;
  cursor: grab;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.image-drag-item:active {
  cursor: grabbing;
}

.image-drag-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.image-drag-item.drag-over {
  border: 2px dashed rgb(var(--v-theme-primary));
  transform: scale(1.05);
}
</style>
