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
  enginePower?: number
  towingWeight?: number
  transmissionId?: number
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
  equipment?: any
}

/**
 * Vehicle image model
 */
export interface VehicleImageModel {
  id: number
  vehicleId: number
  url: string
  path: string
  order?: number
  isPrimary?: boolean
  createdAt?: string
}

/**
 * Map API response (snake_case) to VehicleModel (camelCase)
 */
export function mapVehicleFromApi(data: any): VehicleModel {
  return {
    id: data.id,
    dealerId: data.dealer_id,
    userId: data.user_id,
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
    enginePower: data.engine_power,
    towingWeight: data.towing_weight,
    transmissionId: data.transmission_id,
    bodyType: data.body_type,
    hasCarplay: data.has_carplay ?? false,
    hasAdaptiveCruise: data.has_adaptive_cruise ?? false,
    isElectric: data.is_electric ?? false,
    specs: data.specs,
    equipment: data.equipment,
    vehicleListStatusId: data.vehicle_list_status_id,
    vehicleListStatusName: data.vehicle_list_status_name,
    status: data.status,
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
      url: img.url ?? img.image_url ?? img.thumbnail_url ?? img.thumbnail_path,
      path: img.path ?? img.image_path ?? img.thumbnail_path,
      order: img.order ?? img.sort_order,
      isPrimary: img.is_primary,
      createdAt: img.created_at,
    })),
    details: data.details,
    equipment: data.equipment,
  }
}

