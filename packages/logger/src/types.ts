export type LogSeverity =
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'ALERT'
  | 'CRITICAL'

export type StructuredLogPayload = {
  severity: LogSeverity
  message?: string
} & Record<string, unknown>

/** Supports Express req.headers where values can be string | string[]. */
export type TraceHeaderInput =
  | Headers
  | Record<string, string | string[] | undefined | unknown>
  | undefined

/** Trace context for GCP Cloud Logging correlation. Only traceId is propagated. */
export type NormalizedTraceContext = {
  traceId: string
  traceHeaders: {
    'X-Cloud-Trace-Context': string
  }
}
