import { emitStructured } from '@kids-reporter/logger'
import { ZodError } from 'zod'

function zodParseDiagnostics(err: unknown): {
  zodFieldErrors?: Record<string, string[] | undefined>
  zodFormErrors?: string[]
} {
  let cur: unknown = err
  const seen = new Set<unknown>()
  while (cur instanceof Error && !seen.has(cur)) {
    seen.add(cur)
    const c = cur.cause
    if (c instanceof ZodError) {
      const { fieldErrors, formErrors } = c.flatten()
      return { zodFieldErrors: fieldErrors, zodFormErrors: formErrors }
    }
    cur = c
  }
  return {}
}

export function logContentApiFallback(operation: string, err: unknown) {
  const reason = err instanceof Error ? err.message : String(err)
  const zod = zodParseDiagnostics(err)
  emitStructured({
    severity: 'WARNING',
    message: 'content-api request failed; falling back to api-gateway',
    context: { operation, reason, ...zod },
  })
}
