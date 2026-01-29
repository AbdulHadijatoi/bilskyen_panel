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
        <v-btn
          v-if="showFormFields"
          variant="outlined"
          color="warning"
          size="small"
          @click="clearDraft"
        >
          <v-icon start>mdi-delete-sweep</v-icon>
          Clear Draft
        </v-btn>
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
                <v-autocomplete
                  v-model="form.modelId"
                  :items="filteredModels"
                  item-title="name"
                  item-value="id"
                  label="Model"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
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
                <div 
                  class="checkbox-button-field"
                  :class="{ 'checkbox-button-field--checked': form.isImport }"
                  @click="form.isImport = !form.isImport"
                >
                  <v-checkbox
                    v-model="form.isImport"
                    density="compact"
                    color="primary"
                    hide-details
                    class="checkbox-button-field__checkbox"
                    @click.stop
                  />
                  <span class="checkbox-button-field__label">Import Vehicle</span>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div 
                  class="checkbox-button-field"
                  :class="{ 'checkbox-button-field--checked': form.isFactoryNew }"
                  @click="form.isFactoryNew = !form.isFactoryNew"
                >
                  <v-checkbox
                    v-model="form.isFactoryNew"
                    density="compact"
                    color="primary"
                    hide-details
                    class="checkbox-button-field__checkbox"
                    @click.stop
                  />
                  <span class="checkbox-button-field__label">Factory New</span>
                </div>
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
                Sales Configuration
              </h4>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.priceTypeId"
                :items="priceTypes"
                item-title="name"
                item-value="id"
                label="Price Type"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.conditionId"
                :items="conditions"
                item-title="name"
                item-value="id"
                label="Condition"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.salesTypeId"
                :items="salesTypes"
                item-title="name"
                item-value="id"
                label="Sales Type"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
          </v-row>
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
                <div 
                  class="checkbox-button-field"
                  :class="{ 'checkbox-button-field--checked': form.wholesalePriceIncludesDelivery }"
                  @click="form.wholesalePriceIncludesDelivery = !form.wholesalePriceIncludesDelivery"
                >
                  <v-checkbox
                    v-model="form.wholesalePriceIncludesDelivery"
                    density="compact"
                    color="primary"
                    hide-details
                    class="checkbox-button-field__checkbox"
                    @click.stop
                  />
                  <span class="checkbox-button-field__label">Wholesale price includes delivery</span>
                </div>
              </v-col>
            </v-row>
            </div>

            <div class="form-section mt-4">
              <div class="section-title mb-3">
                <v-icon size="18" class="mr-2">mdi-calendar-clock</v-icon>
                <span class="text-subtitle-2 font-weight-medium">Leasing Details (Optional)</span>
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
                  
                  <!-- Custom Upload Dropzone -->
                  <div 
                    class="image-upload-area"
                    :class="{ 'has-images': imagePreviews.length > 0 }"
                  >
                    <input 
                      type="file" 
                      ref="fileInputRef"
                      id="vehicle-images-input"
                      multiple 
                      accept="image/*"
                      class="image-input"
                      @change="handleFileInputChange"
                    >
                    <label 
                      for="vehicle-images-input"
                      class="upload-dropzone"
                      :class="{ 'drag-over': isDragOver }"
                      @dragover.prevent="handleDragOverDropzone"
                      @dragenter.prevent="handleDragEnterDropzone"
                      @dragleave.prevent="handleDragLeaveDropzone"
                      @drop.prevent="handleDropDropzone"
                    >
                      <div class="upload-content">
                        <v-icon class="upload-icon" size="36">mdi-cloud-upload</v-icon>
                        <p class="upload-text">Click to upload or drag and drop</p>
                        <p class="upload-hint">PNG, JPG, GIF up to 20MB each</p>
                      </div>
                    </label>
                    <v-alert
                      v-if="form.images.length === 0"
                      type="error"
                      variant="tonal"
                      density="compact"
                      class="mt-2"
                    >
                      Please upload at least 1 image
                    </v-alert>
                  </div>

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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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

const selectedBrandId = computed(() => {
  const brand = brands.value.find(b => b.name === form.value.make)
  return brand?.id ?? null
})

const filteredModels = computed(() => {
  if (!selectedBrandId.value) return []
  return models.value.filter(model => model.brand_id === selectedBrandId.value)
})

const syncModelIdFromName = () => {
  if (!form.value.model || form.value.modelId) return
  if (!selectedBrandId.value || models.value.length === 0) return
  const normalizedModelName = form.value.model.trim().toLowerCase()
  if (!normalizedModelName) return
  const matchedModel = models.value.find(
    (model) =>
      model.brand_id === selectedBrandId.value &&
      model.name.toLowerCase() === normalizedModelName
  )
  if (matchedModel) {
    form.value.modelId = matchedModel.id
  }
}

