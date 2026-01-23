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

    <!-- Main Tabs Container -->
    <v-card variant="flat" elevation="1">
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
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Vehicle Lookup</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
                    Enter license plate to auto-fill vehicle information
            </p>

            <v-row>
                    <v-col cols="12" md="8">
                <v-text-field
                  v-model="lookupForm.registrationNumber"
                  label="License Plate"
                  placeholder="e.g., AB 12 345"
                  variant="outlined"
                  :disabled="lookupLoading"
                  :rules="[rules.required]"
                        hide-details="auto"
                  @keyup.enter="performLookup"
                >
                  <template #append-inner>
                    <v-btn
                      icon
                      variant="text"
                      :loading="lookupLoading"
                      @click="performLookup"
                    >
                      <v-icon>mdi-magnify</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
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
                    <v-icon start>mdi-check-circle</v-icon>
                    Vehicle data fetched successfully
            </v-alert>
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
                  :items="makes"
                  label="Make"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :readonly="lookupData?.make"
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
                  :readonly="lookupData?.model"
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
                  :items="fuelTypes"
                  label="Fuel Type"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :readonly="lookupData?.fuelType"
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
                    :readonly="lookupData?.vin"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <DatePicker
                    v-model="form.registrationDate"
                    label="Registration Date"
                    :rules="[rules.required]"
                    :readonly="lookupData?.registrationDate"
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
                        hide-details="auto"
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
                <DatePicker
                  v-model="form.firstRegistrationDate"
                  label="First Registration Date"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <DatePicker
                  v-model="form.productionDate"
                  label="Production Date"
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
                <DatePicker
                  v-model="form.lastInspectionDate"
                  label="Last Inspection Date"
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
                  :items="previousUsageTypes"
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
                  :items="transmissionTypes"
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
                  :items="drivetrainTypes"
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
                <v-select
                  v-model="form.fuelConsumptionUnit"
                  :items="consumptionUnits"
                  label="Fuel Consumption Unit"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.fuelConsumption"
                  label="Fuel Consumption"
                  type="number"
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
              v-for="(category, categoryIndex) in equipmentCategories"
              :key="categoryIndex"
                  class="mb-6"
                >
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">{{ getCategoryIcon(category.name) }}</v-icon>
                    {{ category.name }}
                  </h4>
                  <v-row dense>
                <v-col
                  v-for="(feature, featureIndex) in category.features"
                  :key="featureIndex"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-checkbox
                    v-model="form.equipment"
                    :value="feature.value"
                    density="compact"
                    hide-details
                  >
                    <template #label>
                      <span class="text-body-2">{{ feature.label }}</span>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>
                  <v-divider v-if="categoryIndex < equipmentCategories.length - 1" class="mt-6" />
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
                  prepend-inner-icon="mdi-currency-inr"
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
                  prepend-inner-icon="mdi-currency-inr"
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
                  prepend-inner-icon="mdi-currency-inr"
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
                  prepend-inner-icon="mdi-currency-inr"
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
                    prepend-inner-icon="mdi-currency-inr"
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
                    prepend-inner-icon="mdi-currency-inr"
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
                    prepend-inner-icon="mdi-currency-inr"
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
                    prepend-inner-icon="mdi-currency-inr"
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

          <!-- Step 6: Internal Notes and Administration -->
              <template v-if="index === 5">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">Internal Administration</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Internal use only - not displayed publicly
                  </p>
                </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-account-cog</v-icon>
                    Administration
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.responsibleEmployee"
                  label="Responsible Employee"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.internalVehicleId"
                  label="Internal Vehicle ID"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.status"
                    :items="statuses"
                    label="Status"
                    density="compact"
                    variant="outlined"
                    :rules="[rules.required]"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="form.numberOfKeys"
                  label="Number of Keys"
                  type="number"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
                <v-col cols="12" md="3">
                <v-switch
                  v-model="form.hasDamageHistory"
                  label="Damage History"
                  density="compact"
                  color="primary"
                    hide-details
                />
              </v-col>
              </v-row>
            </div>

            <div class="form-section mt-4">
                <v-textarea
                  v-model="form.internalConditionNotes"
                  label="Internal Condition Notes"
                  density="compact"
                  variant="outlined"
                  rows="4"
                hide-details="auto"
                />
          </div>
                </div>
              </template>

          <!-- Step 7: Media Management -->
              <template v-if="index === 6">
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
                  v-model="form.images"
                label="Upload Images"
                  multiple
                  accept="image/*"
                  density="compact"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                hint="Upload 1-20 images. First image will be used as cover."
                  persistent-hint
                  :rules="[rules.requiredImages]"
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
                    class="position-relative"
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
                hint="Describe the vehicle's condition, features, and selling points"
                  persistent-hint
                  :rules="[rules.required, rules.description]"
                hide-details="auto"
                />
          </div>
              </div>
              </template>
        </v-form>

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
            :disabled="!formValid"
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { createVehicle } from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import axios from 'axios'
import DatePicker from '@/components/ui/DatePicker.vue'

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
  { label: 'Internal Notes', key: 'internal' },
  { label: 'Media', key: 'media' },
]

