/**
 * Vehicle list status IDs — must stay aligned with backend
 * `App\Constants\VehicleListStatus`.
 */
export const VEHICLE_LIST_STATUS_ID = {
  DRAFT: 1,
  PUBLISHED: 2,
  SOLD: 3,
  ARCHIVED: 4,
} as const

export type VehicleListStatusId =
  (typeof VEHICLE_LIST_STATUS_ID)[keyof typeof VEHICLE_LIST_STATUS_ID]

/** Display labels when API returns only `list_status_id` (no name field). */
const VEHICLE_LIST_STATUS_LABEL_BY_ID: Record<number, string> = {
  [VEHICLE_LIST_STATUS_ID.DRAFT]: 'draft',
  [VEHICLE_LIST_STATUS_ID.PUBLISHED]: 'published',
  [VEHICLE_LIST_STATUS_ID.SOLD]: 'sold',
  [VEHICLE_LIST_STATUS_ID.ARCHIVED]: 'archived',
}

export function listStatusNameFromId(statusId: number | null | undefined): string | undefined {
  if (statusId == null || !Number.isFinite(Number(statusId))) return undefined
  return VEHICLE_LIST_STATUS_LABEL_BY_ID[Number(statusId)]
}

export function formatListStatusLabel(options: {
  status?: string
  vehicleListStatusName?: string
  vehicleListStatusId?: number | null
}): string {
  const fromText = options.status || options.vehicleListStatusName
  if (fromText) return fromText
  const fromId = listStatusNameFromId(options.vehicleListStatusId)
  return fromId ?? 'N/A'
}

/**
 * Read a count from API payload keys (JSON may stringify numeric keys).
 */
export function listStatusCountFromPayload(
  counts: Record<string, number> | undefined,
  statusId: number
): number {
  if (!counts || typeof counts !== 'object') return 0
  const raw = counts[String(statusId)] ?? (counts as Record<number, number>)[statusId]
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : 0
}
