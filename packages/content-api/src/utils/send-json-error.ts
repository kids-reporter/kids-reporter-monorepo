import type express from 'express'

export type JsonErrorCode =
  | 'invalid_request'
  | 'not_found'
  | 'forbidden'
  | 'unauthorized'
  | 'conflict'
  | 'service_unavailable'
  | 'internal_server_error'
  | 'upstream_error'

/** Standard JSON `{ error: { code, message, details? } }` envelope for HTTP APIs */
export function sendJsonError(
  res: express.Response,
  status: number,
  code: JsonErrorCode,
  message: string,
  details?: unknown
) {
  res.status(status).json({
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  })
}
