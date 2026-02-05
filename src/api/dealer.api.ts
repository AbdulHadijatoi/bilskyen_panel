/**
 * Dealer API Module
 * 
 * Dealer-specific API calls
 * All functions return mapped models, support pagination, use endpoints constants
 */

import httpClient from './http'
import { handleSuccess, handleError } from './response'
import {
  DEALER_VEHICLE_ENDPOINTS,
  DEALER_LEAD_ENDPOINTS,
  DEALER_ENQUIRY_ENDPOINTS,
  DEALER_FAVORITE_ENDPOINTS,
  DEALER_SAVED_SEARCH_ENDPOINTS,
  DEALER_PROFILE_ENDPOINTS,
  DEALER_STAFF_ENDPOINTS,
  DEALER_SUBSCRIPTION_ENDPOINTS,
  DEALER_LOOKUP_ENDPOINTS,
  DEALER_DASHBOARD_ENDPOINTS,
  DEALER_AUDIT_ENDPOINTS,
} from './endpoints'
import type { VehicleModel } from '@/models/vehicle.model'
import { mapVehicleFromApi } from '@/models/vehicle.model'
import type { LeadModel } from '@/models/lead.model'
import { mapLeadFromApi } from '@/models/lead.model'
import type { EnquiryModel } from '@/models/enquiry.model'
import { mapEnquiryFromApi } from '@/models/enquiry.model'
import type { DealerModel } from '@/models/dealer.model'
import { mapDealerFromApi } from '@/models/dealer.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import type { VehicleStatus } from '@/models/vehicle.model'
import type { LeadStage } from '@/models/lead.model'

/**
 * Dealer audit log model
 */
export interface DealerAuditLogModel {
  id: number
  actor_id: number
  actor_type: string
  dealer_id: number
  action: string
  target_type: string
  target_id: number
  related_target_type?: string
  related_target_id?: number
  description?: string
  status?: string
  severity?: string
  tags?: string[]
  metadata?: any
  ip_address?: string
  user_agent?: string
  request_method?: string
  request_url?: string
  created_at: string
}

/**
 * Generate idempotency key header
 */
function getIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// ============================================================================
// VEHICLES
// ============================================================================

/**
 * Get dealer's vehicles with pagination
 */