// Computed property for fuel consumption label based on fuel type ID
// Matching logic from sell-your-car-form.js
const fuelConsumptionLabel = computed(() => {
  const fuelTypeId = form.value.fuelTypeId
  
  // Electric fuel types: 3 (Electric), 7 (El)
  const electricFuelTypes = [3, 7]
  // Hybrid fuel types: 4 (Hybrid), 5 (Plug-in Hybrid)
  const hybridFuelTypes = [4, 5]
  
  if (fuelTypeId && electricFuelTypes.includes(fuelTypeId)) {
    return 'Electric Range (km)'
  }
  
  if (fuelTypeId && hybridFuelTypes.includes(fuelTypeId)) {
    return 'Electric Range / KM/L'
  }
  
  // Default for Petrol, Diesel, etc.
  return 'KM/L'
})

// Computed property for fuel consumption hint
const fuelConsumptionHint = computed(() => {
  const fuelTypeId = form.value.fuelTypeId
  
  // Electric fuel types: 3 (Electric), 7 (El)
  const electricFuelTypes = [3, 7]
  // Hybrid fuel types: 4 (Hybrid), 5 (Plug-in Hybrid)
  const hybridFuelTypes = [4, 5]
  
  if (fuelTypeId && electricFuelTypes.includes(fuelTypeId)) {
    return 'Electric range in kilometers'
  }
  
  if (fuelTypeId && hybridFuelTypes.includes(fuelTypeId)) {
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

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

const toBooleanInt = (value: unknown): 0 | 1 | null => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'number') return value ? 1 : 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'y'].includes(normalized)) return 1
    if (['false', '0', 'no', 'n'].includes(normalized)) return 0
  }
  return null
}

type LookupOption = { id?: number; name?: string }

const normalizeLookupName = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'object' && (value as LookupOption).name) {
    return String((value as LookupOption).name).trim()
  }
  return ''
}

