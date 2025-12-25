/**
 * Lead Model
 * 
 * Maps backend lead response to TypeScript interface
 */

/**
 * Lead stage (matches backend LeadStage constants)
 */
export enum LeadStage {
  NEW = 1,
  CONTACTED = 2,
  QUALIFIED = 3,
  QUOTED = 4,
  NEGOTIATING = 5,
  WON = 6,
  LOST = 7,
}

/**
 * Lead model interface
 */
export interface LeadModel {
  id: number
  dealerId: number
  vehicleId?: number
  userId?: number
  assignedToId?: number
  name: string
  email?: string
  phone?: string
  message?: string
  stageId: number
  stage?: LeadStage
  source?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  
  // Relations (if included in response)
  dealer?: any
  vehicle?: any
  user?: any
  assignedTo?: any
  messages?: LeadMessageModel[]
}

/**
 * Lead message model
 */
export interface LeadMessageModel {
  id: number
  leadId: number
  userId: number
  message: string
  isFromCustomer?: boolean
  createdAt?: string
  updatedAt?: string
  
  user?: any
}

/**
 * Map API response (snake_case) to LeadModel (camelCase)
 */
export function mapLeadFromApi(data: any): LeadModel {
  return {
    id: data.id,
    dealerId: data.dealer_id,
    vehicleId: data.vehicle_id,
    userId: data.user_id,
    assignedToId: data.assigned_to_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    stageId: data.stage_id,
    stage: data.stage_id as LeadStage,
    source: data.source,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
    dealer: data.dealer,
    vehicle: data.vehicle,
    user: data.user,
    assignedTo: data.assigned_to,
    messages: data.messages?.map(mapLeadMessageFromApi),
  }
}

/**
 * Map lead message from API
 */
export function mapLeadMessageFromApi(data: any): LeadMessageModel {
  return {
    id: data.id,
    leadId: data.lead_id,
    userId: data.user_id,
    message: data.message,
    isFromCustomer: data.is_from_customer ?? false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    user: data.user,
  }
}

