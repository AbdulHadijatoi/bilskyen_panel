export interface StatusDistributionItem {
  status: string
  count: number
  color: string
}

export function buildVehicleStatusDistribution(
  items: StatusDistributionItem[],
  total: number,
) {
  const archivedItem = items.find((i) => i.status.toLowerCase() === 'archived')
  const archivedCount = archivedItem?.count ?? 0
  const archivedDominates = total > 0 && archivedCount / total > 0.5
  const visibleItems = archivedDominates
    ? items.filter((i) => i.status.toLowerCase() !== 'archived')
    : items
  const denominator = archivedDominates
    ? visibleItems.reduce((sum, i) => sum + i.count, 0)
    : total
  return { items: visibleItems, archivedDominates, archivedCount, total, denominator }
}
