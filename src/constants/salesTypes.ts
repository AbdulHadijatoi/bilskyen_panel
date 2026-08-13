/** Seeded lookup is `Leasingdetaljer`; Excel/extension may send `Leasing`. */
export const SALES_TYPE_LEASING_DETAILS = 'Leasingdetaljer'

export function isLeasingSalesTypeName(name?: string | null): boolean {
  const n = String(name || '').trim().toLowerCase()
  return n === 'leasingdetaljer' || n === 'leasing'
}
