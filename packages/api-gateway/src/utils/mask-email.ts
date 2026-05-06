const MASKED_EMAIL_LENGTH = 8
const MASKED_VISIBLE_PREFIX = 3

// This approach is a workaround since there'll be content api server in the future.
export function maskEmail(email: string): string {
  if (!email) return ''.padEnd(MASKED_EMAIL_LENGTH, '*')
  return email.slice(0, MASKED_VISIBLE_PREFIX).padEnd(MASKED_EMAIL_LENGTH, '*')
}

export function maskEmailsInData(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(maskEmailsInData)
  }

  if (data !== null && typeof data === 'object') {
    const record = data as Record<string, unknown>
    const next: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(record)) {
      if (key === 'email' && typeof value === 'string') {
        next[key] = maskEmail(value)
        continue
      }
      next[key] = maskEmailsInData(value)
    }

    return next
  }

  return data
}
