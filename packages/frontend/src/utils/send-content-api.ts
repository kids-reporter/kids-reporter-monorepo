import { RestErrorBodySchema } from '@kids-reporter/api-types'
import { emitStructured } from '@kids-reporter/logger'
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
    options?: { cause?: unknown; errorCode?: string; errorDetails?: unknown }
  ) {
    super(message, options)
    this.name = 'ContentApiRequestError'
    this.path = path
    this.url = url
    this.status = status
    this.errorCode = options?.errorCode
    this.errorDetails = options?.errorDetails
  }
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

/**
 * Sends a request to the content API (axios).
 *
 * **Body handling (intentional):** `body` is attached only for `POST`, `PUT`, and `PATCH`.
 * `GET` and `DELETE` never send a JSON body here, even if `body` is passed — content-api
 * callers today do not rely on DELETE bodies. If a future endpoint needs `DELETE` with a
 * body, extend the `sendsBody` condition explicitly rather than assuming `body` is sent.
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

  try {
    const response = await axios.request<TData>(config)
    return response.data
  } catch (err) {
    const annotatedErr = errors.helpers.annotateAxiosError(err)
    const status = axios.isAxiosError(err) ? err.response?.status : undefined
    const responseData = axios.isAxiosError(err)
      ? err.response?.data
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
    emitStructured({
      severity: 'ERROR',
      message: errors.helpers.printAll(annotatedErr, {
        withStack: true,
        withPayload: false,
      }),
      context: {
        path,
        url,
        method,
        status,
      },
    })
    throw new ContentApiRequestError(path, url, errorMessage, status, {
      cause: annotatedErr,
      errorCode,
      errorDetails,
    })
  }
}
