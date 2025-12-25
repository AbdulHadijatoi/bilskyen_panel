/**
 * Response Handler
 * 
 * Centralized response and error handling
 * All API responses go through this module
 */

import type { AxiosError, AxiosResponse } from 'axios'
import type { ApiErrorModel, NummerpladeErrorModel, HttpErrorType } from '@/models/api-error.model'
import { isNummerpladeError, isRetryableError } from '@/models/api-error.model'
import { getAccessToken, clearTokens } from '@/utils/token'
import router from '@/router'

/**
 * Extract data from success response
 * Backend wraps all success responses in { data: {...} }
 */
export function handleSuccess<T>(response: AxiosResponse<{ data: T }>): T {
  // Backend always wraps success in { data: {...} }
  if (response.data && 'data' in response.data) {
    return response.data.data
  }
  
  // Fallback: return response.data directly if not wrapped
  return response.data as T
}

/**
 * Handle API errors
 * Maps Axios errors to ApiErrorModel
 * Handles specific status codes appropriately
 */
export function handleError(error: unknown): ApiErrorModel | NummerpladeErrorModel {
  const axiosError = error as AxiosError<ApiErrorModel | NummerpladeErrorModel>
  
  // Network error or no response
  if (!axiosError.response) {
    return {
      status: 'error',
      message: axiosError.message || 'Network error. Please check your connection.',
      error_code: 'NETWORK_ERROR',
    }
  }

  const status = axiosError.response.status
  const responseData = axiosError.response.data

  // Handle 401 Unauthorized - logout user
  if (status === HttpErrorType.UNAUTHORIZED) {
    // Clear tokens and redirect to login
    clearTokens()
    
    // Only redirect if not already on login page
    if (router.currentRoute.value.path !== '/auth/login') {
      router.push('/auth/login')
    }
    
    return {
      status: 'error',
      message: 'Your session has expired. Please log in again.',
      error_code: 'UNAUTHORIZED',
    }
  }

  // Handle 403 Forbidden - permission error
  if (status === HttpErrorType.FORBIDDEN) {
    return {
      status: 'error',
      message: responseData?.message || 'You do not have permission to perform this action.',
      error_code: 'FORBIDDEN',
    }
  }

  // Handle 422 Validation Error
  if (status === HttpErrorType.VALIDATION_ERROR) {
    return {
      status: 'error',
      message: responseData?.message || 'Validation error',
      errors: responseData?.errors,
      error_code: 'VALIDATION_ERROR',
    }
  }

  // Handle 429 Rate Limit
  if (status === HttpErrorType.TOO_MANY_REQUESTS) {
    const retryAfter = axiosError.response.headers['retry-after']
    return {
      status: 'error',
      message: responseData?.message || 'Too many requests. Please try again later.',
      error_code: 'RATE_LIMIT',
      ...(retryAfter && { errors: { retry_after: [retryAfter] } }),
    }
  }

  // Handle 5xx Server Errors
  if (status >= 500) {
    return {
      status: 'error',
      message: responseData?.message || 'Server error. Please try again later.',
      error_code: `SERVER_ERROR_${status}`,
    }
  }

  // Handle Nummerplade errors (if present)
  if (responseData && isNummerpladeError(responseData)) {
    return responseData as NummerpladeErrorModel
  }

  // Default error response
  return {
    status: 'error',
    message: responseData?.message || axiosError.message || 'An error occurred',
    errors: responseData?.errors,
    error_code: responseData?.error_code || `HTTP_${status}`,
  }
}

/**
 * Check if error is retryable
 */
export function isErrorRetryable(error: ApiErrorModel | NummerpladeErrorModel): boolean {
  return isRetryableError(error)
}

