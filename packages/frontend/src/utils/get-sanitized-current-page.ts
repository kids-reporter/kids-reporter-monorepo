export function getSanitizedCurrentPage(pageParam: unknown): number | null {
  if (pageParam == null || pageParam === '') {
    return 1
  }
  if (typeof pageParam !== 'string') {
    return null
  }

  const n = Number(pageParam)
  if (!Number.isSafeInteger(n) || n <= 0) {
    return null
  }

  return n
}