const upsertLookupOption = <T extends LookupOption>(
  list: T[],
  option: LookupOption,
  extra?: Partial<T>
): void => {
  const id = typeof option.id === 'number' ? option.id : undefined
  const name = normalizeLookupName(option)
  const normalizedName = name.toLowerCase()

  const existingIndex = list.findIndex((item) => {
    if (id !== undefined && item.id === id) return true
    if (normalizedName && item.name?.toLowerCase() === normalizedName) return true
    return false
  })

  if (existingIndex >= 0) {
    const existing = list[existingIndex]
    list[existingIndex] = {
      ...existing,
      ...(id !== undefined ? { id } : {}),
      ...(name ? { name } : {}),
      ...(extra || {}),
    } as T
    return
  }

  if (!name && id === undefined) return
  list.push({
    ...(id !== undefined ? { id } : {}),
    ...(name ? { name } : {}),
    ...(extra || {}),
  } as T)
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
  modelId: null as number | null,
  variant: '',
  fuelType: '',
  fuelTypeId: null as number | null,
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
  odometer: null as number | null,
  previousUsage: '',
  
  // Step 3
  engineType: '',
  transmissionType: '',
  drivetrain: '',
  fuelConsumption: null as number | null,
  euroEmissionClass: '',
  servicebog: '',
  annualTax: null as number | null,
  
  // Step 4
  equipment: [] as string[],
  
  // Step 5
  priceTypeId: null as number | null,
  conditionId: null as number | null,
  salesTypeId: null as number | null,
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
const salesTypes = ref<Array<{id: number, name: string}>>([])
const priceTypes = ref<Array<{id: number, name: string}>>([])
const conditions = ref<Array<{id: number, name: string}>>([])
const variants = ref<Array<{id: number, name: string}>>([])
const models = ref<Array<{id: number, name: string, brand_id: number}>>([])
const drivetrainTypes = ref<Array<{value: string, title: string}>>([])
const equipmentTypes = ref<Array<{id: number, name: string, equipments: Array<{id: number, name: string}>}>>([])

// Image previews
const imagePreviews = ref<string[]>([])
const draggedImageIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

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
    salesTypes.value = data.sales_types || []
    priceTypes.value = data.price_types || []
    conditions.value = data.conditions || []
    variants.value = data.variants || []
    models.value = data.models || []
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

  // Clear any saved draft/form state before applying lookup data
  clearDraft()
  manualEntryMode.value = false
  lookupData.value = null

  lookupLoading.value = true
  lookupError.value = null
  lookupSuccess.value = false
  // Reset manual edit flag when starting new lookup
  isDescriptionManuallyEdited.value = false

  if (brands.value.length === 0 || models.value.length === 0) {
    await loadLookupData()
  }

  try {
    const data = await lookupVehicleByRegistration(
      lookupForm.value.registrationNumber,
      true // advanced = true
    )
    
    // Clear any previous errors
    lookupError.value = null
    lookupData.value = data

    // Auto-fill form with lookup data
    // Ensure lookup options contain API values (avoid duplicates) and set form values
    const apiBrand = data.brand || data.brand_name || data.brand
    const apiModel = data.model || data.model_name || data.model
    const apiFuelType = data.fuel_type || data.fuel_type_name || data.fuel_type

    // Handle brand - upsert first, then set form value
    let brandId: number | undefined = undefined
    if (apiBrand && typeof apiBrand === 'object') {
      upsertLookupOption(brands.value, { id: apiBrand.id, name: apiBrand.name })
      form.value.make = apiBrand.name
      brandId = apiBrand.id
    } else if (apiBrand) {
      const brandName = typeof apiBrand === 'string' ? apiBrand : apiBrand.name || ''
      upsertLookupOption(brands.value, { name: brandName })
      form.value.make = brandName
      // Try to find brand ID after upserting
      const foundBrand = brands.value.find(b => b.name.toLowerCase() === brandName.toLowerCase())
      if (foundBrand) brandId = foundBrand.id
    }

    // Handle model - upsert first, then set form value directly from API if it has an id
    // Ensure we use the brandId from API or the selected brand
    const finalBrandId = brandId || selectedBrandId.value
    if (apiModel && typeof apiModel === 'object') {
      // Upsert model with correct brand_id
      upsertLookupOption(
        models.value,
        { id: apiModel.id, name: apiModel.name },
        { brand_id: finalBrandId }
      )
      form.value.model = apiModel.name
      // Wait for reactivity to update filteredModels before setting modelId
      await nextTick()
      form.value.modelId = apiModel.id
    } else if (apiModel) {
      const modelName = typeof apiModel === 'string' ? apiModel : apiModel.name || ''
      upsertLookupOption(models.value, { name: modelName }, { brand_id: finalBrandId })
      form.value.model = modelName
      // Wait for reactivity to update
      await nextTick()
      // Try to find model ID after upserting
      const matchedModel = models.value.find(
        (model) =>
          model.brand_id === finalBrandId &&
          model.name.toLowerCase() === modelName.toLowerCase()
      ) || models.value.find(
        (model) => model.name.toLowerCase() === modelName.toLowerCase()
      )
      if (matchedModel) {
        form.value.modelId = matchedModel.id
      } else {
        form.value.modelId = null
        syncModelIdFromName()
      }
    }

    // Handle fuel type - upsert first, then set form value
    if (apiFuelType && typeof apiFuelType === 'object') {
      upsertLookupOption(fuelTypes.value, { id: apiFuelType.id, name: apiFuelType.name })
      form.value.fuelType = apiFuelType.name
      form.value.fuelTypeId = apiFuelType.id
      form.value.transmissionType = apiFuelType.name
    } else if (apiFuelType) {
      const fuelTypeName = typeof apiFuelType === 'string' ? apiFuelType : apiFuelType.name || ''
      upsertLookupOption(fuelTypes.value, { name: fuelTypeName })
      form.value.fuelType = fuelTypeName
      // Try to find fuel type ID by name
      const matchedFuelType = fuelTypes.value.find(f => f.name.toLowerCase() === fuelTypeName.toLowerCase())
      if (matchedFuelType) {
        form.value.fuelTypeId = matchedFuelType.id
      } else {
        form.value.fuelTypeId = null
      }
      form.value.transmissionType = fuelTypeName
    }

    // Map variant - handle both object and string formats, also check for 'version' field
    const variantName = data.variant?.name || data.version?.name || data.version || data.variant
    if (variantName) {
      form.value.variant = typeof variantName === 'string' ? variantName : variantName.name || ''
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

    // Map fuel consumption
    if (data.fuel_efficiency) {
      form.value.fuelConsumption = data.fuel_efficiency
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

const handleImageUpload = (newFiles: File | File[]) => {
  const filesArray = Array.isArray(newFiles) ? newFiles : newFiles ? [newFiles] : []
  if (filesArray.length === 0) return
  
  const currentCount = form.value.images.length
  const remainingSlots = 20 - currentCount
  
  if (remainingSlots <= 0) {
    // Already at max, don't add more
    return
  }
  
  // Validate and filter files
  const maxSize = 20 * 1024 * 1024 // 20MB
  const validFiles: File[] = []
  
  filesArray.forEach((file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      console.warn(`File ${file.name} is not an image, skipping`)
      return
    }
    
    // Check file size
    if (file.size > maxSize) {
      console.warn(`File ${file.name} exceeds 20MB limit, skipping`)
      return
    }
    
    validFiles.push(file)
  })
  
  if (validFiles.length === 0) return
  
  // Add only as many as we can fit (up to 20 total)
  const filesToAdd = validFiles.slice(0, remainingSlots)
  form.value.images = [...form.value.images, ...filesToAdd]
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    handleImageUpload(files)
    // Reset input to allow selecting same files again
    target.value = ''
  }
}

const handleDragOverDropzone = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  isDragOver.value = true
}

const handleDragEnterDropzone = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  isDragOver.value = true
}

