<template>
  <div class="vehicle-detail-container">
    <!-- Header Section -->
    <div class="header-section mb-4">
      <div class="d-flex align-center gap-3 mb-3">
        <v-btn
          icon
          variant="text"
          @click="router.back()"
          size="small"
          class="back-button"
        >
          <v-icon size="20">mdi-arrow-left</v-icon>
        </v-btn>
        <div class="flex-grow-1">
          <h1 class="text-h5 font-weight-bold mb-1">{{ t('admin.views.vehicleDetail.title') }}</h1>
          <p class="text-caption text-medium-emphasis mb-0">
            {{ t('admin.views.vehicleDetail.viewSubtitle') }}
          </p>
        </div>
        <v-btn
          v-if="vehicle && !editMode"
          color="primary"
          prepend-icon="mdi-pencil"
          @click="editMode = true"
          size="small"
        >
          {{ t('admin.views.vehicleDetail.editVehicle') }}
        </v-btn>
        <div v-else-if="vehicle && editMode" class="d-flex gap-2">
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
            @click="saveVehicle"
            :loading="updating"
            size="small"
          >
            {{ t('dealer.views.profile.saveChanges') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-3">{{ t('admin.views.vehicleDetail.loadingVehicle') }}</p>
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
      <v-alert-title>Error</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Vehicle Content -->
    <div v-else-if="vehicle" class="vehicle-content">
      <!-- Vehicle Profile Header Card -->
      <v-card
        variant="flat"
        class="profile-header-card mb-4"
        elevation="0"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center gap-4 header-content">
            <!-- Vehicle Image -->
            <div class="vehicle-image">
              <v-img
                v-if="vehicle.images && vehicle.images.length > 0 && vehicle.images[0]"
                :src="vehicle.images[0]?.url || vehicle.images[0]?.thumbnailUrl"
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
                  <v-icon size="16" color="primary">mdi-currency-usd</v-icon>
                  <span class="text-caption font-weight-bold price-text">{{ formatPrice(vehicle.price) }}</span>
                </div>
                <div v-if="vehicle.viewsCount !== undefined && vehicle.viewsCount !== null" class="d-flex align-center gap-1 views-highlight">
                  <v-icon size="16" color="info">mdi-eye</v-icon>
                  <span class="text-caption font-weight-bold views-text">{{ formatNumber(vehicle.viewsCount) }}</span>
                </div>
                <div>
                  <v-chip
                    :color="getStatusColor(vehicle.status || vehicle.vehicleListStatusName)"
                    size="x-small"
                    variant="flat"
                    prepend-icon="mdi-circle"
                  >
                    {{ vehicle.status || vehicle.vehicleListStatusName || '-' }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Quick Actions (Read-only mode) -->
            <div v-if="!editMode" class="quick-actions d-flex gap-2">
              <v-btn
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
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Content Grid -->
      <v-row>
        <!-- Left Column - Vehicle Information -->
        <v-col cols="12" lg="8" :class="{ 'vehicle-edit-grid': editMode }">
          <!-- Basic Information Card -->
          <v-card
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-information</v-icon>
              <span class="text-subtitle-1">Basic Information</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Title</div>
                    <div class="field-value">{{ displayValue(vehicle.title) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.title"
                    label="Title"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Registration</div>
                    <div class="field-value">{{ displayValue(vehicle.registration) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.registration"
                    label="Registration"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">VIN</div>
                    <div class="field-value">{{ displayValue(vehicle.vin) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.vin"
                    label="VIN"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Dealer</div>
                    <div class="field-value">{{ displayValue(vehicle.dealer?.name || vehicle.dealer?.cvr) }}</div>
                  </div>
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Created By</div>
                    <div class="field-value">{{ displayValue(vehicle.user?.name) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Price</div>
                    <div class="field-value font-weight-medium">{{ vehicle.price ? formatPrice(vehicle.price) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.price"
                    label="Price"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Version</div>
                    <div class="field-value">{{ displayValue((vehicle as any).version) }}</div>
                  </div>
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Published At</div>
                    <div class="field-value">{{ vehicle.publishedAt ? formatDate(vehicle.publishedAt) : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Brand</div>
                    <div class="field-value">{{ displayValue(vehicle.brandName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.brand_id"
                    :items="brands"
                    item-title="name"
                    item-value="id"
                    label="Brand"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    @update:model-value="onBrandChange"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Model</div>
                    <div class="field-value">{{ displayValue(vehicle.modelName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.model_id"
                    :items="filteredModels"
                    item-title="name"
                    item-value="id"
                    label="Model"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :disabled="!vehicleData.brand_id"
                    @update:model-value="onModelChange"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Variant</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.variant_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.variant_id"
                    :items="filteredVariants"
                    item-title="name"
                    item-value="id"
                    label="Variant"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :disabled="!vehicleData.model_id"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Model Year</div>
                    <div class="field-value">{{ displayValue(vehicle.modelYearName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.model_year"
                    :items="modelYears"
                    item-title="name"
                    item-value="id"
                    label="Model Year"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">KM Driven</div>
                    <div class="field-value">{{ vehicle.kmDriven ? formatNumber(vehicle.kmDriven) + ' km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.km_driven"
                    label="KM Driven"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Fuel Type</div>
                    <div class="field-value">{{ displayValue(vehicle.fuelTypeName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.fuel_type_id"
                    :items="fuelTypes"
                    item-title="name"
                    item-value="id"
                    label="Fuel Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Transmission</div>
                    <div class="field-value">{{ displayValue(vehicle.gearTypeName || (vehicle.details as any)?.transmission_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.gear_type_id"
                    :items="gearTypes"
                    item-title="name"
                    item-value="id"
                    label="Transmission"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Listing Type</div>
                    <div class="field-value">{{ displayValue(vehicle.listingTypeName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.listing_type_id"
                    :items="listingTypes"
                    item-title="name"
                    item-value="id"
                    label="Listing Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Status</div>
                    <v-chip
                      v-if="vehicle.status || vehicle.vehicleListStatusName"
                      :color="getStatusColor(vehicle.status || vehicle.vehicleListStatusName)"
                      size="x-small"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ vehicle.status || vehicle.vehicleListStatusName }}
                    </v-chip>
                    <div v-else class="field-value"></div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.list_status_id"
                    :items="vehicleListStatuses"
                    item-title="name"
                    item-value="id"
                    label="Status"
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
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-cog</v-icon>
              <span class="text-subtitle-1">Specifications</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Engine Power</div>
                    <div class="field-value">{{
                      vehicle.enginePowerHp != null
                        ? vehicle.enginePowerHp + ' HP'
                        : vehicle.enginePowerKw != null
                          ? vehicle.enginePowerKw + ' kW'
                          : vehicle.enginePower
                            ? vehicle.enginePower + ' HP'
                            : '-'
                    }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.engine_power_kw"
                    label="Engine Power (kW)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Engine Type</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.engine_type) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.engine_type"
                    label="Engine Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Drivetrain</div>
                    <div class="field-value">{{ vehicle.details?.drive_axles === 1 ? 'FWD' : (vehicle.details?.drive_axles === 2 ? 'AWD' : '-') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Euro Emission Class</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.euronom_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.emission_norm_id"
                    :items="euronorms"
                    item-title="name"
                    item-value="id"
                    label="Euro Emission Class"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Previous Usage</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.use_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.vehicle_use_id"
                    :items="vehicleUses"
                    item-title="name"
                    item-value="id"
                    label="Previous Usage"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Towing Weight</div>
                    <div class="field-value">{{ vehicle.towingWeight ? formatNumber(vehicle.towingWeight) + ' kg' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.towing_weight"
                    label="Towing Weight (kg)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Battery Capacity</div>
                    <div class="field-value">{{ vehicle.batteryCapacity ? vehicle.batteryCapacity + ' kWh' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.battery_capacity"
                    label="Battery Capacity (kWh)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Range (km)</div>
                    <div class="field-value">{{ displayValue(vehicle.rangeKm) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.range_km"
                    label="Range (km)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Charging Type</div>
                    <div class="field-value">{{ displayValue(vehicle.chargingType) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.charging_type"
                    label="Charging Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Ownership Tax</div>
                    <div class="field-value">{{
                      vehicle.calculatedOwnershipTax != null
                        ? formatPrice(vehicle.calculatedOwnershipTax)
                        : vehicle.ownershipTax
                          ? formatPrice(vehicle.ownershipTax)
                          : '-'
                    }}</div>
                  </div>
                </v-col>
                <v-col v-if="!editMode" cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Calculated Ownership Tax</div>
                    <div class="field-value">{{ vehicle.calculatedOwnershipTax ? formatPrice(vehicle.calculatedOwnershipTax) : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">First Registration</div>
                    <div class="field-value">{{ vehicle.firstRegistrationDate ? formatDate(vehicle.firstRegistrationDate) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.first_registration_date"
                    label="First Registration Date"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Fuel Efficiency</div>
                    <div class="field-value">{{ vehicle.fuelEfficiency ? vehicle.fuelEfficiency + ' L/100km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.km_per_liter"
                    label="Fuel Efficiency (L/100km)"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Pricing Card -->
          <v-card
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-currency-usd</v-icon>
              <span class="text-subtitle-1">Pricing Information</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Internal Cost Price</div>
                    <div class="field-value">{{ (vehicle.details as any)?.internal_cost_price ? formatPrice((vehicle.details as any).internal_cost_price) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.internal_cost_price"
                    label="Internal Cost Price"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card
            v-if="showLeasingBlockAdmin"
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-calendar-clock</v-icon>
              <span class="text-subtitle-1">Leasing details</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Leasing type</div>
                    <div class="field-value">{{ displayValue((vehicle.details as any)?.leasing_type) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.leasing_type"
                    label="Leasing type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Customer type</div>
                    <div class="field-value">{{ displayValue((vehicle.details as any)?.leasing_customer_type) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.leasing_customer_type"
                    label="Customer type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">First payment</div>
                    <div class="field-value">{{ (vehicle.details as any)?.leasing_first_payment != null ? formatPrice(Number((vehicle.details as any).leasing_first_payment)) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_first_payment"
                    label="First payment"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Residual value</div>
                    <div class="field-value">{{ (vehicle.details as any)?.leasing_residual_value != null ? formatPrice(Number((vehicle.details as any).leasing_residual_value)) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_residual_value"
                    label="Residual value"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Duration (months)</div>
                    <div class="field-value">{{ displayValue((vehicle.details as any)?.leasing_duration) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_duration"
                    label="Duration (months)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Annual mileage</div>
                    <div class="field-value">{{ displayValue((vehicle.details as any)?.leasing_annual_mileage) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_annual_mileage"
                    label="Annual mileage"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Total leasing cost</div>
                    <div class="field-value">{{ (vehicle.details as any)?.leasing_total_cost != null ? formatPrice(Number((vehicle.details as any).leasing_total_cost)) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.leasing_total_cost"
                    label="Total leasing cost"
                    type="number"
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
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-file-document-edit</v-icon>
              <span class="text-subtitle-1">Vehicle Details</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
                <!-- Basic Details -->
                <v-col cols="12">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Description</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.description) }}</div>
                  </div>
                  <v-textarea
                    v-else
                    v-model="vehicleData.description"
                    label="Description"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    hide-details="auto"
                  />
                </v-col>
                <template v-if="!editMode">
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Views Count</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.views_count) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Vehicle External ID</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.vehicle_external_id) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">VIN Location</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.vin_location) }}</div>
                  </div>
                </v-col>
                
                <!-- Type & Category -->
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Type</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.type_name) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Category</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.category) }}</div>
                  </div>
                </v-col>
                
                <!-- Registration Details -->
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Registration Status</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.registration_status) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Registration Status Updated Date</div>
                    <div class="field-value">{{ vehicle.details?.registration_status_updated_date ? formatDate(vehicle.details.registration_status_updated_date) : '-' }}</div>
                    </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Expire Date</div>
                    <div class="field-value">{{ vehicle.details?.expire_date ? formatDate(vehicle.details.expire_date) : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Status Updated Date</div>
                    <div class="field-value">{{ vehicle.details?.status_updated_date ? formatDate(vehicle.details.status_updated_date) : '-' }}</div>
                  </div>
                </v-col>
                
                <!-- Weight Information -->
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Total Weight</div>
                    <div class="field-value">{{ vehicle.details?.total_weight ? formatNumber(vehicle.details.total_weight) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Vehicle Weight</div>
                    <div class="field-value">{{ vehicle.details?.vehicle_weight ? formatNumber(vehicle.details.vehicle_weight) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Technical Total Weight</div>
                    <div class="field-value">{{ vehicle.details?.technical_total_weight ? formatNumber(vehicle.details.technical_total_weight) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Coupling</div>
                    <div class="field-value">{{ vehicle.details?.coupling ? formatNumber(vehicle.details.coupling) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Towing Weight Brakes</div>
                    <div class="field-value">{{ vehicle.details?.towing_weight_brakes ? formatNumber(vehicle.details.towing_weight_brakes) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Minimum Weight</div>
                    <div class="field-value">{{ vehicle.details?.minimum_weight ? formatNumber(vehicle.details.minimum_weight) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Gross Combination Weight</div>
                    <div class="field-value">{{ vehicle.details?.gross_combination_weight ? formatNumber(vehicle.details.gross_combination_weight) + ' kg' : '-' }}</div>
                  </div>
                </v-col>
                </template>
                
                <!-- Inspection Details -->
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Last Inspection Date</div>
                    <div class="field-value">{{ vehicle.details?.last_inspection_date ? formatDate(vehicle.details.last_inspection_date) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.last_inspection_date"
                    label="Last Inspection Date"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <template v-if="!editMode">
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Last Inspection Result</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.last_inspection_result) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Last Inspection Odometer</div>
                    <div class="field-value">{{ vehicle.details?.last_inspection_odometer ? formatNumber(vehicle.details.last_inspection_odometer) + ' km' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Type Approval Code</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.type_approval_code) }}</div>
                  </div>
                </v-col>
                
                <!-- Vehicle Specifications -->
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Top Speed</div>
                    <div class="field-value">{{ vehicle.details?.top_speed ? vehicle.details.top_speed + ' km/h' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Doors</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.doors) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Minimum Seats</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.minimum_seats) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Maximum Seats</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.maximum_seats) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Wheels</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.wheels) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Axles</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.axles) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Drive Axles</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.drive_axles) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Wheelbase</div>
                    <div class="field-value">{{ vehicle.details?.wheelbase ? vehicle.details.wheelbase + ' mm' : '-' }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Extra Equipment</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.extra_equipment) }}</div>
                  </div>
                </v-col>
                </template>
                
                <!-- Fuel & Emissions -->
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Fuel Consumption WLTP</div>
                    <div class="field-value">{{ vehicle.details?.fuel_consumption_wltp ? vehicle.details.fuel_consumption_wltp + ' L/100km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.fuel_consumption_wltp"
                    label="Fuel Consumption WLTP (L/100km)"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Fuel Consumption NEDC</div>
                    <div class="field-value">{{ vehicle.details?.fuel_consumption_nedc ? vehicle.details.fuel_consumption_nedc + ' L/100km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.fuel_consumption_nedc"
                    label="Fuel Consumption NEDC (L/100km)"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">CO2 Emissions</div>
                    <div class="field-value">{{ vehicle.details?.co2_emission ?? vehicle.details?.co2_emissions ? (vehicle.details?.co2_emission ?? vehicle.details?.co2_emissions) + ' g/km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.co2_emission"
                    label="CO2 Emissions (g/km)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                
                <template v-if="!editMode">
                <!-- Safety Features -->
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">NCAP Five</div>
                    <div class="field-value">{{ vehicle.details?.ncap_five ? t('common.yes') : (vehicle.details?.ncap_five === false ? t('common.no') : '-') }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Airbags</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.airbags) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Integrated Child Seats</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.integrated_child_seats) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Seat Belt Alarms</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.seat_belt_alarms) }}</div>
                  </div>
                </v-col>
                </template>
                
                <!-- Vehicle Attributes -->
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Color</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.color_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.colour_id"
                    :items="colors"
                    item-title="name"
                    item-value="id"
                    label="Color"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Body Type</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.body_type_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.body_type_id"
                    :items="bodyTypes"
                    item-title="name"
                    item-value="id"
                    label="Body Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Price Type</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.price_type_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.price_type_id"
                    :items="priceTypes"
                    item-title="name"
                    item-value="id"
                    label="Price Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Condition</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.condition_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.condition_id"
                    :items="conditions"
                    item-title="name"
                    item-value="id"
                    label="Condition"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Sales Type</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.sales_type_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.sales_type_id"
                    :items="salesTypes"
                    item-title="name"
                    item-value="id"
                    label="Sales Type"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                
                <!-- Flags & Status -->
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Is Import</div>
                    <div class="field-value">{{ vehicle.details?.is_import ? t('common.yes') : (vehicle.details?.is_import === false ? t('common.no') : '-') }}</div>
                  </div>
                  <v-checkbox
                    v-else
                    v-model="vehicleData.is_import"
                    label="Is Import"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Is Factory New</div>
                    <div class="field-value">{{ vehicle.details?.is_factory_new ? t('common.yes') : (vehicle.details?.is_factory_new === false ? t('common.no') : '-') }}</div>
                  </div>
                  <v-checkbox
                    v-else
                    v-model="vehicleData.is_factory_new"
                    label="Is Factory New"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Servicebog</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.servicebog) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.servicebog"
                    label="Servicebog"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Cover Image Index</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.cover_image_index) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.cover_image_index"
                    label="Cover Image Index"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                
                <!-- Seller Information -->
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Seller Phone</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.seller_phone) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.seller_phone"
                    label="Seller Phone"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Seller Address</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.seller_address) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.address"
                    label="Seller Address"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Seller Postcode</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.seller_postcode) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.postcode"
                    label="Seller Postcode"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Annual Tax</div>
                    <div class="field-value">{{ vehicle.details?.annual_tax ? formatPrice(vehicle.details.annual_tax) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.annual_tax"
                    label="Annual Tax"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <template v-if="!editMode">
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Owners</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.owners) }}</div>
                  </div>
                </v-col>
                </template>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Production Date</div>
                    <div class="field-value">{{ vehicle.details?.production_date ? formatDate(vehicle.details.production_date) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.production_date"
                    label="Production Date"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                
                <template v-if="!editMode">
                <!-- Permits & Dispensations -->
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Dispensations</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.dispensations) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Permits</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.permits) }}</div>
                  </div>
                </v-col>
                </template>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Images Management Card -->
          <v-card
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-image-multiple</v-icon>
              <span class="text-subtitle-1">Vehicle Images</span>
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
              <div v-if="loadingImages" class="text-center py-2">
                <v-progress-circular indeterminate color="primary" size="24" />
              </div>
              <div v-else-if="vehicleImages.length === 0" class="text-center text-medium-emphasis text-caption py-2">
                No images available
              </div>
              <div v-else class="images-grid">
                <div
                  v-for="image in vehicleImages"
                  :key="image.id"
                  class="image-item"
                >
                  <v-img
                    :src="image.url || image.thumbnailUrl"
                    :alt="`Vehicle image ${image.id}`"
                    cover
                    width="120"
                    height="120"
                    style="border-radius: 4px;"
                  />
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

          <!-- Equipment Management Card -->
          <v-card
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-cog</v-icon>
              <span class="text-subtitle-1">Equipment</span>
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
                No equipment assigned
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Additional Information -->
        <v-col cols="12" lg="4">
          <!-- Vehicle Information Sidebar -->
          <v-card
            variant="flat"
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-information-outline</v-icon>
              <span class="text-subtitle-1">Information</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <div class="info-list">
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-store</v-icon>
                    Dealer
                  </div>
                  <div class="info-item-value">
                    {{ displayValue(vehicle.dealer?.cvr) }}
                  </div>
                </div>
                <v-divider class="my-2" />
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-account</v-icon>
                    Created By
                  </div>
                  <div class="info-item-value">
                    {{ displayValue(vehicle.user?.name) }}
                  </div>
                </div>
                <v-divider class="my-2" />
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-calendar-plus</v-icon>
                    Created At
                  </div>
                  <div class="info-item-value">
                    {{ vehicle.createdAt ? formatDate(vehicle.createdAt) : '-' }}
                  </div>
                </div>
                <v-divider class="my-2" />
                <div class="info-item">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-calendar-edit</v-icon>
                    Updated At
                  </div>
                  <div class="info-item-value">
                    {{ vehicle.updatedAt ? formatDate(vehicle.updatedAt) : '-' }}
                  </div>
                </div>
                <v-divider class="my-2" v-if="vehicle.details?.created_at || vehicle.details?.updated_at" />
                <div class="info-item" v-if="vehicle.details?.created_at">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-calendar-plus</v-icon>
                    Details Created At
                  </div>
                  <div class="info-item-value">
                    {{ formatDate(vehicle.details.created_at) }}
                  </div>
                </div>
                <v-divider class="my-2" v-if="vehicle.details?.created_at && vehicle.details?.updated_at" />
                <div class="info-item" v-if="vehicle.details?.updated_at">
                  <div class="info-item-label">
                    <v-icon size="16" class="mr-1">mdi-calendar-edit</v-icon>
                    Details Updated At
                  </div>
                  <div class="info-item-value">
                    {{ formatDate(vehicle.details.updated_at) }}
                  </div>
                </div>
                
              </div>
            </v-card-text>
          </v-card>

          <!-- History Card -->
          <v-card
            variant="flat"
            class="info-card"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-history</v-icon>
              <span class="text-subtitle-1">History</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <div v-if="loadingHistory" class="text-center py-2">
                <v-progress-circular indeterminate color="primary" size="24" />
              </div>
              <div v-else-if="history.price_history && history.price_history.length > 0" class="history-list">
                <div
                  v-for="(item, index) in history.price_history.slice(0, 5)"
                  :key="index"
                  class="history-item"
                >
                  <div class="history-item-label">Price Change</div>
                  <div class="history-item-value">
                    {{ formatPrice(item.old_price) }} → {{ formatPrice(item.new_price) }}
                  </div>
                  <div class="history-item-date">{{ formatDate(item.changed_at) }}</div>
                </div>
              </div>
              <div v-else class="text-medium-emphasis text-caption text-center py-2">
                No history available
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Image Upload Dialog -->
    <v-dialog v-model="showImageUploadDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="primary" size="18" class="mr-2">mdi-upload</v-icon>
          Upload Vehicle Images
        </v-card-title>
        <v-card-text class="pa-3">
          <v-file-input
            v-model="imageFiles"
            label="Select Images"
            multiple
            accept="image/*"
            variant="outlined"
            density="compact"
            prepend-icon="mdi-image"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="cancelImageUpload">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="uploadImages"
            :loading="uploadingImages"
            :disabled="!imageFiles || imageFiles.length === 0"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Image Confirmation Dialog -->
    <v-dialog v-model="showDeleteImageDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="error" size="18" class="mr-2">mdi-delete</v-icon>
          Delete Image
        </v-card-title>
        <v-card-text class="pa-3">
          <p class="text-body-2">
            Are you sure you want to delete this image?
          </p>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showDeleteImageDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="error"
            size="small"
            @click="deleteImage"
            :loading="deletingImage"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Equipment Management Dialog -->
    <v-dialog v-model="showEquipmentDialog" max-width="700">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="primary" size="18" class="mr-2">mdi-cog</v-icon>
          Edit Equipment
        </v-card-title>
        <v-card-text class="pa-3">
          <div v-if="loadingEquipment" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>
          <div v-else>
            <div
              v-for="equipmentType in equipmentTypes"
              :key="equipmentType.id"
              class="mb-3"
            >
              <div class="text-caption font-weight-medium mb-2">{{ equipmentType.name }}</div>
              <v-checkbox
                v-for="equipment in equipmentType.equipments || []"
                :key="equipment.id"
                v-model="selectedEquipment"
                :value="equipment.id"
                :label="equipment.name"
                density="compact"
                hide-details
                class="ml-4"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="cancelEquipmentEdit">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="saveEquipment"
            :loading="savingEquipment"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Mark as Sold Confirmation Dialog -->
    <v-dialog v-model="showMarkAsSoldDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="success" size="18" class="mr-2">mdi-check-circle</v-icon>
          Mark as Sold
        </v-card-title>
        <v-card-text class="pa-3">
          <p class="text-body-2">
            Are you sure you want to mark <strong>{{ vehicle?.title || `Vehicle #${vehicle?.id}` }}</strong> as sold?
          </p>
          <p class="text-caption text-medium-emphasis mt-1">
            This will update the vehicle status to "Sold". The vehicle will be marked as sold in the system.
          </p>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showMarkAsSoldDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="success"
            size="small"
            @click="markAsSold"
            :loading="markingAsSold"
          >
            Mark as Sold
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Status Update Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="primary" size="18" class="mr-2">mdi-update</v-icon>
          Update Vehicle Status
        </v-card-title>
        <v-card-text class="pa-3">
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="New Status"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="cancelStatusUpdate">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="updateStatus"
            :loading="updatingStatus"
            :disabled="!selectedStatus || selectedStatus === (vehicle?.status || vehicle?.vehicleListStatusName)?.toLowerCase()"
          >
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Vehicle Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="error" size="18" class="mr-2">mdi-delete</v-icon>
          {{ t('admin.views.vehicles.deleteVehicle') }}
        </v-card-title>
        <v-card-text class="pa-3">
          <p class="text-body-2">
            {{ t('common.confirmDeleteLead') }}<strong>{{ vehicle?.title || t('common.vehicleTitleFallback', { id: vehicle?.id }) }}</strong>{{ t('common.confirmDeleteTrail') }}
          </p>
          <p class="text-caption text-medium-emphasis mt-1">
            {{ t('common.softDeleteVehicleWarning') }}
          </p>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showDeleteDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn
            color="error"
            size="small"
            @click="deleteVehicle"
            :loading="deleting"
          >
            {{ t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getVehicle,
  updateVehicle,
  updateVehicleStatus,
  getVehicleImages,
  updateVehicleImages,
  deleteVehicleImage,
  updateVehicleEquipment,
  getVehicleHistory,
  deleteVehicle as deleteVehicleApi,
  getConstantsData,
  getVehicleModels,
  getVariants,
  type UpdateVehicleData,
  type UpdateVehicleStatusData,
  type ConstantsData,
  type VehicleModelConstant,
  type VariantConstant,
} from '@/api/admin.api'
import { SALES_TYPE_LEASING_DETAILS } from '@/constants/salesTypes'
import type { VehicleModel } from '@/models/vehicle.model'
import type { VehicleImageModel } from '@/models/vehicle.model'
import { VehicleStatus } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const vehicle = ref<VehicleModel | null>(null)
const vehicleImages = ref<VehicleImageModel[]>([])
const history = ref<{ price_history: any[], view_logs: any[] }>({
  price_history: [],
  view_logs: [],
})
const editMode = ref(false)
const updating = ref(false)
const deleting = ref(false)
const vehicleData = ref<UpdateVehicleData>({})

/** Map loaded vehicle to editable payload — only `vehicles` table columns (matches dealer panel). */
function buildAdminVehicleEditData(source: VehicleModel): UpdateVehicleData {
  const details = source.details ?? {}
  return {
    title: source.title || undefined,
    registration: source.registration || undefined,
    vin: source.vin || undefined,
    dmr_fact_vehicle_id: source.dmrFactVehicleId || undefined,
    brand_id: source.brandId || undefined,
    model_id: source.modelId || undefined,
    model_year: source.modelYearId || undefined,
    variant_id: source.variantId ?? details.variant_id ?? undefined,
    km_driven: source.kmDriven ?? undefined,
    fuel_type_id: source.fuelTypeId || undefined,
    gear_type_id: source.gearTypeId || undefined,
    price: source.price ?? undefined,
    battery_capacity: source.batteryCapacity ?? undefined,
    range_km: source.rangeKm ?? undefined,
    charging_type: source.chargingType || undefined,
    engine_power_kw:
      source.enginePowerKw ??
      (source.enginePowerHp == null ? source.enginePower : undefined) ??
      undefined,
    towing_weight: source.towingWeight ?? undefined,
    first_registration_date: source.firstRegistrationDate || undefined,
    km_per_liter: source.fuelEfficiency ?? undefined,
    list_status_id: source.vehicleListStatusId || undefined,
    listing_type_id: source.listingTypeId || undefined,
    address: details.seller_address || undefined,
    postcode: details.seller_postcode || undefined,
    seller_phone: details.seller_phone || undefined,
    description: details.description || undefined,
    colour_id: (source.colourId ?? details.colour_id ?? details.color_id) ?? undefined,
    body_type_id: details.body_type_id || undefined,
    production_date: details.production_date || undefined,
    last_inspection_date: details.last_inspection_date || undefined,
    is_import: details.is_import ?? undefined,
    is_factory_new: details.is_factory_new ?? undefined,
    co2_emission: details.co2_emission ?? details.co2_emissions ?? undefined,
    fuel_consumption_wltp: details.fuel_consumption_wltp ?? undefined,
    fuel_consumption_nedc: details.fuel_consumption_nedc ?? undefined,
    engine_type: details.engine_type || undefined,
    emission_norm_id: (source.emissionNormId ?? details.emission_norm_id ?? details.euronom_id) ?? undefined,
    vehicle_use_id: source.vehicleUseId ?? details.vehicle_use_id ?? details.use_id ?? undefined,
    price_type_id: details.price_type_id || undefined,
    condition_id: details.condition_id || undefined,
    sales_type_id: details.sales_type_id || undefined,
    internal_cost_price: details.internal_cost_price ?? undefined,
    leasing_type: details.leasing_type || undefined,
    leasing_customer_type: details.leasing_customer_type || undefined,
    leasing_first_payment: details.leasing_first_payment ?? undefined,
    leasing_residual_value: details.leasing_residual_value ?? undefined,
    leasing_duration: details.leasing_duration ?? undefined,
    leasing_annual_mileage: details.leasing_annual_mileage ?? undefined,
    leasing_total_cost: details.leasing_total_cost ?? undefined,
    servicebog: details.servicebog || undefined,
    annual_tax: details.annual_tax ?? undefined,
    cover_image_index: details.cover_image_index ?? undefined,
  }
}
const loadingImages = ref(false)
const loadingHistory = ref(false)
const loadingConstants = ref(false)
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
const updatingStatus = ref(false)
const selectedStatus = ref<VehicleStatus | ''>('')
const showMarkAsSoldDialog = ref(false)
const markingAsSold = ref(false)

// Constants data
const constants = ref<ConstantsData | null>(null)
const brands = computed(() => constants.value?.brands || [])
const modelYears = computed(() => constants.value?.model_years || [])
const fuelTypes = computed(() => constants.value?.fuel_types || [])
const gearTypes = computed(() => constants.value?.gear_types || [])
const listingTypes = computed(() => constants.value?.listing_types || [])
const bodyTypes = computed(() => constants.value?.body_types || [])
const colors = computed(() => constants.value?.colors || [])
const variants = ref<VariantConstant[]>([])

const filteredVariants = computed(() => {
  const modelId = vehicleData.value.model_id as number | undefined
  let list = modelId
    ? variants.value.filter((v) => v.model_id === modelId)
    : variants.value

  const currentVariantId = vehicleData.value.variant_id as number | undefined
  if (currentVariantId && !list.some((v) => v.id === currentVariantId)) {
    const currentName = vehicle.value?.details?.variant_name
    list = [
      ...list,
      {
        id: currentVariantId,
        name: currentName || `Variant #${currentVariantId}`,
        model_id: modelId,
      } as VariantConstant,
    ]
  }

  return list
})
const conditions = computed(() => constants.value?.conditions || [])
const salesTypes = computed(() => constants.value?.sales_types || [])
const isLeasingSalesTypeEditingAdmin = computed(() => {
  const id = vehicleData.value.sales_type_id
  if (id == null) return false
  return salesTypes.value.some((st) => st.id === id && st.name === SALES_TYPE_LEASING_DETAILS)
})
const showLeasingBlockAdmin = computed(() => {
  if (editMode.value) return isLeasingSalesTypeEditingAdmin.value
  return vehicle.value?.details?.sales_type_name === SALES_TYPE_LEASING_DETAILS
})
const priceTypes = computed(() => constants.value?.price_types || [])
const euronorms = computed(() => constants.value?.euronorms || [])
const vehicleModels = ref<VehicleModelConstant[]>([])
const vehicleUses = computed(() => constants.value?.vehicle_uses || [])
const vehicleListStatuses = computed(() => constants.value?.vehicle_list_statuses || [])
const equipmentTypes = computed(() => constants.value?.equipment_types || [])
const equipments = computed(() => constants.value?.equipments || [])

// Models for selected brand (loaded via admin vehicle-models API, not bulk constants)
const filteredModels = computed(() => vehicleModels.value)

// Status options for status update dialog
const statusOptions = computed(() => {
  const validApiStatuses = ['draft', 'published', 'unpublished', 'archived']
  
  return vehicleListStatuses.value
    .map(status => {
      // Map status name to API format (lowercase)
      const apiValue = status.name.toLowerCase()
      
      // Only include statuses that are valid for the API
      if (validApiStatuses.includes(apiValue)) {
        return {
          label: status.name,
          value: apiValue
        }
      }
      return null
    })
    .filter((option): option is { label: string; value: string } => option !== null)
})

const loadVehicle = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loading.value = true
    error.value = null
    const loadedVehicle = await getVehicle(vehicleId)
    vehicle.value = loadedVehicle
    
    vehicleData.value = buildAdminVehicleEditData(loadedVehicle)

    await loadVehicleModelsForBrand(vehicleData.value.brand_id as number | undefined)
    await loadAllVariants()
    await loadVariantsForModel(vehicleData.value.model_id as number | undefined)

    await Promise.all([loadImages(), loadHistory()])
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load vehicle'
  } finally {
    loading.value = false
  }
}

const loadVehicleModelsForBrand = async (brandId: number | undefined) => {
  if (!brandId) {
    vehicleModels.value = []
    return
  }
  try {
    const res = await getVehicleModels({ brand_id: brandId, page: 1, limit: 500 })
    vehicleModels.value = res.docs as VehicleModelConstant[]
  } catch (err) {
    console.error('Failed to load vehicle models:', err)
    vehicleModels.value = []
  }
}

const loadVariantsForModel = async (modelId: number | undefined) => {
  if (!modelId) {
    return
  }
  try {
    const res = await getVariants({ model_id: modelId, page: 1, limit: 500 })
    const loaded = res.docs as VariantConstant[]
    const byId = new Map(variants.value.map((v) => [v.id, v]))
    for (const item of loaded) {
      byId.set(item.id, item)
    }
    variants.value = Array.from(byId.values())
  } catch (err) {
    console.error('Failed to load variants:', err)
  }
}

const loadAllVariants = async () => {
  try {
    const res = await getVariants({ page: 1, limit: 5000 })
    variants.value = res.docs as VariantConstant[]
  } catch (err) {
    console.error('Failed to load variants:', err)
    variants.value = []
  }
}

const refreshEditLookups = async () => {
  await loadAllVariants()
  await loadVehicleModelsForBrand(vehicleData.value.brand_id as number | undefined)
  const modelId = vehicleData.value.model_id as number | undefined
  if (modelId) {
    await loadVariantsForModel(modelId)
  }
}

const loadConstants = async () => {
  try {
    loadingConstants.value = true
    const data = await getConstantsData()
    constants.value = data
  } catch (err) {
    console.error('Failed to load constants:', err)
  } finally {
    loadingConstants.value = false
  }
}

const loadImages = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loadingImages.value = true
    const images = await getVehicleImages(vehicleId)
    vehicleImages.value = images
  } catch (err) {
    console.error('Failed to load images:', err)
  } finally {
    loadingImages.value = false
  }
}

const loadHistory = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loadingHistory.value = true
    const historyData = await getVehicleHistory(vehicleId)
    history.value = historyData
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    loadingHistory.value = false
  }
}

const onBrandChange = () => {
  vehicleData.value.model_id = undefined
  vehicleData.value.variant_id = undefined
  void loadVehicleModelsForBrand(vehicleData.value.brand_id as number | undefined)
}

const onModelChange = () => {
  vehicleData.value.variant_id = undefined
  void loadVariantsForModel(vehicleData.value.model_id as number | undefined)
}

watch(editMode, (isEditing) => {
  if (isEditing && vehicle.value) {
    vehicleData.value = buildAdminVehicleEditData(vehicle.value)
    void refreshEditLookups()
  }
})

const cancelEdit = () => {
  if (!vehicle.value) return
  editMode.value = false
  vehicleData.value = buildAdminVehicleEditData(vehicle.value)
}

const saveVehicle = async () => {
  if (!vehicle.value) return

  try {
    updating.value = true
    error.value = null
    const updatedVehicle = await updateVehicle(vehicle.value.id, vehicleData.value)
    vehicle.value = updatedVehicle
    editMode.value = false
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update vehicle'
  } finally {
    updating.value = false
  }
}

const uploadImages = async () => {
  if (!vehicle.value || !imageFiles.value || imageFiles.value.length === 0) return

  try {
    uploadingImages.value = true
    error.value = null
    
    // Get existing image URLs to preserve them
    const existingImageUrls = vehicleImages.value
      .map(img => img.url || img.thumbnailUrl)
      .filter((url): url is string => !!url) // Filter out any null/undefined URLs with type guard
    
    // Send both existing images (as URLs) and new files
    await updateVehicleImages(vehicle.value.id, { 
      images: existingImageUrls,
      files: imageFiles.value 
    })
    
    showImageUploadDialog.value = false
    imageFiles.value = []
    await loadImages()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to upload images'
  } finally {
    uploadingImages.value = false
  }
}

const cancelImageUpload = () => {
  showImageUploadDialog.value = false
  imageFiles.value = []
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
    await deleteVehicleImage(vehicle.value.id, { image_id: imageToDelete.value.id })
    showDeleteImageDialog.value = false
    imageToDelete.value = null
    await loadImages()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete image'
  } finally {
    deletingImage.value = false
  }
}

const saveEquipment = async () => {
  if (!vehicle.value) return

  try {
    savingEquipment.value = true
    error.value = null
    await updateVehicleEquipment(vehicle.value.id, { equipment_ids: selectedEquipment.value })
    showEquipmentDialog.value = false
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update equipment'
  } finally {
    savingEquipment.value = false
  }
}

const cancelEquipmentEdit = () => {
  showEquipmentDialog.value = false
  selectedEquipment.value = []
}

const cancelStatusUpdate = () => {
  showStatusDialog.value = false
  selectedStatus.value = ''
}

const updateStatus = async () => {
  if (!vehicle.value || !selectedStatus.value) return

  try {
    updatingStatus.value = true
    error.value = null
    
    const statusData: UpdateVehicleStatusData = {
      status: selectedStatus.value as VehicleStatus
    }
    
    const updatedVehicle = await updateVehicleStatus(vehicle.value.id, statusData)
    vehicle.value = updatedVehicle
    
    showStatusDialog.value = false
    selectedStatus.value = ''
    
    // Reload vehicle to get updated status
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to update vehicle status'
  } finally {
    updatingStatus.value = false
  }
}

const markAsSold = async () => {
  if (!vehicle.value) return

  try {
    markingAsSold.value = true
    error.value = null
    
    // Use 'sold' status for admin API
    const statusData: UpdateVehicleStatusData = {
      status: VehicleStatus.SOLD
    }
    
    const updatedVehicle = await updateVehicleStatus(vehicle.value.id, statusData)
    vehicle.value = updatedVehicle
    
    showMarkAsSoldDialog.value = false
    
    // Reload vehicle to get updated status
    await loadVehicle()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to mark vehicle as sold'
  } finally {
    markingAsSold.value = false
  }
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
    router.push({ name: 'admin.vehicles' })
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete vehicle'
  } finally {
    deleting.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    published: 'success',
    sold: 'info',
    archived: 'warning',
  }
  return colors[status?.toLowerCase() || ''] || 'grey'
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
    // Initialize with current status (convert to lowercase for API)
    const currentStatus = (vehicle.value.status || vehicle.value.vehicleListStatusName || '').toLowerCase()
    selectedStatus.value = currentStatus as VehicleStatus || ''
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
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.info-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
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

.vehicle-edit-grid :deep(.v-row.dense > .v-col) {
  align-self: flex-start;
}

.vehicle-edit-grid :deep(.v-input),
.vehicle-edit-grid :deep(.v-checkbox) {
  width: 100%;
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

.delete-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.history-item-label {
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
}

.history-item-value {
  font-size: 0.8125rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.history-item-date {
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.5);
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
