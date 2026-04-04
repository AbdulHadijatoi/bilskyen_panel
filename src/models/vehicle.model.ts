/**
 * Vehicle Model
 * 
 * Maps backend vehicle response to TypeScript interface
 */

/**
 * Vehicle list status (matches backend VehicleListStatus constants)
 */
export enum VehicleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
  ARCHIVED = 'archived',
}

/**
 * Vehicle model interface
 */
export interface VehicleModel {
  id: number
  dealerId?: number
  userId?: number
  dmrFactVehicleId?: number
  locationId?: number
  registration?: string
  vin?: string
  title?: string
  description?: string
  brandName?: string
  modelName?: string
  modelYearName?: string
  price: number
  mileage?: number
  year?: number
  kmDriven?: number
  fuelTypeId?: number
  gearTypeId?: number
  enginePower?: number
  towingWeight?: number
  batteryCapacity?: number
  rangeKm?: number
  chargingType?: string
  ownershipTax?: number
  calculatedOwnershipTax?: number
  firstRegistrationDate?: string
  firstRegistrationYear?: number
  lastInspectionDate?: string
  fuelEfficiency?: number
  brandId?: number
  modelId?: number
  modelYearId?: number
  /** DMR colour id (`vehicles.colour_id`) */
  colourId?: number
  /** DMR emission norm id (`vehicles.emission_norm_id`) */
  emissionNormId?: number
  listingTypeId?: number
  transmissionId?: number
  variantId?: number
  bodyTypeId?: number
  vehicleUseId?: number
  enginePowerKw?: number
  enginePowerHp?: number
  bodyType?: string
  hasCarplay?: boolean
  hasAdaptiveCruise?: boolean
  isElectric?: boolean
  specs?: Record<string, any>
  equipment?: string[] | Record<string, any>
  vehicleListStatusId?: number
  vehicleListStatusName?: string
  status?: VehicleStatus
  publishedAt?: string
  viewsCount?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  
  // Relations (if included in response)
  dealer?: any
  user?: any
  location?: any
  fuelType?: any
  transmission?: any
  gearTypeName?: string
  fuelTypeName?: string
  listingTypeName?: string
  images?: VehicleImageModel[]
  details?: Record<string, any>
}

/**
 * Vehicle image model
 */
export interface VehicleImageModel {
  id: number
  vehicleId: number
  url: string
  thumbnailUrl?: string
  path: string
  thumbnailPath?: string
  order?: number
  sortOrder?: number
  isPrimary?: boolean
  createdAt?: string
}

/**
 * Dealer `show` returns a flat payload; older views expect `details.*`. Merge root fields into `details`.
 */
