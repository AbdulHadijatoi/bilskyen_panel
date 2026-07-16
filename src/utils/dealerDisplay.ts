/**
 * Sanitize dealer CVR and display names for admin lists.
 * Registration creates placeholder CVRs ("PENDING-<userId>") until onboarding completes.
 */

export function isValidCvr(cvr?: string | null): boolean {
  if (!cvr) return false
  const trimmed = cvr.trim()
  if (/^PENDING/i.test(trimmed)) return false
  return /^\d{8}$/.test(trimmed)
}

export function isNonsenseName(name?: string | null): boolean {
  if (!name) return true
  const trimmed = name.trim()
  if (!trimmed) return true
  return /^0+$/.test(trimmed) || /^\d+$/.test(trimmed)
}

export function getDealerDisplayName(
  item: { id: number; name?: string | null; email?: string | null },
  unnamedLabel: string,
): string {
  if (!isNonsenseName(item.name)) return item.name as string
  if (item.email) return item.email
  return `${unnamedLabel} #${item.id}`
}
