<template>
  <v-container class="pa-4" max-width="1400">
    <!-- Header with Actions -->
    <div class="d-flex justify-space-between align-center flex-wrap mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">{{ t('dealer.views.addVehicle.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t('dealer.views.addVehicle.subtitle') }}
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
          {{ t('dealer.views.addVehicle.draftSaved') }}
        </v-chip>
      </div>
    </div>

    <!-- License Plate Lookup Section (Outside Tabs) -->
    <v-card elevation="0" class="mb-4 border border-gray-200">
      <v-card-text class="pa-6">
        <div class="mb-2">
          <h3 class="text-h6 font-weight-semibold mb-2">{{ t('dealer.views.addVehicle.vehicleLookup') }}</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ t('dealer.views.addVehicle.lookupSubtitle') }}
          </p>

          <v-row class="align-center">
            <v-col cols="12" md="8">
              <v-text-field
                v-model="lookupForm.registrationNumber"
                :label="t('dealer.views.addVehicle.licensePlate')"
                :placeholder="t('dealer.views.addVehicle.placeholderLicensePlate')"
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
                {{ t('dealer.views.addVehicle.findVehicle') }}
              </v-btn>
              <v-btn
                v-if="!showFormFields"
                variant="outlined"
                color="grey-darken-1"
                @click="manualEntryMode = true"
                style="height: 56px;"
              >
                <v-icon start>mdi-pencil</v-icon>
                {{ t('dealer.views.addVehicle.enterManually') }}
              </v-btn>
              <v-btn
                v-if="showFormFields"
                variant="outlined"
                color="grey-darken-1"
                @click="manualEntryMode = false; lookupSuccess = false; lookupData = null"
                style="height: 56px;"
              >
                <v-icon start>mdi-refresh</v-icon>
                {{ t('dealer.views.addVehicle.startOver') }}
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
                      <div class="d-flex justify-space-between align-center flex-wrap mb-2">
                        <h3 class="text-h6 font-weight-semibold mb-0">{{ t('dealer.views.addVehicle.vehicleInformation') }}</h3>
                        <v-btn
                          variant="outlined"
                          color="warning"
                          size="small"
                          @click="clearDraft"
                        >
                          <v-icon start>mdi-delete-sweep</v-icon>
                          {{ t('dealer.views.addVehicle.clearDraft') }}
                        </v-btn>
                      </div>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        {{ t('dealer.views.addVehicle.completeVehicleDetails') }}
                      </p>
                    </div>

                    <v-divider class="my-6" />
                    <div class="mb-4">
                      <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                        <v-icon size="20" class="mr-2">mdi-car-info</v-icon>
                        {{ t('dealer.views.addVehicle.basicInformation') }}
                      </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="form.make"
                  :items="brands.map(b => b.name)"
                  :label="t('dealer.views.addVehicle.make')"
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
                  :items="models"
                  item-title="name"
                  item-value="id"
                  :label="t('dealer.views.addVehicle.model')"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :loading="modelsLoading"
                  :disabled="!selectedBrandId"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-combobox
                  v-model="form.variant"
                  :items="variants"
                  item-title="name"
                  item-value="name"
                  :label="t('dealer.views.addVehicle.variant')"
                  density="compact"
                  variant="outlined"
                  :hint="t('dealer.views.addVehicle.variantHint')"
                  persistent-hint
                  :rules="[rules.required]"
                  :loading="variantsLoading"
                  :disabled="!form.modelId"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="form.fuelType"
                  :items="fuelTypes.map(f => f.name)"
                  :label="t('dealer.views.addVehicle.fuelType')"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :readonly="!!lookupData?.fuelType"
                    hide-details="auto"
                />
              </v-col>
                <v-col cols="12" md="4">
                  <MonthYearPicker
                    v-model="form.registrationDate"
                    :label="t('dealer.views.addVehicle.registration')"
                    :rules="[rules.required]"
                    :readonly="!!lookupData?.registrationDate"
                    :min-year="MODEL_YEAR_MIN"
                  />
                </v-col>
              </v-row>
            </div>

                    <v-divider class="my-6" />
                    <div class="mb-4">
                      <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                        <v-icon size="20" class="mr-2">mdi-gauge</v-icon>
                        {{ t('dealer.views.addVehicle.performanceEmissions') }}
                      </h4>
                      <v-row dense>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="form.powerKw"
                            :label="t('dealer.views.addVehicle.powerKw')"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          >
                            <template v-if="displayHpFromKw !== null" #append-inner>
                              <span class="text-caption text-medium-emphasis text-no-wrap me-1">
                                {{ t('dealer.views.addVehicle.powerKwApproxHpInline', { hp: displayHpFromKw }) }}
                              </span>
                            </template>
                          </v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="form.co2Emissions"
                            :label="t('dealer.views.addVehicle.co2Emissions')"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="form.fuelConsumptionWltp"
                            :label="t('dealer.views.addVehicle.fuelConsumptionWltp')"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details="auto"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="form.fuelConsumptionNedc"
                            :label="t('dealer.views.addVehicle.fuelConsumptionNedc')"
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
                  <h3 class="text-h6 font-weight-semibold mb-2">{{ t('dealer.views.vehicleDetail.detailsSection') }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t('dealer.views.addVehicle.registrationMileageInfo') }}
                  </p>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-calendar-check</v-icon>
                    {{ t('dealer.views.addVehicle.registrationIdentity') }}
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <MonthYearPicker
                  v-model="form.firstRegistrationDate"
                  :label="t('dealer.views.addVehicle.firstRegistration')"
                  :rules="[rules.required]"
                  :min-year="MODEL_YEAR_MIN"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MonthYearPicker
                  v-model="form.productionDate"
                  :label="t('dealer.views.addVehicle.production')"
                  :hint="t('dealer.views.addVehicle.optional')"
                  persistent-hint
                  :min-year="MODEL_YEAR_MIN"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.registrationNumber"
                  :label="t('dealer.views.addVehicle.licensePlate')"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <MonthYearPicker
                  v-model="form.lastInspectionDate"
                  :label="t('dealer.views.addVehicle.lastInspection')"
                  :min-year="MODEL_YEAR_MIN"
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
                  <span class="checkbox-button-field__label">{{ t('dealer.views.addVehicle.importVehicle') }}</span>
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
                  <span class="checkbox-button-field__label">{{ t('dealer.views.addVehicle.factoryNew') }}</span>
                </div>
              </v-col>
            </v-row>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-speedometer</v-icon>
                    {{ t('dealer.views.addVehicle.mileageUsage') }}
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.odometer"
                  :label="t('dealer.views.addVehicle.currentMileage')"
                  type="number"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.odometer]"
                  :hint="t('dealer.views.addVehicle.optional')"
                  persistent-hint
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
                  <h3 class="text-h6 font-weight-semibold mb-2">{{ t('dealer.views.addVehicle.technicalSpecifications') }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t('dealer.views.addVehicle.engineTransmission') }}
                  </p>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-engine</v-icon>
                    {{ t('dealer.views.addVehicle.engineTransmissionTitle') }}
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.engineType"
                  :label="t('dealer.views.addVehicle.engineType')"
                  density="compact"
                  variant="outlined"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.fuelType"
                  :items="fuelTypes.map(f => f.name)"
                  :label="t('dealer.views.addVehicle.fuelType')"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.gearTypeId"
                  :items="gearTypes"
                  item-title="name"
                  item-value="id"
                  :label="t('dealer.views.addVehicle.gearType')"
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
                    {{ t('dealer.views.addVehicle.consumptionEmissions') }}
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.euroEmissionClass"
                  :label="t('dealer.views.addVehicle.euroEmissionClass')"
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
                  <h3 class="text-h6 font-weight-semibold mb-2">{{ t('dealer.views.addVehicle.tabEquipment') }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t('dealer.views.addVehicle.equipmentSelectHint') }}
                    <span v-if="maxEquipmentPerVehicle > 0" class="text-caption">({{ form.equipment.length }}/{{ maxEquipmentPerVehicle }})</span>
                  </p>
                </div>

            <v-expansion-panels class="equipment-panels" multiple elevation="0">
              <v-expansion-panel
                v-for="(equipmentType, typeIndex) in equipmentTypes"
                :key="typeIndex"
                class="equipment-type-panel"
                elevation="0"
              >
                <v-expansion-panel-title class="equipment-type-title">
                  <span class="equipment-type-name">{{ equipmentType.name }}</span>
                  <v-chip
                    v-if="equipmentType.equipments?.length"
                    size="x-small"
                    color="primary"
                    variant="tonal"
                    class="equipment-type-badge"
                  >
                    {{ t('dealer.views.addVehicle.selectedCount', { count: form.equipment.filter(id =>
                        equipmentType.equipments.some(eq => eq.id.toString() === id)
                      ).length }) }}
                  </v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="equipment-type-content">
                  <div class="equipment-chips">
                    <div
                      v-for="(equipment, equipmentIndex) in equipmentType.equipments"
                      :key="equipmentIndex"
                      class="equipment-chip"
                    >
                      <v-checkbox
                        v-model="form.equipment"
                        :value="equipment.id.toString()"
                        color="primary"
                        density="compact"
                        hide-details
                        class="equipment-checkbox"
                        :disabled="maxEquipmentPerVehicle > 0 && form.equipment.length >= maxEquipmentPerVehicle && !form.equipment.includes(equipment.id.toString())"
                      >
                        <template #label>
                          <span class="equipment-label">{{ equipment.name }}</span>
                        </template>
                      </v-checkbox>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
              </template>

          <!-- Step 5: Pricing and Sales Configuration -->
              <template v-if="index === 4">
                <div>
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-semibold mb-2">{{ t('dealer.views.addVehicle.tabPricing') }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t('dealer.views.addVehicle.configurePricingHint') }}
                  </p>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
              <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                <v-icon size="20" class="mr-2">mdi-tag-outline</v-icon>
                {{ t('dealer.views.addVehicle.salesConfiguration') }}
              </h4>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.priceTypeId"
                :items="priceTypes"
                item-title="name"
                item-value="id"
                :label="t('dealer.views.addVehicle.priceType')"
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
                :label="t('dealer.views.addVehicle.condition')"
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
                :label="t('dealer.views.addVehicle.salesType')"
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
                    <v-icon size="20" class="mr-2">mdi-store-marker</v-icon>
                    {{ t('dealer.views.addVehicle.dealerContactShown') }}
                  </h4>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="form.sellerAddress"
                        :label="t('dealer.views.addVehicle.address')"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :placeholder="t('dealer.views.addVehicle.placeholderStreetCity')"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="form.sellerPostcode"
                        :label="t('dealer.views.addVehicle.postalCode')"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :placeholder="t('dealer.views.addVehicle.placeholderPostcode')"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="form.sellerPhone"
                        :label="t('dealer.views.addVehicle.phone')"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :placeholder="t('dealer.views.addVehicle.placeholderContactNumber')"
                      />
                    </v-col>
                  </v-row>
                  <p class="text-caption text-medium-emphasis mt-2">{{ t('dealer.views.addVehicle.filledFromProfile') }}</p>
                </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-currency-usd</v-icon>
                    {{ t('dealer.views.addVehicle.pricing') }}
                  </h4>
              <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.retailPrice"
                    :label="t('dealer.views.addVehicle.retailPrice')"
                  type="number"
                  density="compact"
                  variant="outlined"
                  prefix="kr"
                    :hint="t('dealer.views.addVehicle.includingDelivery')"
                    persistent-hint
                  :rules="[rules.price]"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.wholesalePrice"
                  :label="t('dealer.views.addVehicle.wholesalePrice')"
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
                  :label="t('dealer.views.addVehicle.priceWithoutTax')"
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
                    :label="t('dealer.views.addVehicle.internalCostPrice')"
                  type="number"
                  density="compact"
                  variant="outlined"
                  prefix="kr"
                    :hint="t('dealer.views.addVehicle.dealerOnly')"
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
                  <span class="checkbox-button-field__label">{{ t('dealer.views.addVehicle.wholesaleIncludesDelivery') }}</span>
                </div>
              </v-col>
            </v-row>
            </div>

            <div class="form-section mt-4">
              <div class="section-title mb-3">
                <v-icon size="18" class="mr-2">mdi-calendar-clock</v-icon>
                <span class="text-subtitle-2 font-weight-medium">{{ t('dealer.views.addVehicle.leasingDetailsOptional') }}</span>
              </div>
                <v-row dense>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.leasingType"
                    :items="leasingTypes"
                    :label="t('dealer.views.addVehicle.leasingType')"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.leasingCustomerType"
                    :items="leasingCustomerTypes"
                    :label="t('dealer.views.addVehicle.customerType')"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="form.leasingMonthlyPayment"
                    :label="t('dealer.views.addVehicle.monthlyPayment')"
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
                    :label="t('dealer.views.addVehicle.firstPayment')"
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
                    :label="t('dealer.views.addVehicle.residualValue')"
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
                      :label="t('dealer.views.addVehicle.durationMonths')"
                    type="number"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model.number="form.leasingAnnualMileage"
                    :label="t('dealer.views.addVehicle.annualMileage')"
                    type="number"
                    density="compact"
                    variant="outlined"
                      hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.leasingTotalCost"
                    :label="t('dealer.views.addVehicle.totalCostOverTerm')"
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
                  <h3 class="text-h6 font-weight-semibold mb-2">{{ t('dealer.views.addVehicle.mediaDescription') }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ t('dealer.views.addVehicle.uploadImagesHint') }}
                  </p>
                </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-image-multiple</v-icon>
                    {{ t('dealer.views.addVehicle.vehicleImages') }}
                    <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">
                      {{ imagePreviews.length }}/{{ maxVehicleImages }}
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
                        <p class="upload-text">{{ t('dealer.views.addVehicle.clickToUpload') }}</p>
                        <p class="upload-hint">{{ t('dealer.views.addVehicle.uploadHintFormats') }}</p>
                      </div>
                    </label>
                    <v-alert
                      v-if="form.images.length === 0"
                      type="error"
                      variant="tonal"
                      density="compact"
                      class="mt-2"
                    >
                      {{ t('dealer.views.addVehicle.uploadMinOneImage') }}
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
                    {{ t('dealer.views.addVehicle.cover') }}
                    </v-chip>
                  </v-card>
                </v-col>
              </v-row>
            </div>

                <v-divider class="my-6" />
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-semibold mb-4">
                    <v-icon size="20" class="mr-2">mdi-text</v-icon>
                    {{ t('dealer.views.addVehicle.vehicleDescription') }}
                  </h4>
                <v-textarea
                  v-model="form.description"
                  :label="t('dealer.views.addVehicle.vehicleDescription')"
                  density="compact"
                  variant="outlined"
                  rows="6"
                :hint="t('dealer.views.addVehicle.descriptionHint')"
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
          <strong>{{ t('dealer.views.addVehicle.fixErrorsStrong') }}</strong>
        </div>
        <ul class="mb-0 pl-4">
          <li v-for="(errors, field) in validationErrors" :key="field">
            <strong>{{ field }}:</strong> {{ errors.join(', ') }}
          </li>
        </ul>
      </v-alert>

      <!-- Success Dialog -->
      <v-dialog
        v-model="showSuccessDialog"
        max-width="520"
        persistent
        scrim="rgba(0, 0, 0, 0.5)"
      >
        <v-card class="success-dialog-card" elevation="8">
          <v-card-text class="pa-0">
            <!-- Success Icon Section -->
            <div class="success-icon-container">
              <div class="success-icon-wrapper">
                <v-icon 
                  size="64" 
                  color="success"
                  class="success-icon"
                >
                  mdi-check-circle
                </v-icon>
              </div>
            </div>

            <!-- Content Section -->
            <div class="success-content pa-6">
              <h3 class="text-h5 font-weight-bold text-center mb-2">
                {{ t('dealer.views.addVehicle.vehicleSavedSuccessfully') }}
              </h3>
              <p class="text-body-1 text-center text-medium-emphasis mb-6">
                {{ t('dealer.views.addVehicle.vehicleSavedMessage') }}
              </p>

              <!-- Action Buttons -->
              <div class="d-flex flex-column flex-sm-row gap-3">
                <v-btn
                  variant="outlined"
                  color="grey-darken-1"
                  size="large"
                  class="flex-grow-1"
                  @click="goToVehiclesList"
                >
                  <v-icon start>mdi-view-list</v-icon>
                  {{ t('dealer.views.addVehicle.viewVehiclesList') }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="large"
                  class="flex-grow-1"
                  @click="addAnotherVehicle"
                >
                  <v-icon start>mdi-plus-circle</v-icon>
                  {{ t('dealer.views.addVehicle.addAnotherVehicle') }}
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

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
          {{ t('dealer.views.addVehicle.previous') }}
        </v-btn>

        <div class="d-flex">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            class="mr-2"
            @click="saveAsDraft"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            {{ t('dealer.views.addVehicle.saveDraft') }}
          </v-btn>

          <v-btn
            v-if="currentStep < steps.length - 1"
            color="primary"
            variant="elevated"
            @click="nextStep"
          >
            {{ t('dealer.views.addVehicle.next') }}
            <v-icon end>mdi-chevron-right</v-icon>
          </v-btn>

          <v-btn
            v-else
            color="primary"
            variant="elevated"
            :loading="submitting"
            :disabled="submitting"
            @click="submitForm"
          >
            <v-icon start>{{ submitting ? 'mdi-loading' : 'mdi-check-circle' }}</v-icon>
            {{ submitting ? t('dealer.views.addVehicle.saving') : t('dealer.views.addVehicle.saveVehicle') }}
          </v-btn>
        </div>
      </div>
          </v-card-text>
        </v-window-item>
      </v-window>
      </v-card>
    </v-expand-transition>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">{{ t('dealer.views.addVehicle.close') }}</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { createVehicle, createVehicleDraft, updateVehicle, getLookupConstants, lookupDealerVehicleByIdentity, getProfile } from '@/api/dealer.api'
import { searchLookupModels, searchLookupVariants, type LookupVariantRow } from '@/api/lookup-search.api'
import { loadSubscriptionFeatures } from '@/api/subscription-features.api'
import type { ApiErrorModel } from '@/models/api-error.model'
import type { VehicleModel } from '@/models/vehicle.model'
import MonthYearPicker from '@/components/ui/MonthYearPicker.vue'
import { useErrorMessage } from '@/composables/useErrorMessage'
import { getFeatureLimit, getSubscriptionFeatures, FeatureKey } from '@/utils/subscriptionFeatures'

const router = useRouter()
const { t } = useI18n()
const { getDisplayMessage } = useErrorMessage()

/** Year dropdowns: align with dealer policy (no model_years from lookup-constants). */
const MODEL_YEAR_MIN = 1975

// Wizard state
const currentStep = ref(0)
const visitedSteps = ref<Set<number>>(new Set([0])) // Track visited steps
const steps = computed(() => [
  { label: t('dealer.views.addVehicle.tabLookup'), key: 'lookup' },
  { label: t('dealer.views.addVehicle.tabDetails'), key: 'details' },
  { label: t('dealer.views.addVehicle.tabTechnical'), key: 'technical' },
  { label: t('dealer.views.addVehicle.tabEquipment'), key: 'equipment' },
  { label: t('dealer.views.addVehicle.tabPricing'), key: 'pricing' },
  { label: t('dealer.views.addVehicle.tabMedia'), key: 'media' },
])

// Form state
const formRef = ref()
const formValid = ref(false)
const submitting = ref(false)
const draftSaved = ref(false)
const draftVehicleId = ref<number | null>(null) // Track the draft vehicle ID
const submitError = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})
const showSuccessDialog = ref(false)
const hasUnsavedChanges = ref(false)
const formSuccessfullySaved = ref(false)

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error' | 'info' | 'warning'
})

