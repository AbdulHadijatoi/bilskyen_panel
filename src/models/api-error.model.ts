/**
 * API Error Models
 * 
 * Centralized error models that mirror backend error responses
 */

/**
 * Standard API error response structure
 */
export interface ApiErrorModel {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
  error_code?: string
}

/**
 * Nummerplade API error response structure
 */
export interface NummerpladeErrorModel extends ApiErrorModel {
  source: 'nummerplade'
  retryable: boolean
  code: NummerpladeErrorCode
}

/**
 * Nummerplade error codes
 */
export enum NummerpladeErrorCode {
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVICE_DOWN = 'SERVICE_DOWN',
  UNKNOWN = 'UNKNOWN',
}

/**
 * HTTP status code error types
 */
export enum HttpErrorType {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Check if error is a Nummerplade error
 */
export function isNummerpladeError(error: ApiErrorModel): error is NummerpladeErrorModel {
  return 'source' in error && error.source === 'nummerplade'
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiErrorModel | NummerpladeErrorModel): boolean {
  if (isNummerpladeError(error)) {
    return error.retryable
  }
  
  // Rate limit errors are retryable
  if (error.error_code === 'RATE_LIMIT' || error.error_code === '429') {
    return true
  }
  
  return false
}