// Form state
const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const draftSaved = ref(false)

// Lookup state
const lookupForm = ref({
  registrationNumber: '',
})
const lookupLoading = ref(false)
const lookupError = ref<string | null>(null)
const lookupSuccess = ref(false)
const lookupData = ref<any>(null)

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
  firstRegistrationDate: '',
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
  fuelConsumptionUnit: 'l_per_100km',
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
  
  // Step 6
  responsibleEmployee: '',
  internalVehicleId: '',
  numberOfKeys: 1,
  hasDamageHistory: false,
  internalConditionNotes: '',
  status: 'Draft',
  
  // Step 7
  images: [] as File[],
  coverImageIndex: 0,
  description: '',
})

// Image previews
const imagePreviews = ref<string[]>([])

// Constants
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

const fuelTypes = [
  'Petrol', 'Diesel', 'Compressed Natural Gas (CNG)', 'Liquefied Petroleum Gas (LPG)',
  'Electric Vehicle (EV)', 'Hybrid Electric Vehicle (HEV)', 'Plug-in Hybrid Electric Vehicle (PHEV)',
]

const previousUsageTypes = [
  'Private', 'Leasing', 'Rental', 'Company car', 'Demo vehicle',
]

const transmissionTypes = [
  'Manual', 'Automatic',
]

const drivetrainTypes = [
  'FWD', 'RWD', 'AWD',
]

const consumptionUnits = [
  { title: 'Liters per 100 km', value: 'l_per_100km' },
  { title: 'Kilometers per liter', value: 'km_per_l' },
]

const leasingTypes = [
  'Financial', 'Operational',
]

const leasingCustomerTypes = [
  'Private', 'Business (excluding VAT)',
]

const statuses = [
  'Draft', 'Ready for sale', 'Reserved', 'Sold',
]

