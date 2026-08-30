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
  DEALER_LEAD_CRM_ENDPOINTS,
  DEALER_ENQUIRY_ENDPOINTS,
  DEALER_FAVORITE_ENDPOINTS,
  DEALER_SAVED_SEARCH_ENDPOINTS,
  DEALER_PROFILE_ENDPOINTS,
  DEALER_STAFF_ENDPOINTS,
  DEALER_SUBSCRIPTION_ENDPOINTS,
  DEALER_BILLING_ENDPOINTS,
  DEALER_AI_ENDPOINTS,
  DEALER_LOOKUP_ENDPOINTS,
  DEALER_DASHBOARD_ENDPOINTS,
  DEALER_AUDIT_ENDPOINTS,
  DEALER_ANALYTICS_ENDPOINTS,
  DEALER_NOTIFICATION_ENDPOINTS,
  DEALER_FEED_ENDPOINTS,
  DEALER_SYNDICATION_ENDPOINTS,
  DEALER_TRADE_IN_ENDPOINTS,
  DEALER_BRANDING_ENDPOINTS,
  DEALER_DMS_ENDPOINTS,
  DEALER_COMPLIANCE_ENDPOINTS,
  DEALER_BULK_PRICE_ENDPOINTS,
  DEALER_MARKETING_ENDPOINTS,
  DEALER_DEAL_QUOTE_ENDPOINTS,
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
    const mapped = mapVehicleFromApi(data) as VehicleModel & {
      fairPrice?: { label?: string; diff_percent?: number; suggested_min?: number; suggested_max?: number }
      listingHealth?: { score?: number; issues?: Array<{ message: string }> }
    }
    mapped.fairPrice = data.fair_price
    mapped.listingHealth = data.listing_health
    ;(mapped as VehicleModel & { pricingIntelligence?: unknown }).pricingIntelligence = data.pricing_intelligence
    ;(mapped as VehicleModel & { listingBoost?: unknown }).listingBoost = data.listing_boost
    return mapped
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

    const remoteImageUrls = (data as Record<string, unknown>).image_urls
    if (Array.isArray(remoteImageUrls)) {
      remoteImageUrls.forEach((url: unknown) => {
        if (typeof url === 'string' && url.trim() !== '') {
          formData.append('image_urls[]', url.trim())
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

    const draftRemoteImageUrls = (data as Record<string, unknown>).image_urls
    if (Array.isArray(draftRemoteImageUrls)) {
      draftRemoteImageUrls.forEach((url: unknown) => {
        if (typeof url === 'string' && url.trim() !== '') {
          formData.append('image_urls[]', url.trim())
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
 * Soft-delete multiple vehicles at once
 */
export async function bulkDeleteVehicles(
  ids: Array<number | string>
): Promise<{ deleted: number; requested: number }> {
  try {
    const response = await httpClient.post<{ data: { deleted: number; requested: number } }>(
      DEALER_VEHICLE_ENDPOINTS.BULK_DELETE,
      { ids }
    )
    return handleSuccess<{ deleted: number; requested: number }>(response)
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
 * Renew listing expiry for a published vehicle
 */
export async function renewVehicleListing(id: number | string): Promise<VehicleModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.RENEW_LISTING(id),
      {}
    )
    return mapVehicleFromApi(handleSuccess<any>(response))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Upload 3D view file for a vehicle
 */
export async function uploadVehicle3dView(
  id: number | string,
  file: File
): Promise<VehicleModel> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPLOAD_3D_VIEW(id),
      formData
    )
    return mapVehicleFromApi(handleSuccess<any>(response))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Remove 3D view from a vehicle
 */
export async function deleteVehicle3dView(id: number | string): Promise<VehicleModel> {
  try {
    const response = await httpClient.delete<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.DELETE_3D_VIEW(id)
    )
    return mapVehicleFromApi(handleSuccess<any>(response))
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

export interface ApplySuggestedPriceResult {
  vehicleId: number
  oldPrice: number
  newPrice: number
  listingHealth?: Record<string, unknown>
}

export async function applyVehicleSuggestedPrice(
  id: number | string,
): Promise<ApplySuggestedPriceResult> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.APPLY_SUGGESTED_PRICE(id),
    )
    const data = handleSuccess<any>(response)
    return {
      vehicleId: data.vehicle_id,
      oldPrice: data.old_price,
      newPrice: data.new_price,
      listingHealth: data.listing_health,
    }
  } catch (error) {
    throw handleError(error)
  }
}

export interface BoostVehicleListingResult {
  vehicleId: number
  boost: { expires_at?: string; days_remaining?: number }
  activeCount: number
}

export async function boostVehicleListing(
  id: number | string,
): Promise<BoostVehicleListingResult> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.BOOST_LISTING(id),
    )
    const data = handleSuccess<any>(response)
    return {
      vehicleId: data.vehicle_id,
      boost: data.boost,
      activeCount: data.active_count,
    }
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
  status: 'created' | 'created_with_warnings' | 'failed' | 'validated' | 'validated_with_warnings'
  vehicle_id?: number | null
  registration?: string | null
  warnings: VehicleImportRowIssue[]
  errors: VehicleImportRowIssue[]
}

export interface VehicleImportResult {
  summary: {
    total: number
    created: number
    validated?: number
    failed: number
    warnings: number
  }
  rows: VehicleImportRowResult[]
}

export interface VehicleImportQueuedResult {
  batch_id: number
  status: string
  message: string
}

export interface VehicleImportBatchSummary {
  id: number
  original_filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  summary?: VehicleImportResult['summary'] | null
  error_message?: string | null
  created_at?: string
  started_at?: string | null
  completed_at?: string | null
}

export interface VehicleImportBatchDetail extends VehicleImportBatchSummary {
  rows?: VehicleImportRowResult[] | null
}

export interface VehicleImportSample {
  headers: string[]
  row: Record<string, string>
  usage_notice?: {
    billing_model: string
    price_per_day_cents: number
    message: string
  } | null
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
 * Bulk import vehicles from Excel/CSV (processed synchronously on the server).
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
    {
      params: options?.dryRun ? { dry_run: 1 } : undefined,
      timeout: 600000,
    }
  )
  return handleSuccess(response)
}

export async function getVehicleImportBatch(id: number): Promise<VehicleImportBatchDetail> {
  const response = await httpClient.get<{ data: VehicleImportBatchDetail }>(
    DEALER_VEHICLE_ENDPOINTS.IMPORT_BATCH(id)
  )
  return handleSuccess<VehicleImportBatchDetail>(response)
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
  traffic_source?: string
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

export async function getLeadActivities(leadId: number | string): Promise<any> {
  const response = await httpClient.get(DEALER_LEAD_CRM_ENDPOINTS.ACTIVITIES(leadId))
  return handleSuccess<any>(response)
}

export async function getLeadNotes(leadId: number | string): Promise<any[]> {
  const response = await httpClient.get(DEALER_LEAD_CRM_ENDPOINTS.NOTES(leadId))
  return handleSuccess<any[]>(response)
}

export async function createLeadNote(leadId: number | string, data: { body: string; is_pinned?: boolean }) {
  const response = await httpClient.post(DEALER_LEAD_CRM_ENDPOINTS.NOTES(leadId), data)
  return handleSuccess<any>(response)
}

export async function getLeadTasks(leadId: number | string): Promise<any[]> {
  const response = await httpClient.get(DEALER_LEAD_CRM_ENDPOINTS.TASKS(leadId))
  return handleSuccess<any[]>(response)
}

export async function createLeadTask(leadId: number | string, data: { title: string; due_at?: string; assigned_user_id?: number }) {
  const response = await httpClient.post(DEALER_LEAD_CRM_ENDPOINTS.TASKS(leadId), data)
  return handleSuccess<any>(response)
}

export async function updateLeadTask(leadId: number | string, taskId: number | string, data: Record<string, unknown>) {
  const response = await httpClient.put(DEALER_LEAD_CRM_ENDPOINTS.TASK(leadId, taskId), data)
  return handleSuccess<any>(response)
}

export async function getLeadLostReasons(): Promise<any[]> {
  const response = await httpClient.get(DEALER_LEAD_CRM_ENDPOINTS.LOST_REASONS)
  return handleSuccess<any[]>(response)
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
 * Get pay-as-you-go usage summary for current billing period
 */
export async function getSubscriptionUsage(): Promise<DealerSubscriptionUsageModel> {
  try {
    const response = await httpClient.get<{ data: DealerSubscriptionUsageModel }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.USAGE
    )
    return handleSuccess<DealerSubscriptionUsageModel>(response)
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
  billing_model?: 'subscription' | 'usage_daily'
  price_per_listing_per_day?: number
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
  billing_cycle: 'monthly' | 'yearly' | 'usage_daily'
  starts_at?: string
}

export interface DealerSubscriptionUsageModel {
  period_start: string
  period_end: string
  published_listings: number
  daily_rate_cents: number
  estimated_monthly_cents: number
  total_charged_cents: number
  pending_cents: number
  invoiced_cents: number
  is_usage_plan: boolean
  billing_periods?: Array<{
    id: number
    billing_date: string
    amount_cents: number
    status: string
    vehicle?: { id: number; title?: string; registration?: string }
  }>
}

export interface DealerPendingChangeRequestModel {
  id: number
  dealer_id: number
  requested_plan_id: number
  billing_cycle: 'monthly' | 'yearly' | 'usage_daily'
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
// BILLING & PAYMENTS
// ============================================================================

export interface DealerBillingConfig {
  stripe_enabled: boolean
  publishable_key: string | null
  instant_subscription_checkout: boolean
}

export interface DealerInvoiceModel {
  id: number
  dealer_id: number
  status: string
  total_cents: number
  currency?: string
  period_start?: string | null
  period_end?: string | null
  due_at?: string | null
  paid_at?: string | null
  created_at?: string
  lines?: Array<{
    id: number
    description: string
    quantity: number
    unit_price_cents: number
    total_cents: number
  }>
}

export interface DealerPaymentModel {
  id: number
  dealer_id: number
  purpose: string
  status: string
  amount_cents: number
  currency: string
  stripe_checkout_session_id?: string | null
  created_at?: string
}

export interface CheckoutResult {
  checkout_url: string
  payment_id: number
}

export async function getBillingConfig(): Promise<DealerBillingConfig> {
  try {
    const response = await httpClient.get<{ data: DealerBillingConfig }>(
      DEALER_BILLING_ENDPOINTS.CONFIG
    )
    return handleSuccess<DealerBillingConfig>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getBillingInvoices(params?: { page?: number; limit?: number }): Promise<PaginationModel<DealerInvoiceModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<DealerInvoiceModel> }>(
      DEALER_BILLING_ENDPOINTS.INVOICES,
      { params }
    )
    return handleSuccess<PaginationModel<DealerInvoiceModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function checkoutInvoice(invoiceId: number): Promise<CheckoutResult> {
  try {
    const response = await httpClient.post<{ data: CheckoutResult }>(
      DEALER_BILLING_ENDPOINTS.CHECKOUT_INVOICE(invoiceId),
      {}
    )
    return handleSuccess<CheckoutResult>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function checkoutSubscription(data: {
  plan_id: number
  billing_cycle: 'monthly' | 'yearly'
}): Promise<CheckoutResult> {
  try {
    const response = await httpClient.post<{ data: CheckoutResult }>(
      DEALER_BILLING_ENDPOINTS.SUBSCRIPTION_CHECKOUT,
      data
    )
    return handleSuccess<CheckoutResult>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getPaymentHistory(params?: { page?: number; limit?: number }): Promise<PaginationModel<DealerPaymentModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<DealerPaymentModel> }>(
      DEALER_BILLING_ENDPOINTS.PAYMENTS,
      { params }
    )
    return handleSuccess<PaginationModel<DealerPaymentModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// AI ASSISTANT
// ============================================================================

export interface DealerAiConfig {
  enabled: boolean
  providers: string[]
  tasks: string[]
  remaining_requests: number | null
  monthly_request_limit: number | null
}

export interface AiGenerateResult {
  text: string
  provider: string
  model: string
  task: string
  tokens: number
}

export async function getAiConfig(): Promise<DealerAiConfig> {
  try {
    const response = await httpClient.get<{ data: DealerAiConfig }>(DEALER_AI_ENDPOINTS.CONFIG)
    return handleSuccess<DealerAiConfig>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function generateAiContent(data: {
  task: string
  context: Record<string, unknown>
  locale?: string
  context_type?: string
  context_id?: number
}): Promise<AiGenerateResult> {
  try {
    const response = await httpClient.post<{ data: AiGenerateResult }>(DEALER_AI_ENDPOINTS.GENERATE, data)
    return handleSuccess<AiGenerateResult>(response)
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

export interface MarketPulseComparison {
  period: { start: string; end: string }
  comparisons: Record<string, { summary: string | null; better_than_market?: boolean; diff_percent?: number | null }>
}

export interface ListingHealthIssue {
  key: string
  message: string
  severity: 'high' | 'medium' | 'low'
  actions?: Array<{
    type: 'ai' | 'navigate'
    task?: string
    target?: string
    label: string
    suggested_min?: number | null
    suggested_max?: number | null
  }>
}

export interface ListingHealthAttentionItem {
  vehicle_id: number
  title?: string
  slug?: string
  score: number
  grade: string
  category?: 'quality' | 'expiring' | 'incomplete'
  priority_score?: number
  impact_label?: string | null
  issues: ListingHealthIssue[]
  metrics?: Record<string, unknown>
  pricing?: Record<string, unknown> | null
}

export interface ListingHealthFixImpactItem {
  id: number
  vehicle_id: number
  title?: string
  slug?: string
  fix_type?: string
  issue_key?: string
  status: 'pending' | 'measured'
  fixed_at?: string
  measured_at?: string
  enquiry_lift?: number | null
  views_lift?: number | null
  score_lift?: number | null
  days_until_measured?: number | null
}

export interface ListingHealthAttention {
  count: number
  items: ListingHealthAttentionItem[]
  fix_impact?: ListingHealthFixImpactItem[]
  portfolio?: {
    avg_score: number | null
    platform_avg_score: number
    attention_count: number
    published_count: number
    trend_7d?: number
  }
  categories?: {
    quality: number
    expiring: number
    incomplete: number
  }
}

export async function getMarketPulseWidget(): Promise<MarketPulseComparison> {
  try {
    const response = await httpClient.get<MarketPulseComparison>(DEALER_DASHBOARD_ENDPOINTS.MARKET_PULSE)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

export async function getListingHealthAttention(): Promise<ListingHealthAttention> {
  try {
    const response = await httpClient.get<ListingHealthAttention>(DEALER_DASHBOARD_ENDPOINTS.LISTING_HEALTH_ATTENTION)
    return response.data
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
  lead_stages?: Array<{ id: number; name: string }>
  lead_intents?: Array<{ id: number; name: string }>
  lead_categories?: Array<{ id: number; name: string }>
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
    return handleSuccess<any>(response)
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
    return handleSuccess<any>(response)
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
    return handleSuccess<any>(response)
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
    return handleSuccess<any>(response)
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
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getAnalyticsFunnel(dateRange?: string, compare = false): Promise<import('@/models/analytics.model').FunnelAnalytics> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.FUNNEL, {
    params: { date_range: dateRange, compare: compare ? '1' : '0' },
  })
  return handleSuccess<any>(response)
}

export async function getAnalyticsStock(dateRange?: string): Promise<import('@/models/analytics.model').StockAnalytics> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.STOCK, { params: { date_range: dateRange } })
  return handleSuccess<any>(response)
}

export async function getAnalyticsAssignees(dateRange?: string): Promise<import('@/models/analytics.model').AssigneeAnalytics> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.ASSIGNEES, { params: { date_range: dateRange } })
  return handleSuccess<any>(response)
}

export async function getAnalyticsChannels(dateRange?: string): Promise<import('@/models/analytics.model').ChannelAnalytics> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.CHANNELS, { params: { date_range: dateRange } })
  return handleSuccess<any>(response)
}

export async function getAnalyticsTrends(dateRange?: string): Promise<import('@/models/analytics.model').TrendAnalytics> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.TRENDS, { params: { date_range: dateRange } })
  return handleSuccess<any>(response)
}

export async function downloadDealerAnalyticsExport(report: string, dateRange?: string): Promise<void> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.EXPORT, {
    params: { report, date_range: dateRange },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `dealer-analytics-${report}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function downloadDealerAnalyticsPdf(dateRange?: string): Promise<void> {
  const response = await httpClient.get(DEALER_ANALYTICS_ENDPOINTS.EXPORT_PDF, {
    params: { date_range: dateRange },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `dealer-analytics-${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  window.URL.revokeObjectURL(url)
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface DealerNotificationModel {
  id: number
  title: string
  message?: string
  is_read?: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

export async function getNotificationCount(unread = true): Promise<number> {
  try {
    const response = await httpClient.get<{ count: number }>(
      DEALER_NOTIFICATION_ENDPOINTS.COUNT,
      { params: { unread: unread ? 'true' : 'false' } }
    )
    return typeof response.data?.count === 'number' ? response.data.count : 0
  } catch (error) {
    throw handleError(error)
  }
}

export async function getNotifications(params?: {
  unread?: boolean
  perPage?: number
  page?: number
}): Promise<PaginationModel<DealerNotificationModel>> {
  try {
    const response = await httpClient.get<{
      docs: DealerNotificationModel[]
      totalDocs: number
      limit: number
      page: number
      totalPages: number
      hasPrevPage: boolean
      hasNextPage: boolean
      prevPage: number | null
      nextPage: number | null
    }>(DEALER_NOTIFICATION_ENDPOINTS.LIST, {
      params: {
        unread: params?.unread ? 'true' : undefined,
        perPage: params?.perPage ?? 15,
        page: params?.page ?? 1,
      },
    })
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

export async function markNotificationsRead(ids: number[]): Promise<void> {
  try {
    await httpClient.post(DEALER_NOTIFICATION_ENDPOINTS.MARK_READ, { ids })
  } catch (error) {
    throw handleError(error)
  }
}

export async function exportVehicleStock(params?: {
  format?: 'csv' | 'xlsx'
  list_status_id?: number
}): Promise<void> {
  const format = params?.format ?? 'csv'
  const response = await httpClient.get(DEALER_VEHICLE_ENDPOINTS.EXPORT, {
    params: {
      format,
      list_status_id: params?.list_status_id,
    },
    responseType: 'blob',
  })
  const mime =
    format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv'
  const blob = new Blob([response.data], { type: mime })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vehicle-stock.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function reorderVehicleImages(
  vehicleId: number | string,
  imageIds: number[]
): Promise<VehicleModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.REORDER_IMAGES(vehicleId),
      { image_ids: imageIds }
    )
    return mapVehicleFromApi(handleSuccess<any>(response))
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateVehicleVideo(
  vehicleId: number | string,
  videoUrl: string | null
): Promise<VehicleModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
      DEALER_VEHICLE_ENDPOINTS.UPDATE_VIDEO(vehicleId),
      { video_url: videoUrl }
    )
    return mapVehicleFromApi(handleSuccess<any>(response))
  } catch (error) {
    throw handleError(error)
  }
}

export interface DealerFeedTokenModel {
  id: number
  dealer_id: number
  name: string
  token: string
  created_at?: string
}

export interface DealerFeedUrlsModel {
  name: string
  json: string
  xml: string
  csv?: string
}

export interface DealerSyndicationProviderModel {
  key: string
  name: string
  description?: string
  enabled: boolean
  last_sync_at?: string | null
}

export interface SyndicationLogModel {
  id: number
  dealer_id: number
  vehicle_id?: number | null
  provider_key: string
  action: string
  status: string
  message?: string | null
  created_at?: string
}

export async function getDealerFeeds(): Promise<{
  tokens: DealerFeedTokenModel[]
  feed_urls: DealerFeedUrlsModel[]
}> {
  const response = await httpClient.get<{ data: { tokens: DealerFeedTokenModel[]; feed_urls: DealerFeedUrlsModel[] } }>(
    DEALER_FEED_ENDPOINTS.TOKENS
  )
  return handleSuccess<any>(response)
}

export async function createDealerFeedToken(name?: string): Promise<DealerFeedTokenModel> {
  const response = await httpClient.post<{ data: DealerFeedTokenModel }>(
    DEALER_FEED_ENDPOINTS.TOKENS,
    { name }
  )
  return handleSuccess<any>(response)
}

export async function deleteDealerFeedToken(id: number): Promise<void> {
  await httpClient.delete(DEALER_FEED_ENDPOINTS.TOKEN(id))
}

export async function getDealerSyndication(): Promise<{
  providers: DealerSyndicationProviderModel[]
  logs: SyndicationLogModel[]
}> {
  const response = await httpClient.get<{
    data: { providers: DealerSyndicationProviderModel[]; logs: SyndicationLogModel[] }
  }>(DEALER_SYNDICATION_ENDPOINTS.INDEX)
  return handleSuccess<any>(response)
}

export async function updateDealerSyndication(
  providers: { provider_key: string; enabled: boolean }[]
): Promise<void> {
  await httpClient.put(DEALER_SYNDICATION_ENDPOINTS.INDEX, { providers })
}

export async function syncDealerSyndicationNow(): Promise<{ synced: number }> {
  const response = await httpClient.post<{ data: { synced: number } }>(
    DEALER_SYNDICATION_ENDPOINTS.SYNC
  )
  return handleSuccess<any>(response)
}

export interface MetaCatalogPreview {
  vehicle: {
    id: number
    title: string
    slug: string
    detail_url: string
    list_status_id?: number
    is_published?: boolean
  }
  row: Record<string, string>
  readiness: Array<{ key: string; ok: boolean; label: string }>
  ready: boolean
  feed_url: string | null
  has_feed_token?: boolean
  pixel_enabled?: boolean
  pixel_id?: string
}

export async function getDealerMetaCatalogPreview(vehicleId: number | string): Promise<MetaCatalogPreview> {
  const response = await httpClient.get<{ data: MetaCatalogPreview }>(
    DEALER_SYNDICATION_ENDPOINTS.META_PREVIEW(vehicleId)
  )
  return handleSuccess<MetaCatalogPreview>(response)
}

export async function getDealerMetaFeedUrl(): Promise<{ feed_url: string | null; has_feed_token: boolean }> {
  const response = await httpClient.get<{ data: { feed_url: string | null; has_feed_token: boolean } }>(
    DEALER_SYNDICATION_ENDPOINTS.META_FEED_URL
  )
  return handleSuccess(response)
}

export async function getTradeInRequests(page = 1): Promise<any> {
  const response = await httpClient.get(DEALER_TRADE_IN_ENDPOINTS.LIST, { params: { page } })
  return handleSuccess<any>(response)
}

export async function updateTradeInRequest(id: number, data: Record<string, unknown>): Promise<any> {
  const response = await httpClient.put(DEALER_TRADE_IN_ENDPOINTS.UPDATE(id), data)
  return handleSuccess<any>(response)
}

export async function getDealerBranding(): Promise<any> {
  const response = await httpClient.get(DEALER_BRANDING_ENDPOINTS.SHOW)
  return handleSuccess<any>(response)
}

export async function updateDealerBranding(data: Record<string, unknown>): Promise<any> {
  const response = await httpClient.put(DEALER_BRANDING_ENDPOINTS.UPDATE, data)
  return handleSuccess<any>(response)
}

export async function addDealerDomain(domain: string, isPrimary = false): Promise<any> {
  const response = await httpClient.post(DEALER_BRANDING_ENDPOINTS.DOMAINS, { domain, is_primary: isPrimary })
  return handleSuccess<any>(response)
}

export async function verifyDealerDomain(id: number): Promise<any> {
  const response = await httpClient.post(DEALER_BRANDING_ENDPOINTS.VERIFY_DOMAIN(id))
  return handleSuccess<any>(response)
}

export async function getDealerDms(): Promise<any> {
  const response = await httpClient.get(DEALER_DMS_ENDPOINTS.INDEX)
  return handleSuccess<any>(response)
}

export async function createDealerApiKey(name: string): Promise<any> {
  const response = await httpClient.post(DEALER_DMS_ENDPOINTS.API_KEYS, { name })
  return handleSuccess<any>(response)
}

export async function createDealerWebhook(url: string, events: string[]): Promise<any> {
  const response = await httpClient.post(DEALER_DMS_ENDPOINTS.WEBHOOKS, { url, events })
  return handleSuccess<any>(response)
}

export async function deleteDealerApiKey(id: number): Promise<void> {
  await httpClient.delete(DEALER_DMS_ENDPOINTS.API_KEY(id))
}

export async function deleteDealerWebhook(id: number): Promise<void> {
  await httpClient.delete(DEALER_DMS_ENDPOINTS.WEBHOOK(id))
}

export async function getDealerAuditLink(): Promise<any> {
  const response = await httpClient.get(DEALER_BRANDING_ENDPOINTS.AUDIT_LINK)
  return handleSuccess<any>(response)
}

export async function getDealerReviewSummary(): Promise<any> {
  const response = await httpClient.get(DEALER_BRANDING_ENDPOINTS.REVIEW_SUMMARY)
  return handleSuccess<any>(response)
}

export async function bulkUpdateVehiclePrices(updates: Array<{ vehicle_id: number; price: number }>): Promise<any> {
  const response = await httpClient.post(DEALER_BULK_PRICE_ENDPOINTS.UPDATE, { updates })
  return handleSuccess<any>(response)
}

export async function getMarketingCampaigns(): Promise<any[]> {
  const response = await httpClient.get(DEALER_MARKETING_ENDPOINTS.CAMPAIGNS)
  return handleSuccess<any[]>(response)
}

export async function createMarketingCampaign(data: Record<string, unknown>): Promise<any> {
  const response = await httpClient.post(DEALER_MARKETING_ENDPOINTS.CAMPAIGNS, data)
  return handleSuccess<any>(response)
}

export async function updateMarketingCampaign(id: number, data: Record<string, unknown>): Promise<any> {
  const response = await httpClient.put(DEALER_MARKETING_ENDPOINTS.CAMPAIGN(id), data)
  return handleSuccess<any>(response)
}

export async function sendMarketingCampaign(id: number): Promise<any> {
  const response = await httpClient.post(DEALER_MARKETING_ENDPOINTS.SEND_CAMPAIGN(id))
  return handleSuccess<any>(response)
}

export async function deleteMarketingCampaign(id: number): Promise<void> {
  await httpClient.delete(DEALER_MARKETING_ENDPOINTS.CAMPAIGN(id))
}

export async function getDealQuotes(leadId: number): Promise<any[]> {
  const response = await httpClient.get(DEALER_DEAL_QUOTE_ENDPOINTS.LIST(leadId))
  return handleSuccess<any[]>(response)
}

export async function createDealQuote(leadId: number, data: Record<string, unknown>): Promise<any> {
  const response = await httpClient.post(DEALER_DEAL_QUOTE_ENDPOINTS.CREATE(leadId), data)
  return handleSuccess<any>(response)
}

export async function updateDealQuote(leadId: number, id: number, data: Record<string, unknown>): Promise<any> {
  const response = await httpClient.put(DEALER_DEAL_QUOTE_ENDPOINTS.UPDATE(leadId, id), data)
  return handleSuccess<any>(response)
}

export async function sendDealQuote(leadId: number, id: number): Promise<any> {
  const response = await httpClient.post(DEALER_DEAL_QUOTE_ENDPOINTS.SEND(leadId, id))
  return handleSuccess<any>(response)
}

export async function deleteDealQuote(leadId: number, id: number): Promise<void> {
  await httpClient.delete(DEALER_DEAL_QUOTE_ENDPOINTS.DELETE(leadId, id))
}

export async function exportLeadPiiAudit(): Promise<void> {
  const response = await httpClient.get(DEALER_COMPLIANCE_ENDPOINTS.LEAD_PII_EXPORT, { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'lead-pii-audit.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
