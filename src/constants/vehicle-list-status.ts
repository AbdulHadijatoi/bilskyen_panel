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
