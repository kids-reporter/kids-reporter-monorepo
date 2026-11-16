import { RestErrorBodySchema } from '@kids-reporter/api-types'
import { emitStructured, type LogSeverity } from '@kids-reporter/logger'
import errors from '@twreporter/errors'
import axios, { AxiosRequestConfig } from 'axios'
import { ZodError } from 'zod'

import { CONTENT_API_ORIGIN, INTERNAL_CONTENT_API_ORIGIN } from '@/constants'
import envVars from '@/environment-variables'

import { buildTraceHeaders } from './trace-context'

export type ContentApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ContentApiQuery = Record<
  string,
  string | number | boolean | undefined | null
>

/** Attach Zod parse output so fallback logs and debuggers retain field-level issues. */
export function contentApiResponseParseError(
  message: string,
  zodError: ZodError
): Error {
  return new Error(message, { cause: zodError })
}

export class ContentApiRequestError extends Error {
  path: string
  url: string
  status?: number
  errorCode?: string
  errorDetails?: unknown
  constructor(
    path: string,
    url: string,
    message: string,
    status?: number,
    options?: { cause?: Error; errorCode?: string; errorDetails?: unknown }
  ) {
    // Copy only message/name/stack — never Axios/AnnotatingError
    // (AxiosError.request is a Writable that Cloud Logging splits).
    let cause: Error | undefined
    if (options?.cause) {
      cause = new Error(options.cause.message)
      cause.name = options.cause.name
      if (options.cause.stack) cause.stack = options.cause.stack
    }
    super(message, cause ? { cause } : undefined)
    this.name = 'ContentApiRequestError'
    this.path = path
    this.url = url
    this.status = status
    this.errorCode = options?.errorCode
    this.errorDetails = options?.errorDetails
  }
}

export function isContentApiNotFound(error: unknown): boolean {
  return error instanceof ContentApiRequestError && error.status === 404
}

const pickQueryParams = (query: ContentApiQuery | undefined) => {
  if (!query) return undefined
  const out: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    out[key] = value
  }
  return out
}

