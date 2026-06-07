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
  DEALER_ANALYTICS_ENDPOINTS,
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
import { useAuthStore } from '@/stores/auth.store'
import { pickVehiclePersistFields } from '@/constants/vehicle-persist-fields'

/**
 * Dealer audit log model
 */
export interface DealerAuditLogModel {
  id: number
  actor_id: number
  actor_type: string
  dealer_id: number
  action: string
  status: string
  error_message?: string | null
  duration_ms?: number | null
  request_method?: string | null
  request_url?: string | null
  target_type: string
  target_id: number
  related_target_type?: string | null
  related_target_id?: number | null
  description?: string | null
  tags?: string | null
  severity?: string | null
  metadata?: Record<string, any> | null
  payload_before?: Record<string, any> | null
  payload_after?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  session_id?: string | null
  request_id?: string | null
  created_at?: string
}

/**
 * Generate idempotency key header
 */
function getIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/** @deprecated use pickVehiclePersistFields from @/constants/vehicle-persist-fields */
function pickDmrSlimVehicleFields(
  input: Record<string, any>,
  options?: { omitListStatusId?: boolean }
): Record<string, any> {
  return pickVehiclePersistFields(input, options)
}

/** Multipart form values are strings; MySQL tinyint/boolean columns reject `"true"` / `"false"`. */
const DEALER_VEHICLE_FORM_BOOLEAN_KEYS = new Set<string>([
  'leasing_enabled',
  'is_import',
  'is_factory_new',
  'particle_filter',
  'ncap_test',
])

function appendVehicleFieldToFormData(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return
  }
  if (DEALER_VEHICLE_FORM_BOOLEAN_KEYS.has(key)) {
    const truthy =
      value === true ||
      value === 1 ||
      value === '1' ||
      (typeof value === 'string' &&
        ['true', 'on', 'yes'].includes(value.toLowerCase().trim()))
    formData.append(key, truthy ? '1' : '0')
    return
  }
  if (Array.isArray(value)) {
    formData.append(key, JSON.stringify(value))
  } else if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value))
  } else {
    formData.append(key, String(value))
  }
}

// ============================================================================
// VEHICLES
// ============================================================================

/**
 * Get dealer's vehicles with pagination
 */