export async function getVehicles(params?: PaginationParams & {
  status?: VehicleStatus
  search?: string
  min_price?: number
  max_price?: number
  fuel_type_id?: number
  year?: number
}): Promise<PaginationModel<VehicleModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      DEALER_VEHICLE_ENDPOINTS.LIST,
      { params }
    )
    const data = handleSuccess<PaginationModel<any>>(response)
    return {
      ...data,
      docs: data.docs.map(mapVehicleFromApi),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get vehicle by ID
 */
export async function getVehicle(id: number | string): Promise<VehicleModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapVehicleFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create vehicle data
 */
export interface CreateVehicleData {
  registration?: string
  vin?: string
  title?: string
  description?: string
  price: number
  mileage?: number
  year?: number
  fuel_type_id?: number
  transmission_id?: number
  body_type?: string
  location_id?: number
  has_carplay?: boolean
  has_adaptive_cruise?: boolean
  is_electric?: boolean
  specs?: Record<string, any>
  equipment?: string[]
  images?: File[]
  [key: string]: any
}

/**
 * Create vehicle
 * Supports idempotency via header
 */
export async function createVehicle(
  data: CreateVehicleData,
  idempotencyKey?: string
): Promise<VehicleModel> {
  try {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    } else {
      headers['Idempotency-Key'] = getIdempotencyKey()
    }

    const formData = new FormData()
    
    // Handle images separately - append each file individually
    // Laravel expects images[] to be an array of UploadedFile objects
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((file: File) => {
        // Ensure it's a File object
        if (file instanceof File) {
          formData.append('images[]', file, file.name)
        }
      })
    }
    
    // Handle equipment_ids separately - send as equipment_ids[] array for Laravel (matches sell-your-car)
    // Also support legacy 'equipment' key for backward compatibility
    const equipmentArray = data.equipment_ids || data.equipment
    if (equipmentArray && Array.isArray(equipmentArray) && equipmentArray.length > 0) {
      equipmentArray.forEach((equipmentId: number | string) => {
        formData.append('equipment_ids[]', String(equipmentId))
      })
    }
    
    // Handle other fields
    Object.keys(data).forEach((key) => {
      // Skip images, equipment, and equipment_ids as we already handled them above
      if (key === 'images' || key === 'equipment' || key === 'equipment_ids') {
        return
      }
      
      if (data[key] !== undefined && data[key] !== null) {
        if (Array.isArray(data[key])) {
          // For other arrays, send as JSON string
          formData.append(key, JSON.stringify(data[key]))
        } else if (typeof data[key] === 'object') {
          // For objects, send as JSON string
          formData.append(key, JSON.stringify(data[key]))
        } else {
          // For primitives, send as string
          formData.append(key, String(data[key]))
        }
      }
    })

    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.CREATE,
      formData,
      { headers }
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create vehicle draft (no validation)
 * Allows saving incomplete vehicle data without validation
 */
export async function createVehicleDraft(
  data: CreateVehicleData
): Promise<VehicleModel> {
  try {
    const formData = new FormData()
    
    // Handle images separately - append each file individually
    // Laravel expects images[] to be an array of UploadedFile objects
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((file: File) => {
        // Ensure it's a File object
        if (file instanceof File) {
          formData.append('images[]', file, file.name)
        }
      })
    }
    
    // Handle equipment_ids separately - send as equipment_ids[] array for Laravel (matches sell-your-car)
    // Also support legacy 'equipment' key for backward compatibility
    const equipmentArray = data.equipment_ids || data.equipment
    if (equipmentArray && Array.isArray(equipmentArray) && equipmentArray.length > 0) {
      equipmentArray.forEach((equipmentId: number | string) => {
        formData.append('equipment_ids[]', String(equipmentId))
      })
    }
    
    // Handle other fields
    Object.keys(data).forEach((key) => {
      // Skip images, equipment, and equipment_ids as we already handled them above
      if (key === 'images' || key === 'equipment' || key === 'equipment_ids') {
        return
      }
      
      if (data[key] !== undefined && data[key] !== null) {
        if (Array.isArray(data[key])) {
          // For other arrays, send as JSON string
          formData.append(key, JSON.stringify(data[key]))
        } else if (typeof data[key] === 'object') {
          // For objects, send as JSON string
          formData.append(key, JSON.stringify(data[key]))
        } else {
          // For primitives, send as string
          formData.append(key, String(data[key]))
        }
      }
    })

    const response = await httpClient.post<{ success: boolean; message?: string; data: any }>(
      DEALER_VEHICLE_ENDPOINTS.DRAFT,
      formData
    )
    const vehicleData = handleSuccess<any>(response)
    const vehicle = mapVehicleFromApi(vehicleData)
    // Attach message to vehicle object for access in component
    ;(vehicle as any).__message = response.data?.message || 'Vehicle draft saved successfully'
    return vehicle
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle data
 */
export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

/**
 * Update vehicle
 */
export async function updateVehicle(
  id: number | string,
  data: UpdateVehicleData | FormData
): Promise<VehicleModel> {
  try {
    // If data is FormData, send it directly; otherwise convert to FormData if needed
    let requestData: FormData | UpdateVehicleData = data
    
    // Check if data has File objects (images) that need FormData
    if (data instanceof FormData) {
      requestData = data
    } else {
      const updateData = data as UpdateVehicleData
      // Check if images are present and are File objects
      if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0 && updateData.images[0] instanceof File) {
        // Convert to FormData if images are present
        const formData = new FormData()
        
        // Handle images
        updateData.images.forEach((file: File) => {
          if (file instanceof File) {
            formData.append('images[]', file, file.name)
          }
        })
        
        // Handle equipment_ids
        const equipmentArray = updateData.equipment_ids || updateData.equipment
        if (equipmentArray && Array.isArray(equipmentArray) && equipmentArray.length > 0) {
          equipmentArray.forEach((equipmentId: number | string) => {
            formData.append('equipment_ids[]', String(equipmentId))
          })
        }
        
        // Handle other fields
        Object.keys(updateData).forEach((key) => {
          if (key === 'images' || key === 'equipment' || key === 'equipment_ids') {
            return
          }
          
          const value = updateData[key as keyof UpdateVehicleData]
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value))
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value))
            } else {
              formData.append(key, String(value))
            }
          }
        })
        
        requestData = formData
      }
    }
    
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE(id),
      requestData
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete vehicle (soft delete)
 */
