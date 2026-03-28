/**
 * Public DMR lookup search (models / variants scoped by parent id).
 */

import httpClient from './http'
import { handleSuccess } from './response'
import { LOOKUP_SEARCH_ENDPOINTS } from './endpoints'

export type LookupModelRow = { id: number; name: string; brand_id: number }
export type LookupVariantRow = { id: number; name: string; model_id: number }

export async function searchLookupModels(
  brandIds: number[],
  search?: string
): Promise<LookupModelRow[]> {
  if (!brandIds.length) return []
  const response = await httpClient.get<{ data: { items: LookupModelRow[] } }>(
    LOOKUP_SEARCH_ENDPOINTS.MODELS,
    {
      params: {
        brand_ids: brandIds.join(','),
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    }
  )
  const payload = handleSuccess<{ items: LookupModelRow[] }>(response)
  return payload.items ?? []
}

export async function searchLookupVariants(
  modelIds: number[],
  search?: string
): Promise<LookupVariantRow[]> {
  if (!modelIds.length) return []
  const response = await httpClient.get<{ data: { items: LookupVariantRow[] } }>(
    LOOKUP_SEARCH_ENDPOINTS.VARIANTS,
    {
      params: {
        model_ids: modelIds.join(','),
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    }
  )
  const payload = handleSuccess<{ items: LookupVariantRow[] }>(response)
  return payload.items ?? []
}
