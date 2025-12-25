/**
 * Public API Module
 * 
 * Public API calls (no authentication required)
 */

import httpClient from './http'
import { handleSuccess, handleError } from './response'
import {
  PUBLIC_VEHICLE_ENDPOINTS,
  PUBLIC_LOOKUP_ENDPOINTS,
} from './endpoints'
import type { VehicleModel } from '@/models/vehicle.model'
import { mapVehicleFromApi } from '@/models/vehicle.model'
import type { PaginationModel, PaginationParams } from '@/models/pagination.model'

/**
 * Get published vehicles (public listing)
 */
export async function getVehicles(params?: PaginationParams & {
  search?: string
  min_price?: number
  max_price?: number
  fuel_type_id?: number
  transmission_id?: number
  year?: number
  location_id?: number
  sort?: string
}): Promise<PaginationModel<VehicleModel>> {
  try {
    const response = await httpClient.get<{ data: PaginationModel<any> }>(
      PUBLIC_VEHICLE_ENDPOINTS.LIST,
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
 * Get vehicle by ID (public)
 */
export async function getVehicle(id: number | string): Promise<VehicleModel> {
  try {
    const response = await httpClient.get<{ data: any }>(
      PUBLIC_VEHICLE_ENDPOINTS.SHOW(id)
    )
    const data = handleSuccess<any>(response)
    return mapVehicleFromApi(data)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Location model
 */
export interface LocationModel {
  id: number
  name: string
  city?: string
  state?: string
  country?: string
  zip_code?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Get locations
 */
export async function getLocations(): Promise<LocationModel[]> {
  try {
    const response = await httpClient.get<{ data: LocationModel[] }>(
      PUBLIC_LOOKUP_ENDPOINTS.LOCATIONS
    )
    return handleSuccess<LocationModel[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Fuel type model
 */
export interface FuelTypeModel {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Get fuel types
 */
export async function getFuelTypes(): Promise<FuelTypeModel[]> {
  try {
    const response = await httpClient.get<{ data: FuelTypeModel[] }>(
      PUBLIC_LOOKUP_ENDPOINTS.FUEL_TYPES
    )
    return handleSuccess<FuelTypeModel[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Transmission model
 */
export interface TransmissionModel {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Get transmission types
 */
export async function getTransmissions(): Promise<TransmissionModel[]> {
  try {
    const response = await httpClient.get<{ data: TransmissionModel[] }>(
      PUBLIC_LOOKUP_ENDPOINTS.TRANSMISSIONS
    )
    return handleSuccess<TransmissionModel[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

