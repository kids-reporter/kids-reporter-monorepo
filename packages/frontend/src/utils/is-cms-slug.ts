/** Matches CMS slugConfig: lowercase letters, digits, and hyphens only. */
const CMS_SLUG = /^[a-z0-9-]+$/

export function isCmsSlug(value: string): boolean {
  return CMS_SLUG.test(value)
}
