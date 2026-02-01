/**
 * Enquiry Model
 * 
 * Maps backend enquiry response to TypeScript interface
 */

/**
 * Enquiry status enum
 */
export enum EnquiryStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  AWAITING_CUSTOMER = 'Awaiting Customer',
  RESPONDED = 'Responded',
  CLOSED = 'Closed',
  CONVERTED_TO_SALE = 'Converted to Sale',
  CANCELLED = 'Cancelled',
}

/**
 * Enquiry type enum
 */
export enum EnquiryType {
  GENERAL = 'General',
  SALES = 'Sales',
  VEHICLE_INFORMATION = 'Vehicle Information',
  TEST_DRIVE = 'Test Drive',
  PRICE_ENQUIRY = 'Price Enquiry',
  FINANCING = 'Financing',
  INSURANCE = 'Insurance',
  TRADE_IN = 'Trade-In',
  AVAILABILITY = 'Availability',
  SERVICE = 'Service',
  PARTS = 'Parts',
  COMPLAINT = 'Complaint',
  FEEDBACK = 'Feedback',
  OTHER = 'Other',
}

/**
 * Enquiry model interface
 */
export interface EnquiryModel {
  id: number
  serialNo?: number
  subject: string
  message: string
  type: string
  status: string
  source: string
  contactId?: number
  userId?: number
  vehicleId?: number
  createdAt?: string
  updatedAt?: string
  
  // Relations (if included in response)
  user?: any
  vehicle?: any
  contact?: any
}

/**
 * Map API response (snake_case) to EnquiryModel (camelCase)
 */
export function mapEnquiryFromApi(data: any): EnquiryModel {
  return {
    id: data.id,
    serialNo: data.serial_no,
    subject: data.subject,
    message: data.message,
    type: data.type,
    status: data.status,
    source: data.source,
    contactId: data.contact_id,
    userId: data.user_id,
    vehicleId: data.vehicle_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    user: data.user,
    vehicle: data.vehicle,
    contact: data.contact,
  }
}
