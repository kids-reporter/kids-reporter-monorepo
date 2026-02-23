import express from 'express'

import { slowThresholdMs, statusCodes } from './gql-rest-shared.js'

const maxLogBodyBytes = 1024

const summarizeParams = (
  variables: Record<string, unknown>
): Record<string, unknown> | undefined => {
  const summary: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(variables)) {
    const lowerKey = key.toLowerCase()
    if (
      lowerKey.endsWith('take') &&
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      summary[key] = value
    }
    if (lowerKey.endsWith('orderby') && Array.isArray(value)) {
      summary[`${key}Count`] = value.length
    }
  }

  const skipValue = variables.skip
  if (typeof skipValue === 'number' && Number.isFinite(skipValue)) {
    summary.skip = skipValue
  }

  if (typeof variables.nextCursor === 'string') {
    summary.nextCursorLength = variables.nextCursor.length
  }

  return Object.keys(summary).length ? summary : undefined
}

export const logResponse = (
  res: express.Response,
  status: number,
  payload: unknown,
  startAt?: bigint,
  operation?: string,
  variables?: Record<string, unknown>
) => {
  const elapsedMs = startAt
    ? // Convert high-resolution nanoseconds to milliseconds.
      Number(process.hrtime.bigint() - startAt) / 1e6
    : undefined
  const isSlow =
    typeof elapsedMs === 'number' ? elapsedMs >= slowThresholdMs : false
  const params = isSlow && variables ? summarizeParams(variables) : undefined
  let serialized = ''
  let serializeError: string | undefined
  try {
    serialized = JSON.stringify(payload)
  } catch (err) {
    serialized = '"[unserializable payload]"'
    serializeError = (err as Error).message
  }

  const byteLength = Buffer.byteLength(serialized, 'utf8')
  const errorInfo = serializeError
    ? { unserializable: true, serializeError }
    : null
  let bodyForLog: unknown = errorInfo
  if (!bodyForLog) {
    if (status === statusCodes.ok) {
      bodyForLog = { byteLength }
    } else if (byteLength > maxLogBodyBytes) {
      bodyForLog = {
        truncated: true,
        byteLength,
        preview: serialized.slice(0, maxLogBodyBytes),
      }
    } else {
      bodyForLog = payload
    }
  }

  const severity =
    status >= statusCodes.internalServerError
      ? 'ERROR'
      : isSlow
        ? 'WARNING'
        : 'INFO'

  console.log(
    JSON.stringify({
      severity,
      message: 'GraphQL REST response',
      status,
      elapsedMs,
      slow: isSlow,
      operation,
      params,
      body: bodyForLog,
      ...res?.locals?.globalLogFields,
    })
  )
}

export const logAndSend = (
  res: express.Response,
  status: number,
  payload: unknown,
  startAt?: bigint,
  operation?: string,
  variables?: Record<string, unknown>
) => {
  logResponse(res, status, payload, startAt, operation, variables)
  return res.status(status).json(payload)
}