const handleDragLeaveDropzone = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  // Only set dragOver to false if we're actually leaving the dropzone
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
  }
}

const handleDropDropzone = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }
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
  if (!movedImage) {
    return
  }
  imagesArray.splice(toIndex, 0, movedImage)
  form.value.images = imagesArray

  // Reorder previews array
  const previewsArray = [...imagePreviews.value]
  const [movedPreview] = previewsArray.splice(fromIndex, 1)
  if (!movedPreview) {
    return
  }
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

const clearDraft = () => {
  // Clear localStorage draft
  localStorage.removeItem('add-vehicle-form-draft')
  
  // Reset form to initial state
  form.value = {
    // Step 1
    make: '',
  model: '',
  modelId: null,
    variant: '',
    fuelType: '',
    fuelTypeId: null,
    powerHp: null,
    powerKw: null,
    registrationDate: '',
    vin: '',
    co2Emissions: null,
    fuelConsumptionNedc: null,
    fuelConsumptionWltp: null,
    
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
    fuelConsumption: null,
    euroEmissionClass: '',
    servicebog: '',
    annualTax: null,
    
    // Step 4
    equipment: [],
    
  // Step 5
  priceTypeId: null,
  conditionId: null,
  salesTypeId: null,
    retailPrice: null,
    wholesalePrice: null,
    wholesalePriceIncludesDelivery: false,
    priceWithoutTax: null,
    internalCostPrice: null,
    leasingEnabled: false,
    leasingType: '',
    leasingCustomerType: '',
    leasingMonthlyPayment: null,
    leasingFirstPayment: null,
    leasingResidualValue: null,
    leasingDuration: null,
    leasingAnnualMileage: null,
    leasingTotalCost: null,
    
    // Step 6 (Media)
    images: [],
    coverImageIndex: 0,
    description: '',
  }
  
  // Clear image previews
  imagePreviews.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  imagePreviews.value = []
  
  // Reset to first step
  currentStep.value = 0
  
  // Reset description manual edit flag
  isDescriptionManuallyEdited.value = false
  
  // Clear any errors
  submitError.value = null
  validationErrors.value = {}
  
  // Show feedback
  draftSaved.value = false
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

    // Define nummerpladeData from lookupData (API response)
    const nummerpladeData = lookupData.value || {}

    const vehicleData: any = {
      title: title,
      registration: form.value.registrationNumber,
      vin: form.value.vin,
      brand_id: brand.id,
      model_id: form.value.modelId ?? undefined,
      version: form.value.variant || nummerpladeData.version || nummerpladeData.variant, // variant maps to version in Vehicle model
      fuel_type_id: fuelType.id,
      price: toNumberOrNull(form.value.retailPrice) ?? 0,
      km_driven: toNumberOrNull(form.value.odometer) ?? 0,
      description: form.value.description,
      images: form.value.images,
      equipment_ids: form.value.equipment.map(id => parseInt(id)), // Convert to numbers - use equipment_ids to match sell-your-car
      vehicle_list_status_id: 2, // Default to draft/unpublished - adjust as needed
      // published_at will be set automatically when vehicle is published (don't set to null)
    }

    const variantName = String(
      form.value.variant ||
        nummerpladeData.variant?.name ||
        nummerpladeData.version?.name ||
        nummerpladeData.version ||
        nummerpladeData.variant ||
        ''
    ).trim()
    if (variantName) {
      const matchedVariant = variants.value.find(
        (variant) => variant.name.toLowerCase() === variantName.toLowerCase()
      )
      if (matchedVariant) {
        vehicleData.variant_id = matchedVariant.id
      } else {
        vehicleData.variant = variantName
      }
    }

    // Add model_year_id from Nummerplade API if available
    if (nummerpladeData.model_year?.id) {
      const modelYearId = toNumberOrNull(nummerpladeData.model_year.id)
      if (modelYearId !== null) {
        vehicleData.model_year_id = modelYearId
      }
    } else if (typeof nummerpladeData.model_year === 'number') {
      const modelYearId = toNumberOrNull(nummerpladeData.model_year)
      if (modelYearId !== null) {
        vehicleData.model_year_id = modelYearId
      }
    }

    // Add towing_weight from Nummerplade API if available (including 0)
    if (nummerpladeData.towing_weight !== undefined && nummerpladeData.towing_weight !== null) {
      const towingWeight = toNumberOrNull(nummerpladeData.towing_weight)
      if (towingWeight !== null) {
        vehicleData.towing_weight = towingWeight
      }
    }

    // Add fuel_efficiency from Nummerplade API if available (convert km/L to L/100km if needed)
    // fuel_efficiency goes to vehicles table, not vehicle_details
    if (form.value.fuelConsumption !== null && form.value.fuelConsumption !== undefined) {
      const fuelEfficiency = toNumberOrNull(form.value.fuelConsumption)
      if (fuelEfficiency !== null) {
        vehicleData.fuel_efficiency = fuelEfficiency
      }
    } else if (nummerpladeData.fuel_efficiency !== undefined && nummerpladeData.fuel_efficiency !== null) {
      // Nummerplade returns km/L
      const fuelEfficiency = toNumberOrNull(nummerpladeData.fuel_efficiency)
      if (fuelEfficiency !== null) {
        vehicleData.fuel_efficiency = fuelEfficiency
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
    if (form.value.powerKw !== null && form.value.powerKw !== undefined) {
      const enginePower = toNumberOrNull(form.value.powerKw)
      if (enginePower !== null) {
        vehicleData.engine_power = Math.round(enginePower) // Convert kW to integer
      }
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
    if (form.value.co2Emissions !== null && form.value.co2Emissions !== undefined) {
      const co2Emissions = toNumberOrNull(form.value.co2Emissions)
      if (co2Emissions !== null) {
        vehicleData.co2_emissions = co2Emissions
      }
    }
    if (form.value.fuelConsumptionWltp !== null && form.value.fuelConsumptionWltp !== undefined) {
      const fuelConsumptionWltp = toNumberOrNull(form.value.fuelConsumptionWltp)
      if (fuelConsumptionWltp !== null) {
        vehicleData.fuel_consumption_wltp = fuelConsumptionWltp
      }
    }
    if (form.value.fuelConsumptionNedc !== null && form.value.fuelConsumptionNedc !== undefined) {
      const fuelConsumptionNedc = toNumberOrNull(form.value.fuelConsumptionNedc)
      if (fuelConsumptionNedc !== null) {
        vehicleData.fuel_consumption_nedc = fuelConsumptionNedc
      }
    }
    // fuel_efficiency is already set above from form or API data
    if (form.value.euroEmissionClass) {
      const euroEmissionValue = String(form.value.euroEmissionClass).trim()
      if (/^\d+$/.test(euroEmissionValue)) {
        vehicleData.euronom_id = Number(euroEmissionValue)
      }
    }
    if (form.value.engineType) {
      vehicleData.engine_type = form.value.engineType
    }
    if (form.value.drivetrain) {
      vehicleData.drive_axles = form.value.drivetrain === 'FWD' ? 1 : (form.value.drivetrain === 'AWD' ? 2 : null)
    }
    if (form.value.priceTypeId !== null && form.value.priceTypeId !== undefined) {
      const priceTypeId = toNumberOrNull(form.value.priceTypeId)
      if (priceTypeId !== null) {
        vehicleData.price_type_id = priceTypeId
      }
    }
    if (form.value.conditionId !== null && form.value.conditionId !== undefined) {
      const conditionId = toNumberOrNull(form.value.conditionId)
      if (conditionId !== null) {
        vehicleData.condition_id = conditionId
      }
    }
    if (form.value.salesTypeId !== null && form.value.salesTypeId !== undefined) {
      const salesTypeId = toNumberOrNull(form.value.salesTypeId)
      if (salesTypeId !== null) {
        vehicleData.sales_type_id = salesTypeId
      }
    }
    if (form.value.wholesalePrice !== null && form.value.wholesalePrice !== undefined) {
      const wholesalePrice = toNumberOrNull(form.value.wholesalePrice)
      if (wholesalePrice !== null) {
        vehicleData.wholesale_price = wholesalePrice
      }
    }
    if (form.value.internalCostPrice !== null && form.value.internalCostPrice !== undefined) {
      const internalCostPrice = toNumberOrNull(form.value.internalCostPrice)
      if (internalCostPrice !== null) {
        vehicleData.internal_cost_price = internalCostPrice
      }
    }
    if (form.value.isImport !== undefined) {
      const isImport = toBooleanInt(form.value.isImport)
      if (isImport !== null) {
        vehicleData.is_import = isImport
      }
    }
    if (form.value.isFactoryNew !== undefined) {
      const isFactoryNew = toBooleanInt(form.value.isFactoryNew)
      if (isFactoryNew !== null) {
        vehicleData.is_factory_new = isFactoryNew
      }
    }
    if (form.value.coverImageIndex !== undefined && form.value.coverImageIndex !== null) {
      const coverImageIndex = toNumberOrNull(form.value.coverImageIndex)
      if (coverImageIndex !== null) {
        vehicleData.cover_image_index = coverImageIndex
      }
    }

    // ============================================
    // Map all Nummerplade API data to vehicle_details
    // User-provided form data takes precedence
    // ============================================
    
    // Vehicle external ID (Nummerplade's vehicle_id)
    if (nummerpladeData.vehicle_id) {
      const vehicleExternalId = toNumberOrNull(nummerpladeData.vehicle_id)
      if (vehicleExternalId !== null) {
        vehicleData.vehicle_external_id = vehicleExternalId
      }
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
    // expire_date - send even if null (null means no expiration)
    if (nummerpladeData.expire_date !== undefined) {
      vehicleData.expire_date = nummerpladeData.expire_date
    }
    if (nummerpladeData.status_updated_date) {
      vehicleData.status_updated_date = nummerpladeData.status_updated_date
    }

    // Weight fields
    if (nummerpladeData.total_weight !== undefined && nummerpladeData.total_weight !== null) {
      const totalWeight = toNumberOrNull(nummerpladeData.total_weight)
      if (totalWeight !== null) {
        vehicleData.total_weight = totalWeight
      }
    }
    if (nummerpladeData.vehicle_weight !== undefined && nummerpladeData.vehicle_weight !== null) {
      const vehicleWeight = toNumberOrNull(nummerpladeData.vehicle_weight)
      if (vehicleWeight !== null) {
        vehicleData.vehicle_weight = vehicleWeight
      }
    }
    if (nummerpladeData.technical_total_weight !== undefined && nummerpladeData.technical_total_weight !== null) {
      const technicalTotalWeight = toNumberOrNull(nummerpladeData.technical_total_weight)
      if (technicalTotalWeight !== null) {
        vehicleData.technical_total_weight = technicalTotalWeight
      }
    }
    if (nummerpladeData.coupling !== undefined && nummerpladeData.coupling !== null) {
      const coupling = toBooleanInt(nummerpladeData.coupling)
      if (coupling !== null) {
        vehicleData.coupling = coupling
      }
    }
    // towing_weight_brakes - send even if 0
    if (nummerpladeData.towing_weight_brakes !== undefined && nummerpladeData.towing_weight_brakes !== null) {
      const towingWeightBrakes = toNumberOrNull(nummerpladeData.towing_weight_brakes)
      if (towingWeightBrakes !== null) {
        vehicleData.towing_weight_brakes = towingWeightBrakes
      }
    }
    if (nummerpladeData.minimum_weight !== undefined && nummerpladeData.minimum_weight !== null) {
      const minimumWeight = toNumberOrNull(nummerpladeData.minimum_weight)
      if (minimumWeight !== null) {
        vehicleData.minimum_weight = minimumWeight
      }
    }
    // gross_combination_weight - send even if 0
    if (nummerpladeData.gross_combination_weight !== undefined && nummerpladeData.gross_combination_weight !== null) {
      const grossCombinationWeight = toNumberOrNull(nummerpladeData.gross_combination_weight)
      if (grossCombinationWeight !== null) {
        vehicleData.gross_combination_weight = grossCombinationWeight
      }
    }

    // Engine details - send even if 0
    if (nummerpladeData.engine_displacement !== undefined && nummerpladeData.engine_displacement !== null) {
      const engineDisplacement = toNumberOrNull(nummerpladeData.engine_displacement)
      if (engineDisplacement !== null) {
        vehicleData.engine_displacement = engineDisplacement
      }
    }
    if (nummerpladeData.engine_cylinders !== undefined && nummerpladeData.engine_cylinders !== null) {
      const engineCylinders = toNumberOrNull(nummerpladeData.engine_cylinders)
      if (engineCylinders !== null) {
        vehicleData.engine_cylinders = engineCylinders
      }
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
    // last_inspection_odometer - always send from API if available (even if 0)
    if (nummerpladeData.last_inspection_odometer !== undefined && nummerpladeData.last_inspection_odometer !== null) {
      const lastInspectionOdometer = toNumberOrNull(nummerpladeData.last_inspection_odometer)
      if (lastInspectionOdometer !== null) {
        vehicleData.last_inspection_odometer = lastInspectionOdometer
      }
    }

    // Type approval code
    if (nummerpladeData.type_approval_code) {
      vehicleData.type_approval_code = nummerpladeData.type_approval_code
    }

    // Top speed
    if (nummerpladeData.top_speed !== undefined && nummerpladeData.top_speed !== null) {
      const topSpeed = toNumberOrNull(nummerpladeData.top_speed)
      if (topSpeed !== null) {
        vehicleData.top_speed = topSpeed
      }
    }

    // Doors and seats
    if (nummerpladeData.doors !== undefined && nummerpladeData.doors !== null) {
      const doors = toNumberOrNull(nummerpladeData.doors)
      if (doors !== null) {
        vehicleData.doors = doors
      }
    }
    if (nummerpladeData.minimum_seats !== undefined && nummerpladeData.minimum_seats !== null) {
      const minimumSeats = toNumberOrNull(nummerpladeData.minimum_seats)
      if (minimumSeats !== null) {
        vehicleData.minimum_seats = minimumSeats
      }
    }
    if (nummerpladeData.maximum_seats !== undefined && nummerpladeData.maximum_seats !== null) {
      const maximumSeats = toNumberOrNull(nummerpladeData.maximum_seats)
      if (maximumSeats !== null) {
        vehicleData.maximum_seats = maximumSeats
      }
    }

    // Wheels
    if (nummerpladeData.wheels !== undefined && nummerpladeData.wheels !== null) {
      vehicleData.wheels = String(nummerpladeData.wheels)
    }

    // Extra equipment
    if (nummerpladeData.extra_equipment) {
      vehicleData.extra_equipment = nummerpladeData.extra_equipment
    }

    // Axles (convert string to int if needed)
    if (nummerpladeData.axles !== undefined && nummerpladeData.axles !== null) {
      const axles = toNumberOrNull(nummerpladeData.axles)
      if (axles !== null) {
        vehicleData.axles = axles
      }
    }

    // Drive axles (already handled above, but ensure it's set from API if not in form)
    if (!form.value.drivetrain && nummerpladeData.drive_axles !== undefined && nummerpladeData.drive_axles !== null) {
      const driveAxlesNum = toNumberOrNull(nummerpladeData.drive_axles)
      if (driveAxlesNum !== null) {
        vehicleData.drive_axles = driveAxlesNum
      }
    }

    // Wheelbase
    if (nummerpladeData.wheelbase !== undefined && nummerpladeData.wheelbase !== null) {
      const wheelbase = toNumberOrNull(nummerpladeData.wheelbase)
      if (wheelbase !== null) {
        vehicleData.wheelbase = wheelbase
      }
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
    if (nummerpladeData.ncap_five !== undefined && nummerpladeData.ncap_five !== null) {
      const ncapFive = toBooleanInt(nummerpladeData.ncap_five)
      if (ncapFive !== null) {
        vehicleData.ncap_five = ncapFive
      }
    }
    if (nummerpladeData.airbags !== undefined && nummerpladeData.airbags !== null) {
      const airbags = toNumberOrNull(nummerpladeData.airbags)
      if (airbags !== null) {
        vehicleData.airbags = airbags
      }
    }
    if (nummerpladeData.integrated_child_seats !== undefined && nummerpladeData.integrated_child_seats !== null) {
      const integratedChildSeats = toNumberOrNull(nummerpladeData.integrated_child_seats)
      if (integratedChildSeats !== null) {
        vehicleData.integrated_child_seats = integratedChildSeats
      }
    }
    if (nummerpladeData.seat_belt_alarms !== undefined && nummerpladeData.seat_belt_alarms !== null) {
      const seatBeltAlarms = toNumberOrNull(nummerpladeData.seat_belt_alarms)
      if (seatBeltAlarms !== null) {
        vehicleData.seat_belt_alarms = seatBeltAlarms
      }
    }

    // Euro norm - send as euronorm_id if available
    if (nummerpladeData.euronorm?.id) {
      const euronomId = toNumberOrNull(nummerpladeData.euronorm.id)
      if (euronomId !== null) {
        vehicleData.euronom_id = euronomId
      }
    } else if (typeof nummerpladeData.euronorm === 'number') {
      const euronomId = toNumberOrNull(nummerpladeData.euronorm)
      if (euronomId !== null) {
        vehicleData.euronom_id = euronomId
      }
    }

    // Permits - convert array to JSON string
    if (nummerpladeData.permits && Array.isArray(nummerpladeData.permits)) {
      vehicleData.permits = JSON.stringify(nummerpladeData.permits)
    }

    // Dispensations - convert array to JSON string
    if (nummerpladeData.dispensations && Array.isArray(nummerpladeData.dispensations)) {
      vehicleData.dispensations = JSON.stringify(nummerpladeData.dispensations)
    }

    // Leasing period - send even if null (null means no leasing period)
    if (nummerpladeData.leasing_period_start !== undefined) {
      vehicleData.leasing_period_start = nummerpladeData.leasing_period_start
    }
    if (nummerpladeData.leasing_period_end !== undefined) {
      vehicleData.leasing_period_end = nummerpladeData.leasing_period_end
    }

    // Variant ID - if variant is selected from form, send variant_id for vehicle_details
    if (form.value.variant) {
      // Try to find variant ID from lookup data if available
      // Note: variant maps to version in vehicles table, but variant_id goes to vehicle_details
      // For now, we'll let the backend handle variant creation if needed
    }

    // Type ID - if type is available from Nummerplade API
    if (nummerpladeData.type && typeof nummerpladeData.type === 'object' && nummerpladeData.type.id) {
      const typeId = toNumberOrNull(nummerpladeData.type.id)
      if (typeId !== null) {
        vehicleData.type_id = typeId
      }
    }

    // Servicebog - from form if available
    if (form.value.servicebog) {
      vehicleData.servicebog = form.value.servicebog
    }

    // Annual tax - from form or API if available
    if (form.value.annualTax !== null && form.value.annualTax !== undefined) {
      const annualTax = toNumberOrNull(form.value.annualTax)
      if (annualTax !== null) {
        vehicleData.annual_tax = annualTax
      }
    } else if (nummerpladeData.annual_tax !== undefined && nummerpladeData.annual_tax !== null) {
      const annualTax = toNumberOrNull(nummerpladeData.annual_tax)
      if (annualTax !== null) {
        vehicleData.annual_tax = annualTax
      }
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
      if (firstErrorField) {
        const stepIndex = fieldToStepMap[firstErrorField.toLowerCase()] ?? 0
        currentStep.value = stepIndex
      } else {
        currentStep.value = 0
      }
      
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

watch(
  () => form.value.modelId,
  (newModelId) => {
    if (!newModelId) {
      form.value.model = ''
      return
    }
    const selectedModel = models.value.find(model => model.id === newModelId)
    if (selectedModel) {
      form.value.model = selectedModel.name
    }
  }
)

watch(
  () => [models.value, form.value.model, form.value.make],
  () => {
    syncModelIdFromName()
  },
  { deep: true }
)

watch(
  () => form.value.make,
  (newMake, oldMake) => {
    if (newMake !== oldMake) {
      form.value.modelId = null
      form.value.model = ''
    }
  }
)

// Watch for fuelType changes to update fuelTypeId
watch(
  () => form.value.fuelType,
  (newFuelType) => {
    if (newFuelType) {
      const matchedFuelType = fuelTypes.value.find(f => f.name === newFuelType)
      if (matchedFuelType) {
        form.value.fuelTypeId = matchedFuelType.id
      } else {
        form.value.fuelTypeId = null
      }
    } else {
      form.value.fuelTypeId = null
    }
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

/* Checkbox button field styles - custom button-like checkbox */
.checkbox-button-field {
  height: 40px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 0 12px;
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.checkbox-button-field:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
}

.checkbox-button-field--checked {
  background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}

.checkbox-button-field--checked:hover {
  background-color: rgba(var(--v-theme-primary), 0.9);
}

.checkbox-button-field__checkbox {
  flex-shrink: 0;
  margin: 0;
}

.checkbox-button-field__checkbox :deep(.v-selection-control) {
  margin: 0;
  padding: 0;
  min-height: auto;
  height: auto;
}

.checkbox-button-field__checkbox :deep(.v-selection-control__wrapper) {
  margin: 0;
  padding: 0;
}

.checkbox-button-field__checkbox :deep(.v-label) {
  display: none;
}

.checkbox-button-field--checked .checkbox-button-field__label,
.checkbox-button-field--checked .checkbox-button-field__checkbox :deep(.v-icon) {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.checkbox-button-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  cursor: pointer;
  user-select: none;
  flex: 1;
  display: block;
}

/* Image Upload Dropzone Styles - matching sell-your-car.blade.php */
.image-upload-area {
  margin-bottom: 1rem;
}

.image-upload-area.has-images .upload-dropzone {
  padding: 1rem;
  border-style: solid;
}

.image-upload-area.has-images .upload-content {
  flex-direction: row;
  gap: 0.75rem;
}

.image-upload-area.has-images .upload-icon {
  width: 24px;
  height: 24px;
}

.image-upload-area.has-images .upload-text {
  font-size: 0.75rem;
  margin: 0;
}

.image-upload-area.has-images .upload-hint {
  display: none;
}

.image-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.upload-dropzone {
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 0.5rem;
  padding: 2rem 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(var(--v-theme-surface), 0.5);
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: auto;
  display: block;
  width: 100%;
  margin: 0;
}

.upload-dropzone:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.upload-dropzone.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  color: rgba(var(--v-theme-on-surface), 0.6);
  transition: color 0.3s ease;
}

.upload-dropzone:hover .upload-icon,
.upload-dropzone.drag-over .upload-icon {
  color: rgb(var(--v-theme-primary));
}

.upload-dropzone.drag-over .upload-icon {
  color: rgb(var(--v-theme-on-primary));
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.upload-hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

.upload-dropzone.drag-over .upload-text,
.upload-dropzone.drag-over .upload-hint {
  color: rgb(var(--v-theme-on-primary));
}
</style>
