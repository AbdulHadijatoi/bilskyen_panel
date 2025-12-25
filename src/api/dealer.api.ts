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
  DEALER_FAVORITE_ENDPOINTS,
  DEALER_SAVED_SEARCH_ENDPOINTS,
  DEALER_PROFILE_ENDPOINTS,
  DEALER_STAFF_ENDPOINTS,
  DEALER_SUBSCRIPTION_ENDPOINTS,
} from './endpoints'
import type { VehicleModel } from '@/models/vehicle.model'
import { mapVehicleFromApi } from '@/models/vehicle.model'
import type { LeadModel } from '@/models/lead.model'
import { mapLeadFromApi } from '@/models/lead.model'
import type { DealerModel } from '@/models/dealer.model'
import { mapDealerFromApi } from '@/models/dealer.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'
import type { ApiErrorModel } from '@/models/api-error.model'
import type { VehicleStatus } from '@/models/vehicle.model'
import type { LeadStage } from '@/models/lead.model'

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
    Object.keys(data).forEach((key) => {
      if (key === 'images' && Array.isArray(data.images)) {
        data.images.forEach((file) => {
          formData.append('images[]', file)
        })
      } else if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]))
        } else {
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
 * Update vehicle data
 */
export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

/**
 * Update vehicle
 */
export async function updateVehicle(
  id: number | string,
  data: UpdateVehicleData
): Promise<VehicleModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE(id),
      data
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
    await httpClient.delete(DEALER_VEHICLE_ENDPOINTS.DELETE(id))
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
  status: VehicleStatus
}

/**
 * Update vehicle status
 */
export async function updateVehicleStatus(
  id: number | string,
  data: UpdateVehicleStatusData
): Promise<VehicleModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
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
    const response = await httpClient.put<{ data: any }>(
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
    const response = await httpClient.get<{ data: SavedSearchModel[] }>(
      DEALER_SAVED_SEARCH_ENDPOINTS.LIST
    )
    return handleSuccess<SavedSearchModel[]>(response)
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
  name?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  description?: string
  logo?: File
}

/**
 * Update dealer profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<DealerModel> {
  try {
    const formData = new FormData()
    Object.keys(data).forEach((key) => {
      if (key === 'logo' && data.logo instanceof File) {
        formData.append('logo', data.logo)
      } else if (data[key as keyof UpdateProfileData] !== undefined) {
        formData.append(key, String(data[key as keyof UpdateProfileData]))
      }
    })

    const response = await httpClient.put<{ data: any }>(
      DEALER_PROFILE_ENDPOINTS.UPDATE,
      formData
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
export async function getStaff(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      DEALER_STAFF_ENDPOINTS.LIST
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Add staff member
 */
export interface AddStaffData {
  user_id: number
  role_id?: number
}

/**
 * Add staff member
 */
export async function addStaff(data: AddStaffData): Promise<any> {
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
 * Update staff role
 */
export interface UpdateStaffData {
  role_id?: number
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

