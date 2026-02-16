/**
 * Admin API Module
 * 
 * Admin-specific API calls
 * All functions return mapped models, support pagination, use endpoints constants
 */

import httpClient from './http'
import { handleSuccess, handleError } from './response'
import {
  ADMIN_USER_ENDPOINTS,
  ADMIN_DEALER_ENDPOINTS,
  ADMIN_VEHICLE_ENDPOINTS,
  ADMIN_PLAN_ENDPOINTS,
  ADMIN_SUBSCRIPTION_ENDPOINTS,
  ADMIN_FEATURE_ENDPOINTS,
  ADMIN_PAGE_ENDPOINTS,
  ADMIN_HOME_PAGE_ENDPOINTS,
  ADMIN_ABOUT_PAGE_ENDPOINTS,
  ADMIN_CONTACT_PAGE_ENDPOINTS,
  ADMIN_PRIVACY_PAGE_ENDPOINTS,
  ADMIN_TERMS_PAGE_ENDPOINTS,
  ADMIN_ANALYTICS_ENDPOINTS,
  ADMIN_AUDIT_ENDPOINTS,
  ADMIN_CONSTANTS_ENDPOINTS,
  ADMIN_DASHBOARD_ENDPOINTS,
  ADMIN_FEATURED_VEHICLE_ENDPOINTS,
} from './endpoints'
import type { UserModel } from '@/models/user.model'
import { mapUserFromApi } from '@/models/user.model'
import type { VehicleModel, VehicleImageModel } from '@/models/vehicle.model'
import { mapVehicleFromApi } from '@/models/vehicle.model'
import type { DealerModel } from '@/models/dealer.model'
import { mapDealerFromApi } from '@/models/dealer.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'
import type { VehicleStatus } from '@/models/vehicle.model'
import type { SubscriptionStatus } from '@/models/dealer.model'
import type { 
  HomePageSectionModel, 
  HomePageContentMap,
  AboutPageContentMap,
  ContactPageContentMap,
  PageImageModel,
  PageImagesMap,
} from '@/models/home-page-content.model'
import { 
  mapHomePageSectionsFromApi,
  mapPageImageFromApi,
  mapPageImagesFromApi,
} from '@/models/home-page-content.model'

/**
 * Generate idempotency key header
 */
function getIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// ============================================================================
// USERS
// ============================================================================

/**
 * Get all users with pagination
 */