// Equipment categories
const equipmentCategories = [
  {
    name: 'Interior',
    features: [
      { label: 'On board computer', value: 'onboard_computer' },
      { label: 'Multifunction steering wheel', value: 'multifunction_steering' },
      { label: 'Leather', value: 'leather' },
      { label: 'Alcantara', value: 'alcantara' },
      { label: 'Fabric', value: 'fabric' },
      { label: 'Heated seats', value: 'heated_seats' },
      { label: 'Electrically adjustable seats', value: 'electric_seats' },
      { label: 'Memory seats', value: 'memory_seats' },
      { label: 'Ambient lighting', value: 'ambient_lighting' },
      { label: 'Adjustable lumbar support', value: 'lumbar_support' },
    ],
  },
  {
    name: 'Exterior',
    features: [
      { label: 'Alloy wheels 15"', value: 'alloy_wheels_15' },
      { label: 'Alloy wheels 16"', value: 'alloy_wheels_16' },
      { label: 'Alloy wheels 17"', value: 'alloy_wheels_17' },
      { label: 'Alloy wheels 18"', value: 'alloy_wheels_18' },
      { label: 'Alloy wheels 19"', value: 'alloy_wheels_19' },
      { label: 'Alloy wheels 20"', value: 'alloy_wheels_20' },
      { label: 'Alloy wheels 21"', value: 'alloy_wheels_21' },
      { label: 'Alloy wheels 22"', value: 'alloy_wheels_22' },
      { label: 'Summer wheels', value: 'summer_wheels' },
      { label: 'Winter wheels', value: 'winter_wheels' },
      { label: 'All season wheels', value: 'all_season_wheels' },
      { label: 'Sunroof', value: 'sunroof' },
      { label: 'Panoramic roof', value: 'panoramic_roof' },
      { label: 'Electric mirrors', value: 'electric_mirrors' },
      { label: 'Heated mirrors', value: 'heated_mirrors' },
      { label: 'Folding mirrors', value: 'folding_mirrors' },
      { label: 'Xenon headlights', value: 'xenon_headlights' },
      { label: 'LED headlights', value: 'led_headlights' },
      { label: 'Matrix LED headlights', value: 'matrix_led_headlights' },
      { label: 'Fog lights', value: 'fog_lights' },
      { label: 'Adaptive headlights', value: 'adaptive_headlights' },
    ],
  },
  {
    name: 'Comfort',
    features: [
      { label: 'Air conditioning', value: 'air_conditioning' },
      { label: 'Climate zone 1', value: 'climate_zone_1' },
      { label: 'Climate zone 2', value: 'climate_zone_2' },
      { label: 'Climate zone 3', value: 'climate_zone_3' },
      { label: 'Climate zone 4', value: 'climate_zone_4' },
      { label: 'Cruise control', value: 'cruise_control' },
      { label: 'Adaptive cruise', value: 'adaptive_cruise' },
      { label: 'Keyless entry and start', value: 'keyless_entry' },
      { label: 'Heated steering wheel', value: 'heated_steering' },
      { label: 'Electric windows (front)', value: 'electric_windows_front' },
      { label: 'Electric windows (all)', value: 'electric_windows_all' },
      { label: 'Electric tailgate', value: 'electric_tailgate' },
      { label: 'Parking heater', value: 'parking_heater' },
      { label: 'Start stop system', value: 'start_stop' },
    ],
  },
  {
    name: 'Multimedia',
    features: [
      { label: 'Radio', value: 'radio' },
      { label: 'DAB', value: 'dab' },
      { label: 'DAB Plus', value: 'dab_plus' },
      { label: 'Navigation', value: 'navigation' },
      { label: 'Bluetooth audio', value: 'bluetooth_audio' },
      { label: 'Apple CarPlay', value: 'apple_carplay' },
      { label: 'Android Auto', value: 'android_auto' },
      { label: 'USB A', value: 'usb_a' },
      { label: 'USB C', value: 'usb_c' },
      { label: 'AUX', value: 'aux' },
      { label: 'Rear seat entertainment', value: 'rear_seat_entertainment' },
    ],
  },
  {
    name: 'Assistance and Safety',
    features: [
      { label: 'Parking sensors (front)', value: 'parking_sensors_front' },
      { label: 'Parking sensors (rear)', value: 'parking_sensors_rear' },
      { label: 'Rear camera', value: 'rear_camera' },
      { label: '360 camera', value: 'camera_360' },
      { label: 'Lane assist', value: 'lane_assist' },
      { label: 'Blind spot monitoring', value: 'blind_spot' },
      { label: 'Traffic sign recognition', value: 'traffic_sign_recognition' },
      { label: 'Night vision', value: 'night_vision' },
      { label: 'Emergency braking', value: 'emergency_braking' },
      { label: 'ESP', value: 'esp' },
      { label: 'ABS', value: 'abs' },
      { label: 'ISOFIX', value: 'isofix' },
    ],
  },
]