const buildUrl = (path: string) => {
  const base =
    typeof window === 'undefined'
      ? INTERNAL_CONTENT_API_ORIGIN
      : CONTENT_API_ORIGIN
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

const SERVER_GET_RETRY_LIMIT = 2
// full jitter up to 200ms then 400ms, and a 20s deadline so a hung
// GET cannot stack three requestTimeoutMs attempts past Cloud Run's 30s limit.
// Upgrade path: env-configured deadline, or Retry-After on 429.
const SERVER_GET_RETRY_BASE_MS = 200
const SERVER_GET_DEADLINE_MS = 20_000

function isRetryableServerGet(err: unknown): boolean {
  if (axios.isCancel(err) || !axios.isAxiosError(err)) return false
  const status = err.response?.status
  if (status === undefined) return true
  if (status === 408 || status === 429) return true
  return status >= 500
}

function maxRetryDelayMs(attempt: number): number {
  return SERVER_GET_RETRY_BASE_MS * 2 ** attempt
}

function retryDelayMs(attempt: number): number {
  return Math.floor(Math.random() * maxRetryDelayMs(attempt))
}

function canAffordRetry(
  elapsedMs: number,
  attempt: number,
  requestTimeoutMs: number
): boolean {
  const remaining = SERVER_GET_DEADLINE_MS - elapsedMs
  const nextAttemptMs = Math.min(requestTimeoutMs, SERVER_GET_DEADLINE_MS)
  return remaining >= maxRetryDelayMs(attempt) + nextAttemptMs
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(new axios.CanceledError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    if (!signal) return
    if (signal.aborted) {
      onAbort()
      return
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function contentApiFailureLogSeverity(
  status?: number,
  isCancel?: boolean
): LogSeverity {
  if (isCancel) return 'INFO'
  if (status === 404) return 'INFO'
  if (status !== undefined && status >= 400 && status < 500) return 'WARNING'
  return 'ERROR'
}

function contentApiFailureLogMessage({
  method,
  path,
  status,
  errorMessage,
  annotatedErr,
  isCancel,
}: {
  method: ContentApiMethod
  path: string
  status?: number
  errorMessage: string
  annotatedErr: unknown
  isCancel?: boolean
}): string {
  if (isCancel) {
    return `content-api request cancelled: ${method} ${path}`
  }
  if (status === 404) {
    return `content-api 404 ${method} ${path}`
  }
  if (status !== undefined && status >= 400 && status < 500) {
    return `content-api ${status} ${method} ${path}: ${errorMessage}`
  }
  return errors.helpers.printAll(annotatedErr, {
    withStack: true,
    withPayload: false,
  })
}

/**
 * Sends a request to the content API (axios).
 *
 * **Body handling (intentional):** `body` is attached only for `POST`, `PUT`, and `PATCH`.
 * `GET` and `DELETE` never send a JSON body here, even if `body` is passed — content-api
 * callers today do not rely on DELETE bodies. If a future endpoint needs `DELETE` with a
 * body, extend the `sendsBody` condition explicitly rather than assuming `body` is sent.
 *
 * Server-side `GET` retries transient failures twice (no response, 408, 429, 5xx)
 * with jittered backoff, and stops when another full attempt would pass a 20s
 * deadline. Browser calls and other methods are not retried. Pass `signal` to
 * abort a wait; server components that have no request signal rely on the deadline.
 */
export async function sendContentApiRequest<TData = unknown>({
  path,
  method = 'GET',
  query,
  body,
  authToken,
  withCredentials = false,
  signal,
  traceHeaders,
}: {
  path: string
  method?: ContentApiMethod
  query?: ContentApiQuery
  body?: unknown
  authToken?: string
  withCredentials?: boolean
  signal?: AbortSignal
  traceHeaders?: Headers | Record<string, string | undefined>
}): Promise<TData> {
  const url = buildUrl(path)

  const config: AxiosRequestConfig = {
    method,
    url,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...buildTraceHeaders(traceHeaders),
    },
    timeout: envVars.requestTimeoutMs,
    withCredentials,
    signal,
    params: pickQueryParams(query),
  }

  // Deliberately no body for GET/DELETE; see function JSDoc.
  const sendsBody =
    method !== 'GET' && method !== 'DELETE' && body !== undefined
  if (sendsBody) {
    config.data = body
  }

  const serverGet = typeof window === 'undefined' && method === 'GET'
  const startedAt = Date.now()

  for (let attempt = 0; ; attempt++) {
    if (serverGet) {
      const remaining = SERVER_GET_DEADLINE_MS - (Date.now() - startedAt)
      if (remaining <= 0) {
        throw new ContentApiRequestError(
          path,
          url,
          'content-api retry deadline exceeded'
        )
      }
      config.timeout = Math.min(envVars.requestTimeoutMs, remaining)
    }

    try {
      const response = await axios.request<TData>(config)
      return response.data
    } catch (err) {
      let failure: unknown = err
      const elapsedMs = Date.now() - startedAt
      if (
        serverGet &&
        attempt < SERVER_GET_RETRY_LIMIT &&
        isRetryableServerGet(err) &&
        canAffordRetry(elapsedMs, attempt, envVars.requestTimeoutMs)
      ) {
        const status = axios.isAxiosError(err)
          ? err.response?.status
          : undefined
        emitStructured({
          severity: 'INFO',
          message: `content-api retry ${attempt + 1}/${SERVER_GET_RETRY_LIMIT} ${method} ${path}`,
          context: {
            path,
            url,
            method,
            status,
            attempt: attempt + 1,
          },
        })
        try {
          await sleep(retryDelayMs(attempt), signal)
          continue
        } catch (sleepErr) {
          failure = sleepErr
        }
      }

      const annotatedErr = errors.helpers.annotateAxiosError(failure)
      const status = axios.isAxiosError(failure)
        ? failure.response?.status
        : undefined
      const responseData = axios.isAxiosError(failure)
        ? failure.response?.data
        : undefined
      const parsedError = RestErrorBodySchema.safeParse(responseData)
      const errorCode = parsedError.success
        ? parsedError.data.error.code
        : undefined
      const errorDetails = parsedError.success
        ? parsedError.data.error.details
        : undefined
      const errorMessage = parsedError.success
        ? parsedError.data.error.message
        : annotatedErr instanceof Error
          ? annotatedErr.message
          : String(annotatedErr)
      const isCancel = axios.isCancel(failure)
      emitStructured({
        severity: contentApiFailureLogSeverity(status, isCancel),
        message: contentApiFailureLogMessage({
          method,
          path,
          status,
          errorMessage,
          annotatedErr,
          isCancel,
        }),
        context: {
          path,
          url,
          method,
          status,
        },
      })
      const cleanCause = new Error(errorMessage)
      cleanCause.name =
        annotatedErr instanceof Error ? annotatedErr.name : 'AxiosError'
      if (annotatedErr instanceof Error && annotatedErr.stack) {
        cleanCause.stack = annotatedErr.stack
      }
      throw new ContentApiRequestError(path, url, errorMessage, status, {
        cause: cleanCause,
        errorCode,
        errorDetails,
      })
    }
  }
}
