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

export type JsonErrorBody = {
  error: {
    code: JsonErrorCode
    message: string
    details?: unknown
  }
}

export function sendJsonError(
  res: express.Response,
  status: number,
  code: JsonErrorCode,
  message: string,
  details?: unknown
) {
  const body: JsonErrorBody = {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  }
  res.status(status).json(body)
}
