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
  ADMIN_BLOG_ENDPOINTS,
  ADMIN_ANALYTICS_ENDPOINTS,
  ADMIN_AUDIT_ENDPOINTS,
} from './endpoints'
import type { UserModel } from '@/models/user.model'
import { mapUserFromApi } from '@/models/user.model'
import type { VehicleModel } from '@/models/vehicle.model'
import { mapVehicleFromApi } from '@/models/vehicle.model'
import type { DealerModel } from '@/models/dealer.model'
import { mapDealerFromApi } from '@/models/dealer.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'
import type { VehicleStatus } from '@/models/vehicle.model'
import type { SubscriptionStatus } from '@/models/dealer.model'

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
  roles?: string[]
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
  roles?: string[]
}

/**
 * Update user
 */
export async function updateUser(
  id: number | string,
  data: UpdateUserData
): Promise<UserModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
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
    await httpClient.delete(ADMIN_USER_ENDPOINTS.DELETE(id))
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
    const response = await httpClient.put<{ data: any }>(
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
 * Ban user
 */
export async function banUser(id: number | string): Promise<UserModel> {
  try {
    const response = await httpClient.put<{ data: any }>(
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
    const response = await httpClient.put<{ data: any }>(
      ADMIN_USER_ENDPOINTS.UNBAN(id),
      {}
    )
    const userData = handleSuccess<any>(response)
    return mapUserFromApi(userData)
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
    const response = await httpClient.put<{ data: any }>(
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
    await httpClient.delete(ADMIN_VEHICLE_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get vehicle history
 */
export async function getVehicleHistory(id: number | string): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      ADMIN_VEHICLE_ENDPOINTS.HISTORY(id)
    )
    return handleSuccess<any[]>(response)
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
  description?: string
  price: number
  interval?: string
  features?: any[]
  createdAt?: string
  updatedAt?: string
}

/**
 * Get all plans
 */
export async function getPlans(): Promise<PlanModel[]> {
  try {
    const response = await httpClient.get<{ data: PlanModel[] }>(
      ADMIN_PLAN_ENDPOINTS.LIST
    )
    return handleSuccess<PlanModel[]>(response)
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
  description?: string
  price: number
  interval?: string
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
  description?: string
  price?: number
  interval?: string
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
 * Subscription model
 */
export interface SubscriptionModel {
  id: number
  dealer_id: number
  plan_id: number
  status: SubscriptionStatus
  start_date?: string
  end_date?: string
  createdAt?: string
  updatedAt?: string
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
  start_date?: string
  end_date?: string
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

// ============================================================================
// FEATURES
// ============================================================================

/**
 * Feature model
 */
export interface FeatureModel {
  id: number
  name: string
  description?: string
  key: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Get all features
 */
export async function getFeatures(): Promise<FeatureModel[]> {
  try {
    const response = await httpClient.get<{ data: FeatureModel[] }>(
      ADMIN_FEATURE_ENDPOINTS.LIST
    )
    return handleSuccess<FeatureModel[]>(response)
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
  name: string
  description?: string
  key: string
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
  name?: string
  description?: string
  key?: string
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
// CMS - BLOGS
// ============================================================================

/**
 * Blog model
 */
export interface BlogModel {
  id: number
  title: string
  slug: string
  content?: string
  excerpt?: string
  featured_image?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Get all blogs
 */
export async function getBlogs(params?: PaginationParams): Promise<PaginationModel<BlogModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<BlogModel> }>(
      ADMIN_BLOG_ENDPOINTS.LIST,
      { params }
    )
    return handleSuccess<PaginationModel<BlogModel>>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get blog by ID
 */
export async function getBlog(id: number | string): Promise<BlogModel> {
  try {
    const response = await httpClient.get<{ data: BlogModel }>(
      ADMIN_BLOG_ENDPOINTS.SHOW(id)
    )
    return handleSuccess<BlogModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Create blog data
 */
export interface CreateBlogData {
  title: string
  slug: string
  content?: string
  excerpt?: string
  featured_image?: string
}

/**
 * Create blog
 */
export async function createBlog(data: CreateBlogData): Promise<BlogModel> {
  try {
    const response = await httpClient.post<{ data: BlogModel }>(
      ADMIN_BLOG_ENDPOINTS.CREATE,
      data
    )
    return handleSuccess<BlogModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Update blog data
 */
export interface UpdateBlogData {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  featured_image?: string
}

/**
 * Update blog
 */
export async function updateBlog(
  id: number | string,
  data: UpdateBlogData
): Promise<BlogModel> {
  try {
    const response = await httpClient.put<{ data: BlogModel }>(
      ADMIN_BLOG_ENDPOINTS.UPDATE(id),
      data
    )
    return handleSuccess<BlogModel>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Delete blog
 */
export async function deleteBlog(id: number | string): Promise<void> {
  try {
    await httpClient.delete(ADMIN_BLOG_ENDPOINTS.DELETE(id))
  } catch (error) {
    throw handleError(error)
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get vehicle analytics
 */
export async function getVehicleAnalytics(params?: {
  date_from?: string
  date_to?: string
  dealer_id?: number
}): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_ANALYTICS_ENDPOINTS.VEHICLES,
      { params }
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get lead analytics
 */
export async function getLeadAnalytics(params?: {
  date_from?: string
  date_to?: string
  dealer_id?: number
}): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_ANALYTICS_ENDPOINTS.LEADS,
      { params }
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics(params?: {
  date_from?: string
  date_to?: string
}): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      ADMIN_ANALYTICS_ENDPOINTS.SUBSCRIPTIONS,
      { params }
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
 * Audit log model
 */
export interface AuditLogModel {
  id: number
  user_id: number
  action: string
  resource_type: string
  resource_id: number
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
  createdAt?: string
}

/**
 * Get audit logs
 */
export async function getAuditLogs(params?: PaginationParams & {
  user_id?: number
  resource_type?: string
  action?: string
  date_from?: string
  date_to?: string
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

