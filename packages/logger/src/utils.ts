import {
  NormalizedTraceContext,
  StructuredLogPayload,
  TraceHeaderInput,
} from './types.js'

const XCLOUD_TRACE_HEADER = 'x-cloud-trace-context'
const TRACE_ID_REGEX = /^[a-f0-9]{32}$/i

const CONSOLE_BY_SEVERITY: Record<string, 'log' | 'warn' | 'error'> = {
  ALERT: 'error',
  CRITICAL: 'error',
  ERROR: 'error',
  WARNING: 'warn',
  NOTICE: 'log',
  INFO: 'log',
  DEBUG: 'log',
}

function normalizeHeaderValue(
  value: string | string[] | undefined | unknown
): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (typeof value === 'string') {
    return value
  }
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'string'
  ) {
    return value[0]
  }
  return undefined
}

function getHeaderValue(input: TraceHeaderInput, headerName: string) {
  if (!input) {
    return undefined
  }
  if (typeof Headers !== 'undefined' && input instanceof Headers) {
    return input.get(headerName) || undefined
  }
  const lowered = headerName.toLowerCase()
  for (const [key, value] of Object.entries(input)) {
    if (key.toLowerCase() === lowered) {
      return normalizeHeaderValue(value)
    }
  }
  return undefined
}

function getRandomHex(length: number) {
  const bytes = new Uint8Array(Math.ceil(length / 2))
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length)
}

/**
 * Parses traceId from GCP X-Cloud-Trace-Context.
 * Accepts "traceId;o=1" or "traceId/spanId;o=1" (spanId is ignored).
 */
function parseXCloudTraceContext(
  xCloudTraceContext?: string
): string | undefined {
  if (!xCloudTraceContext) {
    return undefined
  }
  const [traceAndSpan] = xCloudTraceContext.trim().split(';')
  const traceId = traceAndSpan.split('/')[0]?.trim()
  if (!traceId || !TRACE_ID_REGEX.test(traceId)) {
    return undefined
  }
  return traceId.toLowerCase()
}

// Overloads: when generateIfMissing is true, return is always NormalizedTraceContext
/* eslint-disable no-redeclare -- overload signatures + implementation */
export function normalizeTraceContext(
  headersInput: TraceHeaderInput | undefined,
  options: { generateIfMissing: true }
): NormalizedTraceContext
export function normalizeTraceContext(
  headersInput?: TraceHeaderInput,
  options?: { generateIfMissing?: boolean }
): NormalizedTraceContext | undefined
export function normalizeTraceContext(
  headersInput?: TraceHeaderInput,
  options: { generateIfMissing?: boolean } = {}
) {
  /* eslint-enable no-redeclare */
  const shouldGenerate = options.generateIfMissing !== false
  const xCloudTraceContext = getHeaderValue(headersInput, XCLOUD_TRACE_HEADER)
  const traceId = parseXCloudTraceContext(xCloudTraceContext)

  if (!traceId && !shouldGenerate) {
    return undefined
  }

  const resolvedTraceId = traceId ?? getRandomHex(32)
  const xCloudValue = `${resolvedTraceId};o=1`

  return {
    traceId: resolvedTraceId,
    traceHeaders: {
      'X-Cloud-Trace-Context': xCloudValue,
    },
  }
}

export function getGcpTraceField({
  projectId,
  traceId,
}: {
  projectId?: string
  traceId: string
}) {
  if (!projectId || !traceId) {
    return undefined
  }
  return `projects/${projectId}/traces/${traceId}`
}

export function getTraceLogFields(
  headersInput?: TraceHeaderInput,
  options: { projectId?: string; generateIfMissing?: boolean } = {}
) {
  const traceContext = normalizeTraceContext(headersInput, {
    generateIfMissing: options.generateIfMissing ?? false,
  })
  if (!traceContext) {
    return {}
  }

  const projectId =
    options.projectId ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCP_PROJECT
  const traceField = getGcpTraceField({
    projectId,
    traceId: traceContext.traceId,
  })

  return {
    ...(traceField ? { 'logging.googleapis.com/trace': traceField } : {}),
    traceId: traceContext.traceId,
  }
}

export function emitStructured(payload: StructuredLogPayload) {
  const severity =
    typeof payload?.severity === 'string'
      ? payload.severity.toUpperCase()
      : 'INFO'
  const method = CONSOLE_BY_SEVERITY[severity] || 'log'
  const message = JSON.stringify(payload)

  if (method === 'error') {
    console.error(message)
    return
  }
  if (method === 'warn') {
    console.warn(message)
    return
  }
  console.log(message)
}