export async function getUsers(params?: PaginationParams & {
  status_id?: number
  role?: string
  search?: string
}): Promise<PaginationModel<UserModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      ADMIN_USER_ENDPOINTS.LIST,
      { params }
    )
    const data = handleSuccess<PaginationModel<any>>(response)
    return {
      ...data,
      docs: data.docs.map(mapUserFromApi),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get user by ID
 */
export async function getUser(id: number | string): Promise<UserModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_USER_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapUserFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create user data
 */
export interface CreateUserData {
  name: string
  email: string
  password: string
  phone?: string
  status_id: number
  role_id: number
}

/**
 * Create user (with idempotency)
 */
export async function createUser(
  data: CreateUserData,
  idempotencyKey?: string
): Promise<UserModel> {
  try {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    } else {
      headers['Idempotency-Key'] = getIdempotencyKey()
    }

    const response = await httpClient.post<{ data: any }>(
      ADMIN_USER_ENDPOINTS.CREATE,
      data,
      { headers }
    )
    const userData = handleSuccess<any>(response)
    return mapUserFromApi(userData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update user data
 */
export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  status_id?: number
  role_id?: number
}

/**
 * Update user
 */
export async function updateUser(
  id: number | string,
  data: UpdateUserData
): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_USER_ENDPOINTS.UPDATE(id),
      data
    )
    const userData = handleSuccess<any>(response)
    return mapUserFromApi(userData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_USER_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update user status
 */
export interface UpdateUserStatusData {
  status_id: number
}

/**
 * Update user status
 */
export async function updateUserStatus(
  id: number | string,
  data: UpdateUserStatusData
): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_USER_ENDPOINTS.UPDATE_STATUS(id),
      data
    )
    const userData = handleSuccess<any>(response)
    return mapUserFromApi(userData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Role model interface
 */
export interface RoleModel {
  id: number
  name: string
  guard_name: string
  created_at?: string
  updated_at?: string
}

/**
 * Get all roles (cached forever)
 */
export async function getRoles(): Promise<RoleModel[]> {
  try {
    const response = await httpClient.get<{ data: RoleModel[] }>(
      ADMIN_USER_ENDPOINTS.ROLES
    )
    return handleSuccess<RoleModel[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Ban user
 */
export async function banUser(id: number | string): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_USER_ENDPOINTS.BAN(id),
      {}
    )
    const userData = handleSuccess<any>(response)
    return mapUserFromApi(userData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Unban user
 */
export async function unbanUser(id: number | string): Promise<UserModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_USER_ENDPOINTS.UNBAN(id),
      {}
    )
    const userData = handleSuccess<any>(response)
    return mapUserFromApi(userData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Change user password data
 */
export interface ChangeUserPasswordData {
  password: string
}

/**
 * Change user password (admin can change without current password)
 */
export async function changeUserPassword(
  id: number | string,
  data: ChangeUserPasswordData
): Promise<{ message: string }> {
  try {
    const response = await httpClient.post<{ data: { message: string } }>(
      ADMIN_USER_ENDPOINTS.CHANGE_PASSWORD(id),
      data
    )
    return handleSuccess<{ message: string }>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Change admin's own password data
 */
export interface ChangeOwnPasswordData {
  current_password: string
  password: string
  password_confirmation: string
}

/**
 * Change admin's own password (requires current password verification)
 */
export async function changeOwnPassword(
  data: ChangeOwnPasswordData
): Promise<{ message: string }> {
  try {
    const response = await httpClient.post<{ data: { message: string } }>(
      ADMIN_USER_ENDPOINTS.CHANGE_OWN_PASSWORD,
      data
    )
    return handleSuccess<{ message: string }>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// DEALERS
// ============================================================================

/**
 * Get all dealers with pagination
 */
export async function getDealers(params?: PaginationParams & {
  search?: string
  subscription_status?: SubscriptionStatus
}): Promise<PaginationModel<DealerModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      ADMIN_DEALER_ENDPOINTS.LIST,
      { params }
    )
    const data = handleSuccess<PaginationModel<any>>(response)
    return {
      ...data,
      docs: data.docs.map(mapDealerFromApi),
    }
  } catch (error) {
    throw handleError(error)
  }
}

export interface DealerMinimalItem {
  id: number
  name: string
  email?: string
}

/**
 * Get dealers for dropdowns (id and name only)
 */
export async function getDealersMinimal(): Promise<DealerMinimalItem[]> {
  try {
    const response = await httpClient.get<{ data: DealerMinimalItem[] }>(
      ADMIN_DEALER_ENDPOINTS.LIST_MINIMAL
    )
    return handleSuccess<DealerMinimalItem[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get dealer by ID
 */
export async function getDealer(id: number | string): Promise<DealerModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_DEALER_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapDealerFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create dealer data
 */
export interface CreateDealerData {
  name: string
  email?: string
  phone?: string
  address?: string
  website?: string
}

/**
 * Create dealer (with idempotency)
 */
export async function createDealer(
  data: CreateDealerData,
  idempotencyKey?: string
): Promise<DealerModel> {
  try {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    } else {
      headers['Idempotency-Key'] = getIdempotencyKey()
    }

    const response = await httpClient.post<{ data: any }>(
      ADMIN_DEALER_ENDPOINTS.CREATE,
      data,
      { headers }
    )
    const dealerData = handleSuccess<any>(response)
    return mapDealerFromApi(dealerData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update dealer data
 */
export interface UpdateDealerData {
  name?: string
  email?: string
  phone?: string
  address?: string
  website?: string
}

/**
 * Update dealer
 */
export async function updateDealer(
  id: number | string,
  data: UpdateDealerData
): Promise<DealerModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
      ADMIN_DEALER_ENDPOINTS.UPDATE(id),
      data
    )
    const dealerData = handleSuccess<any>(response)
    return mapDealerFromApi(dealerData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete dealer (soft delete)
 */
export async function deleteDealer(id: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_DEALER_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// VEHICLES (Admin can see all dealer listings)
// ============================================================================

/**
 * Get all vehicles (any dealer) with pagination
 */
export async function getVehicles(params?: PaginationParams & {
  dealer_id?: number
  user_id?: number
  dealer_name?: string
  user_name?: string
  brand_id?: number
  model_id?: number
  model_year_id?: number
  status?: VehicleStatus
  search?: string
}): Promise<PaginationModel<VehicleModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      ADMIN_VEHICLE_ENDPOINTS.LIST,
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
 * Get vehicle by ID (admin)
 */
export async function getVehicle(id: number | string): Promise<VehicleModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_VEHICLE_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapVehicleFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle data
 */
export interface UpdateVehicleData {
  // Basic vehicle fields
  title?: string
  registration?: string
  vin?: string
  brand_id?: number
  model_id?: number
  model_year_id?: number
  km_driven?: number
  fuel_type_id?: number
  gear_type_id?: number
  transmission_id?: number
  price?: number
  battery_capacity?: number
  range_km?: number
  charging_type?: string
  engine_power?: number
  towing_weight?: number
  ownership_tax?: number
  first_registration_date?: string
  fuel_efficiency?: number
  vehicle_list_status_id?: number
  listing_type_id?: number
  published_at?: string
  version?: string
  
  // Vehicle details fields
  description?: string
  variant_id?: number
  color_id?: number
  body_type_id?: number
  price_type_id?: number
  condition_id?: number
  sales_type_id?: number
  use_id?: number
  euronom_id?: number
  transmission_name?: string
  
  // Pricing fields
  wholesale_price?: number
  internal_cost_price?: number
  price_without_tax?: number
  wholesale_price_includes_delivery?: boolean
  
  // Technical fields
  engine_type?: string
  drive_axles?: number
  co2_emissions?: number
  fuel_consumption_wltp?: number
  fuel_consumption_nedc?: number
  
  // Dates
  production_date?: string
  last_inspection_date?: string
  last_inspection_result?: string
  last_inspection_odometer?: number
  
  // Flags
  is_import?: boolean
  is_factory_new?: boolean
  
  // Other details
  servicebog?: string
  annual_tax?: number
  cover_image_index?: number
  leasing_period_start?: string
  leasing_period_end?: string
  
  // Equipment
  equipment_ids?: number[]
}

/**
 * Update vehicle (admin)
 */
export async function updateVehicle(
  id: number | string,
  data: UpdateVehicleData
): Promise<VehicleModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_VEHICLE_ENDPOINTS.UPDATE(id),
      data
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle status (admin)
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
    const response = await httpClient.post<{ data: any }>(
      ADMIN_VEHICLE_ENDPOINTS.UPDATE_STATUS(id),
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
    await httpClient.post(ADMIN_VEHICLE_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get vehicle history
 */
export async function getVehicleHistory(id: number | string): Promise<{
  price_history: any[]
  view_logs: any[]
}> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_VEHICLE_ENDPOINTS.HISTORY(id)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get vehicle images
 */
export async function getVehicleImages(id: number | string): Promise<VehicleImageModel[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      ADMIN_VEHICLE_ENDPOINTS.IMAGES(id)
    )
    const data = handleSuccess<any[]>(response)
    return data.map((img: any) => ({
      id: img.id,
      vehicleId: img.vehicle_id,
      url: img.image_url ?? img.thumbnail_url,
      path: img.image_path ?? img.thumbnail_path,
      order: img.sort_order,
      isPrimary: false,
      createdAt: img.created_at,
    }))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update vehicle images data
 */
export interface UpdateVehicleImagesData {
  images?: string[] // URLs
  files?: File[] // File uploads
}

/**
 * Update vehicle images
 */
export async function updateVehicleImages(
  id: number | string,
  data: UpdateVehicleImagesData
): Promise<VehicleModel> {
  try {
    const formData = new FormData()
    
    // Append existing image URLs as an array (Laravel expects images[] format)
    if (data.images && data.images.length > 0) {
      data.images.forEach((imageUrl) => {
        formData.append('images[]', imageUrl)
      })
    }
    
    // Append new file uploads
    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })
    }
    
    const response = await httpClient.post<{ data: any }>(
      ADMIN_VEHICLE_ENDPOINTS.UPDATE_IMAGES(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete vehicle image data
 */
export interface DeleteVehicleImageData {
  image_id: number
}

/**
 * Delete vehicle image
 */
export async function deleteVehicleImage(
  id: number | string,
  data: DeleteVehicleImageData
): Promise<void> {
  try {
    await httpClient.post(
      ADMIN_VEHICLE_ENDPOINTS.DELETE_IMAGE(id),
      data
    )
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
      ADMIN_VEHICLE_ENDPOINTS.UPDATE_EQUIPMENT(id),
      data
    )
    const vehicleData = handleSuccess<any>(response)
    return mapVehicleFromApi(vehicleData)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// PLANS & SUBSCRIPTIONS
// ============================================================================

/**
 * Plan model
 */
export interface PlanModel {
  id: number
  name: string
  slug: string
  description?: string
  is_active?: boolean
  trial_days?: number
  price?: number
  interval?: string
  features?: any[]
  price_history?: Array<{
    id: number
    price: number
    currency: string
    billing_cycle: 'monthly' | 'yearly'
    starts_at: string
    ends_at?: string | null
  }>
  priceHistory?: Array<{
    id: number
    price: number
    currency: string
    billing_cycle: 'monthly' | 'yearly'
    starts_at: string
    ends_at?: string | null
  }>
  availability?: Array<{
    id: number
    allowed_role_id?: number | null
    dealer_id?: number | null
    is_enabled: boolean
    allowed_role?: {
      id: number
      name: string
    }
    allowedRole?: {
      id: number
      name: string
    }
    dealer?: {
      id: number
      cvr: string
      city?: string
    } | null
  }>
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Get all plans
 */
export async function getPlans(): Promise<PlanModel[]> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<PlanModel> | PlanModel[] }>(
      ADMIN_PLAN_ENDPOINTS.LIST
    )
    const data = handleSuccess<PaginationModel<PlanModel> | PlanModel[]>(response)
    // Handle paginated response
    if (data && typeof data === 'object' && 'docs' in data) {
      return (data as PaginationModel<PlanModel>).docs
    }
    // Handle direct array response
    return Array.isArray(data) ? data : []
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get plan by ID
 */
export async function getPlan(id: number | string): Promise<PlanModel> {
  try {
    const response = await httpClient.get<{ data: PlanModel }>(
      ADMIN_PLAN_ENDPOINTS.SHOW(id)
    )
    return handleSuccess<PlanModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create plan data
 */
export interface CreatePlanData {
  name: string
  slug: string
  description?: string
  is_active?: boolean
  trial_days?: number | null
  role_ids?: number[]
  dealer_ids?: number[]
  pricing?: {
    monthly_price?: number
    yearly_price?: number
    currency?: string
  }
}

/**
 * Create plan (with idempotency)
 */
export async function createPlan(
  data: CreatePlanData,
  idempotencyKey?: string
): Promise<PlanModel> {
  try {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    } else {
      headers['Idempotency-Key'] = getIdempotencyKey()
    }

    const response = await httpClient.post<{ data: PlanModel }>(
      ADMIN_PLAN_ENDPOINTS.CREATE,
      data,
      { headers }
    )
    return handleSuccess<PlanModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update plan data
 */
export interface UpdatePlanData {
  name?: string
  slug?: string
  description?: string
  is_active?: boolean
  trial_days?: number | null
  role_ids?: number[]
  dealer_ids?: number[]
  pricing?: {
    monthly_price?: number
    yearly_price?: number
    currency?: string
  }
}

/**
 * Update plan
 */
export async function updatePlan(
  id: number | string,
  data: UpdatePlanData
): Promise<PlanModel> {
  try {
    const response = await httpClient.put<{ data: PlanModel }>(
      ADMIN_PLAN_ENDPOINTS.UPDATE(id),
      data
    )
    return handleSuccess<PlanModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete plan
 */
export async function deletePlan(id: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_PLAN_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get plan features
 */
export async function getPlanFeatures(id: number | string): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      ADMIN_PLAN_ENDPOINTS.FEATURES(id)
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Assign feature to plan
 */
export interface AssignFeatureData {
  feature_id: number
  value?: string | null
}

/**
 * Assign feature to plan
 */
export async function assignFeature(
  planId: number | string,
  data: AssignFeatureData
): Promise<void> {
  try {
    await httpClient.post(
      ADMIN_PLAN_ENDPOINTS.ASSIGN_FEATURE(planId),
      data
    )
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Remove feature from plan
 */
export async function removeFeature(
  planId: number | string,
  featureId: number | string
): Promise<void> {
  try {
    await httpClient.delete(
      ADMIN_PLAN_ENDPOINTS.REMOVE_FEATURE(planId, featureId)
    )
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get plan availability (roles and dealers)
 */
export async function getPlanAvailability(id: number | string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_PLAN_ENDPOINTS.AVAILABILITY(id)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Sync plan availability data
 */
export interface SyncPlanAvailabilityData {
  role_ids?: number[]
  dealer_ids?: number[]
}

/**
 * Sync plan availability
 */
export async function syncPlanAvailability(
  id: number | string,
  data: SyncPlanAvailabilityData
): Promise<void> {
  try {
    await httpClient.post(
      ADMIN_PLAN_ENDPOINTS.SYNC_AVAILABILITY(id),
      data
    )
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get plan pricing
 */
export async function getPlanPricing(id: number | string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_PLAN_ENDPOINTS.PRICING(id)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update plan pricing data
 */
export interface UpdatePlanPricingData {
  monthly_price?: number
  yearly_price?: number
  currency?: string
}

/**
 * Update plan pricing
 */
export async function updatePlanPricing(
  id: number | string,
  data: UpdatePlanPricingData
): Promise<void> {
  try {
    await httpClient.post(
      ADMIN_PLAN_ENDPOINTS.UPDATE_PRICING(id),
      data
    )
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Subscription model
 */
export interface SubscriptionModel {
  id: number
  dealer_id: number
  plan_id: number
  subscription_status_id: number
  subscriptionStatus?: {
    id: number
    name: string
  }
  starts_at?: string
  ends_at?: string
  auto_renew?: boolean
  created_at?: string
  dealer?: {
    id: number
    cvr: string
    city?: string
    address?: string
    owner?: {
      id: number
      name: string
      email: string
    }
  }
  plan?: {
    id: number
    name: string
    slug: string
    description?: string
    features?: any[]
  }
}

/**
 * Get all subscriptions
 */
export async function getSubscriptions(params?: PaginationParams): Promise<PaginationModel<SubscriptionModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<SubscriptionModel> }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<SubscriptionModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create subscription data
 */
export interface CreateSubscriptionData {
  dealer_id: number
  plan_id: number
  subscription_status_id: number
  starts_at: string
  ends_at?: string
  auto_renew?: boolean
  billing_cycle?: 'monthly' | 'yearly'
}

/**
 * Create subscription
 */
export async function createSubscription(data: CreateSubscriptionData): Promise<SubscriptionModel> {
  try {
    const response = await httpClient.post<{ data: SubscriptionModel }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<SubscriptionModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(id: number | string): Promise<SubscriptionModel> {
  try {
    const response = await httpClient.get<{ data: SubscriptionModel }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.SHOW(id)
    )
    return handleSuccess<SubscriptionModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update subscription data
 */
export interface UpdateSubscriptionData {
  subscription_status_id?: number
  starts_at?: string
  ends_at?: string
  auto_renew?: boolean
}

/**
 * Update subscription
 */
export async function updateSubscription(
  id: number | string,
  data: UpdateSubscriptionData
): Promise<SubscriptionModel> {
  try {
    const response = await httpClient.put<{ data: SubscriptionModel }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.UPDATE(id),
      data
    )
    return handleSuccess<SubscriptionModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update subscription status
 */
export interface UpdateSubscriptionStatusData {
  status: SubscriptionStatus
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  id: number | string,
  data: UpdateSubscriptionStatusData
): Promise<SubscriptionModel> {
  try {
    const response = await httpClient.put<{ data: SubscriptionModel }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.UPDATE_STATUS(id),
      data
    )
    return handleSuccess<SubscriptionModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(id: number | string): Promise<SubscriptionModel> {
  try {
    const response = await httpClient.post<{ data: SubscriptionModel }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.CANCEL(id),
      {}
    )
    return handleSuccess<SubscriptionModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Renew subscription
 */
export async function renewSubscription(id: number | string): Promise<SubscriptionModel> {
  try {
    const response = await httpClient.post<{ data: SubscriptionModel }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.RENEW(id),
      {}
    )
    return handleSuccess<SubscriptionModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get dealer subscriptions
 */
export async function getDealerSubscriptions(dealerId: number | string): Promise<SubscriptionModel[]> {
  try {
    const response = await httpClient.get<{ data: SubscriptionModel[] }>(
      ADMIN_SUBSCRIPTION_ENDPOINTS.DEALER_SUBSCRIPTIONS(dealerId)
    )
    return handleSuccess<SubscriptionModel[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// FEATURES
// ============================================================================

/**
 * Feature model
 */
export interface FeatureModel {
  id: number
  key: string
  feature_value_type_id: number
  feature_value_type?: {
    id: number
    name: string
  }
  description: string
  created_at?: string
}

/**
 * Get all features
 */
export async function getFeatures(): Promise<FeatureModel[]> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<FeatureModel> | FeatureModel[] }>(
      ADMIN_FEATURE_ENDPOINTS.LIST
    )
    const data = handleSuccess<PaginationModel<FeatureModel> | FeatureModel[]>(response)
    // Handle paginated response
    if (data && typeof data === 'object' && 'docs' in data) {
      return (data as PaginationModel<FeatureModel>).docs
    }
    // Handle direct array response
    return Array.isArray(data) ? data : []
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get feature by ID
 */
export async function getFeature(id: number | string): Promise<FeatureModel> {
  try {
    const response = await httpClient.get<{ data: FeatureModel }>(
      ADMIN_FEATURE_ENDPOINTS.SHOW(id)
    )
    return handleSuccess<FeatureModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create feature data
 */
export interface CreateFeatureData {
  key: string
  feature_value_type_id: number
  description: string
}

/**
 * Create feature
 */
export async function createFeature(data: CreateFeatureData): Promise<FeatureModel> {
  try {
    const response = await httpClient.post<{ data: FeatureModel }>(
      ADMIN_FEATURE_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<FeatureModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update feature data
 */
export interface UpdateFeatureData {
  key?: string
  feature_value_type_id?: number
  description?: string
}

/**
 * Update feature
 */
export async function updateFeature(
  id: number | string,
  data: UpdateFeatureData
): Promise<FeatureModel> {
  try {
    const response = await httpClient.put<{ data: FeatureModel }>(
      ADMIN_FEATURE_ENDPOINTS.UPDATE(id),
      data
    )
    return handleSuccess<FeatureModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete feature
 */
export async function deleteFeature(id: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_FEATURE_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// CMS - PAGES
// ============================================================================

/**
 * Page model
 */
export interface PageModel {
  id: number
  title: string
  slug: string
  content?: string
  status_id?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Get all pages
 */
export async function getPages(params?: PaginationParams): Promise<PaginationModel<PageModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<PageModel> }>(
      ADMIN_PAGE_ENDPOINTS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<PageModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get page by ID
 */
export async function getPage(id: number | string): Promise<PageModel> {
  try {
    const response = await httpClient.get<{ data: PageModel }>(
      ADMIN_PAGE_ENDPOINTS.SHOW(id)
    )
    return handleSuccess<PageModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create page data
 */
export interface CreatePageData {
  title: string
  slug: string
  content?: string
}

/**
 * Create page
 */
export async function createPage(data: CreatePageData): Promise<PageModel> {
  try {
    const response = await httpClient.post<{ data: PageModel }>(
      ADMIN_PAGE_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<PageModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update page data
 */
export interface UpdatePageData {
  title?: string
  slug?: string
  content?: string
}

/**
 * Update page
 */
export async function updatePage(
  id: number | string,
  data: UpdatePageData
): Promise<PageModel> {
  try {
    const response = await httpClient.put<{ data: PageModel }>(
      ADMIN_PAGE_ENDPOINTS.UPDATE(id),
      data
    )
    return handleSuccess<PageModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete page
 */
export async function deletePage(id: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_PAGE_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Publish page
 */
export async function publishPage(id: number | string): Promise<PageModel> {
  try {
    const response = await httpClient.put<{ data: PageModel }>(
      ADMIN_PAGE_ENDPOINTS.PUBLISH(id),
      {}
    )
    return handleSuccess<PageModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// HOME PAGE CONTENT
// ============================================================================

/**
 * Get all home page sections
 */
export async function getHomePageContent(
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      ADMIN_HOME_PAGE_ENDPOINTS.LIST,
      { params: pageName ? { page_name: pageName } : {} }
    )
    const sections = handleSuccess<any[]>(response)
    return mapHomePageSectionsFromApi(sections)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update single home page section
 */
export async function updateHomePageSection(
  sectionKey: string,
  content: string | null,
  pageName?: string
): Promise<HomePageSectionModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_HOME_PAGE_ENDPOINTS.UPDATE(sectionKey),
      {
        content,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    const sectionData = handleSuccess<any>(response)
    return {
      id: sectionData.id,
      sectionKey: sectionData.section_key,
      content: sectionData.content,
      pageName: sectionData.page_name,
      createdAt: sectionData.created_at,
      updatedAt: sectionData.updated_at,
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Bulk update home page sections
 */
export async function bulkUpdateHomePageContent(
  sections: HomePageContentMap,
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.post<{ data: any[] }>(
      ADMIN_HOME_PAGE_ENDPOINTS.BULK_UPDATE,
      {
        sections,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    
    // Use handleSuccess to extract data from response
    const sectionsData = handleSuccess<any>(response)
    
    // Ensure sectionsData is an array before mapping
    if (!Array.isArray(sectionsData)) {
      // If it's a single object, wrap it in an array
      if (sectionsData && typeof sectionsData === 'object' && sectionsData !== null) {
        const singleSection = {
          id: sectionsData.id,
          sectionKey: sectionsData.section_key || sectionsData.sectionKey,
          content: sectionsData.content,
          pageName: sectionsData.page_name || sectionsData.pageName,
          createdAt: sectionsData.created_at || sectionsData.createdAt,
          updatedAt: sectionsData.updated_at || sectionsData.updatedAt,
        }
        return [singleSection]
      }
      // If it's null, undefined, or not an object, return empty array
      console.warn('bulkUpdateHomePageContent: sectionsData is not an array', sectionsData)
      return []
    }
    
    return mapHomePageSectionsFromApi(sectionsData)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// ABOUT PAGE CONTENT
// ============================================================================

/**
 * Get all about page sections and images
 */
export async function getAboutPageContent(
  pageName?: string
): Promise<{ sections: HomePageSectionModel[], images: PageImagesMap }> {
  try {
    const response = await httpClient.get<{ data: { sections: any[], images: any } }>(
      ADMIN_ABOUT_PAGE_ENDPOINTS.LIST,
      { params: pageName ? { page_name: pageName } : {} }
    )
    const data = handleSuccess<{ sections: any[], images: any }>(response)
    return {
      sections: mapHomePageSectionsFromApi(data.sections || []),
      images: Object.keys(data.images || {}).reduce((acc, key) => {
        acc[key] = mapPageImagesFromApi(data.images[key] || [])
        return acc
      }, {} as PageImagesMap),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update single about page section
 */
export async function updateAboutPageSection(
  sectionKey: string,
  content: string | null,
  pageName?: string
): Promise<HomePageSectionModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_ABOUT_PAGE_ENDPOINTS.UPDATE(sectionKey),
      {
        content,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    const sectionData = handleSuccess<any>(response)
    return {
      id: sectionData.id,
      sectionKey: sectionData.section_key,
      content: sectionData.content,
      pageName: sectionData.page_name,
      createdAt: sectionData.created_at,
      updatedAt: sectionData.updated_at,
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Bulk update about page sections
 */
export async function bulkUpdateAboutPageContent(
  sections: AboutPageContentMap,
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.post<{ data: any[] }>(
      ADMIN_ABOUT_PAGE_ENDPOINTS.BULK_UPDATE,
      {
        sections,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    
    const sectionsData = handleSuccess<any>(response)
    
    if (!Array.isArray(sectionsData)) {
      if (sectionsData && typeof sectionsData === 'object' && sectionsData !== null) {
        const singleSection = {
          id: sectionsData.id,
          sectionKey: sectionsData.section_key || sectionsData.sectionKey,
          content: sectionsData.content,
          pageName: sectionsData.page_name || sectionsData.pageName,
          createdAt: sectionsData.created_at || sectionsData.createdAt,
          updatedAt: sectionsData.updated_at || sectionsData.updatedAt,
        }
        return [singleSection]
      }
      console.warn('bulkUpdateAboutPageContent: sectionsData is not an array', sectionsData)
      return []
    }
    
    return mapHomePageSectionsFromApi(sectionsData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Upload image for about page
 */
export async function uploadAboutPageImage(
  sectionKey: string,
  image: File,
  altText?: string,
  sortOrder?: number,
  pageName?: string
): Promise<PageImageModel> {
  try {
    const formData = new FormData()
    formData.append('section_key', sectionKey)
    formData.append('image', image)
    if (altText) formData.append('alt_text', altText)
    if (sortOrder !== undefined) formData.append('sort_order', sortOrder.toString())
    if (pageName) formData.append('page_name', pageName)

    const response = await httpClient.post<{ data: any }>(
      ADMIN_ABOUT_PAGE_ENDPOINTS.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const imageData = handleSuccess<any>(response)
    return mapPageImageFromApi(imageData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete about page image
 */
export async function deleteAboutPageImage(imageId: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_ABOUT_PAGE_ENDPOINTS.DELETE_IMAGE(imageId))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// CONTACT PAGE CONTENT
// ============================================================================

/**
 * Get all contact page sections and images
 */
export async function getContactPageContent(
  pageName?: string
): Promise<{ sections: HomePageSectionModel[], images: PageImagesMap }> {
  try {
    const response = await httpClient.get<{ data: { sections: any[], images: any } }>(
      ADMIN_CONTACT_PAGE_ENDPOINTS.LIST,
      { params: pageName ? { page_name: pageName } : {} }
    )
    const data = handleSuccess<{ sections: any[], images: any }>(response)
    return {
      sections: mapHomePageSectionsFromApi(data.sections || []),
      images: Object.keys(data.images || {}).reduce((acc, key) => {
        acc[key] = mapPageImagesFromApi(data.images[key] || [])
        return acc
      }, {} as PageImagesMap),
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update single contact page section
 */
export async function updateContactPageSection(
  sectionKey: string,
  content: string | null,
  pageName?: string
): Promise<HomePageSectionModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_CONTACT_PAGE_ENDPOINTS.UPDATE(sectionKey),
      {
        content,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    const sectionData = handleSuccess<any>(response)
    return {
      id: sectionData.id,
      sectionKey: sectionData.section_key,
      content: sectionData.content,
      pageName: sectionData.page_name,
      createdAt: sectionData.created_at,
      updatedAt: sectionData.updated_at,
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Bulk update contact page sections
 */
export async function bulkUpdateContactPageContent(
  sections: ContactPageContentMap,
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.post<{ data: any[] }>(
      ADMIN_CONTACT_PAGE_ENDPOINTS.BULK_UPDATE,
      {
        sections,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    
    const sectionsData = handleSuccess<any>(response)
    
    if (!Array.isArray(sectionsData)) {
      if (sectionsData && typeof sectionsData === 'object' && sectionsData !== null) {
        const singleSection = {
          id: sectionsData.id,
          sectionKey: sectionsData.section_key || sectionsData.sectionKey,
          content: sectionsData.content,
          pageName: sectionsData.page_name || sectionsData.pageName,
          createdAt: sectionsData.created_at || sectionsData.createdAt,
          updatedAt: sectionsData.updated_at || sectionsData.updatedAt,
        }
        return [singleSection]
      }
      console.warn('bulkUpdateContactPageContent: sectionsData is not an array', sectionsData)
      return []
    }
    
    return mapHomePageSectionsFromApi(sectionsData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Upload image for contact page
 */
export async function uploadContactPageImage(
  sectionKey: string,
  image: File,
  altText?: string,
  sortOrder?: number,
  pageName?: string
): Promise<PageImageModel> {
  try {
    const formData = new FormData()
    formData.append('section_key', sectionKey)
    formData.append('image', image)
    if (altText) formData.append('alt_text', altText)
    if (sortOrder !== undefined) formData.append('sort_order', sortOrder.toString())
    if (pageName) formData.append('page_name', pageName)

    const response = await httpClient.post<{ data: any }>(
      ADMIN_CONTACT_PAGE_ENDPOINTS.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const imageData = handleSuccess<any>(response)
    return mapPageImageFromApi(imageData)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete contact page image
 */
export async function deleteContactPageImage(imageId: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_CONTACT_PAGE_ENDPOINTS.DELETE_IMAGE(imageId))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// PRIVACY PAGE CONTENT
// ============================================================================

/**
 * Get all privacy page sections
 */
export async function getPrivacyPageContent(
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      ADMIN_PRIVACY_PAGE_ENDPOINTS.LIST,
      { params: pageName ? { page_name: pageName } : {} }
    )
    const sections = handleSuccess<any[]>(response)
    return mapHomePageSectionsFromApi(sections)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update single privacy page section
 */
export async function updatePrivacyPageContent(
  sectionKey: string,
  content: string | null,
  pageName?: string
): Promise<HomePageSectionModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_PRIVACY_PAGE_ENDPOINTS.UPDATE(sectionKey),
      {
        content,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    const sectionData = handleSuccess<any>(response)
    return {
      id: sectionData.id,
      sectionKey: sectionData.section_key,
      content: sectionData.content,
      pageName: sectionData.page_name,
      createdAt: sectionData.created_at,
      updatedAt: sectionData.updated_at,
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Bulk update privacy page sections
 */
export async function bulkUpdatePrivacyPageContent(
  sections: Record<string, string | null>,
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.post<{ data: any[] }>(
      ADMIN_PRIVACY_PAGE_ENDPOINTS.BULK_UPDATE,
      {
        sections,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    
    const sectionsData = handleSuccess<any>(response)
    
    if (!Array.isArray(sectionsData)) {
      if (sectionsData && typeof sectionsData === 'object' && sectionsData !== null) {
        const singleSection = {
          id: sectionsData.id,
          sectionKey: sectionsData.section_key || sectionsData.sectionKey,
          content: sectionsData.content,
          pageName: sectionsData.page_name || sectionsData.pageName,
          createdAt: sectionsData.created_at || sectionsData.createdAt,
          updatedAt: sectionsData.updated_at || sectionsData.updatedAt,
        }
        return [singleSection]
      }
      console.warn('bulkUpdatePrivacyPageContent: sectionsData is not an array', sectionsData)
      return []
    }
    
    return mapHomePageSectionsFromApi(sectionsData)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// TERMS PAGE CONTENT
// ============================================================================

/**
 * Get all terms page sections
 */
export async function getTermsPageContent(
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      ADMIN_TERMS_PAGE_ENDPOINTS.LIST,
      { params: pageName ? { page_name: pageName } : {} }
    )
    const sections = handleSuccess<any[]>(response)
    return mapHomePageSectionsFromApi(sections)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update single terms page section
 */
export async function updateTermsPageContent(
  sectionKey: string,
  content: string | null,
  pageName?: string
): Promise<HomePageSectionModel> {
  try {
    const response = await httpClient.post<{ data: any }>(
      ADMIN_TERMS_PAGE_ENDPOINTS.UPDATE(sectionKey),
      {
        content,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    const sectionData = handleSuccess<any>(response)
    return {
      id: sectionData.id,
      sectionKey: sectionData.section_key,
      content: sectionData.content,
      pageName: sectionData.page_name,
      createdAt: sectionData.created_at,
      updatedAt: sectionData.updated_at,
    }
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Bulk update terms page sections
 */
export async function bulkUpdateTermsPageContent(
  sections: Record<string, string | null>,
  pageName?: string
): Promise<HomePageSectionModel[]> {
  try {
    const response = await httpClient.post<{ data: any[] }>(
      ADMIN_TERMS_PAGE_ENDPOINTS.BULK_UPDATE,
      {
        sections,
        ...(pageName ? { page_name: pageName } : {}),
      }
    )
    
    const sectionsData = handleSuccess<any>(response)
    
    if (!Array.isArray(sectionsData)) {
      if (sectionsData && typeof sectionsData === 'object' && sectionsData !== null) {
        const singleSection = {
          id: sectionsData.id,
          sectionKey: sectionsData.section_key || sectionsData.sectionKey,
          content: sectionsData.content,
          pageName: sectionsData.page_name || sectionsData.pageName,
          createdAt: sectionsData.created_at || sectionsData.createdAt,
          updatedAt: sectionsData.updated_at || sectionsData.updatedAt,
        }
        return [singleSection]
      }
      console.warn('bulkUpdateTermsPageContent: sectionsData is not an array', sectionsData)
      return []
    }
    
    return mapHomePageSectionsFromApi(sectionsData)
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
export async function getAnalyticsOverview(dateRange?: string): Promise<import('@/models/analytics.model').AnalyticsOverview> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').AnalyticsOverview }>(
      ADMIN_ANALYTICS_ENDPOINTS.OVERVIEW,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get revenue analytics
 */
export async function getAnalyticsRevenue(dateRange?: string): Promise<import('@/models/analytics.model').RevenueAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').RevenueAnalytics }>(
      ADMIN_ANALYTICS_ENDPOINTS.REVENUE,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get dealer performance analytics
 */
export async function getAnalyticsDealers(dateRange?: string): Promise<import('@/models/analytics.model').DealerPerformance> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').DealerPerformance }>(
      ADMIN_ANALYTICS_ENDPOINTS.DEALERS,
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
export async function getAnalyticsVehicles(dateRange?: string): Promise<import('@/models/analytics.model').VehicleAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').VehicleAnalytics }>(
      ADMIN_ANALYTICS_ENDPOINTS.VEHICLES,
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
export async function getAnalyticsLeads(dateRange?: string): Promise<import('@/models/analytics.model').LeadAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').LeadAnalytics }>(
      ADMIN_ANALYTICS_ENDPOINTS.LEADS,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get user activity analytics
 */
export async function getAnalyticsActivity(dateRange?: string): Promise<import('@/models/analytics.model').UserActivityAnalytics> {
  try {
    const response = await httpClient.get<{ data: import('@/models/analytics.model').UserActivityAnalytics }>(
      ADMIN_ANALYTICS_ENDPOINTS.ACTIVITY,
      { params: { date_range: dateRange } }
    )
    return handleSuccess(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

/**
 * Audit log model
 */
export interface AuditLogModel {
  id: number
  actor_id: number
  actor_type: string
  dealer_id?: number
  action: string
  target_type: string
  target_id: number
  related_target_type?: string
  related_target_id?: number
  description?: string
  status?: string
  severity?: string
  tags?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  request_method?: string
  request_url?: string
  error_message?: string
  duration_ms?: number
  session_id?: string
  request_id?: string
  created_at?: string
}

/**
 * Get audit logs
 */
export async function getAuditLogs(params?: PaginationParams & {
  actor_id?: number
  target_type?: string
  action?: string
  severity?: string
  status?: string
  search?: string
  date_from?: string
  date_to?: string
  sort?: string
  order?: 'asc' | 'desc'
}): Promise<PaginationModel<AuditLogModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<AuditLogModel> }>(
      ADMIN_AUDIT_ENDPOINTS.LOGS,
      { params }
    )
    return handleSuccess<PaginationModel<AuditLogModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get audit log details by ID
 */
export async function getAuditLog(id: number): Promise<AuditLogModel> {
  try {
    const response = await httpClient.get<{ data: AuditLogModel }>(
      `${ADMIN_AUDIT_ENDPOINTS.LOGS}/${id}`
    )
    return handleSuccess<AuditLogModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Constant model (base)
 */
export interface ConstantModel {
  id: number
  name: string
}

/**
 * Vehicle Model (with brand relationship)
 */
export interface VehicleModelConstant extends ConstantModel {
  brand_id: number
  brand?: ConstantModel
}

/**
 * Equipment (with equipment type relationship)
 */
export interface EquipmentConstant extends ConstantModel {
  equipment_type_id: number
  equipment_type?: ConstantModel
}

/**
 * Variant (with model relationship)
 */
export interface VariantConstant extends ConstantModel {
  model_id?: number
  model?: VehicleModelConstant
}

/**
 * Equipment Type (with equipments relationship)
 */
export interface EquipmentTypeConstant extends ConstantModel {
  equipments?: EquipmentConstant[]
}

/**
 * All constants data response
 */
export interface ConstantsData {
  brands: ConstantModel[]
  model_years: ConstantModel[]
  fuel_types: ConstantModel[]
  gear_types: ConstantModel[]
  listing_types: ConstantModel[]
  body_types: ConstantModel[]
  colors: ConstantModel[]
  variants: VariantConstant[]
  types: ConstantModel[]
  conditions: ConstantModel[]
  sales_types: ConstantModel[]
  price_types: ConstantModel[]
  euronorms: ConstantModel[]
  vehicle_models: VehicleModelConstant[]
  vehicle_uses: ConstantModel[]
  vehicle_list_statuses: ConstantModel[]
  equipment_types: EquipmentTypeConstant[]
  equipments: EquipmentConstant[]
}

/**
 * Get all constants data (cached)
 */
export async function getConstantsData(): Promise<ConstantsData> {
  try {
    const response = await httpClient.get<{ data: ConstantsData }>(
      ADMIN_CONSTANTS_ENDPOINTS.GET_ALL
    )
    return handleSuccess<ConstantsData>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create constant data
 */
export interface CreateConstantData {
  name: string
  brand_id?: number
  equipment_type_id?: number
  model_id?: number
}

/**
 * Update constant data
 */
export interface UpdateConstantData {
  name?: string
  brand_id?: number
  equipment_type_id?: number
  model_id?: number
}

// ============================================================================
// BRANDS
// ============================================================================

export async function getBrands(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.BRANDS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getBrand(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.BRANDS.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createBrand(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.BRANDS.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateBrand(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.BRANDS.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteBrand(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.BRANDS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// MODEL YEARS
// ============================================================================

export async function getModelYears(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.MODEL_YEARS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getModelYear(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.MODEL_YEARS.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createModelYear(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.MODEL_YEARS.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateModelYear(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.MODEL_YEARS.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteModelYear(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.MODEL_YEARS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// FUEL TYPES
// ============================================================================

export async function getFuelTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.FUEL_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getFuelType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.FUEL_TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createFuelType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.FUEL_TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateFuelType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.FUEL_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteFuelType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.FUEL_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// GEAR TYPES
// ============================================================================

export async function getGearTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.GEAR_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getGearType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.GEAR_TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createGearType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.GEAR_TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateGearType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.GEAR_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteGearType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.GEAR_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// LISTING TYPES
// ============================================================================

export async function getListingTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.LISTING_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getListingType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.LISTING_TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createListingType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.LISTING_TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateListingType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.LISTING_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteListingType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.LISTING_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// BODY TYPES
// ============================================================================

export async function getBodyTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.BODY_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getBodyType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.BODY_TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createBodyType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.BODY_TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateBodyType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.BODY_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteBodyType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.BODY_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// COLORS
// ============================================================================

export async function getColors(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.COLORS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getColor(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.COLORS.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createColor(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.COLORS.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateColor(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.COLORS.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteColor(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.COLORS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// VARIANTS
// ============================================================================

export async function getVariants(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.VARIANTS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getVariant(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VARIANTS.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createVariant(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VARIANTS.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateVariant(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VARIANTS.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteVariant(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.VARIANTS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// TYPES
// ============================================================================

export async function getTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// CONDITIONS
// ============================================================================

export async function getConditions(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.CONDITIONS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getCondition(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.CONDITIONS.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createCondition(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.CONDITIONS.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateCondition(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.CONDITIONS.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteCondition(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.CONDITIONS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// SALES TYPES
// ============================================================================

export async function getSalesTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.SALES_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getSalesType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.SALES_TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createSalesType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.SALES_TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateSalesType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.SALES_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteSalesType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.SALES_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// PRICE TYPES
// ============================================================================

export async function getPriceTypes(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.PRICE_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getPriceType(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.PRICE_TYPES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createPriceType(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.PRICE_TYPES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updatePriceType(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.PRICE_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deletePriceType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.PRICE_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// EURONORMS
// ============================================================================

export async function getEuronorms(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.EURONORMS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getEuronorm(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.EURONORMS.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createEuronorm(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.EURONORMS.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateEuronorm(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.EURONORMS.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteEuronorm(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.EURONORMS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// VEHICLE MODELS
// ============================================================================

export async function getVehicleModels(params?: PaginationParams): Promise<PaginationModel<VehicleModelConstant>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<VehicleModelConstant> }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_MODELS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<VehicleModelConstant>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getVehicleModel(id: number | string): Promise<VehicleModelConstant> {
  try {
    const response = await httpClient.get<{ data: VehicleModelConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_MODELS.SHOW(id)
    )
    return handleSuccess<VehicleModelConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createVehicleModel(data: CreateConstantData & { brand_id: number }): Promise<VehicleModelConstant> {
  try {
    const response = await httpClient.post<{ data: VehicleModelConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_MODELS.CREATE,
      data
    )
    return handleSuccess<VehicleModelConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateVehicleModel(id: number | string, data: UpdateConstantData): Promise<VehicleModelConstant> {
  try {
    const response = await httpClient.post<{ data: VehicleModelConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_MODELS.UPDATE(id),
      data
    )
    return handleSuccess<VehicleModelConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteVehicleModel(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_MODELS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// VEHICLE USES
// ============================================================================

export async function getVehicleUses(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_USES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getVehicleUse(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_USES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createVehicleUse(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_USES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateVehicleUse(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_USES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteVehicleUse(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_USES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// VEHICLE LIST STATUSES
// ============================================================================

export async function getVehicleListStatuses(params?: PaginationParams): Promise<PaginationModel<ConstantModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<ConstantModel> }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_LIST_STATUSES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<ConstantModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getVehicleListStatus(id: number | string): Promise<ConstantModel> {
  try {
    const response = await httpClient.get<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_LIST_STATUSES.SHOW(id)
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createVehicleListStatus(data: CreateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_LIST_STATUSES.CREATE,
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateVehicleListStatus(id: number | string, data: UpdateConstantData): Promise<ConstantModel> {
  try {
    const response = await httpClient.post<{ data: ConstantModel }>(
      ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_LIST_STATUSES.UPDATE(id),
      data
    )
    return handleSuccess<ConstantModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteVehicleListStatus(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.VEHICLE_LIST_STATUSES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// EQUIPMENT TYPES
// ============================================================================

export async function getEquipmentTypes(params?: PaginationParams): Promise<PaginationModel<EquipmentTypeConstant>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<EquipmentTypeConstant> }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENT_TYPES.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<EquipmentTypeConstant>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getEquipmentType(id: number | string): Promise<EquipmentTypeConstant> {
  try {
    const response = await httpClient.get<{ data: EquipmentTypeConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENT_TYPES.SHOW(id)
    )
    return handleSuccess<EquipmentTypeConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createEquipmentType(data: CreateConstantData): Promise<EquipmentTypeConstant> {
  try {
    const response = await httpClient.post<{ data: EquipmentTypeConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENT_TYPES.CREATE,
      data
    )
    return handleSuccess<EquipmentTypeConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateEquipmentType(id: number | string, data: UpdateConstantData): Promise<EquipmentTypeConstant> {
  try {
    const response = await httpClient.post<{ data: EquipmentTypeConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENT_TYPES.UPDATE(id),
      data
    )
    return handleSuccess<EquipmentTypeConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteEquipmentType(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENT_TYPES.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// EQUIPMENTS
// ============================================================================

export async function getEquipments(params?: PaginationParams): Promise<PaginationModel<EquipmentConstant>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<EquipmentConstant> }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENTS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<EquipmentConstant>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function getEquipment(id: number | string): Promise<EquipmentConstant> {
  try {
    const response = await httpClient.get<{ data: EquipmentConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENTS.SHOW(id)
    )
    return handleSuccess<EquipmentConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function createEquipment(data: CreateConstantData & { equipment_type_id: number }): Promise<EquipmentConstant> {
  try {
    const response = await httpClient.post<{ data: EquipmentConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENTS.CREATE,
      data
    )
    return handleSuccess<EquipmentConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateEquipment(id: number | string, data: UpdateConstantData): Promise<EquipmentConstant> {
  try {
    const response = await httpClient.post<{ data: EquipmentConstant }>(
      ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENTS.UPDATE(id),
      data
    )
    return handleSuccess<EquipmentConstant>(response)
  } catch (error) {
    throw handleError(error)
  }
}

export async function deleteEquipment(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_CONSTANTS_ENDPOINTS.EQUIPMENTS.DELETE(id), {})
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
    users: {
      total: number
      new_last_7_days: number
      new_last_30_days: number
      new_this_month: number
      new_last_month: number
      growth_rate: number
    }
    dealers: {
      total: number
      new_last_7_days: number
      new_last_30_days: number
      new_this_month: number
      new_last_month: number
      growth_rate: number
    }
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
    subscriptions: {
      total: number
      active: number
      trial: number
      expired: number
      new_last_7_days: number
      new_last_30_days: number
      new_this_month: number
      new_last_month: number
      growth_rate: number
    }
    plans: {
      total: number
      active: number
    }
  }
  trends: {
    vehicles: Array<{ date: string; count: number }>
    users: Array<{ date: string; count: number }>
  }
  distributions: {
    vehicle_status: Array<{ status: string; count: number; color: string }>
    subscription_status: Array<{ status: string; count: number; color: string }>
  }
  recent: {
    vehicles: Array<any>
    users: Array<any>
    dealers: Array<any>
    leads: Array<any>
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await httpClient.get<{ data: DashboardStats }>(
      ADMIN_DASHBOARD_ENDPOINTS.STATS
    )
    return handleSuccess<DashboardStats>(response)
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// FEATURED VEHICLES
// ============================================================================

/**
 * Featured vehicle model
 */
export interface FeaturedVehicleModel {
  id: number
  vehicle_id: number
  sort_order: number
  vehicle?: any // VehicleModel with relationships
  created_at?: string
  updated_at?: string
}

/**
 * Get all featured vehicles
 */
export async function getFeaturedVehicles(
  params?: PaginationParams & {
    search?: string
    status?: string
  }
): Promise<PaginationModel<FeaturedVehicleModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<FeaturedVehicleModel> }>(
      ADMIN_FEATURED_VEHICLE_ENDPOINTS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<FeaturedVehicleModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create featured vehicle data
 */
export interface CreateFeaturedVehicleData {
  vehicle_id: number
  sort_order?: number
}

/**
 * Add vehicle to featured listings
 */
export async function addFeaturedVehicle(
  data: CreateFeaturedVehicleData
): Promise<FeaturedVehicleModel> {
  try {
    const response = await httpClient.post<{ data: FeaturedVehicleModel }>(
      ADMIN_FEATURED_VEHICLE_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<FeaturedVehicleModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update featured vehicle data
 */
export interface UpdateFeaturedVehicleData {
  sort_order: number
}

/**
 * Update featured vehicle sort order
 */
export async function updateFeaturedVehicle(
  id: number | string,
  data: UpdateFeaturedVehicleData
): Promise<FeaturedVehicleModel> {
  try {
    const response = await httpClient.post<{ data: FeaturedVehicleModel }>(
      ADMIN_FEATURED_VEHICLE_ENDPOINTS.UPDATE(id),
      data
    )
    return handleSuccess<FeaturedVehicleModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Remove vehicle from featured listings
 */
export async function removeFeaturedVehicle(id: number | string): Promise<void> {
  try {
    await httpClient.post(ADMIN_FEATURED_VEHICLE_ENDPOINTS.DELETE(id), {})
  } catch (error) {
    throw handleError(error)
  }
}
