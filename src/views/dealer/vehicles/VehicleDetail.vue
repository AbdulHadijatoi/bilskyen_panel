<template>
  <div class="panel-page vehicle-detail-container">
    <!-- Header Section -->
    <PageHeader :title="t('dealer.views.vehicleDetail.title')" :subtitle="t('dealer.views.vehicleDetail.viewSubtitle')" show-back />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-3">{{ t('dealer.views.vehicleDetail.loadingVehicle') }}</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      prominent
      class="mb-4"
      density="compact"
    >
      <v-alert-title>{{ t('dealer.views.vehicleDetail.error') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Vehicle Content -->
    <div v-else-if="vehicle" class="vehicle-content">
      <v-alert
        v-if="showExpiryBanner"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ expiryBannerText }}
        <template #append>
          <v-btn
            color="warning"
            variant="flat"
            size="small"
            :loading="renewingListing"
            @click="handleRenewListing"
          >
            {{ t('dealer.views.vehicleDetail.renewListing') }}
          </v-btn>
        </template>
      </v-alert>
      <!-- Vehicle Profile Header Card -->
      <v-card
        variant="flat"
        class="profile-header-card panel-card mb-4"
        elevation="0"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center gap-4 header-content">
            <!-- Vehicle Image -->
            <div class="vehicle-image">
              <v-img
                v-if="sortedVehicleImages.length > 0"
                :src="sortedVehicleImages[0]?.url || sortedVehicleImages[0]?.thumbnailUrl"
                :alt="vehicle.title"
                cover
                width="100"
                height="100"
                style="border-radius: 8px;"
              />
              <div
                v-else
                class="no-image-placeholder"
                style="width: 100px; height: 100px; border-radius: 8px; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;"
              >
                <v-icon size="40" color="medium-emphasis">mdi-car</v-icon>
              </div>
            </div>
            
            <!-- Vehicle Info -->
            <div class="flex-grow-1 vehicle-info-section">
              <h2 class="text-h6 font-weight-bold mb-1 vehicle-title">{{ vehicle.title || '-' }}</h2>
              <div class="d-flex align-center gap-3 flex-wrap vehicle-metadata">
                <!-- <div class="d-flex align-center gap-1">
                  <v-icon size="16" color="medium-emphasis">mdi-identifier</v-icon>
                  <span class="text-caption">#{{ vehicle.id }}</span>
                </div> -->
                <div v-if="vehicle.registration" class="d-flex align-center gap-1">
                  <v-icon size="16" color="medium-emphasis">mdi-numeric</v-icon>
                  <span class="text-caption">{{ vehicle.registration }}</span>
                </div>
                <div v-if="vehicle.price" class="d-flex align-center gap-1 price-highlight">
                  <v-icon size="16" color="primary">mdi-cash</v-icon>
                  <span class="text-caption font-weight-bold price-text">{{ formatPrice(vehicle.price) }}</span>
                </div>
                <v-tooltip
                  v-if="fairPriceLabel"
                  :text="fairPriceTooltip"
                  location="top"
                  max-width="320"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-chip
                      v-bind="tooltipProps"
                      size="x-small"
                      color="info"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ fairPriceLabel }}
                    </v-chip>
                  </template>
                </v-tooltip>
                <v-tooltip
                  v-if="listingHealthScore !== null"
                  :text="t('dealer.views.vehicleDetail.listingHealthTooltip')"
                  location="top"
                  max-width="320"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-chip
                      v-bind="tooltipProps"
                      size="x-small"
                      :color="listingHealthScore >= 70 ? 'success' : 'warning'"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ t('dealer.views.dashboard.listingHealthScore') }}: {{ listingHealthScore }}
                    </v-chip>
                  </template>
                </v-tooltip>
                <div class="d-flex align-center gap-1 views-highlight">
                  <v-icon size="16" color="info">mdi-eye</v-icon>
                  <span class="text-caption text-medium-emphasis">{{ t('dealer.views.vehicleDetail.viewsCount') }}</span>
                  <span class="text-caption font-weight-bold views-text">{{ formatNumber(vehicle.viewsCount ?? 0) }}</span>
                </div>
                <div>
                  <v-chip
                    :color="getStatusColor(vehicle.status || vehicle.vehicleListStatusName, vehicle.vehicleListStatusId)"
                    size="x-small"
                    variant="flat"
                    prepend-icon="mdi-circle"
                  >
                    {{ translateStatus(vehicle.status || vehicle.vehicleListStatusName, t, vehicle.vehicleListStatusId) }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div v-if="!editMode" class="quick-actions d-flex gap-2 flex-wrap">
              <v-btn
                v-if="vehicle.status?.toLowerCase() !== VehicleStatusEnum.SOLD && vehicle.vehicleListStatusName?.toLowerCase() !== VehicleStatusEnum.SOLD"
                color="primary"
                variant="flat"
                prepend-icon="mdi-pencil"
                @click="startEdit"
                size="small"
              >
                {{ t('dealer.views.vehicleDetail.editVehicle') }}
              </v-btn>
              <v-btn
                v-if="vehicle.status?.toLowerCase() !== VehicleStatusEnum.SOLD && vehicle.vehicleListStatusName?.toLowerCase() !== VehicleStatusEnum.SOLD"
                color="success"
                variant="outlined"
                prepend-icon="mdi-check-circle"
                @click="showMarkAsSoldDialog = true"
                size="small"
              >
                Mark as Sold
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-update"
                @click="showStatusDialog = true"
                size="small"
              >
                Change Status
              </v-btn>
              <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete"
                @click="confirmDeleteVehicle"
                size="small"
              >
                Delete
              </v-btn>
            </div>
            <div v-else class="quick-actions d-flex gap-2">
              <v-btn
                variant="outlined"
                @click="cancelEdit"
                size="small"
              >
                {{ t('common.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                :loading="updating"
                @click="saveVehicle"
                size="small"
              >
                {{ t('dealer.views.vehicleDetail.save') }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Content Grid -->
      <v-row>
        <!-- Left Column - Vehicle Information -->
        <v-col cols="12" lg="8">
          <!-- Basic Information Card -->
          <v-card
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-information</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.basicInformation') }}</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.titleLabel') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.title) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.title"
                    :label="t('dealer.views.vehicleDetail.titleLabel')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.registration') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.registration) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.registration"
                    :label="t('dealer.views.vehicleDetail.registration')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.price') }}</div>
                    <div class="field-value font-weight-medium">{{ vehicle.price ? formatPrice(vehicle.price) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.price"
                    :label="t('dealer.views.vehicleDetail.price')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.brand') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.brandName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.brand_id"
                    :items="brands"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.brand')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    @update:model-value="onBrandChange"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.model') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.modelName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.model_id"
                    :items="models"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.model')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :disabled="!vehicleData.brand_id"
                    :loading="modelsLoading"
                    @update:model-value="onModelChange"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.variant') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.variant_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.variant_id"
                    :items="variants"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.variant')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :disabled="!vehicleData.model_id"
                    :loading="variantsLoading"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.modelYear') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.modelYearName || vehicle.modelYearId) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.model_year"
                    :items="modelYears"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.modelYear')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.kmDriven') }}</div>
                    <div class="field-value">{{ vehicle.kmDriven ? formatNumber(vehicle.kmDriven) + ' km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.km_driven"
                    :label="t('dealer.views.vehicleDetail.kmDriven')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.fuelType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.fuelTypeName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.fuel_type_id"
                    :items="fuelTypes"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.fuelType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.status') }}</div>
                    <v-chip
                      v-if="vehicle.status || vehicle.vehicleListStatusName"
                      :color="getStatusColor(vehicle.status || vehicle.vehicleListStatusName, vehicle.vehicleListStatusId)"
                      size="x-small"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ translateStatus(vehicle.status || vehicle.vehicleListStatusName, t, vehicle.vehicleListStatusId) }}
                    </v-chip>
                    <div v-else class="field-value"></div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.list_status_id"
                    :items="localizedVehicleListStatuses"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.status')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Vehicle Specifications Card -->
          <v-card
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-cog</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.specifications') }}</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.enginePowerHp') }}</div>
                    <div class="field-value">{{
                      vehicle.enginePowerHp != null
                        ? vehicle.enginePowerHp + ' HP'
                        : vehicle.enginePowerKw != null
                          ? vehicle.enginePowerKw + ' kW'
                          : '-'
                    }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.engine_power_kw"
                    :label="t('dealer.views.vehicleDetail.enginePowerHp') + ' (kW)'"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.towingWeightKg') }}</div>
                    <div class="field-value">{{ vehicle.towingWeight ? formatNumber(vehicle.towingWeight) + ' kg' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.towing_weight"
                    :label="t('dealer.views.vehicleDetail.towingWeightKg')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.batteryCapacityKwh') }}</div>
                    <div class="field-value">{{ vehicle.batteryCapacity ? vehicle.batteryCapacity + ' kWh' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.battery_capacity"
                    :label="t('dealer.views.vehicleDetail.batteryCapacityKwh')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.rangeKm') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.rangeKm) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.range_km"
                    :label="t('dealer.views.vehicleDetail.rangeKm')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col v-if="showChargingTypeField" cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.chargingType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.chargingType) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.charging_type"
                    :label="t('dealer.views.vehicleDetail.chargingType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.ownershipTax') }}</div>
                    <div class="field-value">
                      {{ vehicle.ownershipTax != null ? formatPrice(Number(vehicle.ownershipTax)) : '-' }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.firstRegistrationDate') }}</div>
                    <div class="field-value">{{ vehicle.firstRegistrationDate ? formatDate(vehicle.firstRegistrationDate) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.first_registration_date"
                    :label="t('dealer.views.vehicleDetail.firstRegistrationDate')"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.fuelEfficiency') }}</div>
                    <div class="field-value">{{ vehicle.fuelEfficiency ? vehicle.fuelEfficiency + ' L/100km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.km_per_liter"
                    :label="t('dealer.views.vehicleDetail.fuelEfficiency')"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.co2Emissions') }}</div>
                    <div class="field-value">{{ vehicle.details?.co2_emissions ? vehicle.details.co2_emissions + ' g/km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.co2_emission"
                    :label="t('dealer.views.vehicleDetail.co2Emissions')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.fuelConsumptionWltp') }}</div>
                    <div class="field-value">{{ vehicle.details?.fuel_consumption_wltp ? vehicle.details.fuel_consumption_wltp + ' L/100km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.fuel_consumption_wltp"
                    :label="t('dealer.views.vehicleDetail.fuelConsumptionWltp')"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.fuelConsumptionNedc') }}</div>
                    <div class="field-value">{{ vehicle.details?.fuel_consumption_nedc ? vehicle.details.fuel_consumption_nedc + ' L/100km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.fuel_consumption_nedc"
                    :label="t('dealer.views.vehicleDetail.fuelConsumptionNedc')"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.gearType') }}</div>
                    <div class="field-value">{{ translateTransmission(vehicle.gearTypeName, t) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.gear_type_id"
                    :items="gearTypes"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.gearType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.engineType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.engine_type) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.engine_type"
                    :label="t('dealer.views.vehicleDetail.engineType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.euroEmissionClass') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.euronom_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.emission_norm_id"
                    :items="euronorms"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.euroEmissionClass')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.previousUsage') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.use_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.vehicle_use_id"
                    :items="vehicleUses"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.previousUsage')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Vehicle Details Card -->
          <v-card
            v-if="vehicle.details"
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-file-document-edit</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.detailsSection') }}</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.description') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.description) }}</div>
                  </div>
                  <v-textarea
                    v-else
                    v-model="vehicleData.description"
                    :label="t('dealer.views.vehicleDetail.description')"
                    variant="outlined"
                    density="compact"
                    rows="4"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.color') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.color_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.colour_id"
                    :items="colors"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.color')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.bodyType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.body_type_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.body_type_id"
                    :items="bodyTypes"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.bodyType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.productionDate') }}</div>
                    <div class="field-value">{{ vehicle.details?.production_date ? formatDate(vehicle.details.production_date) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.production_date"
                    :label="t('dealer.views.vehicleDetail.productionDate')"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.lastInspectionDate') }}</div>
                    <div class="field-value">{{ vehicle.details?.last_inspection_date ? formatDate(vehicle.details.last_inspection_date) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.last_inspection_date"
                    :label="t('dealer.views.vehicleDetail.lastInspectionDate')"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.isImport') }}</div>
                    <div class="field-value">{{ vehicle.details?.is_import ? t('common.yes') : t('common.no') }}</div>
                  </div>
                  <v-checkbox
                    v-else
                    v-model="vehicleData.is_import"
                    :label="t('dealer.views.vehicleDetail.isImport')"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.isFactoryNew') }}</div>
                    <div class="field-value">{{ vehicle.details?.is_factory_new ? t('common.yes') : t('common.no') }}</div>
                  </div>
                  <v-checkbox
                    v-else
                    v-model="vehicleData.is_factory_new"
                    :label="t('dealer.views.vehicleDetail.isFactoryNew')"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Pricing Information Card -->
          <v-card
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-cash</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.pricingInformation') }}</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.priceType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.price_type_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.price_type_id"
                    :items="priceTypes"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.priceType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.condition') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.condition_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.condition_id"
                    :items="conditions"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.condition')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.salesType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.sales_type_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.sales_type_id"
                    :items="salesTypes"
                    item-title="name"
                    item-value="id"
                    :label="t('dealer.views.vehicleDetail.salesType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.vehicleDetail.internalCostPrice') }}</div>
                    <div class="field-value">{{ vehicle.details?.internal_cost_price ? formatPrice(vehicle.details.internal_cost_price) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.internal_cost_price"
                    :label="t('dealer.views.vehicleDetail.internalCostPrice')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card
            v-if="showLeasingBlock"
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-calendar-clock</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.addVehicle.leasingDetails') }}</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.leasingType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.leasing_type) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.leasing_type"
                    :label="t('dealer.views.addVehicle.leasingType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.customerType') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.leasing_customer_type) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.leasing_customer_type"
                    :label="t('dealer.views.addVehicle.customerType')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.firstPayment') }}</div>
                    <div class="field-value">{{ vehicle.details?.leasing_first_payment != null ? formatPrice(Number(vehicle.details.leasing_first_payment)) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_first_payment"
                    :label="t('dealer.views.addVehicle.firstPayment')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.residualValue') }}</div>
                    <div class="field-value">{{ vehicle.details?.leasing_residual_value != null ? formatPrice(Number(vehicle.details.leasing_residual_value)) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_residual_value"
                    :label="t('dealer.views.addVehicle.residualValue')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.durationMonths') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.leasing_duration) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_duration"
                    :label="t('dealer.views.addVehicle.durationMonths')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.annualMileage') }}</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.leasing_annual_mileage) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_annual_mileage"
                    :label="t('dealer.views.addVehicle.annualMileage')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">{{ t('dealer.views.addVehicle.totalCostOverTerm') }}</div>
                    <div class="field-value">{{ vehicle.details?.leasing_total_cost != null ? formatPrice(Number(vehicle.details.leasing_total_cost)) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_total_cost"
                    :label="t('dealer.views.addVehicle.totalCostOverTerm')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <div
            v-if="canSeePricingIntelligence"
            id="vehicle-price"
            class="mb-3"
          >
            <PricingIntelligencePanel
              :vehicle-id="vehicle.id"
              :current-price="vehicle.price"
              :pricing="pricingIntelligence"
              @applied="onSuggestedPriceApplied"
            />
          </div>

          <div v-if="canSeeListingBoost" class="mb-3">
            <ListingBoostPanel
              :vehicle-id="vehicle.id"
              :meta="listingBoostMeta"
              @boosted="onListingBoosted"
            />
          </div>

          <!-- Images Management Card -->
          <v-card
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-image-multiple</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.vehicleImages') }}</span>
              <v-spacer />
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-upload"
                size="x-small"
                @click="showImageUploadDialog = true"
              >
                Upload
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-alert
                v-if="sortedVehicleImages.length === 0"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-2"
              >
                {{ t('vehicleGallery.noFeaturedImage') }}
              </v-alert>
              <div v-if="vehicleImages.length === 0" class="text-center text-medium-emphasis text-caption py-2">
                No images available
              </div>
              <div v-else class="images-grid">
                <div
                  v-for="(image, imgIndex) in sortedVehicleImages"
                  :key="image.id"
                  class="image-item image-drag-item"
                  :class="{
                    dragging: draggedImageIndex === imgIndex,
                    'drag-over': dragOverIndex === imgIndex,
                  }"
                  draggable="true"
                  @dragstart="handleImageDragStart(imgIndex, $event)"
                  @dragover.prevent="handleImageDragOver"
                  @dragenter.prevent="handleImageDragEnter(imgIndex)"
                  @dragleave="handleImageDragLeave"
                  @drop.prevent="handleImageDrop(imgIndex)"
                  @dragend="handleImageDragEnd"
                >
                  <v-img
                    :src="image.url || image.thumbnailUrl"
                    :alt="`Vehicle image ${image.id}`"
                    cover
                    width="120"
                    height="120"
                    style="border-radius: 4px;"
                  />
                  <v-chip
                    v-if="imgIndex === 0"
                    size="x-small"
                    color="primary"
                    variant="flat"
                    class="featured-image-badge"
                  >
                    <v-icon start size="12">mdi-star</v-icon>
                    {{ t('vehicleGallery.setAsFeatured') }}
                  </v-chip>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    size="x-small"
                    class="delete-image-btn"
                    @click="confirmDeleteImage(image)"
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Video URL Card -->
          <v-card variant="flat" class="info-card panel-card mb-3" elevation="0">
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-video</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.videoTitle') }}</span>
              <v-spacer />
              <v-btn
                color="primary"
                variant="outlined"
                size="x-small"
                :loading="savingVideo"
                @click="saveVideoUrl"
              >
                {{ t('common.save') }}
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-text-field
                v-model="videoUrlInput"
                :label="t('dealer.views.vehicleDetail.videoUrlLabel')"
                placeholder="https://www.youtube.com/watch?v=..."
                variant="outlined"
                density="compact"
                hide-details
              />
              <p v-if="vehicle?.videoProvider" class="text-caption text-medium-emphasis mt-2 mb-0">
                {{ t('dealer.views.vehicleDetail.videoProvider') }}: {{ vehicle.videoProvider }}
              </p>
            </v-card-text>
          </v-card>

          <!-- 3D View Card -->
          <v-card
            v-if="canUpload3dView"
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-rotate-3d</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.view3dTitle') }}</span>
              <v-spacer />
              <v-btn
                v-if="vehicle?.view3dUrl"
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete"
                size="x-small"
                class="mr-2"
                @click="openRemove3dDialog"
              >
                {{ t('dealer.views.vehicleDetail.remove3dView') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-upload"
                size="x-small"
                @click="open3dUploadDialog"
              >
                {{ vehicle?.view3dUrl ? t('dealer.views.vehicleDetail.update3dView') : t('dealer.views.vehicleDetail.add3dView') }}
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-3">
              <div v-if="vehicle?.view3dUrl" class="text-body-2">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  class="px-0"
                  prepend-icon="mdi-rotate-3d"
                  @click="show3dPreviewDialog = true"
                >
                  {{ t('dealer.views.vehicleDetail.view3dLink') }}
                </v-btn>
              </div>
              <div v-else class="text-caption text-medium-emphasis">
                {{ t('dealer.views.vehicleDetail.no3dView') }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Equipment Management Card -->
          <v-card
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-cog</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.equipment') }}</span>
              <v-spacer />
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                size="x-small"
                @click="showEquipmentDialog = true"
              >
                Edit
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-3">
              <div v-if="vehicle.equipment && Array.isArray(vehicle.equipment) && vehicle.equipment.length > 0">
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="(eq, index) in vehicle.equipment"
                    :key="index"
                    color="primary"
                    size="x-small"
                    variant="flat"
                  >
                    {{ typeof eq === 'object' ? eq.name : eq }}
                  </v-chip>
                </div>
              </div>
              <div v-else class="text-medium-emphasis text-caption">
                {{ t('dealer.views.vehicleDetail.noEquipment') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Additional Information -->
        <v-col cols="12" lg="4">
          <!-- Vehicle Information Sidebar -->
          <v-card
            variant="flat"
            class="info-card panel-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-information-outline</v-icon>
              <span class="text-subtitle-1">{{ t('dealer.views.vehicleDetail.information') }}</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <div class="info-list">
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-calendar-plus</v-icon>
                    {{ t('common.createdAt') }}
                  </div>
                  <div class="info-item-value">
                    {{ vehicle.createdAt ? formatDate(vehicle.createdAt) : '-' }}
                  </div>
                </div>
                <v-divider class="my-2" />
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-calendar-edit</v-icon>
                    {{ t('common.updatedAt') }}
                  </div>
                  <div class="info-item-value">
                    {{ vehicle.updatedAt ? formatDate(vehicle.updatedAt) : '-' }}
                  </div>
                </div>
                
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Image Upload Dialog -->
    <PanelDialog v-model="showImageUploadDialog" :max-width="500">
      <template #header>
        <div class="panel-dialog__title-row">
          <v-icon color="primary" size="20" class="panel-dialog__icon">mdi-upload</v-icon>
          <h2 class="panel-dialog__title">{{ t('dealer.views.vehicleDetail.uploadVehicleImages') }}</h2>
          <v-chip v-if="maxVehicleImages > 0" size="x-small" class="ml-2" color="primary" variant="tonal">
            {{ vehicleImages.length }}/{{ maxVehicleImages }}
          </v-chip>
        </div>
      </template>
      <v-file-input
        v-model="imageFiles"
        :label="t('dealer.views.vehicleDetail.selectImages')"
        multiple
        accept="image/*"
        variant="outlined"
        density="compact"
        prepend-icon="mdi-image"
        hide-details="auto"
        :hint="maxVehicleImages > 0 ? t('dealer.views.vehicleDetail.moreImagesSlotHint', { count: remainingImageSlots }) : undefined"
      />
      <template #footer>
        <PanelButton variant="ghost" @click="cancelImageUpload">{{ t('common.cancel') }}</PanelButton>
        <PanelButton
          variant="primary"
          :loading="uploadingImages"
          :disabled="!imageFiles || imageFiles.length === 0 || (maxVehicleImages > 0 && vehicleImages.length + (imageFiles?.length || 0) > maxVehicleImages)"
          @click="uploadImages"
        >
          {{ t('common.upload') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <!-- Delete Image Confirmation Dialog -->
    <PanelDialog
      v-model="showDeleteImageDialog"
      :title="t('dealer.views.vehicleDetail.deleteImageTitle')"
      icon="mdi-delete"
      :max-width="400"
    >
      <p class="text-body-2 mb-0">
        {{ t('dealer.views.vehicleDetail.deleteImageConfirmFull') }}
      </p>
      <template #footer>
        <PanelButton variant="ghost" @click="showDeleteImageDialog = false">{{ t('common.cancel') }}</PanelButton>
        <PanelButton variant="danger" :loading="deletingImage" @click="deleteImage">
          {{ t('dealer.views.vehicleDetail.delete') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <!-- 3D View Upload Dialog -->
    <PanelDialog
      v-model="show3dUploadDialog"
      :title="t('dealer.views.vehicleDetail.upload3dTitle')"
      :max-width="500"
    >
      <v-alert
        v-if="upload3dError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-3"
        closable
        @click:close="upload3dError = null"
      >
        {{ upload3dError }}
      </v-alert>
      <v-file-input
        v-model="view3dFile"
        :label="t('dealer.views.vehicleDetail.view3dFileLabel')"
        :hint="t('dealer.views.vehicleDetail.view3dFileHint')"
        variant="outlined"
        density="compact"
        accept=".glb,.gltf,.zip"
        prepend-icon="mdi-file"
        hide-details="auto"
        @update:model-value="onView3dFileSelected"
      />
      <template #footer>
        <PanelButton variant="ghost" @click="close3dUploadDialog">{{ t('common.cancel') }}</PanelButton>
        <PanelButton
          variant="primary"
          :loading="uploading3dView"
          :disabled="!canSubmit3dUpload"
          @click="handleUpload3dView"
        >
          {{ t('common.upload') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <PanelDialog
      v-model="showRemove3dDialog"
      :title="t('dealer.views.vehicleDetail.remove3dViewTitle')"
      :max-width="400"
    >
      <v-alert
        v-if="remove3dError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-3"
        closable
        @click:close="remove3dError = null"
      >
        {{ remove3dError }}
      </v-alert>
      <p class="text-body-2 mb-0">
        {{ t('dealer.views.vehicleDetail.remove3dViewConfirm') }}
      </p>
      <template #footer>
        <PanelButton variant="ghost" @click="showRemove3dDialog = false">{{ t('common.cancel') }}</PanelButton>
        <PanelButton variant="danger" :loading="removing3dView" @click="handleRemove3dView">
          {{ t('dealer.views.vehicleDetail.remove3dView') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <ModelViewerDialog
      v-if="vehicle?.view3dUrl"
      v-model="show3dPreviewDialog"
      :src="vehicle.view3dUrl"
      :title="t('dealer.views.vehicleDetail.view3dTitle')"
    />

    <!-- Equipment Management Dialog -->
    <PanelDialog v-model="showEquipmentDialog" :max-width="700">
      <template #header>
        <div class="panel-dialog__title-row">
          <v-icon color="primary" size="20" class="panel-dialog__icon">mdi-cog</v-icon>
          <h2 class="panel-dialog__title">{{ t('dealer.views.vehicleDetail.editEquipmentTitle') }}</h2>
          <v-chip v-if="maxEquipmentPerVehicle > 0" size="x-small" class="ml-2" color="primary" variant="tonal">
            {{ selectedEquipment.length }}/{{ maxEquipmentPerVehicle }}
          </v-chip>
        </div>
      </template>
      <div v-if="loadingEquipment" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>
      <div v-else>
        <div
          v-for="equipmentType in equipmentTypes"
          :key="equipmentType.id"
          class="mb-3"
        >
          <div class="text-caption font-weight-medium mb-2">{{ translateEquipmentCategory(equipmentType.name, t) }}</div>
          <v-checkbox
            v-for="equipment in equipmentType.equipments || []"
            :key="equipment.id"
            v-model="selectedEquipment"
            :value="equipment.id"
            :label="equipment.name"
            density="compact"
            hide-details
            class="ml-4"
            :disabled="maxEquipmentPerVehicle > 0 && selectedEquipment.length >= maxEquipmentPerVehicle && !selectedEquipment.includes(equipment.id)"
          />
        </div>
      </div>
      <template #footer>
        <PanelButton variant="ghost" @click="cancelEquipmentEdit">{{ t('common.cancel') }}</PanelButton>
        <PanelButton variant="primary" :loading="savingEquipment" @click="saveEquipment">
          {{ t('dealer.views.vehicleDetail.save') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <!-- Update Status Dialog -->
    <PanelDialog
      v-model="showStatusDialog"
      :title="t('dealer.views.vehicleDetail.updateStatusTitle')"
      icon="mdi-update"
      :max-width="500"
    >
      <p class="text-body-2 mb-3">
        {{ t('dealer.views.vehicleDetail.currentStatus') }} <strong>{{ translateStatus(vehicle?.status || vehicle?.vehicleListStatusName, t, vehicle?.vehicleListStatusId) }}</strong>
      </p>
      <v-select
        v-model="selectedStatus"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        :label="t('dealer.views.vehicleDetail.newStatus')"
        variant="outlined"
        density="compact"
        hide-details="auto"
      />
      <v-alert
        v-if="isCriticalStatusSelection"
        type="warning"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ criticalStatusWarning }}
      </v-alert>
      <template #footer>
        <PanelButton variant="ghost" @click="cancelStatusUpdate">{{ t('common.cancel') }}</PanelButton>
        <PanelButton
          variant="primary"
          :loading="updatingStatus"
          :disabled="selectedStatus == null || selectedStatus === vehicle?.vehicleListStatusId"
          @click="confirmStatusUpdate"
        >
          {{ t('dealer.views.vehicleDetail.updateStatus') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <!-- Mark as Sold Confirmation Dialog -->
    <PanelDialog
      v-model="showMarkAsSoldDialog"
      :title="t('dealer.views.vehicleDetail.markAsSold')"
      icon="mdi-check-circle"
      :max-width="400"
    >
      <p class="text-body-2 mb-0">
        {{ t('dealer.views.vehicleDetail.markAsSoldConfirm', { name: vehicleDisplayTitle }) }}
      </p>
      <p class="text-caption text-medium-emphasis mt-1 mb-0">
        {{ t('dealer.views.vehicleDetail.markAsSoldDescription') }}
      </p>
      <template #footer>
        <PanelButton variant="ghost" @click="showMarkAsSoldDialog = false">{{ t('common.cancel') }}</PanelButton>
        <PanelButton variant="primary" :loading="markingAsSold" @click="markAsSold">
          {{ t('dealer.views.vehicleDetail.markAsSold') }}
        </PanelButton>
      </template>
    </PanelDialog>

    <!-- Delete Vehicle Confirmation Dialog -->
    <PanelDialog
      v-model="showDeleteDialog"
      :title="t('dealer.views.vehicleDetail.deleteVehicleTitle')"
      icon="mdi-delete"
      :max-width="400"
    >
      <p class="text-body-2 mb-0">
        {{ t('common.confirmDeleteLead') }}<strong>{{ vehicle?.title || t('common.vehicleTitleFallback', { id: vehicle?.id }) }}</strong>{{ t('common.confirmDeleteTrail') }}
      </p>
      <p class="text-caption text-medium-emphasis mt-1 mb-0">
        {{ t('common.softDeleteVehicleWarning') }}
      </p>
      <template #footer>
        <PanelButton variant="ghost" @click="showDeleteDialog = false">{{ t('common.cancel') }}</PanelButton>
        <PanelButton variant="danger" :loading="deleting" @click="deleteVehicle">
          {{ t('dealer.views.vehicleDetail.delete') }}
        </PanelButton>
      </template>
    </PanelDialog>
    <PanelSnackbar :snackbar="snackbar" />
  </div>
</template>

<script setup lang="ts">
import { useSnackbar } from '@/composables/useSnackbar'
import PanelSnackbar from '@/components/panel/PanelSnackbar.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getVehicle,
  updateVehicle,
  updateVehicleStatus,
  renewVehicleListing,
  uploadVehicle3dView,
  deleteVehicle3dView,
  updateVehicleEquipment,
  deleteVehicle as deleteVehicleApi,
  uploadVehicleImages,
  deleteVehicleImage,
  reorderVehicleImages,
  updateVehicleVideo,
  getLookupConstants,
  type UpdateVehicleData,
  type UpdateVehicleStatusData,
  type LookupConstantsResponse,
} from '@/api/dealer.api'
import {
  searchLookupModels,
  searchLookupVariants,
  type LookupModelRow,
  type LookupVariantRow,
} from '@/api/lookup-search.api'
import { VehicleStatus as VehicleStatusEnum } from '@/models/vehicle.model'
import type { VehicleModel } from '@/models/vehicle.model'
import type { VehicleImageModel } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import { getFeatureLimit, hasFeature, FeatureKey } from '@/utils/subscriptionFeatures'
import { SALES_TYPE_LEASING_DETAILS } from '@/constants/salesTypes'
import PageHeader from '@/components/panel/PageHeader.vue'
import PanelDialog from '@/components/ui/PanelDialog.vue'
import PanelButton from '@/components/ui/PanelButton.vue'
import PricingIntelligencePanel from '@/components/dealer/vehicles/PricingIntelligencePanel.vue'
import ListingBoostPanel, { type ListingBoostMeta } from '@/components/dealer/vehicles/ListingBoostPanel.vue'
import ModelViewerDialog from '@/components/shared/ModelViewerDialog.vue'
import { useErrorMessage } from '@/composables/useErrorMessage'
import {
  translateStatus,
  translateTransmission,
  translateEquipmentCategory,
  isElectricOrHybridFuel,
  mapVehicleListStatusOptions,
  statusSlugForColor,
} from '@/utils/vehicleLabels'
import { VEHICLE_LIST_STATUS_ID } from '@/constants/vehicle-list-status'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { getDisplayMessage } = useErrorMessage()
const { snackbar, showError, showSnackbar } = useSnackbar()

const loading = ref(false)
const error = ref<string | null>(null)
const vehicle = ref<VehicleModel | null>(null)

const vehicleDisplayTitle = computed(() => {
  const v = vehicle.value
  if (!v) return ''
  return v.title || t('common.vehicleTitleFallback', { id: String(v.id) })
})

const daysUntilExpiry = computed(() => {
  const expiresAt = vehicle.value?.expiresAt
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const showExpiryBanner = computed(() => {
  const days = daysUntilExpiry.value
  if (days == null) return false
  const status = vehicle.value?.vehicleListStatusName?.toLowerCase() || vehicle.value?.status?.toLowerCase()
  return status === 'published' && days <= 14
})

const expiryBannerText = computed(() => {
  const days = daysUntilExpiry.value
  if (days == null) return ''
  if (days <= 0) return t('dealer.views.vehicleDetail.listingExpired')
  return t('dealer.views.vehicleDetail.listingExpiresIn', { days })
})

async function handleRenewListing() {
  if (!vehicle.value) return
  try {
    renewingListing.value = true
    vehicle.value = await renewVehicleListing(vehicle.value.id)
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicleDetail.renewListingFailed')
  } finally {
    renewingListing.value = false
  }
}

const vehicleImages = ref<VehicleImageModel[]>([])
const editMode = ref(false)
const updating = ref(false)
const deleting = ref(false)
const vehicleData = ref<UpdateVehicleData>({})
const showImageUploadDialog = ref(false)
const imageFiles = ref<File[]>([])
const uploadingImages = ref(false)
const showDeleteImageDialog = ref(false)
const imageToDelete = ref<VehicleImageModel | null>(null)
const deletingImage = ref(false)
const showEquipmentDialog = ref(false)
const loadingEquipment = ref(false)
const selectedEquipment = ref<number[]>([])
const savingEquipment = ref(false)
const showDeleteDialog = ref(false)
const showStatusDialog = ref(false)
const showMarkAsSoldDialog = ref(false)
const updatingStatus = ref(false)
const selectedStatus = ref<number | null>(null)
const markingAsSold = ref(false)
const renewingListing = ref(false)
const show3dUploadDialog = ref(false)
const show3dPreviewDialog = ref(false)
const showRemove3dDialog = ref(false)
const view3dFile = ref<File | File[] | null>(null)
const view3dSelectedFile = ref<File | null>(null)
const upload3dError = ref<string | null>(null)
const uploading3dView = ref(false)
const removing3dView = ref(false)
const remove3dError = ref<string | null>(null)
const videoUrlInput = ref('')
const savingVideo = ref(false)
const draggedImageIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const reorderingImages = ref(false)

const canUpload3dView = computed(() => hasFeature(FeatureKey.UPLOAD_3D_VIEW))

const MAX_3D_FILE_SIZE = 50 * 1024 * 1024

function get3dDialogErrorMessage(err: unknown, fallbackKey: string): string {
  const apiError = err as ApiErrorModel
  if (apiError.errors) {
    const messages = Object.values(apiError.errors).flat().filter(Boolean)
    if (messages.length > 0) {
      return messages.join(' ')
    }
  }
  return getDisplayMessage(apiError) || t(fallbackKey)
}

function resolveUploadFile(files: File | File[] | null | undefined): File | undefined {
  if (!files) return undefined
  const file = Array.isArray(files) ? files[0] : files
  return file instanceof File ? file : undefined
}

function onView3dFileSelected(files: File | File[] | null) {
  view3dFile.value = files
  const file = resolveUploadFile(files)
  if (file && file.size > MAX_3D_FILE_SIZE) {
    view3dSelectedFile.value = null
    upload3dError.value = t('dealer.views.vehicleDetail.view3dFileTooLarge')
    return
  }
  view3dSelectedFile.value = file ?? null
  upload3dError.value = null
}

function reset3dUploadForm() {
  view3dFile.value = null
  view3dSelectedFile.value = null
  upload3dError.value = null
}

function open3dUploadDialog() {
  upload3dError.value = null
  show3dUploadDialog.value = true
}

function openRemove3dDialog() {
  remove3dError.value = null
  showRemove3dDialog.value = true
}

function close3dUploadDialog() {
  show3dUploadDialog.value = false
  reset3dUploadForm()
}

const canSubmit3dUpload = computed(() => !!view3dSelectedFile.value)

async function handleUpload3dView() {
  if (!vehicle.value) return
  const file = view3dSelectedFile.value
  if (!file) return
  if (file.size > MAX_3D_FILE_SIZE) {
    upload3dError.value = t('dealer.views.vehicleDetail.view3dFileTooLarge')
    return
  }
  try {
    uploading3dView.value = true
    upload3dError.value = null
    vehicle.value = await uploadVehicle3dView(vehicle.value.id, file)
    show3dUploadDialog.value = false
    reset3dUploadForm()
  } catch (err) {
    upload3dError.value = get3dDialogErrorMessage(err, 'dealer.views.vehicleDetail.upload3dFailed')
  } finally {
    uploading3dView.value = false
  }
}

async function handleRemove3dView() {
  if (!vehicle.value) return
  try {
    removing3dView.value = true
    remove3dError.value = null
    vehicle.value = await deleteVehicle3dView(vehicle.value.id)
    showRemove3dDialog.value = false
    show3dPreviewDialog.value = false
  } catch (err) {
    remove3dError.value = get3dDialogErrorMessage(err, 'dealer.views.vehicleDetail.remove3dViewFailed')
  } finally {
    removing3dView.value = false
  }
}
const loadingConstants = ref(false)

// Constants data
const constants = ref<LookupConstantsResponse | null>(null)
const brands = computed(() => constants.value?.brands || [])
const fuelTypes = computed(() => constants.value?.fuel_types || [])
const gearTypes = computed(() => constants.value?.gear_types || [])
const equipmentTypes = computed(() => constants.value?.equipment_types || [])
const colors = computed(() => constants.value?.colors || [])
const bodyTypes = computed(() => constants.value?.body_types || [])
/** Loaded via /api/v1/models|variants (not lookup-constants). */
const models = ref<LookupModelRow[]>([])
const variants = ref<LookupVariantRow[]>([])
const modelsLoading = ref(false)
const variantsLoading = ref(false)
const priceTypes = computed(() => constants.value?.price_types || [])
const conditions = computed(() => constants.value?.conditions || [])
const salesTypes = computed(() => constants.value?.sales_types || [])
const isLeasingSalesTypeEditing = computed(() => {
  const id = vehicleData.value.sales_type_id
  if (id == null) return false
  return salesTypes.value.some((st) => st.id === id && st.name === SALES_TYPE_LEASING_DETAILS)
})
const showLeasingBlock = computed(() => {
  if (editMode.value) return isLeasingSalesTypeEditing.value
  return vehicle.value?.details?.sales_type_name === SALES_TYPE_LEASING_DETAILS
})
const euronorms = computed(() => constants.value?.euronorms || [])
const vehicleUses = computed(() => constants.value?.vehicle_uses || [])
const modelYears = computed(() => constants.value?.model_years || [])
const vehicleListStatusesFromConstants = computed(() => constants.value?.vehicle_list_statuses || [])

// Subscription plan limits
const maxVehicleImages = computed(() => getFeatureLimit(FeatureKey.MAX_VEHICLE_IMAGES, 20))
const maxEquipmentPerVehicle = computed(() => getFeatureLimit(FeatureKey.MAX_EQUIPMENT_PER_VEHICLE, 30))
const remainingImageSlots = computed(() => {
  const max = maxVehicleImages.value
  if (max <= 0) return 999
  return Math.max(0, max - vehicleImages.value.length)
})

const imageSortKey = (img: VehicleImageModel) => img.sortOrder ?? img.order ?? 0

/** Gallery + banner: first item is the cover (matches `vehicles.cover_image_index` = 0 after upload/delete). */
const sortedVehicleImages = computed(() => {
  const src =
    vehicleImages.value.length > 0 ? vehicleImages.value : vehicle.value?.images ?? []
  return [...src].sort((a, b) => imageSortKey(a) - imageSortKey(b))
})

// Get vehicle list statuses from constants
const vehicleListStatuses = computed(() => vehicleListStatusesFromConstants.value)

const localizedVehicleListStatuses = computed(() =>
  mapVehicleListStatusOptions(vehicleListStatusesFromConstants.value, t),
)

const showChargingTypeField = computed(() => {
  const fuelTypeId = editMode.value ? vehicleData.value.fuel_type_id : vehicle.value?.fuelTypeId
  const fuelTypeName = editMode.value
    ? fuelTypes.value.find((f) => f.id === vehicleData.value.fuel_type_id)?.name
    : vehicle.value?.fuelTypeName
  return isElectricOrHybridFuel(fuelTypeId, fuelTypeName)
})

const fairPriceLabel = computed(() => {
  const label = (vehicle.value as VehicleModel & { fairPrice?: { label?: string } })?.fairPrice?.label
  if (label === 'below_market') return 'Below market'
  if (label === 'above_market') return 'Above market'
  if (label === 'fair_price') return 'Fair price'
  return null
})

const fairPriceTooltip = computed(() => {
  const label = (vehicle.value as VehicleModel & { fairPrice?: { label?: string } })?.fairPrice?.label
  if (label === 'below_market') return t('dealer.views.vehicleDetail.fairPriceTooltipBelowMarket')
  if (label === 'above_market') return t('dealer.views.vehicleDetail.fairPriceTooltipAboveMarket')
  if (label === 'fair_price') return t('dealer.views.vehicleDetail.fairPriceTooltipFairPrice')
  return ''
})

const listingHealthScore = computed(() => {
  return (vehicle.value as VehicleModel & { listingHealth?: { score?: number } })?.listingHealth?.score ?? null
})

const canSeePricingIntelligence = hasFeature(FeatureKey.PRICING_INTELLIGENCE)
const canSeeListingBoost = hasFeature(FeatureKey.LISTING_BOOST)

const pricingIntelligence = computed(() => {
  return (vehicle.value as VehicleModel & {
    pricingIntelligence?: Record<string, unknown> | null
  })?.pricingIntelligence ?? null
})

const listingBoostMeta = computed((): ListingBoostMeta | null => {
  const raw = (vehicle.value as VehicleModel & { listingBoost?: ListingBoostMeta | null })?.listingBoost
  if (!raw) return null

  return {
    active: raw.active ?? null,
    can_boost: Boolean(raw.can_boost),
    active_count: Number(raw.active_count ?? 0),
    max_active: Number(raw.max_active ?? 5),
  }
})

async function onListingBoosted(meta: ListingBoostMeta) {
  ;(vehicle.value as VehicleModel & { listingBoost?: ListingBoostMeta }).listingBoost = meta
  showSnackbar(t('dealer.views.vehicleDetail.listingBoostApplied'), 'success')
  await loadVehicle()
}

async function onSuggestedPriceApplied(payload: { newPrice: number }) {
  if (!vehicle.value) return
  vehicle.value.price = payload.newPrice
  showSnackbar(t('dealer.views.vehicleDetail.suggestedPriceApplied'), 'success')
  await loadVehicle()
}

const loadVehicle = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loading.value = true
    error.value = null
    const loadedVehicle = await getVehicle(vehicleId)
    vehicle.value = loadedVehicle
    videoUrlInput.value = loadedVehicle.videoUrl || ''
    
    // Initialize vehicle images from vehicle object
    if (loadedVehicle.images && Array.isArray(loadedVehicle.images)) {
      vehicleImages.value = loadedVehicle.images
    }
    
    // Initialize vehicle data for editing
    vehicleData.value = {
      title: loadedVehicle.title || undefined,
      registration: loadedVehicle.registration || undefined,
      dmr_fact_vehicle_id: loadedVehicle.dmrFactVehicleId || undefined,
      brand_id: loadedVehicle.brandId || undefined,
      model_id: loadedVehicle.modelId || undefined,
      model_year: loadedVehicle.modelYearId || undefined,
      variant_id: loadedVehicle.variantId ?? loadedVehicle.details?.variant_id ?? undefined,
      km_driven: loadedVehicle.kmDriven || undefined,
      fuel_type_id: loadedVehicle.fuelTypeId || undefined,
      gear_type_id: loadedVehicle.gearTypeId || undefined,
      price: loadedVehicle.price || undefined,
      battery_capacity: loadedVehicle.batteryCapacity || undefined,
      range_km: loadedVehicle.rangeKm || undefined,
      charging_type: loadedVehicle.chargingType || undefined,
      engine_power_kw:
        loadedVehicle.enginePowerKw ??
        (loadedVehicle.enginePowerHp == null ? loadedVehicle.enginePower : undefined) ??
        undefined,
      towing_weight: loadedVehicle.towingWeight || undefined,
      first_registration_date: loadedVehicle.firstRegistrationDate || undefined,
      km_per_liter: loadedVehicle.fuelEfficiency || undefined,
      list_status_id: loadedVehicle.vehicleListStatusId || undefined,
      // Vehicle details fields (using snake_case as returned from backend)
      description: loadedVehicle.details?.description || undefined,
      colour_id: (loadedVehicle.colourId ?? loadedVehicle.details?.colour_id ?? loadedVehicle.details?.color_id) ?? undefined,
      body_type_id: loadedVehicle.details?.body_type_id || undefined,
      production_date: loadedVehicle.details?.production_date || undefined,
      last_inspection_date: loadedVehicle.details?.last_inspection_date || undefined,
      is_import: loadedVehicle.details?.is_import || undefined,
      is_factory_new: loadedVehicle.details?.is_factory_new || undefined,
      co2_emission: loadedVehicle.details?.co2_emissions || undefined,
      fuel_consumption_wltp: loadedVehicle.details?.fuel_consumption_wltp || undefined,
      fuel_consumption_nedc: loadedVehicle.details?.fuel_consumption_nedc || undefined,
      engine_type: loadedVehicle.details?.engine_type || undefined,
      emission_norm_id: (loadedVehicle.emissionNormId ?? loadedVehicle.details?.emission_norm_id ?? loadedVehicle.details?.euronom_id) ?? undefined,
      vehicle_use_id: loadedVehicle.vehicleUseId ?? loadedVehicle.details?.use_id ?? undefined,
      price_type_id: loadedVehicle.details?.price_type_id || undefined,
      condition_id: loadedVehicle.details?.condition_id || undefined,
      sales_type_id: loadedVehicle.details?.sales_type_id || undefined,
      internal_cost_price: loadedVehicle.details?.internal_cost_price || undefined,
      leasing_type: (loadedVehicle.details as any)?.leasing_type || undefined,
      leasing_customer_type: (loadedVehicle.details as any)?.leasing_customer_type || undefined,
      leasing_first_payment: (loadedVehicle.details as any)?.leasing_first_payment ?? undefined,
      leasing_residual_value: (loadedVehicle.details as any)?.leasing_residual_value ?? undefined,
      leasing_duration: (loadedVehicle.details as any)?.leasing_duration ?? undefined,
      leasing_annual_mileage: (loadedVehicle.details as any)?.leasing_annual_mileage ?? undefined,
      leasing_total_cost: (loadedVehicle.details as any)?.leasing_total_cost ?? undefined,
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicleDetail.failedLoadVehicle')
  } finally {
    loading.value = false
  }
}

const loadConstants = async () => {
  try {
    loadingConstants.value = true
    const data = await getLookupConstants()
    constants.value = data
  } catch (err) {
    showError(t('common.failedToLoadData'))
  } finally {
    loadingConstants.value = false
  }
}

async function loadModelsForBrand(brandId: number | null | undefined) {
  models.value = []
  if (brandId == null) return
  modelsLoading.value = true
  try {
    models.value = await searchLookupModels([brandId])
    // Keep current model selectable if API omits it for any reason
    const currentId = vehicleData.value.model_id
    const currentName = vehicle.value?.modelName
    if (
      currentId != null &&
      currentName &&
      !models.value.some((m) => m.id === currentId)
    ) {
      models.value = [
        ...models.value,
        { id: currentId, name: currentName, brand_id: brandId },
      ]
    }
  } catch (e) {
    console.error('Failed to load models for brand', e)
    models.value = []
  } finally {
    modelsLoading.value = false
  }
}

async function loadVariantsForModel(modelId: number | null | undefined) {
  variants.value = []
  if (modelId == null) return
  variantsLoading.value = true
  try {
    variants.value = await searchLookupVariants([modelId])
    const currentId = vehicleData.value.variant_id
    const currentName = vehicle.value?.details?.variant_name
    if (
      currentId != null &&
      currentName &&
      !variants.value.some((v) => v.id === currentId)
    ) {
      variants.value = [
        ...variants.value,
        { id: currentId, name: String(currentName), model_id: modelId },
      ]
    }
  } catch (e) {
    console.error('Failed to load variants for model', e)
    variants.value = []
  } finally {
    variantsLoading.value = false
  }
}

async function refreshEditLookups() {
  await loadModelsForBrand(vehicleData.value.brand_id as number | undefined)
  await loadVariantsForModel(vehicleData.value.model_id as number | undefined)
}

const onBrandChange = () => {
  vehicleData.value.model_id = undefined
  vehicleData.value.variant_id = undefined
  variants.value = []
  void loadModelsForBrand(vehicleData.value.brand_id as number | undefined)
}

const onModelChange = () => {
  vehicleData.value.variant_id = undefined
  void loadVariantsForModel(vehicleData.value.model_id as number | undefined)
}

const startEdit = async () => {
  if (!vehicle.value) return
  cancelEdit()
  editMode.value = true
  await refreshEditLookups()
}

const cancelEdit = () => {
  if (!vehicle.value) return
  editMode.value = false
  // Reset form data
  vehicleData.value = {
    title: vehicle.value.title || undefined,
    registration: vehicle.value.registration || undefined,
    dmr_fact_vehicle_id: vehicle.value.dmrFactVehicleId || undefined,
    brand_id: vehicle.value.brandId || undefined,
    model_id: vehicle.value.modelId || undefined,
    model_year: vehicle.value.modelYearId || undefined,
    variant_id: vehicle.value.variantId ?? vehicle.value.details?.variant_id ?? undefined,
    km_driven: vehicle.value.kmDriven || undefined,
    fuel_type_id: vehicle.value.fuelTypeId || undefined,
    gear_type_id: vehicle.value.gearTypeId || undefined,
    price: vehicle.value.price || undefined,
    battery_capacity: vehicle.value.batteryCapacity || undefined,
    range_km: vehicle.value.rangeKm || undefined,
    charging_type: vehicle.value.chargingType || undefined,
    engine_power_kw:
      vehicle.value.enginePowerKw ??
      (vehicle.value.enginePowerHp == null ? vehicle.value.enginePower : undefined) ??
      undefined,
    towing_weight: vehicle.value.towingWeight || undefined,
    first_registration_date: vehicle.value.firstRegistrationDate || undefined,
    km_per_liter: vehicle.value.fuelEfficiency || undefined,
    list_status_id: vehicle.value.vehicleListStatusId || undefined,
    // Vehicle details fields (using snake_case as returned from backend)
    description: vehicle.value.details?.description || undefined,
    colour_id: (vehicle.value.colourId ?? vehicle.value.details?.colour_id ?? vehicle.value.details?.color_id) ?? undefined,
    body_type_id: vehicle.value.details?.body_type_id || undefined,
    production_date: vehicle.value.details?.production_date || undefined,
    last_inspection_date: vehicle.value.details?.last_inspection_date || undefined,
    is_import: vehicle.value.details?.is_import || undefined,
    is_factory_new: vehicle.value.details?.is_factory_new || undefined,
    co2_emission: vehicle.value.details?.co2_emissions || undefined,
    fuel_consumption_wltp: vehicle.value.details?.fuel_consumption_wltp || undefined,
    fuel_consumption_nedc: vehicle.value.details?.fuel_consumption_nedc || undefined,
    engine_type: vehicle.value.details?.engine_type || undefined,
    emission_norm_id: (vehicle.value.emissionNormId ?? vehicle.value.details?.emission_norm_id ?? vehicle.value.details?.euronom_id) ?? undefined,
    vehicle_use_id: vehicle.value.vehicleUseId ?? vehicle.value.details?.use_id ?? undefined,
    price_type_id: vehicle.value.details?.price_type_id || undefined,
    condition_id: vehicle.value.details?.condition_id || undefined,
    sales_type_id: vehicle.value.details?.sales_type_id || undefined,
    internal_cost_price: vehicle.value.details?.internal_cost_price || undefined,
    leasing_type: (vehicle.value.details as any)?.leasing_type || undefined,
    leasing_customer_type: (vehicle.value.details as any)?.leasing_customer_type || undefined,
    leasing_first_payment: (vehicle.value.details as any)?.leasing_first_payment ?? undefined,
    leasing_residual_value: (vehicle.value.details as any)?.leasing_residual_value ?? undefined,
    leasing_duration: (vehicle.value.details as any)?.leasing_duration ?? undefined,
    leasing_annual_mileage: (vehicle.value.details as any)?.leasing_annual_mileage ?? undefined,
    leasing_total_cost: (vehicle.value.details as any)?.leasing_total_cost ?? undefined,
  }
}

const saveVehicle = async () => {
  if (!vehicle.value) return

  try {
    updating.value = true
    error.value = null
    
    const updateData: UpdateVehicleData = { ...vehicleData.value }

    // Include equipment_ids if equipment dialog was used
    if (selectedEquipment.value.length > 0) {
      updateData.equipment_ids = selectedEquipment.value
    }
    
    const updatedVehicle = await updateVehicle(vehicle.value.id, updateData)
    vehicle.value = updatedVehicle
    editMode.value = false
    
    // Update images if vehicle has them
    if (updatedVehicle.images && Array.isArray(updatedVehicle.images)) {
      vehicleImages.value = updatedVehicle.images
    }
    
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicleDetail.failedUpdateVehicle')
  } finally {
    updating.value = false
  }
}

const uploadImages = async () => {
  if (!vehicle.value || !imageFiles.value || imageFiles.value.length === 0) return

  const maxImg = maxVehicleImages.value
  if (maxImg > 0 && vehicleImages.value.length + imageFiles.value.length > maxImg) {
    error.value = t('dealer.views.vehicleDetail.planMaxImagesError', { max: maxImg })
    return
  }

  try {
    uploadingImages.value = true
    error.value = null
    
    const updatedVehicle = await uploadVehicleImages(vehicle.value.id, imageFiles.value)
    vehicle.value = updatedVehicle
    
    // Update images list
    if (updatedVehicle.images && Array.isArray(updatedVehicle.images)) {
      vehicleImages.value = updatedVehicle.images
    }
    
    showImageUploadDialog.value = false
    imageFiles.value = []
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedUploadImages')
  } finally {
    uploadingImages.value = false
  }
}

const cancelImageUpload = () => {
  showImageUploadDialog.value = false
  imageFiles.value = []
}

async function saveVideoUrl() {
  if (!vehicle.value) return
  try {
    savingVideo.value = true
    error.value = null
    const updated = await updateVehicleVideo(vehicle.value.id, videoUrlInput.value.trim() || null)
    vehicle.value = updated
    videoUrlInput.value = updated.videoUrl || ''
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicleDetail.videoSaveFailed')
  } finally {
    savingVideo.value = false
  }
}

const handleImageDragStart = (index: number, event: DragEvent) => {
  draggedImageIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleImageDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleImageDragEnter = (index: number) => {
  if (draggedImageIndex.value !== null && draggedImageIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleImageDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!target.contains(relatedTarget)) {
    dragOverIndex.value = null
  }
}

const persistImageOrder = async (orderedImages: VehicleImageModel[]) => {
  if (!vehicle.value) return
  try {
    reorderingImages.value = true
    const updated = await reorderVehicleImages(
      vehicle.value.id,
      orderedImages.map((img) => img.id)
    )
    vehicle.value = updated
    if (updated.images?.length) {
      vehicleImages.value = updated.images
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicleDetail.reorderImagesFailed')
    await loadVehicle()
  } finally {
    reorderingImages.value = false
  }
}

const handleImageDrop = async (dropIndex: number) => {
  dragOverIndex.value = null
  if (draggedImageIndex.value === null || draggedImageIndex.value === dropIndex) {
    return
  }

  const images = [...sortedVehicleImages.value]
  const [moved] = images.splice(draggedImageIndex.value, 1)
  if (!moved) return
  images.splice(dropIndex, 0, moved)
  vehicleImages.value = images
  draggedImageIndex.value = null
  await persistImageOrder(images)
}

const handleImageDragEnd = () => {
  draggedImageIndex.value = null
  dragOverIndex.value = null
}

const confirmDeleteImage = (image: VehicleImageModel) => {
  imageToDelete.value = image
  showDeleteImageDialog.value = true
}

const deleteImage = async () => {
  if (!vehicle.value || !imageToDelete.value) return

  try {
    deletingImage.value = true
    error.value = null
    await deleteVehicleImage(vehicle.value.id, imageToDelete.value.id)
    showDeleteImageDialog.value = false
    imageToDelete.value = null
    
    // Reload vehicle to get updated images
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedDeleteImage')
  } finally {
    deletingImage.value = false
  }
}

const saveEquipment = async () => {
  if (!vehicle.value) return

  const maxEquip = maxEquipmentPerVehicle.value
  if (maxEquip > 0 && selectedEquipment.value.length > maxEquip) {
    error.value = t('dealer.views.vehicleDetail.planMaxEquipmentError', { max: maxEquip })
    return
  }

  try {
    savingEquipment.value = true
    error.value = null
    
    // Ensure equipment_ids are numbers
    const equipmentIds = selectedEquipment.value
      .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter(id => !isNaN(id) && typeof id === 'number')
    
    await updateVehicleEquipment(vehicle.value.id, { equipment_ids: equipmentIds })
    showEquipmentDialog.value = false
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedUpdateEquipment')
  } finally {
    savingEquipment.value = false
  }
}

const cancelEquipmentEdit = () => {
  showEquipmentDialog.value = false
  selectedEquipment.value = []
}

const confirmDeleteVehicle = () => {
  showDeleteDialog.value = true
}

const deleteVehicle = async () => {
  if (!vehicle.value) return

  try {
    deleting.value = true
    error.value = null
    await deleteVehicleApi(vehicle.value.id)
    router.push({ name: 'dealer.vehicles.overview' })
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.vehicles.failedDeleteVehicle')
  } finally {
    deleting.value = false
  }
}

// Status options: use DB ids + localized names from lookup constants (names are not English slugs).
const statusOptions = computed(() =>
  vehicleListStatusesFromConstants.value.map((status) => ({
    label: translateStatus(status.name, t, status.id),
    value: status.id,
  })),
)

const cancelStatusUpdate = () => {
  showStatusDialog.value = false
  selectedStatus.value = null
}

const isCriticalStatusSelection = computed(() => {
  const id = selectedStatus.value
  return id === VEHICLE_LIST_STATUS_ID.SOLD || id === VEHICLE_LIST_STATUS_ID.ARCHIVED
})

const criticalStatusWarning = computed(() => {
  if (selectedStatus.value === VEHICLE_LIST_STATUS_ID.SOLD) {
    return t('dealer.views.vehicleDetail.statusWarningSold')
  }
  if (selectedStatus.value === VEHICLE_LIST_STATUS_ID.ARCHIVED) {
    return t('dealer.views.vehicleDetail.statusWarningArchived')
  }
  return ''
})

const confirmStatusUpdate = () => {
  if (isCriticalStatusSelection.value) {
    const msg =
      selectedStatus.value === VEHICLE_LIST_STATUS_ID.SOLD
        ? t('dealer.views.vehicleDetail.confirmStatusSold')
        : t('dealer.views.vehicleDetail.confirmStatusArchived')
    if (!window.confirm(msg)) return
  }
  updateStatus()
}

const updateStatus = async () => {
  if (!vehicle.value || selectedStatus.value == null) return

  try {
    updatingStatus.value = true
    error.value = null
    
    const statusData: UpdateVehicleStatusData = {
      list_status_id: selectedStatus.value,
    }
    
    const updatedVehicle = await updateVehicleStatus(vehicle.value.id, statusData)
    vehicle.value = updatedVehicle
    
    showStatusDialog.value = false
    selectedStatus.value = null
    
    // Reload vehicle to get updated status
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedUpdateVehicleStatus')
  } finally {
    updatingStatus.value = false
  }
}

const markAsSold = async () => {
  if (!vehicle.value) return

  try {
    markingAsSold.value = true
    error.value = null
    
    const statusData: UpdateVehicleStatusData = {
      list_status_id: 3,
    }
    
    const updatedVehicle = await updateVehicleStatus(vehicle.value.id, statusData)
    vehicle.value = updatedVehicle
    
    showMarkAsSoldDialog.value = false
    
    // Reload vehicle to get updated status
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedMarkVehicleSold')
  } finally {
    markingAsSold.value = false
  }
}

const getStatusColor = (status?: string, statusId?: number | null) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    published: 'success',
    sold: 'info',
    archived: 'warning',
    pending: 'orange',
    pending_review: 'orange',
  }
  const slug = statusSlugForColor(status, statusId)
  return colors[slug] || 'grey'
}

const formatPrice = (price?: number) => {
  if (!price) return '-'
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('da-DK').format(num)
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return date
  }
}

// Helper function to display "-" for empty values
const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return String(value)
}

// Watch for equipment dialog to load equipment when opened
watch(
  () => vehicleData.value.sales_type_id,
  () => {
    if (!editMode.value) return
    if (!isLeasingSalesTypeEditing.value) {
      vehicleData.value.leasing_type = undefined
      vehicleData.value.leasing_customer_type = undefined
      vehicleData.value.leasing_first_payment = undefined
      vehicleData.value.leasing_residual_value = undefined
      vehicleData.value.leasing_duration = undefined
      vehicleData.value.leasing_annual_mileage = undefined
      vehicleData.value.leasing_total_cost = undefined
    }
  }
)

watch(showEquipmentDialog, (newVal) => {
  if (newVal && vehicle.value) {
    loadingEquipment.value = true
    // Set selected equipment from vehicle
    if (vehicle.value.equipment && Array.isArray(vehicle.value.equipment)) {
      selectedEquipment.value = vehicle.value.equipment
        .map((eq: any) => typeof eq === 'object' ? eq.id : null)
        .filter((id: any) => id !== null)
    }
    loadingEquipment.value = false
  }
})

// Watch for status dialog to initialize selected status
watch(showStatusDialog, (newVal) => {
  if (newVal && vehicle.value) {
    selectedStatus.value = vehicle.value.vehicleListStatusId ?? null
  }
})

onMounted(async () => {
  await Promise.all([loadConstants(), loadVehicle()])
})
</script>

<style scoped>
.vehicle-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.header-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 16px;
}

.back-button {
  min-width: 36px;
  height: 36px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.profile-header-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
}

.info-card {
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.info-field {
  margin-bottom: 12px;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.field-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  word-break: break-word;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
}

.info-item-value {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-top: 2px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
}

.image-drag-item {
  cursor: grab;
}

.image-drag-item.dragging {
  opacity: 0.5;
}

.image-drag-item.drag-over {
  outline: 2px dashed rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.delete-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
}

.featured-image-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
}

.quick-actions {
  flex-shrink: 0;
}

.price-highlight {
  background: rgba(var(--v-theme-primary), 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.price-text {
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
}

.views-highlight {
  background: rgba(var(--v-theme-info), 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}

.views-text {
  color: rgb(var(--v-theme-info));
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .vehicle-detail-container {
    padding: 12px;
  }

  .profile-header-card :deep(.v-card-text) {
    padding: 16px !important;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px !important;
  }

  .vehicle-image {
    align-self: center;
  }

  .vehicle-image :deep(.v-img),
  .vehicle-image .no-image-placeholder {
    width: 80px !important;
    height: 80px !important;
  }

  .vehicle-info-section {
    width: 100%;
  }

  .vehicle-title {
    font-size: 1rem !important;
    text-align: center;
    width: 100%;
  }

  .vehicle-metadata {
    justify-content: center;
    gap: 8px !important;
  }

  .quick-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .quick-actions .v-btn {
    flex: 1 1 auto;
    min-width: 120px;
  }

  .price-highlight,
  .views-highlight {
    padding: 3px 6px;
  }

  .price-text,
  .views-text {
    font-size: 0.8125rem;
  }
}

@media (max-width: 600px) {
  .vehicle-metadata {
    flex-direction: column;
    align-items: center;
    gap: 6px !important;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions .v-btn {
    width: 100%;
  }
}
</style>
