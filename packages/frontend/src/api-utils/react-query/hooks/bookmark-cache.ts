export const OPTIMISTIC_BOOKMARK_ID = 'optimistic'

export function bookmarkQueryKey(memberId: string, type: string, slug: string) {
  return ['member-bookmark', memberId, type, slug] as const
}

/** TanStack Query ignores setQueryData(undefined), so a missing entry rolls back to null. */
export function rollbackBookmarkCache<T>(previous: T | undefined): T | null {
  return previous ?? null
}

export function isDeletableBookmarkId(id: string) {
  return id !== OPTIMISTIC_BOOKMARK_ID
}