export async function getVehicles(params?: PaginationParams & {
  list_status_id?: number
  /** @deprecated use list_status_id */
  vehicle_list_status_id?: number
  search?: string
  min_price?: number
  max_price?: number
  fuel_type_id?: number
  year?: number
}): Promise<PaginationModel<VehicleModel>> {
  try {
    const query: Record<string, any> = params ? { ...params } : {}
    if (query.list_status_id === undefined && query.vehicle_list_status_id !== undefined) {
      query.list_status_id = query.vehicle_list_status_id
      delete query.vehicle_list_status_id
    }
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      DEALER_VEHICLE_ENDPOINTS.LIST,
      { params: query }
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
    
    // Persist only slim `vehicles` columns (DMR contract)
    const slimPayload = pickDmrSlimVehicleFields(data as Record<string, any>) as Record<string, any>
    Object.keys(slimPayload).forEach((key) => {
      appendVehicleFieldToFormData(formData, key, slimPayload[key])
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
    
    // Persist only slim `vehicles` columns (DMR contract).
    // Draft status is set server-side, so omit any client-provided `vehicle_list_status_id`.
    const slimPayload = pickDmrSlimVehicleFields(data as Record<string, any>, { omitListStatusId: true }) as Record<string, any>
    Object.keys(slimPayload).forEach((key) => {
      appendVehicleFieldToFormData(formData, key, slimPayload[key])
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
    // If data is FormData, send it directly; otherwise whitelist slim fields.
    let requestData: FormData | UpdateVehicleData | Record<string, any> = data
    
    // Check if data has File objects (images) that need FormData
    if (data instanceof FormData) {
      requestData = data
    } else {
      const updateData = data as UpdateVehicleData

      // equipment_ids is a relation pivot; keep it even though it's not part of the slim set.
      const equipmentArray = (updateData as any).equipment_ids || (updateData as any).equipment
      const slimPayload = pickDmrSlimVehicleFields(updateData as Record<string, any>) as Record<string, any>

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
        
        if (equipmentArray && Array.isArray(equipmentArray) && equipmentArray.length > 0) {
          equipmentArray.forEach((equipmentId: number | string) => {
            formData.append('equipment_ids[]', String(equipmentId))
          })
        }

        // Persist only slim `vehicles` columns (DMR contract)
        Object.keys(slimPayload).forEach((key) => {
          appendVehicleFieldToFormData(formData, key, slimPayload[key])
        })

        requestData = formData
      } else {
        // JSON request: only send slim fields + equipment_ids
        requestData = {
          ...slimPayload,
          ...(equipmentArray && Array.isArray(equipmentArray) && equipmentArray.length > 0
            ? { equipment_ids: equipmentArray }
            : {}),
        }
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
  list_status_id?: number
  /** @deprecated use list_status_id */
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
    const payload: Record<string, any> = { ...data }
    if (payload.list_status_id === undefined && payload.vehicle_list_status_id !== undefined) {
      payload.list_status_id = payload.vehicle_list_status_id
      delete payload.vehicle_list_status_id
    }
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE_STATUS(id),
      payload
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
 * Dealer vehicle preview by registration number or VIN (DMR-backed; POST /dealer/vehicles/lookup-by-registration).
 */
export interface DealerVehicleLookupPayload {
  registration?: string
  vin?: string
}

/**
 * Look up vehicle data by registration or VIN for dealer create flow.
 */
export interface VehicleImportRowIssue {
  field: string
  value: string
  message: string
}

export interface VehicleImportRowResult {
  row: number
  status: 'created' | 'created_with_warnings' | 'failed' | 'validated'
  vehicle_id?: number | null
  registration?: string | null
  warnings: VehicleImportRowIssue[]
  errors: VehicleImportRowIssue[]
}

export interface VehicleImportResult {
  summary: {
    total: number
    created: number
    failed: number
    warnings: number
  }
  rows: VehicleImportRowResult[]
}

export interface VehicleImportSample {
  headers: string[]
  row: Record<string, string>
}

/**
 * Download bulk import Excel template.
 */
export async function downloadVehicleImportTemplate(): Promise<void> {
  const response = await httpClient.get(DEALER_VEHICLE_ENDPOINTS.IMPORT_TEMPLATE, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'vehicle-import-template.xlsx'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Fetch sample row metadata for inline UI table.
 */
export async function getVehicleImportSample(): Promise<VehicleImportSample> {
  const response = await httpClient.get<{ data: VehicleImportSample }>(
    DEALER_VEHICLE_ENDPOINTS.IMPORT_SAMPLE
  )
  return handleSuccess<VehicleImportSample>(response)
}

/**
 * Bulk import vehicles from Excel/CSV.
 */
export async function importVehicles(
  file: File,
  options?: { dryRun?: boolean }
): Promise<VehicleImportResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await httpClient.post<{ data: VehicleImportResult }>(
    DEALER_VEHICLE_ENDPOINTS.IMPORT,
    formData,
    { params: options?.dryRun ? { dry_run: 1 } : undefined }
  )
  return handleSuccess<VehicleImportResult>(response)
}

export async function lookupDealerVehicleByIdentity(
  data: DealerVehicleLookupPayload
): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.LOOKUP_BY_REGISTRATION,
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
 * Update dealer profile (single endpoint: text fields + optional logo)
 * Sends multipart/form-data so logo can be included when provided.
 */
export async function updateProfile(data: UpdateProfileData, logoFile?: File | null): Promise<DealerModel> {
  try {
    const formData = new FormData()
    const keys: (keyof UpdateProfileData)[] = ['name', 'email', 'phone', 'cvr', 'address', 'city', 'postcode', 'country_code']
    for (const key of keys) {
      const value = data[key]
      if (value !== undefined && value !== '') {
        formData.append(key, String(value))
      }
    }
    if (logoFile instanceof File) {
      formData.append('logo', logoFile, logoFile.name)
    }
    const response = await httpClient.post<{ data: any }>(
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
 * Get available features (returns array of feature objects)
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
 * Get subscription features as key-value pairs
 * This loads features into the auth store
 */
export async function loadSubscriptionFeatures(): Promise<Record<string, string>> {
  try {
    const response = await httpClient.get<{ data: Record<string, string> }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.FEATURES
    )
    const features = handleSuccess<Record<string, string>>(response)
    
    // Update auth store with features
    const authStore = useAuthStore()
    authStore.setSubscriptionFeatures(features)
    
    return features
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

export interface DealerPendingChangeRequestModel {
  id: number
  dealer_id: number
  requested_plan_id: number
  billing_cycle: 'monthly' | 'yearly'
  starts_at?: string | null
  status: string
  requested_plan?: PlanModel
}

/**
 * Pending subscription change request (awaiting admin approval)
 */
export async function getPendingSubscriptionChangeRequest(): Promise<DealerPendingChangeRequestModel | null> {
  try {
    const response = await httpClient.get<{ data: DealerPendingChangeRequestModel | null }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.PENDING_CHANGE_REQUEST
    )
    return handleSuccess<DealerPendingChangeRequestModel | null>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Cancel pending subscription change request
 */
export async function cancelPendingSubscriptionChangeRequest(): Promise<DealerPendingChangeRequestModel> {
  try {
    const response = await httpClient.post<{ data: DealerPendingChangeRequestModel }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.CANCEL_CHANGE_REQUEST,
      {}
    )
    return handleSuccess<DealerPendingChangeRequestModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export interface CreateDealerSubscriptionRequestResult {
  pending_change_request: DealerPendingChangeRequestModel
}

/**
 * Submit a subscription plan request (requires admin approval; does not change plan immediately).
 */
export async function createSubscription(
  data: CreateDealerSubscriptionData
): Promise<CreateDealerSubscriptionRequestResult & { message?: string }> {
  try {
    const response = await httpClient.post<{ data: CreateDealerSubscriptionRequestResult; message?: string }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.CREATE,
      data
    )
    const result = handleSuccess<CreateDealerSubscriptionRequestResult>(response)
    const message =
      typeof (response.data as { message?: string })?.message === 'string'
        ? (response.data as { message?: string }).message
        : undefined
    return { ...result, message }
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
  /** Dealer/Staff API returns vehicle_models; public API may return models */
  models?: Array<{ id: number; name: string; brand_id: number }>
  vehicle_models?: Array<{ id: number; name: string; brand_id: number }>
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
 * Lookup vehicle by registration (internal lookup service; supports advanced mode).
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

/**
 * Get a single audit log by ID
 */
export async function getAuditLog(id: number): Promise<DealerAuditLogModel> {
  try {
    const response = await httpClient.get<{ data: DealerAuditLogModel }>(
      `${DEALER_AUDIT_ENDPOINTS.LOGS}/${id}`
    )
    return handleSuccess<DealerAuditLogModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get analytics overview
 */
export async function getAnalyticsOverview(dateRange?: string): Promise<import('@/models/analytics.model').DealerAnalyticsOverview> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').DealerAnalyticsOverview }>(
      DEALER_ANALYTICS_ENDPOINTS.OVERVIEW,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get lead analytics
 */
export async function getAnalyticsLeads(dateRange?: string): Promise<import('@/models/analytics.model').DealerLeadAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').DealerLeadAnalytics }>(
      DEALER_ANALYTICS_ENDPOINTS.LEADS,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get vehicle analytics
 */
export async function getAnalyticsVehicles(dateRange?: string): Promise<import('@/models/analytics.model').DealerVehicleAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').DealerVehicleAnalytics }>(
      DEALER_ANALYTICS_ENDPOINTS.VEHICLES,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get marketing analytics
 */
export async function getAnalyticsMarketing(dateRange?: string): Promise<import('@/models/analytics.model').MarketingAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').MarketingAnalytics }>(
      DEALER_ANALYTICS_ENDPOINTS.MARKETING,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get subscription usage analytics
 */
export async function getAnalyticsSubscription(): Promise<import('@/models/analytics.model').SubscriptionUsage> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').SubscriptionUsage }>(
      DEALER_ANALYTICS_ENDPOINTS.SUBSCRIPTION
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}
