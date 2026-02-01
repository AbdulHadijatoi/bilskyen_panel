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
 * Lead intent (matches backend LeadIntent constants)
 */
export enum LeadIntent {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

/**
 * Lead intent interface
 */
export interface LeadIntentModel {
  id: number
  name: string
}

/**
 * Lead category interface
 */
export interface LeadCategoryModel {
  id: number
  name: string
  description?: string
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
  intentId?: number
  categoryId?: number
  intent?: LeadIntentModel
  category?: LeadCategoryModel
  source?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  lastActivityAt?: string
  
  // Relations (if included in response)
  dealer?: any
  vehicle?: any
  user?: any
  buyerUser?: any
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
    userId: data.buyer_user_id || data.user_id,
    assignedToId: data.assigned_user_id || data.assigned_to_id,
    name: data.buyer_user?.name || data.user?.name || data.name || 'Unknown',
    email: data.buyer_user?.email || data.user?.email || data.email,
    phone: data.buyer_user?.phone || data.user?.phone || data.phone,
    message: data.message,
    stageId: data.lead_stage_id || data.stage_id,
    stage: (data.lead_stage_id || data.stage_id) as LeadStage,
    intentId: data.lead_intent_id || data.intent_id,
    categoryId: data.lead_category_id || data.category_id,
    intent: data.lead_intent ? { id: data.lead_intent.id, name: data.lead_intent.name } : undefined,
    category: data.lead_category ? { 
      id: data.lead_category.id, 
      name: data.lead_category.name,
      description: data.lead_category.description 
    } : undefined,
    source: data.source?.name || data.source,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
    lastActivityAt: data.last_activity_at,
    dealer: data.dealer,
    vehicle: data.vehicle,
    user: data.buyer_user || data.user,
    buyerUser: data.buyer_user,
    assignedTo: data.assigned_user || data.assigned_to,
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

