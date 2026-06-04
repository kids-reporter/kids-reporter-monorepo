import {
  createContentApiApp,
  createLoggerMw,
  sendJsonError,
} from '@kids-reporter/content-api-kit'
import { emitStructured } from '@kids-reporter/logger'
// @ts-ignore `@twreporter/errors` does not have typescript definition file yet
import _errors from '@twreporter/errors'
import express from 'express'
import { ZodError } from 'zod'

import consts from './constants.js'
import { createAuthRouter } from './routes/auth.js'
import { createHealthRouter } from './routes/health.js'
import { createOpenApiRouter } from './routes/openapi.js'
import { createV1Router } from './routes/v1/index.js'

const errors = _errors.default
const statusCodes = consts.statusCodes

export function createApp({
  gcpProjectId = 'kids-reporter',
  corsAllowOrigin = [],
  enableOpenApi = false,
  basePath = '',
}: {
  gcpProjectId?: string
  corsAllowOrigin: string[] | string
  enableOpenApi?: boolean
  basePath?: string
}) {
  if (corsAllowOrigin === '*') {
    emitStructured({
      severity: 'ALERT',
      message:
        'Invalid configuration: CORS_ALLOW_ORIGINS="*" cannot be used with credentialed /auth/* routes.',
    })
  }

  const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      emitStructured({
        severity: 'WARNING',
        message: 'Request validation failed',
        context: {
          zodIssues: err.issues.map((i) => ({
            path: i.path.join('.'),
            code: i.code,
          })),
        },
      })
      sendJsonError(
        res,
        statusCodes.badRequest,
        'invalid_request',
        'Invalid request',
        {
          issues: err.issues.map((i) => ({
            path: i.path,
            code: i.code,
            message: i.message,
          })),
        }
      )
      return
    }

    const annotatingError = errors.helpers.wrap(
      err,
      'UnknownError',
      'Express error handler catches an unknown error'
    )

    const entry = Object.assign(
      {
        severity: 'ERROR' as const,
        message: errors.helpers.printAll(
          annotatingError,
          {
            withStack: true,
            withPayload: false,
          },
          0,
          0
        ),
      },
      res.locals.globalLogFields
    )
    emitStructured(entry)
    sendJsonError(
      res,
      statusCodes.internalServerError,
      'internal_server_error',
      'Internal server error'
    )
  }

  return createContentApiApp({
    corsAllowOrigin,
    jsonLimit: '1mb',
    loggerMiddleware: createLoggerMw({
      projectId: gcpProjectId,
      slowThresholdMs: consts.slowThresholdMs,
    }),
    openApi: {
      enabled: enableOpenApi,
      corsMode: 'public',
      path: '',
      router: createOpenApiRouter({
        basePath,
      }),
    },
    routes: [
      {
        path: '/auth',
        corsMode: 'credentialed',
        router: createAuthRouter({ corsAllowOrigin }),
      },
      { path: '/', corsMode: 'public', router: createHealthRouter() },
      { path: '/v1', corsMode: 'public', router: createV1Router() },
    ],
    errorHandler,
  })
}
