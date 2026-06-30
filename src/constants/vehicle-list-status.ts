/**
 * Vehicle list status IDs — must stay aligned with backend
 * `App\Constants\VehicleListStatus`.
 */
export const VEHICLE_LIST_STATUS_ID = {
  DRAFT: 1,
  PUBLISHED: 2,
  SOLD: 3,
  ARCHIVED: 4,
  PENDING_REVIEW: 5,
} as const

export type VehicleListStatusId =
  (typeof VEHICLE_LIST_STATUS_ID)[keyof typeof VEHICLE_LIST_STATUS_ID]

/** Display labels when API returns only `list_status_id` (no name field). */
const VEHICLE_LIST_STATUS_LABEL_BY_ID: Record<number, string> = {
  [VEHICLE_LIST_STATUS_ID.DRAFT]: 'draft',
  [VEHICLE_LIST_STATUS_ID.PUBLISHED]: 'published',
  [VEHICLE_LIST_STATUS_ID.SOLD]: 'sold',
  [VEHICLE_LIST_STATUS_ID.ARCHIVED]: 'archived',
  [VEHICLE_LIST_STATUS_ID.PENDING_REVIEW]: 'pending_review',
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

/** Vuetify chip colors keyed by {@link VEHICLE_LIST_STATUS_ID} (locale-independent). */
export const LIST_STATUS_CHIP_COLORS: Record<number, string> = {
  [VEHICLE_LIST_STATUS_ID.DRAFT]: 'grey',
  [VEHICLE_LIST_STATUS_ID.PUBLISHED]: 'success',
  [VEHICLE_LIST_STATUS_ID.SOLD]: 'info',
  [VEHICLE_LIST_STATUS_ID.ARCHIVED]: 'warning',
  [VEHICLE_LIST_STATUS_ID.PENDING_REVIEW]: 'orange',
}

const LIST_STATUS_CHIP_COLORS_BY_NAME: Record<string, string> = {
  draft: 'grey',
  published: 'success',
  sold: 'info',
  archived: 'warning',
  pending_review: 'orange',
}

/**
 * Resolve chip color from `list_status_id` when present; fall back to English slug names only.
 */
export function listStatusChipColor(options: {
  vehicleListStatusId?: number | null
  status?: string
  vehicleListStatusName?: string
}): string {
  const id =
    options.vehicleListStatusId != null && Number.isFinite(Number(options.vehicleListStatusId))
      ? Number(options.vehicleListStatusId)
      : null
  if (id != null && LIST_STATUS_CHIP_COLORS[id] != null) {
    return LIST_STATUS_CHIP_COLORS[id]
  }
  const slug = listStatusNameFromId(id) ?? (options.status || options.vehicleListStatusName)?.toLowerCase()
  return LIST_STATUS_CHIP_COLORS_BY_NAME[slug || ''] || 'grey'
}
