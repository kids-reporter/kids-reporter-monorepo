# @kids-reporter/logger

Shared structured logger and trace utilities for Kids Reporter services. Uses Google Cloud `X-Cloud-Trace-Context` to propagate a single `traceId` so that logs can be correlated in GCP Cloud Logging via `logging.googleapis.com/trace`.

## Types

- **`LogSeverity`** — `'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'ALERT' | 'CRITICAL'`
- **`StructuredLogPayload`** — `{ severity: LogSeverity; message?: string } & Record<string, unknown>`
- **`TraceHeaderInput`** — `Headers | Record<string, string | undefined | unknown> | undefined`
- **`NormalizedTraceContext`** — `{ traceId: string; traceHeaders: { 'X-Cloud-Trace-Context': string } }`

## API

### `normalizeTraceContext(headersInput?, options?)`

Parses trace context from the `X-Cloud-Trace-Context` header (GCP format). Optionally generates a new trace ID when the header is missing.

- **`headersInput`** — Request headers (e.g. `Headers` or plain object).
- **`options.generateIfMissing`** — If `true` (default), creates a new trace ID when the header is missing; if `false`, returns `undefined` in that case.

**Returns:** `NormalizedTraceContext` or `undefined`.

```ts
import { normalizeTraceContext } from '@kids-reporter/logger'

const ctx = normalizeTraceContext(request.headers)
// ctx.traceId, ctx.traceHeaders['X-Cloud-Trace-Context']
```

### `getTraceLogFields(headersInput?, options?)`

Builds an object of trace-related fields for structured logging. Includes `logging.googleapis.com/trace` when `projectId` is set for GCP log correlation.

- **`headersInput`** — Same as `normalizeTraceContext`.
- **`options.projectId`** — GCP project ID for the trace field; falls back to `GOOGLE_CLOUD_PROJECT` or `GCP_PROJECT` env vars.
- **`options.generateIfMissing`** — Same as `normalizeTraceContext` (default `false` here).

**Returns:** Object with `traceId` and optionally `logging.googleapis.com/trace`.

```ts
import { getTraceLogFields } from '@kids-reporter/logger'

const fields = getTraceLogFields(req.headers, { projectId: 'my-gcp-project' })
console.log(JSON.stringify({ ...fields, message: 'Request processed' }))
```

### `getGcpTraceField({ projectId, traceId })`

Returns the GCP trace resource name: `projects/{projectId}/traces/{traceId}`. Returns `undefined` if `projectId` or `traceId` is missing.

### `emitStructured(payload)`

Writes a structured log entry to the console as JSON. Uses `console.error` for ERROR/ALERT/CRITICAL, `console.warn` for WARNING, and `console.log` for others.

```ts
import { emitStructured } from '@kids-reporter/logger'

emitStructured({
  severity: 'INFO',
  message: 'User signed in',
  userId: 'usr_123',
  ...getTraceLogFields(request.headers),
})
```