// Validation rules
const rules = {
  required: (v: any) => !!v || 'This field is required',
  vin: (v: string) => {
    if (!v) return true
    if (v.length !== 17) return 'VIN must be exactly 17 characters'
    return /^[A-HJ-NPR-Z0-9]+$/i.test(v) || 'VIN can only contain letters (except I, O, Q) and numbers'
  },
  odometer: (v: number) => {
    if (v === null || v === undefined) return true
    return (v >= 0 && v <= 12000000000000) || 'Odometer must be between 0 and 12,000,000,000,000'
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

// Methods
const performLookup = async () => {
  if (!lookupForm.value.registrationNumber) {
    lookupError.value = 'Please enter a license plate number'
    return
  }

  lookupLoading.value = true
  lookupError.value = null
  lookupSuccess.value = false

  try {
    const response = await axios.post('/api/nummerplade/vehicle-by-registration', {
      registration: lookupForm.value.registrationNumber,
      advanced: true,
    })

    const data = response.data.data || response.data
    lookupData.value = data
    lookupSuccess.value = true

    // Auto-fill form with lookup data
    if (data.make) form.value.make = data.make
    if (data.model) form.value.model = data.model
    if (data.fuel_type) form.value.fuelType = data.fuel_type
    if (data.power_hp) form.value.powerHp = data.power_hp
    if (data.power_kw) form.value.powerKw = data.power_kw
    if (data.first_registration_date) form.value.firstRegistrationDate = data.first_registration_date
    if (data.registration_date) form.value.registrationDate = data.registration_date
    if (data.vin) form.value.vin = data.vin
    if (data.co2_emissions) form.value.co2Emissions = data.co2_emissions
    if (data.fuel_consumption_nedc) form.value.fuelConsumptionNedc = data.fuel_consumption_nedc
    if (data.fuel_consumption_wltp) form.value.fuelConsumptionWltp = data.fuel_consumption_wltp

    form.value.registrationNumber = lookupForm.value.registrationNumber
  } catch (error: any) {
    lookupError.value = error.response?.data?.message || 'Failed to fetch vehicle data. Please check the license plate and try again.'
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

// Add keyboard event listener
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
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

  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (!form.value.images || form.value.images.length === 0) {
    // TODO: Show error toast
    return
  }

  try {
    submitting.value = true

    // Convert form data to API format
    const vehicleData: any = {
      registration_number: form.value.registrationNumber,
      vin: form.value.vin,
      make: form.value.make,
      model: form.value.model,
      variant: form.value.variant,
      fuel_type: form.value.fuelType,
      transmission_type: form.value.transmissionType,
      drivetrain: form.value.drivetrain,
      odometer: form.value.odometer,
      status: form.value.status,
      listing_price: form.value.retailPrice || 0,
      description: form.value.description,
      images: form.value.images,
      equipment: form.value.equipment,
    }

    // Add optional fields
    if (form.value.firstRegistrationDate) {
      vehicleData.first_registration_date = form.value.firstRegistrationDate
    }
    if (form.value.productionDate) {
      vehicleData.production_date = form.value.productionDate
    }
    if (form.value.lastInspectionDate) {
      vehicleData.last_inspection_date = form.value.lastInspectionDate
    }
    if (form.value.powerHp) {
      vehicleData.power_hp = form.value.powerHp
    }
    if (form.value.powerKw) {
      vehicleData.power_kw = form.value.powerKw
    }
    if (form.value.co2Emissions) {
      vehicleData.co2_emissions = form.value.co2Emissions
    }
    if (form.value.fuelConsumptionWltp) {
      vehicleData.fuel_consumption_wltp = form.value.fuelConsumptionWltp
    }
    if (form.value.previousUsage) {
      vehicleData.previous_usage = form.value.previousUsage
    }
    if (form.value.salesType) {
      vehicleData.sales_type = form.value.salesType
    }
    if (form.value.wholesalePrice) {
      vehicleData.wholesale_price = form.value.wholesalePrice
    }
    if (form.value.internalCostPrice) {
      vehicleData.internal_cost_price = form.value.internalCostPrice
    }
    if (form.value.responsibleEmployee) {
      vehicleData.responsible_employee = form.value.responsibleEmployee
    }
    if (form.value.internalVehicleId) {
      vehicleData.internal_vehicle_id = form.value.internalVehicleId
    }
    if (form.value.numberOfKeys) {
      vehicleData.number_of_keys = form.value.numberOfKeys
    }
    if (form.value.hasDamageHistory) {
      vehicleData.has_damage_history = form.value.hasDamageHistory
    }
    if (form.value.internalConditionNotes) {
      vehicleData.internal_condition_notes = form.value.internalConditionNotes
    }
    if (form.value.coverImageIndex !== undefined) {
      vehicleData.cover_image_index = form.value.coverImageIndex
    }

    await createVehicle(vehicleData)

    localStorage.removeItem('add-vehicle-form-draft')
    router.push({ name: 'dealer.vehicles.overview' })
  } catch (error) {
    console.error('Failed to create vehicle:', error)
    // TODO: Show error toast
  } finally {
    submitting.value = false
  }
}

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
/* No custom styles - using pure Vuetify components and utility classes */
</style>
