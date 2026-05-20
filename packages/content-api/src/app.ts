import { emitStructured } from '@kids-reporter/logger'
// @ts-ignore `@twreporter/errors` does not have typescript definition file yet
import _errors from '@twreporter/errors'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { ZodError } from 'zod'

import consts from './constants.js'
import middlewareCreator from './middlewares/index.js'
import { createAuthRouter } from './routes/auth.js'
import { createHealthRouter } from './routes/health.js'
import { createOpenApiRouter } from './routes/openapi.js'
import { createV1Router } from './routes/v1/index.js'
import { sendJsonError } from './utils/send-json-error.js'

const errors = _errors.default
const statusCodes = consts.statusCodes

export function createApp({
  gcpProjectId = 'kids-reporter',
  corsAllowOrigin = [],
}: {
  gcpProjectId?: string
  corsAllowOrigin: string[] | string
}) {
  const app = express()

  const corsOptsPublic: cors.CorsOptions = {
    origin: corsAllowOrigin,
    credentials: false,
  }
  const corsOptsCredentialed: cors.CorsOptions = (() => {
    if (corsAllowOrigin === '*') {
      emitStructured({
        severity: 'ALERT',
        message:
          'Invalid configuration: CORS_ALLOW_ORIGINS="*" cannot be used with credentialed /auth/* routes.',
      })
      return { origin: false, credentials: true }
    }
    return {
      origin: corsAllowOrigin,
      credentials: true,
    }
  })()

  app.use(middlewareCreator.createLoggerMw(gcpProjectId), cookieParser())

  app.use(express.json({ limit: '1mb' }))

  // Auth route requires cookies; use credentialed CORS only on /auth/*
  app.use(
    '/auth',
    cors(corsOptsCredentialed),
    createAuthRouter({ corsAllowOrigin })
  )

  // Public routes: non-credentialed CORS
  app.use(cors(corsOptsPublic))

  app.use(createHealthRouter())
  app.use(createOpenApiRouter())
  app.use('/v1', createV1Router())

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

  app.use(errorHandler)

  return app
}
