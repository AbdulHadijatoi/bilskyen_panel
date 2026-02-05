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
          <h1 class="text-h5 font-weight-bold mb-1">Vehicle Details</h1>
          <p class="text-caption text-medium-emphasis mb-0">
            View and manage all vehicle information, images, and equipment
          </p>
        </div>
        <v-btn
          v-if="vehicle && !editMode"
          color="primary"
          prepend-icon="mdi-pencil"
          @click="editMode = true"
          size="small"
        >
          Edit Vehicle
        </v-btn>
        <div v-else-if="vehicle && editMode" class="d-flex gap-2">
          <v-btn
            variant="outlined"
            @click="cancelEdit"
            size="small"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="saveVehicle"
            :loading="updating"
            size="small"
          >
            Save Changes
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-3">Loading vehicle information...</p>
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
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
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
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Variant</div>
                    <div class="field-value">{{ displayValue((vehicle as any).version || vehicle.details?.variant_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.variant_id"
                    :items="variants"
                    item-title="name"
                    item-value="id"
                    label="Variant"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Model Year</div>
                    <div class="field-value">{{ displayValue(vehicle.modelYearName || vehicle.modelYearId) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.model_year_id"
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
                    v-model="vehicleData.vehicle_list_status_id"
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
                    <div class="field-value">{{ vehicle.enginePower ? vehicle.enginePower + ' HP' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.engine_power"
                    label="Engine Power (HP)"
                    type="number"
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
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Ownership Tax</div>
                    <div class="field-value">{{ vehicle.ownershipTax ? formatPrice(vehicle.ownershipTax) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.ownership_tax"
                    label="Ownership Tax"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
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
                    v-model.number="vehicleData.fuel_efficiency"
                    label="Fuel Efficiency (L/100km)"
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
                    <div class="field-value">{{ vehicle.details?.co2_emissions ? vehicle.details.co2_emissions + ' g/km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.co2_emissions"
                    label="CO2 Emissions (g/km)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
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
                    <div class="field-label">Transmission</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.transmission_name || (vehicle as any).transmissionName) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.transmission_id"
                    :items="transmissions"
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
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Drivetrain</div>
                    <div class="field-value">{{ vehicle.details?.drive_axles === 1 ? 'FWD' : vehicle.details?.drive_axles === 2 ? 'AWD' : '-' }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleDataDrivetrain"
                    :items="drivetrainTypes"
                    item-title="title"
                    item-value="value"
                    label="Drivetrain"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Euro Emission Class</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.euronom_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.euronom_id"
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
                    v-model="vehicleData.use_id"
                    :items="vehicleUses"
                    item-title="name"
                    item-value="id"
                    label="Previous Usage"
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
            class="info-card mb-3"
            elevation="0"
          >
            <v-card-title class="card-title">
              <v-icon size="18" class="mr-2">mdi-file-document-edit</v-icon>
              <span class="text-subtitle-1">Vehicle Details</span>
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row dense>
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
                    rows="4"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="info-field">
                    <div class="field-label">Views Count</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.views_count) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Color</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.color_name) }}</div>
                  </div>
                  <v-select
                    v-else
                    v-model="vehicleData.color_id"
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
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Last Inspection Result</div>
                    <div class="field-value">{{ displayValue(vehicle.details?.last_inspection_result) }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model="vehicleData.last_inspection_result"
                    label="Last Inspection Result"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Last Inspection Odometer</div>
                    <div class="field-value">{{ vehicle.details?.last_inspection_odometer ? formatNumber(vehicle.details.last_inspection_odometer) + ' km' : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.last_inspection_odometer"
                    label="Last Inspection Odometer (km)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Is Import</div>
                    <div class="field-value">{{ vehicle.details?.is_import ? 'Yes' : 'No' }}</div>
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
                    <div class="field-value">{{ vehicle.details?.is_factory_new ? 'Yes' : 'No' }}</div>
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
                    <div class="field-label">Annual Tax</div>
                    <div class="field-value">{{ vehicle.details?.annual_tax ? formatPrice(vehicle.details.annual_tax) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.annual_tax"
                    label="Annual Tax"
                    type="number"
                    step="0.01"
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
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Pricing Information Card -->
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
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Wholesale Price</div>
                    <div class="field-value">{{ vehicle.details?.wholesale_price ? formatPrice(vehicle.details.wholesale_price) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.wholesale_price"
                    label="Wholesale Price"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Internal Cost Price</div>
                    <div class="field-value">{{ vehicle.details?.internal_cost_price ? formatPrice(vehicle.details.internal_cost_price) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.internal_cost_price"
                    label="Internal Cost Price"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Price Without Tax</div>
                    <div class="field-value">{{ vehicle.details?.price_without_tax ? formatPrice(vehicle.details.price_without_tax) : '-' }}</div>
                  </div>
                  <v-text-field
                    v-else
                    v-model.number="vehicleData.price_without_tax"
                    label="Price Without Tax"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="kr"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div v-if="!editMode" class="info-field">
                    <div class="field-label">Wholesale Price Includes Delivery</div>
                    <div class="field-value">{{ vehicle.details?.wholesale_price_includes_delivery ? 'Yes' : 'No' }}</div>
                  </div>
                  <v-checkbox
                    v-else
                    v-model="vehicleData.wholesale_price_includes_delivery"
                    label="Wholesale price includes delivery"
                    density="compact"
                    hide-details
                  />
                </v-col>
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
              <div v-if="vehicleImages.length === 0" class="text-center text-medium-emphasis text-caption py-2">
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
          <v-btn variant="text" size="small" @click="cancelImageUpload">Cancel</v-btn>
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
          <v-btn variant="text" size="small" @click="showDeleteImageDialog = false">Cancel</v-btn>
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
          <v-btn variant="text" size="small" @click="cancelEquipmentEdit">Cancel</v-btn>
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

    <!-- Update Status Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="primary" size="18" class="mr-2">mdi-update</v-icon>
          Update Vehicle Status
        </v-card-title>
        <v-card-text class="pa-3">
          <p class="text-body-2 mb-3">
            Current status: <strong>{{ vehicle?.status || vehicle?.vehicleListStatusName || '-' }}</strong>
          </p>
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
          <v-btn variant="text" size="small" @click="cancelStatusUpdate">Cancel</v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="updateStatus"
            :loading="updatingStatus"
            :disabled="!selectedStatus || selectedStatus === (vehicle?.status || vehicle?.vehicleListStatusName)"
          >
            Update Status
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
          <v-btn variant="text" size="small" @click="showMarkAsSoldDialog = false">Cancel</v-btn>
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

    <!-- Delete Vehicle Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center text-subtitle-1">
          <v-icon color="error" size="18" class="mr-2">mdi-delete</v-icon>
          Delete Vehicle
        </v-card-title>
        <v-card-text class="pa-3">
          <p class="text-body-2">
            Are you sure you want to delete <strong>{{ vehicle?.title || `Vehicle #${vehicle?.id}` }}</strong>?
          </p>
          <p class="text-caption text-medium-emphasis mt-1">
            This action will soft delete the vehicle. The vehicle will no longer be visible in the system.
          </p>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            size="small"
            @click="deleteVehicle"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getVehicle,
  updateVehicle,
  updateVehicleStatus,
  updateVehicleEquipment,
  deleteVehicle as deleteVehicleApi,
  uploadVehicleImages,
  deleteVehicleImage,
  getLookupConstants,
  type UpdateVehicleData,
  type UpdateVehicleStatusData,
  type LookupConstantsResponse,
} from '@/api/staff.api'
import type { VehicleStatus } from '@/models/vehicle.model'
import { VehicleStatus as VehicleStatusEnum } from '@/models/vehicle.model'
import type { VehicleModel } from '@/models/vehicle.model'
import type { VehicleImageModel } from '@/models/vehicle.model'
import type { ApiErrorModel } from '@/models/api-error.model'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const vehicle = ref<VehicleModel | null>(null)
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
const selectedStatus = ref<VehicleStatus | ''>('')
const markingAsSold = ref(false)
const loadingConstants = ref(false)

// Constants data
const constants = ref<LookupConstantsResponse | null>(null)
const brands = computed(() => constants.value?.brands || [])
const fuelTypes = computed(() => constants.value?.fuel_types || [])
const gearTypes = computed(() => constants.value?.gear_types || [])
const vehicleModels = computed(() => constants.value?.models || [])
const equipmentTypes = computed(() => constants.value?.equipment_types || [])
const colors = computed(() => constants.value?.colors || [])
const bodyTypes = computed(() => constants.value?.body_types || [])
const variants = computed(() => constants.value?.variants || [])
const priceTypes = computed(() => constants.value?.price_types || [])
const conditions = computed(() => constants.value?.conditions || [])
const salesTypes = computed(() => constants.value?.sales_types || [])
const euronorms = computed(() => constants.value?.euronorms || [])
const vehicleUses = computed(() => constants.value?.vehicle_uses || [])
const modelYears = computed(() => constants.value?.model_years || [])
const transmissions = computed(() => constants.value?.transmissions || [])
const drivetrainTypes = computed(() => constants.value?.drivetrain_types || [])
const vehicleListStatusesFromConstants = computed(() => constants.value?.vehicle_list_statuses || [])

// Filter vehicle models by selected brand
const filteredModels = computed(() => {
  if (!vehicleData.value.brand_id) return []
  return vehicleModels.value.filter(model => model.brand_id === vehicleData.value.brand_id)
})

// Helper to convert drive_axles number to drivetrain string value
const driveAxlesToDrivetrain = (driveAxles: number | null | undefined): string | undefined => {
  if (driveAxles === 1) return 'FWD'
  if (driveAxles === 2) return 'AWD'
  return undefined
}

// Helper to convert drivetrain string value to drive_axles number
const drivetrainToDriveAxles = (drivetrain: string | undefined): number | undefined => {
  if (drivetrain === 'FWD') return 1
  if (drivetrain === 'AWD') return 2
  return undefined
}

// Get vehicle list statuses from constants
const vehicleListStatuses = computed(() => {
  return vehicleListStatusesFromConstants.value
})

// Computed property for drivetrain that converts between drive_axles and drivetrain string
const vehicleDataDrivetrain = computed({
  get: () => {
    return driveAxlesToDrivetrain(vehicleData.value.drive_axles as number | undefined) || ''
  },
  set: (value: string) => {
    vehicleData.value.drive_axles = drivetrainToDriveAxles(value) as number | undefined
  }
})

const loadVehicle = async () => {
  const vehicleId = route.params.id as string
  if (!vehicleId) return

  try {
    loading.value = true
    error.value = null
    const loadedVehicle = await getVehicle(vehicleId)
    vehicle.value = loadedVehicle
    
    // Initialize vehicle images from vehicle object
    if (loadedVehicle.images && Array.isArray(loadedVehicle.images)) {
      vehicleImages.value = loadedVehicle.images
    }
    
    // Initialize vehicle data for editing
    vehicleData.value = {
      title: loadedVehicle.title || undefined,
      registration: loadedVehicle.registration || undefined,
      vin: loadedVehicle.vin || undefined,
      brand_id: loadedVehicle.brandId || undefined,
      model_id: loadedVehicle.modelId || undefined,
      model_year_id: loadedVehicle.modelYearId || undefined,
      variant_id: loadedVehicle.details?.variant_id || undefined,
      version: (loadedVehicle as any).version || undefined,
      km_driven: loadedVehicle.kmDriven || undefined,
      fuel_type_id: loadedVehicle.fuelTypeId || undefined,
      gear_type_id: loadedVehicle.gearTypeId || undefined,
      transmission_id: loadedVehicle.details?.transmission_id || undefined,
      price: loadedVehicle.price || undefined,
      battery_capacity: loadedVehicle.batteryCapacity || undefined,
      range_km: loadedVehicle.rangeKm || undefined,
      charging_type: loadedVehicle.chargingType || undefined,
      engine_power: loadedVehicle.enginePower || undefined,
      towing_weight: loadedVehicle.towingWeight || undefined,
      ownership_tax: loadedVehicle.ownershipTax || undefined,
      first_registration_date: loadedVehicle.firstRegistrationDate || undefined,
      fuel_efficiency: loadedVehicle.fuelEfficiency || undefined,
      vehicle_list_status_id: loadedVehicle.vehicleListStatusId || undefined,
      // Vehicle details fields (using snake_case as returned from backend)
      description: loadedVehicle.details?.description || undefined,
      color_id: loadedVehicle.details?.color_id || undefined,
      body_type_id: loadedVehicle.details?.body_type_id || undefined,
      production_date: loadedVehicle.details?.production_date || undefined,
      last_inspection_date: loadedVehicle.details?.last_inspection_date || undefined,
      last_inspection_result: loadedVehicle.details?.last_inspection_result || undefined,
      last_inspection_odometer: loadedVehicle.details?.last_inspection_odometer || undefined,
      is_import: loadedVehicle.details?.is_import || undefined,
      is_factory_new: loadedVehicle.details?.is_factory_new || undefined,
      servicebog: loadedVehicle.details?.servicebog || undefined,
      annual_tax: loadedVehicle.details?.annual_tax || undefined,
      cover_image_index: loadedVehicle.details?.cover_image_index || undefined,
      co2_emissions: loadedVehicle.details?.co2_emissions || undefined,
      fuel_consumption_wltp: loadedVehicle.details?.fuel_consumption_wltp || undefined,
      fuel_consumption_nedc: loadedVehicle.details?.fuel_consumption_nedc || undefined,
      engine_type: loadedVehicle.details?.engine_type || undefined,
      drive_axles: loadedVehicle.details?.drive_axles || undefined,
      euronom_id: loadedVehicle.details?.euronom_id || undefined,
      use_id: loadedVehicle.details?.use_id || undefined,
      price_type_id: loadedVehicle.details?.price_type_id || undefined,
      condition_id: loadedVehicle.details?.condition_id || undefined,
      sales_type_id: loadedVehicle.details?.sales_type_id || undefined,
      wholesale_price: loadedVehicle.details?.wholesale_price || undefined,
      internal_cost_price: loadedVehicle.details?.internal_cost_price || undefined,
      price_without_tax: loadedVehicle.details?.price_without_tax || undefined,
      wholesale_price_includes_delivery: loadedVehicle.details?.wholesale_price_includes_delivery || undefined,
    }
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load vehicle'
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
    console.error('Failed to load constants:', err)
  } finally {
    loadingConstants.value = false
  }
}

const onBrandChange = () => {
  // Reset model_id when brand changes
  vehicleData.value.model_id = undefined
}

const cancelEdit = () => {
  if (!vehicle.value) return
  editMode.value = false
  // Reset form data
  vehicleData.value = {
    title: vehicle.value.title || undefined,
    registration: vehicle.value.registration || undefined,
    vin: vehicle.value.vin || undefined,
    brand_id: vehicle.value.brandId || undefined,
    model_id: vehicle.value.modelId || undefined,
    model_year_id: vehicle.value.modelYearId || undefined,
    variant_id: vehicle.value.details?.variant_id || undefined,
    version: (vehicle.value as any).version || undefined,
    km_driven: vehicle.value.kmDriven || undefined,
    fuel_type_id: vehicle.value.fuelTypeId || undefined,
    gear_type_id: vehicle.value.gearTypeId || undefined,
    transmission_id: vehicle.value.details?.transmission_id || undefined,
    price: vehicle.value.price || undefined,
    battery_capacity: vehicle.value.batteryCapacity || undefined,
    range_km: vehicle.value.rangeKm || undefined,
    charging_type: vehicle.value.chargingType || undefined,
    engine_power: vehicle.value.enginePower || undefined,
    towing_weight: vehicle.value.towingWeight || undefined,
    ownership_tax: vehicle.value.ownershipTax || undefined,
    first_registration_date: vehicle.value.firstRegistrationDate || undefined,
    fuel_efficiency: vehicle.value.fuelEfficiency || undefined,
    vehicle_list_status_id: vehicle.value.vehicleListStatusId || undefined,
    // Vehicle details fields (using snake_case as returned from backend)
    description: vehicle.value.details?.description || undefined,
    color_id: vehicle.value.details?.color_id || undefined,
    body_type_id: vehicle.value.details?.body_type_id || undefined,
    production_date: vehicle.value.details?.production_date || undefined,
    last_inspection_date: vehicle.value.details?.last_inspection_date || undefined,
    last_inspection_result: vehicle.value.details?.last_inspection_result || undefined,
    last_inspection_odometer: vehicle.value.details?.last_inspection_odometer || undefined,
    is_import: vehicle.value.details?.is_import || undefined,
    is_factory_new: vehicle.value.details?.is_factory_new || undefined,
    servicebog: vehicle.value.details?.servicebog || undefined,
    annual_tax: vehicle.value.details?.annual_tax || undefined,
    cover_image_index: vehicle.value.details?.cover_image_index || undefined,
    co2_emissions: vehicle.value.details?.co2_emissions || undefined,
    fuel_consumption_wltp: vehicle.value.details?.fuel_consumption_wltp || undefined,
    fuel_consumption_nedc: vehicle.value.details?.fuel_consumption_nedc || undefined,
    engine_type: vehicle.value.details?.engine_type || undefined,
    drive_axles: vehicle.value.details?.drive_axles || undefined,
    euronom_id: vehicle.value.details?.euronom_id || undefined,
    use_id: vehicle.value.details?.use_id || undefined,
    price_type_id: vehicle.value.details?.price_type_id || undefined,
    condition_id: vehicle.value.details?.condition_id || undefined,
    sales_type_id: vehicle.value.details?.sales_type_id || undefined,
    wholesale_price: vehicle.value.details?.wholesale_price || undefined,
    internal_cost_price: vehicle.value.details?.internal_cost_price || undefined,
    price_without_tax: vehicle.value.details?.price_without_tax || undefined,
    wholesale_price_includes_delivery: vehicle.value.details?.wholesale_price_includes_delivery || undefined,
  }
}

const saveVehicle = async () => {
  if (!vehicle.value) return

  try {
    updating.value = true
    error.value = null
    
    // Prepare update data - ensure drive_axles is set correctly from drivetrain
    const updateData: UpdateVehicleData = { ...vehicleData.value }
    
    // Convert drivetrain string to drive_axles number if needed
    if (vehicleDataDrivetrain.value && !updateData.drive_axles) {
      updateData.drive_axles = drivetrainToDriveAxles(vehicleDataDrivetrain.value) as number | undefined
    }
    
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
    
    const updatedVehicle = await uploadVehicleImages(vehicle.value.id, imageFiles.value)
    vehicle.value = updatedVehicle
    
    // Update images list
    if (updatedVehicle.images && Array.isArray(updatedVehicle.images)) {
      vehicleImages.value = updatedVehicle.images
    }
    
    showImageUploadDialog.value = false
    imageFiles.value = []
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
    await deleteVehicleImage(vehicle.value.id, imageToDelete.value.id)
    showDeleteImageDialog.value = false
    imageToDelete.value = null
    
    // Reload vehicle to get updated images
    await loadVehicle()
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
    
    // Ensure equipment_ids are numbers
    const equipmentIds = selectedEquipment.value
      .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter(id => !isNaN(id) && typeof id === 'number')
    
    await updateVehicleEquipment(vehicle.value.id, { equipment_ids: equipmentIds })
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

const confirmDeleteVehicle = () => {
  showDeleteDialog.value = true
}

const deleteVehicle = async () => {
  if (!vehicle.value) return

  try {
    deleting.value = true
    error.value = null
    await deleteVehicleApi(vehicle.value.id)
    router.push({ name: 'staff.vehicles.overview' })
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to delete vehicle'
  } finally {
    deleting.value = false
  }
}

// Status options for the status update dialog - map from constants to API format
// API accepts: draft, published, unpublished, archived
const statusOptions = computed(() => {
  const validApiStatuses = ['draft', 'published', 'unpublished', 'archived']
  
  return vehicleListStatusesFromConstants.value
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
    
    // Send vehicle_list_status_id: 3 (Sold) instead of status text
    const statusData: UpdateVehicleStatusData = {
      vehicle_list_status_id: 3
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

.delete-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
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