export async function deleteVehicle(id: number | string): Promise<void> {
  try {
    await httpClient.post(DEALER_VEHICLE_ENDPOINTS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Upload vehicle images
 */
export async function uploadVehicleImages(
  id: number | string,
  images: File[]
): Promise<VehicleModel> {
  try {
    const formData = new FormData()
    images.forEach((file) => {
      formData.append('images[]', file)
    })

    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPLOAD_IMAGES(id),
      formData
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete vehicle image
 */
export async function deleteVehicleImage(
  vehicleId: number | string,
  imageId: number | string
): Promise<void> {
  try {
    await httpClient.delete(
      DEALER_VEHICLE_ENDPOINTS.DELETE_IMAGE(vehicleId, imageId)
    )
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle status
 */
export interface UpdateVehicleStatusData {
  status?: VehicleStatus
  vehicle_list_status_id?: number
}

/**
 * Update vehicle status
 */
export async function updateVehicleStatus(
  id: number | string,
  data: UpdateVehicleStatusData
): Promise<VehicleModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE_STATUS(id),
      data
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle equipment data
 */
export interface UpdateVehicleEquipmentData {
  equipment_ids: number[]
}

/**
 * Update vehicle equipment
 */
export async function updateVehicleEquipment(
  id: number | string,
  data: UpdateVehicleEquipmentData
): Promise<VehicleModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE_EQUIPMENT(id),
      data
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle price
 */
export interface UpdateVehiclePriceData {
  price: number
}

/**
 * Update vehicle price (creates history)
 */
export async function updateVehiclePrice(
  id: number | string,
  data: UpdateVehiclePriceData
): Promise<VehicleModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE_PRICE(id),
      data
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Fetch vehicle from Nummerplade API
 */
export interface FetchFromNummerpladeData {
  registration?: string
  vin?: string
}

/**
 * Fetch vehicle data from Nummerplade API
 */
export async function fetchVehicleFromNummerplade(
  data: FetchFromNummerpladeData
): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.FETCH_FROM_NUMMERPLADE,
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// LEADS
// ============================================================================

/**
 * Get dealer's leads with pagination
 */
export async function getLeads(params?: PaginationParams & {
  stage_id?: number
  assigned_to_id?: number
  vehicle_id?: number
  search?: string
}): Promise<PaginationModel<LeadModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      DEALER_LEAD_ENDPOINTS.LIST,
      { params }
    )
    const data = handleSuccess<PaginationModel<any>>(response)
    return {
      ...data,
      docs: data.docs.map(mapLeadFromApi),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get lead by ID
 */
export async function getLead(id: number | string): Promise<LeadModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      DEALER_LEAD_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapLeadFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Assign lead to staff
 */
export interface AssignLeadData {
  assigned_to_id: number
}

/**
 * Assign lead to staff member
 */
export async function assignLead(
  id: number | string,
  data: AssignLeadData
): Promise<LeadModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_LEAD_ENDPOINTS.ASSIGN(id),
      data
    )
    const leadData = handleSuccess<any>(response)
    return mapLeadFromApi(leadData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update lead stage
 */
export interface UpdateLeadStageData {
  stage_id: number
}

/**
 * Update lead stage
 */
export async function updateLeadStage(
  id: number | string,
  data: UpdateLeadStageData
): Promise<LeadModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_LEAD_ENDPOINTS.UPDATE_STAGE(id),
      data
    )
    const leadData = handleSuccess<any>(response)
    return mapLeadFromApi(leadData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update lead intent
 */
export interface UpdateLeadIntentData {
  intent_id: number
}

/**
 * Update lead intent
 */
export async function updateLeadIntent(
  id: number | string,
  data: UpdateLeadIntentData
): Promise<LeadModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_LEAD_ENDPOINTS.UPDATE_INTENT(id),
      data
    )
    const leadData = handleSuccess<any>(response)
    return mapLeadFromApi(leadData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update lead category
 */
export interface UpdateLeadCategoryData {
  category_id: number
}

/**
 * Update lead category
 */
export async function updateLeadCategory(
  id: number | string,
  data: UpdateLeadCategoryData
): Promise<LeadModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_LEAD_ENDPOINTS.UPDATE_CATEGORY(id),
      data
    )
    const leadData = handleSuccess<any>(response)
    return mapLeadFromApi(leadData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get lead messages
 */
export async function getLeadMessages(id: number | string): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      DEALER_LEAD_ENDPOINTS.GET_MESSAGES(id)
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Send message to lead
 */
export interface SendLeadMessageData {
  message: string
}

/**
 * Send message to lead
 */
export async function sendLeadMessage(
  id: number | string,
  data: SendLeadMessageData
): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_LEAD_ENDPOINTS.SEND_MESSAGE(id),
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// ENQUIRIES
// ============================================================================

/**
 * Get dealer's enquiries with pagination
 */
export async function getEnquiries(params?: PaginationParams & {
  status?: string
  type?: string
  vehicle_id?: number
  user_id?: number
}): Promise<PaginationModel<EnquiryModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      DEALER_ENQUIRY_ENDPOINTS.LIST,
      { params }
    )
    const data = handleSuccess<PaginationModel<any>>(response)
    return {
      ...data,
      docs: data.docs.map(mapEnquiryFromApi),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get enquiry by ID
 */
export async function getEnquiry(id: number | string): Promise<EnquiryModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      DEALER_ENQUIRY_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapEnquiryFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update enquiry status
 */
export interface UpdateEnquiryStatusData {
  status: string
}

/**
 * Update enquiry status
 */
export async function updateEnquiryStatus(
  id: number | string,
  data: UpdateEnquiryStatusData
): Promise<EnquiryModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_ENQUIRY_ENDPOINTS.UPDATE_STATUS(id),
      data
    )
    const enquiryData = handleSuccess<any>(response)
    return mapEnquiryFromApi(enquiryData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update enquiry type
 */
export interface UpdateEnquiryTypeData {
  type: string
}

/**
 * Update enquiry type
 */
export async function updateEnquiryType(
  id: number | string,
  data: UpdateEnquiryTypeData
): Promise<EnquiryModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_ENQUIRY_ENDPOINTS.UPDATE_TYPE(id),
      data
    )
    const enquiryData = handleSuccess<any>(response)
    return mapEnquiryFromApi(enquiryData)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// FAVORITES
// ============================================================================

/**
 * Get user's favorites
 */
export async function getFavorites(params?: PaginationParams): Promise<PaginationModel<VehicleModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      DEALER_FAVORITE_ENDPOINTS.LIST,
      { params }
    )
    const data = handleSuccess<PaginationModel<any>>(response)
    return {
      ...data,
      docs: data.docs.map(mapVehicleFromApi),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Add favorite
 */
export interface AddFavoriteData {
  vehicle_id: number
}

/**
 * Add vehicle to favorites
 */
export async function addFavorite(data: AddFavoriteData): Promise<void> {
  try {
    await httpClient.post(DEALER_FAVORITE_ENDPOINTS.CREATE, data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Remove favorite
 */
export async function removeFavorite(vehicleId: number | string): Promise<void> {
  try {
    await httpClient.delete(DEALER_FAVORITE_ENDPOINTS.DELETE(vehicleId))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// SAVED SEARCHES
// ============================================================================

/**
 * Saved search model
 */
export interface SavedSearchModel {
  id: number
  name: string
  filters: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

/**
 * Get saved searches
 */
export async function getSavedSearches(): Promise<SavedSearchModel[]> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<SavedSearchModel> }>(
      DEALER_SAVED_SEARCH_ENDPOINTS.LIST
    )
    const paginatedData = handleSuccess<PaginationModel<SavedSearchModel>>(response)
    // Return the docs array, filtering out any null/undefined values and ensuring id exists
    return (paginatedData?.docs || []).filter((search): search is SavedSearchModel => 
      search != null && 
      typeof search === 'object' && 
      'id' in search && 
      search.id != null
    )
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create saved search
 */
export interface CreateSavedSearchData {
  name: string
  filters: Record<string, any>
}

/**
 * Save search
 */
export async function saveSearch(data: CreateSavedSearchData): Promise<SavedSearchModel> {
  try {
    const response = await httpClient.post<{ data: SavedSearchModel }>(
      DEALER_SAVED_SEARCH_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<SavedSearchModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete saved search
 */
export async function deleteSavedSearch(id: number | string): Promise<void> {
  try {
    await httpClient.delete(DEALER_SAVED_SEARCH_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// PROFILE
// ============================================================================

/**
 * Get dealer profile
 */
export async function getProfile(): Promise<DealerModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      DEALER_PROFILE_ENDPOINTS.SHOW
    )
    const data = handleSuccess<any>(response)
    return mapDealerFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update dealer profile
 */
export interface UpdateProfileData {
  // Dealer fields
  cvr?: string
  address?: string
  city?: string
  postcode?: string
  country_code?: string
  // User fields
  name?: string
  email?: string
  phone?: string
}

/**
 * Update dealer profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<DealerModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_PROFILE_ENDPOINTS.UPDATE,
      data
    )
    const dealerData = handleSuccess<any>(response)
    return mapDealerFromApi(dealerData)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// STAFF
// ============================================================================

/**
 * Get dealer staff
 */
export interface StaffMember {
  id: number
  name: string
  email?: string
  username: string
  phone?: string
  membership_role_id?: number
  created_at?: string
}

export async function getStaff(): Promise<StaffMember[]> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      DEALER_STAFF_ENDPOINTS.LIST
    )
    const paginatedData = handleSuccess<PaginationModel<any>>(response)
    // Map the backend response to StaffMember interface
    // Backend returns: { id, name, email, username, phone, created_at }
    return (paginatedData?.docs || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email || undefined,
      username: item.username,
      phone: item.phone || undefined,
      created_at: item.created_at,
    }))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Add staff member - creates new staff user
 */
export interface AddStaffData {
  name: string
  email?: string
  phone?: string
  password: string
}

/**
 * Add staff member
 */
export async function addStaff(data: AddStaffData): Promise<{ dealer_user: any; username: string }> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_STAFF_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update staff member
 */
export interface UpdateStaffData {
  name?: string
  phone?: string
  password?: string
}

/**
 * Update staff member
 */
export async function updateStaff(
  userId: number | string,
  data: UpdateStaffData
): Promise<any> {
  try {
    const response = await httpClient.put<{ data: any }>(
      DEALER_STAFF_ENDPOINTS.UPDATE(userId),
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Remove staff member
 */
export async function removeStaff(userId: number | string): Promise<void> {
  try {
    await httpClient.delete(DEALER_STAFF_ENDPOINTS.DELETE(userId))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// SUBSCRIPTION
// ============================================================================

/**
 * Get current subscription
 */
export async function getSubscription(): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.SHOW
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get available features
 */
export async function getFeatures(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.FEATURES
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.HISTORY
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Plan model interface
 */
export interface PlanModel {
  id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
  trial_days?: number
  features?: any[]
  price_history?: any[]
  priceHistory?: any[]
}

/**
 * Get available plans for dealer
 */
export async function getAvailablePlans(): Promise<PlanModel[]> {
  try {
    const response = await httpClient.get<{ data: PlanModel[] }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.PLANS
    )
    const data = handleSuccess<PlanModel[]>(response)
    // Normalize price_history to priceHistory
    return data.map((plan: any) => ({
      ...plan,
      priceHistory: plan.price_history || plan.priceHistory || [],
      price_history: plan.price_history || plan.priceHistory || [],
    }))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create subscription data interface
 */
export interface CreateDealerSubscriptionData {
  plan_id: number
  billing_cycle: 'monthly' | 'yearly'
  starts_at?: string
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: CreateDealerSubscriptionData): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Dashboard statistics data
 */
export interface DashboardStats {
  overview: {
    vehicles: {
      total: number
      published: number
      draft: number
      sold: number
      archived: number
      new_last_7_days: number
      new_last_30_days: number
      new_this_month: number
      new_last_month: number
      growth_rate: number
      total_value: number
      average_price: number
    }
    leads: {
      total: number
      new_last_7_days: number
      new_last_30_days: number
      new_this_month: number
      new_last_month: number
      growth_rate: number
    }
    subscription: {
      has_subscription: boolean
      plan_name: string
      status: string
      is_active: boolean
    }
  }
  trends: {
    vehicles: Array<{ date: string; count: number }>
  }
  distributions: {
    vehicle_status: Array<{ status: string; count: number; color: string }>
  }
  recent: {
    vehicles: Array<any>
    leads: Array<any>
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await httpClient.get<{ data: DashboardStats }>(
      DEALER_DASHBOARD_ENDPOINTS.STATS
    )
    return handleSuccess<DashboardStats>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// LOOKUP
// ============================================================================

/**
 * Lookup constants response type
 */
export interface LookupConstantsResponse {
  brands: Array<{ id: number; name: string }>
  fuel_types: Array<{ id: number; name: string }>
  gear_types: Array<{ id: number; name: string }>
  vehicle_uses: Array<{ id: number; name: string }>
  sales_types: Array<{ id: number; name: string }>
  price_types: Array<{ id: number; name: string }>
  conditions: Array<{ id: number; name: string }>
  variants: Array<{ id: number; name: string }>
  models: Array<{ id: number; name: string; brand_id: number }>
  equipment_types: Array<{
    id: number
    name: string
    equipments: Array<{ id: number; name: string }>
  }>
  drivetrain_types: Array<{ value: string; title: string }>
  colors?: Array<{ id: number; name: string }>
  body_types?: Array<{ id: number; name: string }>
  model_years?: Array<{ id: number; name: string }>
  transmissions?: Array<{ id: number; name: string }>
  euronorms?: Array<{ id: number; name: string }>
  vehicle_list_statuses?: Array<{ id: number; name: string }>
}

/**
 * Get all lookup constants in a single response
 */
export async function getLookupConstants(): Promise<LookupConstantsResponse> {
  try {
    const response = await httpClient.get<{ data: LookupConstantsResponse }>(
      DEALER_LOOKUP_ENDPOINTS.LOOKUP_CONSTANTS
    )
    return handleSuccess<LookupConstantsResponse>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Lookup vehicle by registration number
 */
export interface LookupVehicleByRegistrationData {
  registration: string
  advanced?: boolean
}

/**
 * Lookup vehicle by registration number using Nummerplade API
 */
export async function lookupVehicleByRegistration(
  registration: string,
  advanced: boolean = true
): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_LOOKUP_ENDPOINTS.VEHICLE_BY_REGISTRATION,
      {
        registration,
        advanced,
      }
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

/**
 * Get audit logs for the dealer with pagination and filtering
 */
export async function getAuditLogs(params?: PaginationParams & {
  actor_id?: number
  target_type?: string
  action?: string
  severity?: string
  status?: string
  date_from?: string
  date_to?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}): Promise<PaginationModel<DealerAuditLogModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<DealerAuditLogModel> }>(
      DEALER_AUDIT_ENDPOINTS.LOGS,
      { params }
    )
    const data = handleSuccess<PaginationModel<DealerAuditLogModel>>(response)
    return data
  } catch (error) {
    throw handleError(error)
  }
}
