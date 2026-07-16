import { VEHICLE_LIST_STATUS_ID } from '@/constants/vehicle-list-status'

type TranslateFn = (key: string) => string

const STATUS_ID_TO_KEY: Record<number, string> = {
  [VEHICLE_LIST_STATUS_ID.DRAFT]: 'draft',
  [VEHICLE_LIST_STATUS_ID.PUBLISHED]: 'published',
  [VEHICLE_LIST_STATUS_ID.SOLD]: 'sold',
  [VEHICLE_LIST_STATUS_ID.ARCHIVED]: 'archived',
  [VEHICLE_LIST_STATUS_ID.PENDING_REVIEW]: 'pending_review',
}

/** Maps Danish/English/API slugs to `vehicleStatus.*` i18n keys. */
const STATUS_ALIASES: Record<string, string> = {
  draft: 'draft',
  published: 'published',
  sold: 'sold',
  archived: 'archived',
  pending: 'pending',
  pending_review: 'pending_review',
  'pending review': 'pending_review',
  udgivet: 'published',
  offentliggjort: 'published',
  solgt: 'sold',
  kladde: 'draft',
  arkiveret: 'archived',
  afventer: 'pending',
  'afventer gennemgang': 'pending_review',
}

const TRANSMISSION_ALIASES: Record<string, string> = {
  automatisk: 'automatic',
  automatic: 'automatic',
  auto: 'automatic',
  manual: 'manual',
  manuel: 'manual',
}

const LISTING_TYPE_ALIASES: Record<string, string> = {
  køb: 'buy',
  kob: 'buy',
  buy: 'buy',
  purchase: 'buy',
  leasing: 'leasing',
  lease: 'leasing',
  engros: 'wholesale',
  wholesale: 'wholesale',
  'engros/cvr': 'wholesale',
  'engros/cvr-nummer': 'wholesale',
  formidlingssalg: 'brokerage',
  brokerage: 'brokerage',
  'uden afgift': 'duty_free',
  duty_free: 'duty_free',
}

const VEHICLE_USE_ALIASES: Record<string, string> = {
  'privat personkørsel': 'private_passenger',
  'privat personkorsel': 'private_passenger',
  private_passenger: 'private_passenger',
  'private passenger': 'private_passenger',
  erhverv: 'commercial',
  commercial: 'commercial',
  taxa: 'taxi',
  taxi: 'taxi',
  leje: 'rental',
  rental: 'rental',
  undervisning: 'driving_school',
  driving_school: 'driving_school',
}

const ELECTRIC_FUEL_TYPE_IDS = new Set([3, 7])
const HYBRID_FUEL_TYPE_IDS = new Set([4, 5])

const EQUIPMENT_CATEGORY_ALIASES: Record<string, string> = {
  interiør: 'interior',
  interior: 'interior',
  eksteriør: 'exterior',
  exterior: 'exterior',
  'sikkerhed & førerassistance': 'safety_assistance',
  'sikkerhed og førerassistance': 'safety_assistance',
  'safety & driver assistance': 'safety_assistance',
  'safety and driver assistance': 'safety_assistance',
  'klima & komfort': 'climate_comfort',
  'klima og komfort': 'climate_comfort',
  'climate & comfort': 'climate_comfort',
  'infotainment & navigation': 'infotainment_navigation',
  'infotainment and navigation': 'infotainment_navigation',
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

function statusKeyFromRaw(raw?: string | null, statusId?: number | null): string | undefined {
  if (statusId != null && STATUS_ID_TO_KEY[Number(statusId)]) {
    return STATUS_ID_TO_KEY[Number(statusId)]
  }
  if (!raw) return undefined
  const normalized = normalizeToken(raw)
  const slug = normalizeSlug(raw)
  return STATUS_ALIASES[normalized] ?? STATUS_ALIASES[slug] ?? slug
}

export function translateStatus(
  raw: string | undefined | null,
  t: TranslateFn,
  statusId?: number | null,
): string {
  const key = statusKeyFromRaw(raw, statusId)
  if (key) {
    const i18nKey = `vehicleStatus.${key}`
    const translated = t(i18nKey)
    if (translated !== i18nKey) return translated
  }
  if (raw?.trim()) return raw.trim()
  return t('common.na')
}

export function translateTransmission(raw: string | undefined | null, t: TranslateFn): string {
  if (!raw?.trim()) return t('common.na')
  const normalized = normalizeToken(raw)
  const slug = TRANSMISSION_ALIASES[normalized] ?? TRANSMISSION_ALIASES[normalizeSlug(raw)]
  if (slug) {
    const i18nKey = `vehicleTransmission.${slug}`
    const translated = t(i18nKey)
    if (translated !== i18nKey) return translated
  }
  return raw.trim()
}

export function translateListingType(raw: string | undefined | null, t: TranslateFn): string {
  if (!raw?.trim()) return t('common.na')
  const normalized = normalizeToken(raw)
  const slug = LISTING_TYPE_ALIASES[normalized] ?? LISTING_TYPE_ALIASES[normalizeSlug(raw)]
  if (slug) {
    const i18nKey = `vehicleListingType.${slug}`
    const translated = t(i18nKey)
    if (translated !== i18nKey) return translated
  }
  return raw.trim()
}

export function translateVehicleUse(raw: string | undefined | null, t: TranslateFn): string {
  if (!raw?.trim()) return t('common.na')
  const normalized = normalizeToken(raw)
  const slug = VEHICLE_USE_ALIASES[normalized] ?? VEHICLE_USE_ALIASES[normalizeSlug(raw)]
  if (slug) {
    const i18nKey = `vehicleUse.${slug}`
    const translated = t(i18nKey)
    if (translated !== i18nKey) return translated
  }
  return raw.trim()
}

export function translateEquipmentCategory(name: string | undefined | null, t: TranslateFn): string {
  if (!name?.trim()) return t('common.na')
  const normalized = normalizeToken(name)
  const slug = EQUIPMENT_CATEGORY_ALIASES[normalized]
  if (slug) {
    const i18nKey = `vehicleEquipmentCategories.${slug}`
    const translated = t(i18nKey)
    if (translated !== i18nKey) return translated
  }
  return name.trim()
}

export function isElectricOrHybridFuel(
  fuelTypeId?: unknown,
  fuelTypeName?: unknown,
): boolean {
  if (fuelTypeId != null && fuelTypeId !== '') {
    const id = Number(fuelTypeId)
    if (Number.isFinite(id) && (ELECTRIC_FUEL_TYPE_IDS.has(id) || HYBRID_FUEL_TYPE_IDS.has(id))) {
      return true
    }
  }
  if (typeof fuelTypeName !== 'string' || !fuelTypeName.trim()) return false
  const name = fuelTypeName.trim().toLowerCase()
  return (
    name.includes('el') ||
    name.includes('electric') ||
    name.includes('hybrid') ||
    name.includes('plug-in') ||
    name.includes('plugin')
  )
}

export function mapVehicleListStatusOptions(
  statuses: Array<{ id: number; name: string }>,
  t: TranslateFn,
): Array<{ id: number; name: string }> {
  return statuses.map((status) => ({
    id: status.id,
    name: translateStatus(status.name, t, status.id),
  }))
}

export function statusSlugForColor(raw?: string | null, statusId?: number | null): string {
  return statusKeyFromRaw(raw, statusId) ?? ''
}