const showSnackbar = (message: string, color: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

// Subscription plan limits for images and equipment
const maxVehicleImages = computed(() => getFeatureLimit(FeatureKey.MAX_VEHICLE_IMAGES, 20))
const maxEquipmentPerVehicle = computed(() => getFeatureLimit(FeatureKey.MAX_EQUIPMENT_PER_VEHICLE, 30))

// Computed property to check if images are valid
const imagesValid = computed(() => {
  const max = maxVehicleImages.value
  return form.value.images && form.value.images.length >= 1 && (max <= 0 || form.value.images.length <= max)
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

const modelsLoading = ref(false)
const variantsLoading = ref(false)
/** Skip make/model cascade when applying DMR lookup programmatically */
const suppressLookupCascade = ref(false)

async function loadModelsForBrand(brandId: number | null) {
  models.value = []
  if (brandId == null) return
  modelsLoading.value = true
  try {
    models.value = await searchLookupModels([brandId])
  } catch (e) {
    console.error('Failed to load models for brand', e)
    models.value = []
  } finally {
    modelsLoading.value = false
  }
}

async function loadVariantsForModel(modelId: number | null) {
  variants.value = []
  if (modelId == null) return
  variantsLoading.value = true
  try {
    variants.value = await searchLookupVariants([modelId])
  } catch (e) {
    console.error('Failed to load variants for model', e)
    variants.value = []
  } finally {
    variantsLoading.value = false
  }
}

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

/** Shown inside the kW field; backend still derives `engine_power_hp` when only kW is sent */
const displayHpFromKw = computed(() => calculatePowerHp(toNumberOrNull(form.value.powerKw)))

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

/** DMR registration lookup: persist CSV + specs on create (same as sell-your-car). */
function appendLookupEquipmentAndSpecifications(
  vehicleData: Record<string, unknown>,
  nummerpladeData: Record<string, unknown>
) {
  if (typeof nummerpladeData.equipments === 'string' && nummerpladeData.equipments.trim() !== '') {
    vehicleData.lookup_equipments = nummerpladeData.equipments.trim()
  }
  if (Array.isArray(nummerpladeData.specifications) && nummerpladeData.specifications.length > 0) {
    vehicleData.lookup_specifications = JSON.stringify(nummerpladeData.specifications)
  }
}

/**
 * Copy DMR `lookup-by-registration` fields onto the dealer create/draft payload.
 * Supports canonical keys from {@link DmrFactVehicleLookupService} plus legacy aliases.
 */
function mergeDmrLookupVehicleFields(vehicleData: Record<string, any>, d: Record<string, any>): void {
  if (!d || typeof d !== 'object') {
    return
  }

  if (d.registration_status != null && vehicleData.registration_status == null) {
    vehicleData.registration_status =
      typeof d.registration_status === 'string'
        ? d.registration_status
        : (d.registration_status as { name?: string })?.name
  }

  if (vehicleData.maximum_weight_kg == null) {
    const mw = toNumberOrNull(d.maximum_weight_kg)
    if (mw !== null) {
      vehicleData.maximum_weight_kg = mw
    }
  }
  if (vehicleData.maximum_weight_kg == null) {
    const tw = toNumberOrNull(d.total_weight)
    const tech = toNumberOrNull(d.technical_total_weight)
    if (tech !== null) {
      vehicleData.maximum_weight_kg = tech
    } else if (tw !== null) {
      vehicleData.maximum_weight_kg = tw
    }
  }

  if (vehicleData.engine_displacement_litres == null) {
    const lit = toNumberOrNull(d.engine_displacement_litres)
    if (lit !== null) {
      vehicleData.engine_displacement_litres = lit
    }
  }
  if (vehicleData.engine_displacement_litres == null && d.engine_displacement != null) {
    const cc = toNumberOrNull(d.engine_displacement)
    if (cc !== null) {
      vehicleData.engine_displacement_litres = Math.round((cc / 1000) * 100) / 100
    }
  }
  if (vehicleData.engine_displacement_litres == null && d.engine_size_cc != null) {
    const cc = toNumberOrNull(d.engine_size_cc)
    if (cc !== null) {
      vehicleData.engine_displacement_litres = Math.round((cc / 1000) * 100) / 100
    }
  }

  if (vehicleData.max_speed == null) {
    const ms = toNumberOrNull(d.max_speed ?? d.top_speed)
    if (ms !== null) {
      vehicleData.max_speed = ms
    }
  }

  if (vehicleData.door_count == null) {
    const doors = toNumberOrNull(d.door_count ?? d.doors)
    if (doors !== null) {
      vehicleData.door_count = doors
    }
  }

  if (vehicleData.seats_min == null) {
    const n = toNumberOrNull(d.seats_min ?? d.minimum_seats)
    if (n !== null) {
      vehicleData.seats_min = n
    }
  }
  if (vehicleData.seats_max == null) {
    const n = toNumberOrNull(d.seats_max ?? d.maximum_seats)
    if (n !== null) {
      vehicleData.seats_max = n
    }
  }

  if (vehicleData.axle_count == null) {
    const n = toNumberOrNull(d.axle_count ?? d.axles)
    if (n !== null) {
      vehicleData.axle_count = n
    }
  }

  if (vehicleData.colour_id == null && d.color && typeof d.color === 'object' && d.color !== null && 'id' in d.color) {
    const id = toNumberOrNull((d.color as { id: unknown }).id)
    if (id !== null) {
      vehicleData.colour_id = id
    }
  }
  if (vehicleData.body_type_id == null && d.body_type && typeof d.body_type === 'object' && d.body_type !== null && 'id' in d.body_type) {
    const id = toNumberOrNull((d.body_type as { id: unknown }).id)
    if (id !== null) {
      vehicleData.body_type_id = id
    }
  }
  if (vehicleData.emission_norm_id == null && d.euronorm != null) {
    if (typeof d.euronorm === 'object' && 'id' in d.euronorm) {
      const id = toNumberOrNull((d.euronorm as { id: unknown }).id)
      if (id !== null) {
        vehicleData.emission_norm_id = id
      }
    } else if (typeof d.euronorm === 'number') {
      const id = toNumberOrNull(d.euronorm)
      if (id !== null) {
        vehicleData.emission_norm_id = id
      }
    }
  }

  if (vehicleData.co2_emission == null) {
    const c = toNumberOrNull(d.co2_emission ?? d.co2_emissions)
    if (c !== null) {
      vehicleData.co2_emission = c
    }
  }

  if (vehicleData.engine_power_kw == null) {
    const kw = toNumberOrNull(d.engine_power_kw ?? d.engine_power)
    if (kw !== null) {
      vehicleData.engine_power_kw = kw
    }
  }

  if (vehicleData.variant_id == null && d.variant && typeof d.variant === 'object' && d.variant !== null && 'id' in d.variant) {
    const vid = toNumberOrNull((d.variant as { id: unknown }).id)
    if (vid !== null) {
      vehicleData.variant_id = vid
    }
  }

  if (d.nox_emission != null && vehicleData.nox_emission == null) {
    const n = toNumberOrNull(d.nox_emission)
    if (n !== null) {
      vehicleData.nox_emission = n
    }
  }
  if (d.electrical_consumption != null && vehicleData.electrical_consumption == null) {
    const n = toNumberOrNull(d.electrical_consumption)
    if (n !== null) {
      vehicleData.electrical_consumption = n
    }
  }
  if (d.particle_filter !== undefined && d.particle_filter !== null && vehicleData.particle_filter == null) {
    vehicleData.particle_filter = !!d.particle_filter
  }
  if (d.ncap_test !== undefined && d.ncap_test !== null && vehicleData.ncap_test == null) {
    vehicleData.ncap_test = !!d.ncap_test
  }
  if (d.last_registration_change && vehicleData.last_registration_change == null) {
    vehicleData.last_registration_change = d.last_registration_change
  }
}

// Generate description based on vehicle information and equipment
const generateDescription = (): string => {
  const parts: string[] = []
  const d = lookupData.value as Record<string, unknown> | null

  if (d && typeof d.equipments === 'string' && d.equipments.trim() !== '') {
    const equipItems = d.equipments.split(',').map(s => s.trim()).filter(Boolean)
    if (equipItems.length > 0) {
      parts.push(
        'Equipment (from registration)\n' + equipItems.map(item => `• ${item}`).join('\n')
      )
    }
  }

  if (d && Array.isArray(d.specifications) && d.specifications.length > 0) {
    const specLines: string[] = []
    ;(d.specifications as Array<{ name?: string; count?: number }>).forEach(spec => {
      if (!spec || typeof spec.name !== 'string') return
      const n = spec.name.trim()
      if (!n) return
      const c = spec.count != null ? parseInt(String(spec.count), 10) : 0
      specLines.push(`• ${n}: ${Number.isNaN(c) ? 0 : c}`)
    })
    if (specLines.length > 0) {
      parts.push('Specifications (from registration)\n' + specLines.join('\n'))
    }
  }
  
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
  
  // Equipment from form checkboxes (when no DMR equipments string on lookup)
  if (
    !(d && typeof d.equipments === 'string' && d.equipments.trim() !== '') &&
    form.value.equipment &&
    form.value.equipment.length > 0
  ) {
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
  
  return parts.length > 0 ? parts.join('\n\n') : ''
}

// Form data
const form = ref({
  // Step 1
  make: '',
  model: '',
  modelId: null as number | null,
  variant: '',
  dmr_fact_vehicle_id: null as number | null,
  fuelType: '',
  fuelTypeId: null as number | null,
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
  gearTypeId: null as number | null,
  drivetrain: '',
  fuelConsumption: null as number | null,
  euroEmissionClass: '',
  servicebog: '',
  annualTax: null as number | null,
  
  // Step 4
  equipment: [] as string[],
  
  // Step 5
  priceTypeId: null as number | null,
  conditionId: 2 as number | null,
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
  sellerAddress: '',
  sellerPostcode: '',
  sellerPhone: '',
  
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
const variants = ref<LookupVariantRow[]>([])
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
    const automatic = (data.gear_types || []).find((g: any) => String(g.name || '').toLowerCase() === 'automatic')
    if (automatic && form.value.gearTypeId == null) {
      form.value.gearTypeId = automatic.id
    }
    vehicleUses.value = data.vehicle_uses || []
    salesTypes.value = data.sales_types || []
    priceTypes.value = data.price_types || []
    conditions.value = data.conditions || []
    variants.value = []
    models.value = []
    drivetrainTypes.value = data.drivetrain_types || []
    equipmentTypes.value = data.equipment_types || []
  } catch (error) {
    console.error('Failed to load lookup data:', error)
  }
}

// Pre-fill dealer contact fields from dealer profile when empty
const loadDealerProfileForContact = async () => {
  try {
    const profile = await getProfile()
    const f = form.value
    if (!f.sellerAddress && (profile.address || profile.city || profile.postcode)) {
      const parts = [profile.address, profile.city, profile.postcode].filter(Boolean) as string[]
      if (parts.length) f.sellerAddress = parts.join(', ')
    }
    if (!f.sellerPostcode && profile.postcode) {
      f.sellerPostcode = profile.postcode
    }
    if (!f.sellerPhone && profile.owner?.phone) {
      f.sellerPhone = profile.owner.phone
    }
  } catch (_) {
    // Dealer profile may not be available
  }
}

// Validation rules
const rules = {
  required: (v: any) => !!v || t('dealer.views.addVehicle.fieldRequired'),
  odometer: (v: number | null | undefined) => {
    if (v === null || v === undefined) return true // Optional field
    return (v >= 0 && v <= 12000000000000) || t('dealer.views.addVehicle.odometerRange')
  },
  price: (v: number) => {
    if (v === null || v === undefined) return true
    return (v >= 0 && v <= 999999999) || t('dealer.views.addVehicle.priceRange')
  },
  description: (v: string) => {
    if (!v) return t('dealer.views.addVehicle.fieldRequired')
    return (v.length >= 1 && v.length <= 5000) || t('dealer.views.addVehicle.descriptionLength')
  },
  requiredImages: (v: File[]) => {
    // This rule is not used anymore - validation is done via computed property
    return true
  },
}

/** Returns step indices and labels that have missing or invalid required fields (for validation feedback). */
function getInvalidSteps(): { stepIndex: number; stepLabel: string }[] {
  const invalid: { stepIndex: number; stepLabel: string }[] = []
  const f = form.value

  // Step 0: Vehicle Lookup
  if (!f.make || !f.modelId || !f.variant || !f.fuelType || !f.registrationDate || f.dmr_fact_vehicle_id == null) {
    invalid.push({ stepIndex: 0, stepLabel: steps.value[0]?.label ?? t('dealer.views.addVehicle.tabLookup') })
  }

  // Step 1: Vehicle Details (registration number is optional)
  const odometerValid = f.odometer == null || (f.odometer >= 0 && f.odometer <= 12000000000000)
  if (!f.firstRegistrationDate || !odometerValid) {
    invalid.push({ stepIndex: 1, stepLabel: steps.value[1]?.label ?? t('dealer.views.addVehicle.tabDetails') })
  }

  // Step 2: Technical Data - gear type is required (defaults to Automatic when gear types load)
  if (!f.gearTypeId) {
    invalid.push({ stepIndex: 2, stepLabel: steps.value[2]?.label ?? t('dealer.views.addVehicle.tabTechnical') })
  }

  // Step 3: Equipment - check plan limit
  const maxEquip = maxEquipmentPerVehicle.value
  if (maxEquip > 0 && f.equipment && f.equipment.length > maxEquip) {
    invalid.push({ stepIndex: 3, stepLabel: steps.value[3]?.label ?? t('dealer.views.addVehicle.tabEquipment') })
  }

  // Step 4: Pricing & Sales
  const priceValid = f.retailPrice == null || (f.retailPrice >= 0 && f.retailPrice <= 999999999)
  if (!priceValid) {
    invalid.push({ stepIndex: 4, stepLabel: steps.value[4]?.label ?? t('dealer.views.addVehicle.tabPricing') })
  }

  // Step 5: Media
  const descValid = f.description && f.description.length >= 1 && f.description.length <= 5000
  const maxImg = maxVehicleImages.value
  const imagesCountOk = maxImg <= 0 || imagePreviews.value.length <= maxImg
  if (!(imagePreviews.value.length >= 1) || !descValid || !imagesCountOk) {
    invalid.push({ stepIndex: 5, stepLabel: steps.value[5]?.label ?? t('dealer.views.addVehicle.tabMedia') })
  }

  return invalid
}

// Methods
const performLookup = async () => {
  if (!lookupForm.value.registrationNumber) {
    lookupError.value = t('dealer.views.addVehicle.licensePlateRequired')
    return
  }

  // Clear any saved draft/form state before applying lookup data
  clearDraft()
  manualEntryMode.value = false
  lookupData.value = null
  formSuccessfullySaved.value = false

  lookupLoading.value = true
  lookupError.value = null
  lookupSuccess.value = false
  // Reset manual edit flag when starting new lookup
  isDescriptionManuallyEdited.value = false

  if (brands.value.length === 0) {
    await loadLookupData()
  }

  try {
    const data = await lookupDealerVehicleByIdentity({
      registration: lookupForm.value.registrationNumber,
    })
    
    // Clear any previous errors
    lookupError.value = null
    lookupData.value = data

    // DMR identity required by dealer create/update contract
    form.value.dmr_fact_vehicle_id = data.dmr_fact_vehicle_id ?? data.dmrFactVehicleId ?? null

    suppressLookupCascade.value = true
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

    const finalBrandId: number | undefined =
      typeof brandId === 'number'
        ? brandId
        : typeof selectedBrandId.value === 'number'
          ? selectedBrandId.value
          : undefined

    if (finalBrandId !== undefined) {
      await loadModelsForBrand(finalBrandId)
    }

    // Handle model - upsert first, then set form value directly from API if it has an id
    if (apiModel && typeof apiModel === 'object') {
      upsertLookupOption(
        models.value,
        { id: apiModel.id, name: apiModel.name },
        finalBrandId !== undefined ? { brand_id: finalBrandId } : undefined
      )
      form.value.model = apiModel.name
      await nextTick()
      form.value.modelId = apiModel.id
    } else if (apiModel) {
      const modelName = typeof apiModel === 'string' ? apiModel : apiModel.name || ''
      upsertLookupOption(
        models.value,
        { name: modelName },
        finalBrandId !== undefined ? { brand_id: finalBrandId } : undefined
      )
      form.value.model = modelName
      await nextTick()
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

    if (form.value.modelId) {
      await loadVariantsForModel(form.value.modelId)
    }

    // Map variant - handle both object and string formats, also check for 'version' field
    const variantName = data.variant?.name || data.version?.name || data.version || data.variant
    if (variantName) {
      form.value.variant = typeof variantName === 'string' ? variantName : variantName.name || ''
    }

    // Handle fuel type - upsert first, then set form value
    if (apiFuelType && typeof apiFuelType === 'object') {
      upsertLookupOption(fuelTypes.value, { id: apiFuelType.id, name: apiFuelType.name })
      form.value.fuelType = apiFuelType.name
      form.value.fuelTypeId = apiFuelType.id
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
    }

    // Map power: DMR `lookup-by-registration` returns `engine_power_kw`; older payloads used `engine_power`
    {
      const kwFromLookup =
        toNumberOrNull(data.engine_power_kw) ??
        toNumberOrNull((data as Record<string, unknown>).enginePowerKw) ??
        toNumberOrNull(data.engine_power) ??
        toNumberOrNull((data as Record<string, unknown>).enginePower)
      if (kwFromLookup !== null) {
        form.value.powerKw = kwFromLookup
      }
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

    // Map previous usage (DMR sends `use.id` + `use.name`)
    if (data.use && typeof data.use === 'object') {
      const useId = toNumberOrNull((data.use as { id?: unknown }).id)
      const useName = (data.use as { name?: string }).name
      const byId = useId !== null ? vehicleUses.value.find(u => u.id === useId) : undefined
      const byName =
        useName != null && useName !== ''
          ? vehicleUses.value.find(u => u.name.toLowerCase() === useName.toLowerCase())
          : undefined
      const picked = byId ?? byName
      if (picked) {
        form.value.previousUsage = picked.name
      }
    }

    // Map gearbox: DMR may send `transmission` (name) or `gear_type_id` — persist as vehicles.gear_type_id
    if (data.transmission && typeof data.transmission === 'object' && data.transmission.name) {
      const tname = String(data.transmission.name).trim().toLowerCase()
      const byName = gearTypes.value.find(g => String(g.name || '').trim().toLowerCase() === tname)
      if (byName) {
        form.value.gearTypeId = byName.id
      }
      form.value.transmissionType = typeof data.transmission.name === 'string' ? data.transmission.name : ''
    } else if (data.gear_type_id) {
      const automaticId = gearTypes.value.find(g => g.name === 'Automatic')?.id
      form.value.gearTypeId = data.gear_type_id ?? automaticId ?? null
      const gearType = gearTypes.value.find(g => g.id === data.gear_type_id)
      if (gearType) {
        form.value.transmissionType = gearType.name
      }
    }

    // Map euro emission class - handle both object and string formats
    const euronormName = data.euronorm?.name || data.euronorm
    if (euronormName) {
      form.value.euroEmissionClass = typeof euronormName === 'string' ? euronormName : euronormName.name || ''
    }

    // Map fuel consumption (km/L from DMR)
    const kmpl = toNumberOrNull(data.km_per_liter)
    if (kmpl !== null) {
      form.value.fuelConsumption = kmpl
    }

    // CO₂ (g/km) — DMR key `co2_emission`
    const co2FromLookup =
      toNumberOrNull(data.co2_emission) ?? toNumberOrNull((data as Record<string, unknown>).co2_emissions)
    if (co2FromLookup !== null) {
      form.value.co2Emissions = co2FromLookup
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

    // Map equipment checkboxes from DMR `specifications[]` and/or `equipment[]` (name match)
    const matchApiEquipmentNamesToIds = (list: unknown): string[] => {
      const out: string[] = []
      if (!Array.isArray(list)) {
        return out
      }
      list.forEach((apiEquipment: { name?: string }) => {
        const rawName = apiEquipment?.name
        if (rawName == null || String(rawName).trim() === '') {
          return
        }
        const nameLower = String(rawName).toLowerCase()
        equipmentTypes.value.forEach(type => {
          type.equipments.forEach(dbEquipment => {
            if (dbEquipment.name.toLowerCase() === nameLower) {
              const id = dbEquipment.id.toString()
              if (!out.includes(id)) {
                out.push(id)
              }
            }
          })
        })
      })
      return out
    }
    const equipmentIdSet = new Set<string>(form.value.equipment || [])
    matchApiEquipmentNamesToIds(data.specifications).forEach(id => equipmentIdSet.add(id))
    matchApiEquipmentNamesToIds(data.equipment).forEach(id => equipmentIdSet.add(id))
    form.value.equipment = Array.from(equipmentIdSet)

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
    lookupError.value = error.response?.data?.message || error.message || t('dealer.views.addVehicle.failedFetchVehicleData')
  } finally {
    suppressLookupCascade.value = false
    lookupLoading.value = false
  }
}

const nextStep = async () => {
  if (currentStep.value < steps.value.length - 1) {
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
  if (index >= 0 && index < steps.value.length) {
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
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
  loadLookupData()
  loadDealerProfileForContact()
  // Ensure subscription features (and thus plan limits) are loaded for equipment/image limits
  try {
    const features = getSubscriptionFeatures()
    if (Object.keys(features).length === 0) {
      await loadSubscriptionFeatures()
    }
  } catch {
    // Ignore - limits will use defaults
  }
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

  const maxImages = maxVehicleImages.value
  if (maxImages <= 0) return

  const currentCount = form.value.images.length
  const remainingSlots = maxImages - currentCount
  
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
  
  // Add only as many as we can fit (up to plan limit)
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

const saveAsDraft = async () => {
  try {
    draftSaved.value = false
    submitError.value = null
    validationErrors.value = {}

    // DMR identity required by dealer create/update contract
    if (form.value.dmr_fact_vehicle_id == null) {
      submitError.value = t('dealer.views.addVehicle.fieldRequired')
      currentStep.value = 0
      return
    }

    // Convert form data to API format (similar to submitForm but without validation)
    const nummerpladeData = lookupData.value || {}
    const vehicleData: any = {}

    // Generate title from make, model, variant (if available)
    if (form.value.make || form.value.model) {
      const titleParts = [form.value.make, form.value.model, form.value.variant].filter(Boolean)
      vehicleData.title = titleParts.join(' ') || `${form.value.make || ''} ${form.value.model || ''}`.trim() || undefined
    }

    // Optional fields - only include if they have values
    if (form.value.dmr_fact_vehicle_id != null) {
      vehicleData.dmr_fact_vehicle_id = form.value.dmr_fact_vehicle_id
    }
    if (form.value.registrationNumber) {
      vehicleData.registration = form.value.registrationNumber
    }
    if (form.value.vin) {
      vehicleData.vin = form.value.vin
    }

    // Find brand_id from make name (if make is provided)
    if (form.value.make) {
      const brand = brands.value.find(b => b.name === form.value.make)
      if (brand) {
        vehicleData.brand_id = brand.id
      } else {
        // If brand not found, try to create it via brand_name
        vehicleData.brand_name = form.value.make
      }
    }

    // Model ID
    if (form.value.modelId) {
      vehicleData.model_id = form.value.modelId
    } else if (form.value.model && vehicleData.brand_id) {
      // Try to find model by name
      const model = models.value.find(m => 
        m.brand_id === vehicleData.brand_id && m.name === form.value.model
      )
      if (model) {
        vehicleData.model_id = model.id
      } else {
        vehicleData.model_name = form.value.model
      }
    }

    // Variant/Version
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
      }
    }

    // Fuel type (optional for draft)
    if (form.value.fuelType) {
      const fuelType = fuelTypes.value.find(f => f.name === form.value.fuelType)
      if (fuelType) {
        vehicleData.fuel_type_id = fuelType.id
      }
    }

    // Price (optional for draft, default to 0 if not provided)
    if (form.value.retailPrice !== null && form.value.retailPrice !== undefined) {
      vehicleData.price = toNumberOrNull(form.value.retailPrice) ?? 0
    } else {
      vehicleData.price = 0
    }

    // Odometer
    if (form.value.odometer !== null && form.value.odometer !== undefined) {
      const kmDriven = toNumberOrNull(form.value.odometer)
      if (kmDriven !== null) {
        vehicleData.km_driven = kmDriven
      }
    }

    // Description
    if (form.value.description) {
      vehicleData.description = form.value.description
    }

    // Images (optional for draft)
    if (form.value.images && form.value.images.length > 0) {
      vehicleData.images = form.value.images
    }

    // Equipment
    if (form.value.equipment && form.value.equipment.length > 0) {
      vehicleData.equipment_ids = form.value.equipment.map(id => parseInt(id))
    }

    // Model year from Nummerplade API if available
    if (nummerpladeData.model_year?.id) {
      const modelYearId = toNumberOrNull(nummerpladeData.model_year.id)
      if (modelYearId !== null) {
        vehicleData.model_year = modelYearId
      }
    } else if (typeof nummerpladeData.model_year === 'number') {
      const modelYearId = toNumberOrNull(nummerpladeData.model_year)
      if (modelYearId !== null) {
        vehicleData.model_year = modelYearId
      }
    }

    const draftRegMonth =
      form.value.firstRegistrationDate ||
      form.value.registrationDate ||
      ''
    if (draftRegMonth) {
      const [year, month] = draftRegMonth.split('-')
      vehicleData.first_registration_date = `${year}-${month}-01`
    } else if (nummerpladeData.first_registration_date) {
      vehicleData.first_registration_date = nummerpladeData.first_registration_date
    }

    if (form.value.productionDate) {
      const [year, month] = form.value.productionDate.split('-')
      vehicleData.production_date = `${year}-${month}-01`
    }

    if (form.value.lastInspectionDate) {
      const [year, month] = form.value.lastInspectionDate.split('-')
      vehicleData.last_inspection_date = `${year}-${month}-01`
    } else if (nummerpladeData.last_inspection_date) {
      vehicleData.last_inspection_date = nummerpladeData.last_inspection_date
    }

    if (form.value.powerKw !== null && form.value.powerKw !== undefined) {
      const enginePowerKw = toNumberOrNull(form.value.powerKw)
      if (enginePowerKw !== null) {
        vehicleData.engine_power_kw = enginePowerKw
      }
    }

    if (form.value.previousUsage) {
      const vehicleUse = vehicleUses.value.find(u => u.name === form.value.previousUsage)
      if (vehicleUse) {
        vehicleData.vehicle_use_id = vehicleUse.id
      }
    } else if (nummerpladeData.use?.id) {
      vehicleData.vehicle_use_id = nummerpladeData.use.id
    }

    if (form.value.co2Emissions !== null && form.value.co2Emissions !== undefined) {
      const co2Emissions = toNumberOrNull(form.value.co2Emissions)
      if (co2Emissions !== null) {
        vehicleData.co2_emission = co2Emissions
      }
    }

    if (form.value.fuelConsumptionWltp !== null && form.value.fuelConsumptionWltp !== undefined) {
      const w = toNumberOrNull(form.value.fuelConsumptionWltp)
      if (w !== null) {
        vehicleData.fuel_consumption_wltp = w
      }
    }
    if (form.value.fuelConsumptionNedc !== null && form.value.fuelConsumptionNedc !== undefined) {
      const n = toNumberOrNull(form.value.fuelConsumptionNedc)
      if (n !== null) {
        vehicleData.fuel_consumption_nedc = n
      }
    }

    if (form.value.fuelConsumption !== null && form.value.fuelConsumption !== undefined) {
      const fuelEfficiency = toNumberOrNull(form.value.fuelConsumption)
      if (fuelEfficiency !== null) {
        vehicleData.km_per_liter = fuelEfficiency
      }
    } else if (nummerpladeData.km_per_liter !== undefined && nummerpladeData.km_per_liter !== null) {
      const fuelEfficiency = toNumberOrNull(nummerpladeData.km_per_liter)
      if (fuelEfficiency !== null) {
        vehicleData.km_per_liter = fuelEfficiency
      }
    } else if (nummerpladeData.fuel_efficiency !== undefined && nummerpladeData.fuel_efficiency !== null) {
      const fuelEfficiency = toNumberOrNull(nummerpladeData.fuel_efficiency)
      if (fuelEfficiency !== null) {
        vehicleData.km_per_liter = fuelEfficiency
      }
    }

    // Towing weight
    if (nummerpladeData.towing_weight !== undefined && nummerpladeData.towing_weight !== null) {
      const towingWeight = toNumberOrNull(nummerpladeData.towing_weight)
      if (towingWeight !== null) {
        vehicleData.towing_weight = towingWeight
      }
    }

    // Pricing fields
    if (form.value.priceTypeId) {
      vehicleData.price_type_id = form.value.priceTypeId
    }
    if (form.value.conditionId) {
      vehicleData.condition_id = form.value.conditionId
    }
    if (form.value.salesTypeId) {
      vehicleData.sales_type_id = form.value.salesTypeId
    }
    if (form.value.sellerAddress) {
      vehicleData.seller_address = form.value.sellerAddress
    }
    if (form.value.sellerPostcode) {
      vehicleData.seller_postcode = form.value.sellerPostcode
    }
    if (form.value.sellerPhone) {
      vehicleData.seller_phone = form.value.sellerPhone
    }
    if (form.value.annualTax !== null && form.value.annualTax !== undefined) {
      const annualTax = toNumberOrNull(form.value.annualTax)
      if (annualTax !== null) {
        vehicleData.annual_tax = annualTax
      }
    }
    if (form.value.engineType) {
      vehicleData.engine_type = form.value.engineType
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
    if (form.value.priceWithoutTax !== null && form.value.priceWithoutTax !== undefined) {
      const p = toNumberOrNull(form.value.priceWithoutTax)
      if (p !== null) {
        vehicleData.price_without_tax = p
      }
    }
    vehicleData.wholesale_price_includes_delivery = !!form.value.wholesalePriceIncludesDelivery
    vehicleData.leasing_enabled = !!form.value.leasingEnabled
    if (form.value.leasingType) {
      vehicleData.leasing_type = form.value.leasingType
    }
    if (form.value.leasingCustomerType) {
      vehicleData.leasing_customer_type = form.value.leasingCustomerType
    }
    const dlm = toNumberOrNull(form.value.leasingMonthlyPayment)
    if (dlm !== null) {
      vehicleData.leasing_monthly_payment = dlm
    }
    const dlf = toNumberOrNull(form.value.leasingFirstPayment)
    if (dlf !== null) {
      vehicleData.leasing_first_payment = dlf
    }
    const dlr = toNumberOrNull(form.value.leasingResidualValue)
    if (dlr !== null) {
      vehicleData.leasing_residual_value = dlr
    }
    const dld = toNumberOrNull(form.value.leasingDuration)
    if (dld !== null) {
      vehicleData.leasing_duration = dld
    }
    const dla = toNumberOrNull(form.value.leasingAnnualMileage)
    if (dla !== null) {
      vehicleData.leasing_annual_mileage = dla
    }
    const dlt = toNumberOrNull(form.value.leasingTotalCost)
    if (dlt !== null) {
      vehicleData.leasing_total_cost = dlt
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
      const ci = toNumberOrNull(form.value.coverImageIndex)
      if (ci !== null) {
        vehicleData.cover_image_index = ci
      }
    }
    if (form.value.servicebog) {
      vehicleData.servicebog = form.value.servicebog
    }
    mergeDmrLookupVehicleFields(vehicleData, nummerpladeData)
    const defaultGearTypeId = gearTypes.value.find(g => g.name === 'Automatic')?.id
    if (form.value.gearTypeId != null || defaultGearTypeId != null) {
      vehicleData.gear_type_id = form.value.gearTypeId ?? defaultGearTypeId ?? null
    }

    appendLookupEquipmentAndSpecifications(vehicleData, nummerpladeData)

    // Check if we have an existing draft vehicle ID
    let savedVehicle: VehicleModel
    let message: string

    if (draftVehicleId.value) {
      // Update existing draft
      savedVehicle = await updateVehicle(draftVehicleId.value, vehicleData)
      message = t('dealer.views.addVehicle.draftUpdated')
    } else {
      // Create new draft
      savedVehicle = await createVehicleDraft(vehicleData)
      message = (savedVehicle as any).__message || t('dealer.views.addVehicle.draftSaved')
      // Store the draft vehicle ID for future updates
      draftVehicleId.value = savedVehicle.id
    }

    // Clear localStorage draft since it's now saved to the server
    localStorage.removeItem('add-vehicle-form-draft')
    hasUnsavedChanges.value = false
    
    // Show success message with API response message
    showSnackbar(message, 'success')
    
    // Also show the chip for visual feedback
    draftSaved.value = true
    setTimeout(() => {
      draftSaved.value = false
    }, 3000)
  } catch (error: any) {
    console.error('Failed to save draft:', error)
    const apiError = error as ApiErrorModel
    const errorMessage = getDisplayMessage(apiError)
    submitError.value = errorMessage
    showSnackbar(errorMessage, 'error')
    draftSaved.value = false
  }
}

const clearDraft = () => {
  // Clear localStorage draft
  localStorage.removeItem('add-vehicle-form-draft')
  
  // Reset draft vehicle ID
  draftVehicleId.value = null
  
  // Reset unsaved changes flag
  hasUnsavedChanges.value = false
  formSuccessfullySaved.value = false
  
  // Reset form to initial state
  form.value = {
    // Step 1
    make: '',
  model: '',
  modelId: null,
    variant: '',
    dmr_fact_vehicle_id: null,
    fuelType: '',
    fuelTypeId: null,
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
    gearTypeId: null,
    drivetrain: '',
    fuelConsumption: null,
    euroEmissionClass: '',
    servicebog: '',
    annualTax: null,
    
    // Step 4
    equipment: [],
    
  // Step 5
  priceTypeId: null,
  conditionId: 2,
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
    sellerAddress: '',
    sellerPostcode: '',
    sellerPhone: '',
    
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
  
  // Re-apply dealer profile contact pre-fill when empty
  loadDealerProfileForContact()
  
  // Reset description manual edit flag
  isDescriptionManuallyEdited.value = false
  
  // Clear any errors
  submitError.value = null
  validationErrors.value = {}
  
  models.value = []
  variants.value = []

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
  
  if (!allValid) {
    const invalidSteps = getInvalidSteps()
    const tabNames = invalidSteps.map(s => s.stepLabel).join(', ')
    submitError.value = t('dealer.views.addVehicle.completeRequiredFieldsIn', { tabs: tabNames })
    currentStep.value = invalidSteps[0]?.stepIndex ?? 0
    return
  }

  // DMR identity required by dealer create/update contract
  if (form.value.dmr_fact_vehicle_id == null) {
    const invalidSteps = getInvalidSteps()
    const tabNames = invalidSteps.map(s => s.stepLabel).join(', ')
    submitError.value = t('dealer.views.addVehicle.completeRequiredFieldsIn', { tabs: tabNames })
    currentStep.value = invalidSteps[0]?.stepIndex ?? 0
    return
  }

  if (!imagesValid.value) {
    submitError.value = t('dealer.views.addVehicle.minImagesRequired')
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
      submitError.value = t('dealer.views.addVehicle.selectValidMake')
      currentStep.value = 0
      return
    }

    // Find fuel_type_id from fuel type name
    const fuelType = fuelTypes.value.find(f => f.name === form.value.fuelType)
    if (!fuelType) {
      submitError.value = t('dealer.views.addVehicle.selectValidFuelType')
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
      dmr_fact_vehicle_id: form.value.dmr_fact_vehicle_id,
      registration: form.value.registrationNumber,
      vin: form.value.vin,
      brand_id: brand.id,
      model_id: form.value.modelId ?? undefined,
      fuel_type_id: fuelType.id,
      price: toNumberOrNull(form.value.retailPrice) ?? 0,
      km_driven: toNumberOrNull(form.value.odometer) ?? 0,
      description: form.value.description,
      images: form.value.images,
      equipment_ids: form.value.equipment.map(id => parseInt(id)),
      list_status_id: 2,
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
      }
    }
    const defaultGearTypeIdSubmit = gearTypes.value.find(g => g.name === 'Automatic')?.id
    vehicleData.gear_type_id = form.value.gearTypeId ?? defaultGearTypeIdSubmit ?? undefined

    // Add model_year from Nummerplade API if available
    if (nummerpladeData.model_year?.id) {
      const modelYearId = toNumberOrNull(nummerpladeData.model_year.id)
      if (modelYearId !== null) {
        vehicleData.model_year = modelYearId
      }
    } else if (typeof nummerpladeData.model_year === 'number') {
      const modelYearId = toNumberOrNull(nummerpladeData.model_year)
      if (modelYearId !== null) {
        vehicleData.model_year = modelYearId
      }
    }

    // Add towing_weight from Nummerplade API if available (including 0)
    if (nummerpladeData.towing_weight !== undefined && nummerpladeData.towing_weight !== null) {
      const towingWeight = toNumberOrNull(nummerpladeData.towing_weight)
      if (towingWeight !== null) {
        vehicleData.towing_weight = towingWeight
      }
    }

    // Add km_per_liter from Nummerplade API if available (convert km/L to L/100km if needed)
    // km_per_liter maps to vehicles.km_per_liter
    if (form.value.fuelConsumption !== null && form.value.fuelConsumption !== undefined) {
      const fuelEfficiency = toNumberOrNull(form.value.fuelConsumption)
      if (fuelEfficiency !== null) {
        vehicleData.km_per_liter = fuelEfficiency
      }
    } else if (nummerpladeData.km_per_liter !== undefined && nummerpladeData.km_per_liter !== null) {
      const fuelEfficiency = toNumberOrNull(nummerpladeData.km_per_liter)
      if (fuelEfficiency !== null) {
        vehicleData.km_per_liter = fuelEfficiency
      }
    } else if (nummerpladeData.fuel_efficiency !== undefined && nummerpladeData.fuel_efficiency !== null) {
      // Nummerplade legacy key — km/L
      const fuelEfficiency = toNumberOrNull(nummerpladeData.fuel_efficiency)
      if (fuelEfficiency !== null) {
        vehicleData.km_per_liter = fuelEfficiency
      }
    }

    // first_registration_date: identity tab month (registrationDate) or details tab (firstRegistrationDate)
    const regMonth =
      form.value.firstRegistrationDate ||
      form.value.registrationDate ||
      ''
    if (regMonth) {
      const [year, month] = regMonth.split('-')
      vehicleData.first_registration_date = `${year}-${month}-01`
    } else if (nummerpladeData.first_registration_date) {
      vehicleData.first_registration_date = nummerpladeData.first_registration_date
    }
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

    if (form.value.powerKw !== null && form.value.powerKw !== undefined) {
      const enginePowerKw = toNumberOrNull(form.value.powerKw)
      if (enginePowerKw !== null) {
        vehicleData.engine_power_kw = enginePowerKw
      }
    }

    if (form.value.previousUsage) {
      const vehicleUse = vehicleUses.value.find(u => u.name === form.value.previousUsage)
      if (vehicleUse) {
        vehicleData.vehicle_use_id = vehicleUse.id
      }
    } else if (nummerpladeData.use?.id) {
      vehicleData.vehicle_use_id = nummerpladeData.use.id
    } else if (nummerpladeData.use?.name) {
      const vehicleUse = vehicleUses.value.find(u =>
        u.name.toLowerCase() === nummerpladeData.use.name.toLowerCase()
      )
      if (vehicleUse) {
        vehicleData.vehicle_use_id = vehicleUse.id
      }
    }

    if (form.value.co2Emissions !== null && form.value.co2Emissions !== undefined) {
      const co2Emissions = toNumberOrNull(form.value.co2Emissions)
      if (co2Emissions !== null) {
        vehicleData.co2_emission = co2Emissions
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
    // km_per_liter is already set above from form or API data
    if (form.value.euroEmissionClass) {
      const euroEmissionValue = String(form.value.euroEmissionClass).trim()
      if (/^\d+$/.test(euroEmissionValue)) {
        vehicleData.emission_norm_id = Number(euroEmissionValue)
      }
    }
    if (form.value.engineType) {
      vehicleData.engine_type = form.value.engineType
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
    if (form.value.sellerAddress) {
      vehicleData.seller_address = form.value.sellerAddress
    }
    if (form.value.sellerPostcode) {
      vehicleData.seller_postcode = form.value.sellerPostcode
    }
    if (form.value.sellerPhone) {
      vehicleData.seller_phone = form.value.sellerPhone
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

    if (form.value.priceWithoutTax !== null && form.value.priceWithoutTax !== undefined) {
      const p = toNumberOrNull(form.value.priceWithoutTax)
      if (p !== null) {
        vehicleData.price_without_tax = p
      }
    }
    vehicleData.wholesale_price_includes_delivery = !!form.value.wholesalePriceIncludesDelivery

    vehicleData.leasing_enabled = !!form.value.leasingEnabled
    if (form.value.leasingType) {
      vehicleData.leasing_type = form.value.leasingType
    }
    if (form.value.leasingCustomerType) {
      vehicleData.leasing_customer_type = form.value.leasingCustomerType
    }
    const lm = toNumberOrNull(form.value.leasingMonthlyPayment)
    if (lm !== null) {
      vehicleData.leasing_monthly_payment = lm
    }
    const lf = toNumberOrNull(form.value.leasingFirstPayment)
    if (lf !== null) {
      vehicleData.leasing_first_payment = lf
    }
    const lr = toNumberOrNull(form.value.leasingResidualValue)
    if (lr !== null) {
      vehicleData.leasing_residual_value = lr
    }
    const ld = toNumberOrNull(form.value.leasingDuration)
    if (ld !== null) {
      vehicleData.leasing_duration = ld
    }
    const la = toNumberOrNull(form.value.leasingAnnualMileage)
    if (la !== null) {
      vehicleData.leasing_annual_mileage = la
    }
    const lt = toNumberOrNull(form.value.leasingTotalCost)
    if (lt !== null) {
      vehicleData.leasing_total_cost = lt
    }

    mergeDmrLookupVehicleFields(vehicleData, nummerpladeData)

    if (form.value.servicebog) {
      vehicleData.servicebog = form.value.servicebog
    }
    if (form.value.annualTax !== null && form.value.annualTax !== undefined) {
      const annualTax = toNumberOrNull(form.value.annualTax)
      if (annualTax !== null) {
        vehicleData.annual_tax = annualTax
      }
    } else if (nummerpladeData.annual_tax !== undefined && nummerpladeData.annual_tax !== null && vehicleData.annual_tax == null) {
      const annualTax = toNumberOrNull(nummerpladeData.annual_tax)
      if (annualTax !== null) {
        vehicleData.annual_tax = annualTax
      }
    }

    appendLookupEquipmentAndSpecifications(vehicleData, nummerpladeData)

    await createVehicle(vehicleData)

    // Clear draft and mark as saved
    localStorage.removeItem('add-vehicle-form-draft')
    hasUnsavedChanges.value = false
    formSuccessfullySaved.value = true
    
    // Show success dialog instead of immediately navigating
    showSuccessDialog.value = true
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
      submitError.value = getDisplayMessage(apiError)
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } finally {
    submitting.value = false
  }
}

watch(
  () => form.value.make,
  async (newMake, oldMake) => {
    if (suppressLookupCascade.value) return
    if (newMake === oldMake) return
    const brand = brands.value.find(b => b.name === newMake)
    const brandId = brand?.id ?? null
    form.value.modelId = null
    form.value.model = ''
    form.value.variant = ''
    variants.value = []
    if (!brandId) {
      models.value = []
      return
    }
    await loadModelsForBrand(brandId)
  }
)

watch(
  () => form.value.modelId,
  async (newModelId, oldModelId) => {
    if (suppressLookupCascade.value) return
    if (newModelId === oldModelId) return
    form.value.variant = ''
    if (!newModelId) {
      form.value.model = ''
      variants.value = []
      return
    }
    const selectedModel = models.value.find(model => model.id === newModelId)
    if (selectedModel) {
      form.value.model = selectedModel.name
    }
    await loadVariantsForModel(newModelId)
  }
)

watch(
  () => [models.value, form.value.model, form.value.make],
  () => {
    if (suppressLookupCascade.value) return
    syncModelIdFromName()
  },
  { deep: true }
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

// Watch for manual entry mode to reset saved flag
watch(
  () => manualEntryMode.value,
  (isManual) => {
    if (isManual) {
      formSuccessfullySaved.value = false
    }
  }
)

// Watch for lookup success to reset saved flag when starting new lookup
watch(
  () => lookupSuccess.value,
  (isSuccess) => {
    if (isSuccess && !formSuccessfullySaved.value) {
      // Only reset if we're starting a new lookup (not after save)
      // This is handled in performLookup already
    }
  }
)

// Auto-save draft on form changes (debounced)
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null
watch(
  () => form.value,
  () => {
    // Mark as having unsaved changes
    hasUnsavedChanges.value = checkUnsavedChanges()
    
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

// Success dialog handlers
const goToVehiclesList = () => {
  showSuccessDialog.value = false
  // Form is already saved, allow navigation without confirmation
  formSuccessfullySaved.value = true
  router.push({ name: 'dealer.vehicles.overview' })
}

const addAnotherVehicle = () => {
  showSuccessDialog.value = false
  // Reset form and start over
  clearDraft()
  lookupSuccess.value = false
  lookupData.value = null
  lookupError.value = null
  manualEntryMode.value = false
  lookupForm.value.registrationNumber = ''
  currentStep.value = 0
  visitedSteps.value = new Set([0])
  // Reset description manual edit flag
  isDescriptionManuallyEdited.value = false
  // Clear any errors
  submitError.value = null
  validationErrors.value = {}
  // Reset saved flag since we're starting fresh
  formSuccessfullySaved.value = false
}

// Check if form has unsaved changes
const checkUnsavedChanges = (): boolean => {
  // If form was successfully saved, no unsaved changes
  if (formSuccessfullySaved.value) {
    return false
  }
  
  // Only check for unsaved changes if the form is actually open
  if (!showFormFields.value) {
    return false
  }
  
  // Check if any form field has been filled
  const hasData = Boolean(
    form.value.make ||
      form.value.model ||
      form.value.variant ||
      form.value.registrationNumber ||
      form.value.vin ||
      form.value.odometer !== null ||
      form.value.retailPrice !== null ||
      form.value.description ||
      form.value.images.length > 0 ||
      form.value.equipment.length > 0
  )
  
  return hasData && !showSuccessDialog.value
}

// Handle beforeunload to warn about unsaved changes
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (checkUnsavedChanges()) {
    event.preventDefault()
    // Modern browsers ignore custom messages, but we can still trigger the dialog
    event.returnValue = ''
    return ''
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  // Cleanup keyboard listener
  window.removeEventListener('keydown', handleKeydown)
  
  // Cleanup beforeunload listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
  
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
      // Mark as having unsaved changes if draft was loaded
      hasUnsavedChanges.value = checkUnsavedChanges()
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

loadDraft()

// Router guard to prevent navigation away with unsaved changes
onBeforeRouteLeave((to, from, next) => {
  if (checkUnsavedChanges() && !showSuccessDialog.value) {
    const confirmed = window.confirm(
      t('dealer.views.addVehicle.unsavedChanges')
    )
    if (confirmed) {
      // Auto-save draft before leaving
      const draftData = { ...form.value, images: [] }
      localStorage.setItem('add-vehicle-form-draft', JSON.stringify(draftData))
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>

<style scoped>
/* Equipment section - match sell-your-car design (collapsible by type) */
.equipment-panels {
  margin-top: 0.5rem;
}

.equipment-type-panel {
  margin-bottom: 0.5rem;
  border: 1px solid rgba(var(--v-border-color), 0.4);
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.equipment-type-panel:last-child {
  margin-bottom: 0;
}

.equipment-type-title {
  min-height: 48px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  color: rgba(var(--v-theme-on-surface), 0.85) !important;
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
  transition: background 0.2s ease, color 0.2s ease !important;
}

.equipment-type-title:hover {
  background: rgba(var(--v-theme-on-surface), 0.07) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

.equipment-type-name {
  flex: 1;
}

.equipment-type-badge {
  margin-left: 0.5rem;
}

.equipment-type-content {
  padding: 1rem !important;
  border-top: 1px solid rgba(var(--v-border-color), 0.4) !important;
  background: rgb(var(--v-theme-surface));
}

.equipment-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.equipment-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(var(--v-border-color), 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(var(--v-theme-on-surface), 0.02);
  color: rgb(var(--v-theme-on-surface));
}

.equipment-chip:hover {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.equipment-chip:has(.v-selection-control-group--dirty) {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

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
  font-size: 0.75rem;
  color: inherit;
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

/* Success Dialog Styles */
.success-dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.success-icon-container {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  animation: successIconPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
}

@keyframes successIconPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-content {
  background-color: rgb(var(--v-theme-surface));
}

.success-content h3 {
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.success-content p {
  line-height: 1.6;
  max-width: 100%;
}

.success-dialog-card :deep(.v-btn) {
  font-weight: 500;
  letter-spacing: 0.01em;
  min-height: 44px;
}

.success-dialog-card :deep(.v-btn--variant-elevated) {
  box-shadow: 0 4px 12px rgba(0, 74, 173, 0.25);
}

.success-dialog-card :deep(.v-btn--variant-elevated:hover) {
  box-shadow: 0 6px 16px rgba(0, 74, 173, 0.35);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.success-dialog-card :deep(.v-btn--variant-outlined:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  transform: translateY(-1px);
  transition: all 0.2s ease;
}
</style>
