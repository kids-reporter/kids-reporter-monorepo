import {
  emitStructured,
  getGcpTraceField,
  normalizeTraceContext,
} from '@kids-reporter/logger'
import type express from 'express'

export type CreateLoggerMwOptions = {
  projectId: string
  /** Defaults to 5000ms. */
  slowThresholdMs?: number
}

function getGlobalLogFields(req: express.Request, projectId: string) {
  const globalLogFields: { 'logging.googleapis.com/trace'?: string } = {}
  const traceContext = normalizeTraceContext(req.headers, {
    generateIfMissing: true,
  })
  const traceLogField = getGcpTraceField({
    projectId,
    traceId: traceContext.traceId,
  })
  if (traceLogField) {
    globalLogFields['logging.googleapis.com/trace'] = traceLogField
  }
  return {
    globalLogFields,
    traceContext,
  }
}

export function createLoggerMw(
  projectIdOrOpts: string | CreateLoggerMwOptions
): express.RequestHandler {
  const opts: CreateLoggerMwOptions =
    typeof projectIdOrOpts === 'string'
      ? { projectId: projectIdOrOpts }
      : (projectIdOrOpts ?? { projectId: '' })

  if (!opts.projectId) {
    throw new Error('projectId is required for createLoggerMw')
  }

  const slowThresholdMs =
    typeof opts.slowThresholdMs === 'number' && opts.slowThresholdMs > 0
      ? opts.slowThresholdMs
      : 5000

  return (req, res, next) => {
    const { globalLogFields, traceContext } = getGlobalLogFields(
      req,
      opts.projectId
    )
    const startAt = process.hrtime.bigint()
    let logged = false

    const authHeader = req.get('Authorization')
    const safeAuthHeader =
      authHeader && authHeader.startsWith('Bearer ')
        ? 'Bearer ***REDACTED***'
        : authHeader
          ? '***REDACTED***'
          : undefined

    const logResponse = (event: 'finish' | 'close') => {
      if (logged) return
      logged = true
      const elapsedMs = Number(process.hrtime.bigint() - startAt) / 1e6
      const isSlow = elapsedMs >= slowThresholdMs

      emitStructured({
        severity: isSlow ? 'WARNING' : 'INFO',
        message: `Response: ${req.method} ${req.originalUrl}`,
        status: res.statusCode,
        elapsedMs,
        event,
        slow: isSlow,
        ...globalLogFields,
      })
    }

    res.once('finish', () => logResponse('finish'))
    res.once('close', () => logResponse('close'))

    emitStructured({
      severity: 'INFO',
      message: `Request: ${req.method} ${req.originalUrl}`,
      debugPayload: {
        'req.headers': {
          'Content-Length': req.get('Content-Length'),
          'Content-Type': req.get('Content-Type'),
          Authorization: safeAuthHeader,
        },
      },
      ...globalLogFields,
    })

    res.locals.globalLogFields = globalLogFields
    res.locals.traceContext = traceContext

    next()
  }
}
