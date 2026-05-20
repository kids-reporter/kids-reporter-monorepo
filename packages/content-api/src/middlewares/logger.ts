import {
  emitStructured,
  getGcpTraceField,
  normalizeTraceContext,
} from '@kids-reporter/logger'
import express from 'express'

import consts from '../constants.js'

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

export function createLoggerMw(projectId: string): express.RequestHandler {
  const handler: express.RequestHandler = (req, res, next) => {
    const { globalLogFields, traceContext } = getGlobalLogFields(req, projectId)
    const startAt = process.hrtime.bigint()
    let logged = false
    const slowThresholdMs = consts.slowThresholdMs

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
  return handler
}
