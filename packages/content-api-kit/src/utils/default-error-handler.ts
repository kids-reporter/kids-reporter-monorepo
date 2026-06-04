import type express from 'express'
import { ZodError } from 'zod'

import { sendJsonError } from './send-json-error.js'

export const defaultErrorHandler: express.ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  if (err instanceof ZodError) {
    sendJsonError(res, 400, 'invalid_request', 'Invalid request', {
      issues: err.issues.map((i) => ({
        path: i.path,
        code: i.code,
        message: i.message,
      })),
    })
    return
  }

  sendJsonError(res, 500, 'internal_server_error', 'Internal server error')
}