function mergeDealerDetailsFromFlatResponse(data: any): Record<string, any> | undefined {
  const nested = data.details
  const base: Record<string, any> =
    nested && typeof nested === 'object' && !Array.isArray(nested) ? { ...nested } : {}

  const driveRaw = data.drive_axles
  let driveAxlesScalar: number | undefined
  if (Array.isArray(driveRaw) && driveRaw.length > 0 && typeof driveRaw[0] === 'number') {
    driveAxlesScalar = driveRaw[0]
  } else if (typeof driveRaw === 'number') {
    driveAxlesScalar = driveRaw
  }

  const fromRoot: Record<string, any> = {
    variant_id: data.variant_id,
    variant_name: data.variant_name,
    gear_type_id: data.gear_type_id,
    gear_type_name: data.gear_type_name,
    body_type_id: data.body_type_id,
    body_type_name: data.body_type_name,
    color_name: data.colour_name,
    co2_emissions: data.co2_emission,
    fuel_consumption_wltp: data.fuel_consumption_wltp,
    fuel_consumption_nedc: data.fuel_consumption_nedc,
    engine_type: data.engine_type,
    drive_axles: driveAxlesScalar !== undefined ? driveAxlesScalar : driveRaw,
    euronom_name: data.emission_norm_name,
    use_name: data.use_name,
    use_id: data.vehicle_use_id,
    description: data.description,
    views_count: data.views_count,
    production_date: data.production_date,
    first_registration_year: data.first_registration_year,
    last_inspection_date: data.last_inspection_date,
    last_inspection_result: data.last_inspection_result,
    last_inspection_odometer: data.last_inspection_odometer,
    is_import: data.is_import,
    is_factory_new: data.is_factory_new,
    servicebog: data.servicebog,
    annual_tax: data.annual_tax,
    calculated_ownership_tax: data.calculated_ownership_tax,
    cover_image_index: data.cover_image_index,
    price_type_name: data.price_type_name,
    condition_name: data.condition_name,
    sales_type_name: data.sales_type_name,
    internal_cost_price: data.internal_cost_price,
    price_type_id: data.price_type_id,
    condition_id: data.condition_id,
    sales_type_id: data.sales_type_id,
    emission_norm_id: data.emission_norm_id,
    leasing_enabled: data.leasing_enabled,
    leasing_type: data.leasing_type,
    leasing_customer_type: data.leasing_customer_type,
    leasing_first_payment: data.leasing_first_payment,
    leasing_residual_value: data.leasing_residual_value,
    leasing_duration: data.leasing_duration,
    leasing_annual_mileage: data.leasing_annual_mileage,
    leasing_total_cost: data.leasing_total_cost,
  }

  const merged: Record<string, any> = { ...base }
  for (const [k, v] of Object.entries(fromRoot)) {
    if (v !== undefined) {
      merged[k] = v
    }
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}

/**
 * Map API response (snake_case) to VehicleModel (camelCase)
 */
export function mapVehicleFromApi(data: any): VehicleModel {
  const listRel = data.vehicle_list_status
  const statusNameFromRel =
    listRel &&
    typeof listRel === 'object' &&
    !Array.isArray(listRel) &&
    typeof (listRel as { name?: unknown }).name === 'string'
      ? (listRel as { name: string }).name
      : undefined
  const listStatusIdFromRel =
    listRel &&
    typeof listRel === 'object' &&
    !Array.isArray(listRel) &&
    typeof (listRel as { id?: unknown }).id === 'number'
      ? (listRel as { id: number }).id
      : undefined

  const vehicleListStatusName =
    data.vehicle_list_status_name ?? statusNameFromRel
  const statusFromApi = data.status
  const statusResolved =
    typeof statusFromApi === 'string' && statusFromApi !== ''
      ? statusFromApi
      : typeof vehicleListStatusName === 'string'
        ? vehicleListStatusName.toLowerCase()
        : undefined

  return {
    id: data.id,
    dealerId: data.dealer_id,
    userId: data.user_id,
    dmrFactVehicleId: data.dmr_fact_vehicle_id ?? data.dmrFactVehicleId,
    locationId: data.location_id,
    registration: data.registration,
    vin: data.vin,
    title: data.title,
    description: data.description,
    brandName: data.brand_name,
    modelName: data.model_name,
    modelYearName: data.model_year_name,
    price: data.price ?? 0,
    mileage: data.mileage,
    year: data.year,
    kmDriven: data.km_driven,
    fuelTypeId: data.fuel_type_id,
    gearTypeId: data.gear_type_id,
    enginePower:
      data.engine_power_hp ?? data.engine_power_kw ?? data.engine_power,
    enginePowerKw: data.engine_power_kw,
    enginePowerHp: data.engine_power_hp,
    towingWeight: data.towing_weight,
    batteryCapacity: data.battery_capacity,
    rangeKm: data.range_km,
    chargingType: data.charging_type,
    ownershipTax: data.ownership_tax,
    calculatedOwnershipTax: data.calculated_ownership_tax,
    firstRegistrationDate: data.first_registration_date,
    firstRegistrationYear:
      data.first_registration_year !== undefined &&
      data.first_registration_year !== null &&
      data.first_registration_year !== ''
        ? Number(data.first_registration_year)
        : undefined,
    lastInspectionDate: data.last_inspection_date,
    fuelEfficiency: data.km_per_liter,
    brandId: data.brand_id,
    modelId: data.model_id,
    variantId: data.variant_id,
    bodyTypeId: data.body_type_id,
    vehicleUseId: data.vehicle_use_id,
    modelYearId: data.model_year ?? data.model_year_id,
    colourId: data.colour_id ?? data.color_id,
    emissionNormId: data.emission_norm_id ?? data.euronom_id,
    listingTypeId: data.listing_type_id,
    transmissionId: data.gear_type_id ?? data.transmission_id,
    bodyType: data.body_type,
    hasCarplay: data.has_carplay ?? false,
    hasAdaptiveCruise: data.has_adaptive_cruise ?? false,
    isElectric: data.is_electric ?? false,
    specs: data.specs,
    equipment: data.equipment,
    vehicleListStatusId:
      data.list_status_id ??
      data.vehicle_list_status_id ??
      listStatusIdFromRel,
    vehicleListStatusName,
    status: statusResolved as VehicleModel['status'],
    publishedAt: data.published_at,
    viewsCount: data.views_count ?? 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
    dealer: data.dealer,
    user: data.user,
    location: data.location,
    fuelType: data.fuel_type,
    transmission: data.transmission,
    gearTypeName: data.gear_type_name,
    fuelTypeName: data.fuel_type_name,
    listingTypeName: data.listing_type_name,
    images: data.images?.map((img: any) => ({
      id: img.id,
      vehicleId: img.vehicle_id,
      url: img.url ?? img.image_url ?? img.thumbnail_url,
      thumbnailUrl: img.thumbnail_url,
      path: img.path ?? img.image_path ?? img.thumbnail_path,
      thumbnailPath: img.thumbnail_path,
      order: img.order ?? img.sort_order,
      sortOrder: img.sort_order,
      isPrimary: img.is_primary,
      createdAt: img.created_at,
    })),
    details: mergeDealerDetailsFromFlatResponse(data),
  }
}

