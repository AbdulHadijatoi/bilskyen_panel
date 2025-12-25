/**
 * Nummerplade API Module
 * 
 * Nummerplade proxy API calls
 * Handles Nummerplade-specific errors
 */

import httpClient from './http'
import { handleSuccess, handleError } from './response'
import { NUMMERPLADE_ENDPOINTS } from './endpoints'
import type { NummerpladeErrorModel } from '@/models/api-error.model'
import { isNummerpladeError } from '@/models/api-error.model'

/**
 * Get vehicle by registration
 */
export interface GetVehicleByRegistrationData {
  registration: string
}

/**
 * Get vehicle by registration (Nummerplade API)
 */
export async function getVehicleByRegistration(
  data: GetVehicleByRegistrationData
): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.VEHICLE_BY_REGISTRATION,
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    // Nummerplade errors are handled by response handler
    throw handleError(error)
  }
}

/**
 * Get vehicle by VIN
 */
export interface GetVehicleByVinData {
  vin: string
}

/**
 * Get vehicle by VIN (Nummerplade API)
 */
export async function getVehicleByVin(data: GetVehicleByVinData): Promise<any> {
  try {
    const response = await httpClient.post<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.VEHICLE_BY_VIN,
      data
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get body types (cached reference data)
 */
export async function getBodyTypes(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      NUMMERPLADE_ENDPOINTS.REFERENCE_BODY_TYPES
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get colors (cached reference data)
 */
export async function getColors(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      NUMMERPLADE_ENDPOINTS.REFERENCE_COLORS
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get fuel types (cached reference data)
 */
export async function getFuelTypes(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      NUMMERPLADE_ENDPOINTS.REFERENCE_FUEL_TYPES
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get equipment (cached reference data)
 */
export async function getEquipment(): Promise<any[]> {
  try {
    const response = await httpClient.get<{ data: any[] }>(
      NUMMERPLADE_ENDPOINTS.REFERENCE_EQUIPMENT
    )
    return handleSuccess<any[]>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get inspections for vehicle
 */
export async function getInspections(vehicleId: number | string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.INSPECTIONS(vehicleId)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get DMR data for vehicle
 */
export async function getDmrData(vehicleId: number | string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.DMR(vehicleId)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get debt data for vehicle
 */
export async function getDebt(vehicleId: number | string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.DEBT(vehicleId)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get tinglysning data for VIN
 */
export async function getTinglysning(vin: string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.TINGLYSNING(vin)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get emissions data
 */
export async function getEmissions(input: string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.EMISSIONS(input)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Get evaluations data
 */
export async function getEvaluations(input: string): Promise<any> {
  try {
    const response = await httpClient.get<{ data: any }>(
      NUMMERPLADE_ENDPOINTS.EVALUATIONS(input)
    )
    return handleSuccess<any>(response)
  } catch (error) {
    throw handleError(error)
  }
}

