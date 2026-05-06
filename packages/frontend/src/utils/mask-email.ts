const MASKED_EMAIL_LENGTH = 8
const MASKED_VISIBLE_PREFIX = 3

export default function maskEmail(email: string): string {
  if (!email) return ''.padEnd(MASKED_EMAIL_LENGTH, '*')
  return email.slice(0, MASKED_VISIBLE_PREFIX).padEnd(MASKED_EMAIL_LENGTH, '*')
}
