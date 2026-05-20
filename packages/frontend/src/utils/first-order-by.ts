/** GraphQL variables often type `orderBy` as a single object or an array; use the first entry. */
export function firstOrderByEntry<T>(
  orderBy: T | T[] | null | undefined
): T | undefined {
  if (orderBy == null) return undefined
  return Array.isArray(orderBy) ? orderBy[0] : orderBy
}
