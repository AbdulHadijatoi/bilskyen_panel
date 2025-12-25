/**
 * Pagination Model
 * 
 * Maps backend pagination format to TypeScript interface
 */

/**
 * Paginated response structure from backend
 */
export interface PaginationModel<T> {
  docs: T[]
  limit: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
  totalDocs?: number
  totalPages?: number
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  limit?: number
  page?: number
  with_deleted?: boolean
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION = {
  limit: 15,
  page: 1,
} as const

