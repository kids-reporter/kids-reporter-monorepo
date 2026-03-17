import { emitStructured } from '@kids-reporter/logger'
// @ts-ignore `@twreporter/errors` does not have typescript definition file yet
import _errors from '@twreporter/errors'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import consts from './constants.js'
import middlewareCreator from './middlewares/index.js'
import { createAuthRouter } from './routes/auth.js'
import { createGqlRestRouter } from './routes/gql-rest.js'
import { createHealthRouter } from './routes/health.js'

// @twreporter/errors is a cjs module, therefore, we need to use its default property
const errors = _errors.default
const statusCodes = consts.statusCodes

/**
 *  This function creates an express application.
 *  This application aims to
 *
 *  1. Expose RESTful GraphQL routes to interact with the CMS.
 *  2. Expose authentication routes for token exchange.
 */
export function createApp({
  gcpProjectId = 'kids-reporter',
  corsAllowOrigin = [],
  gql,
}: {
  gcpProjectId?: string
  corsAllowOrigin: string[] | string
  gql: {
    headlessAccount: {
      email: string
      password: string
    }
    apiOrigin: string
  }
}) {
  // create express app
  const app = express()

  const corsOpts = {
    origin: corsAllowOrigin,
    credentials: true,
  }

  // common middlewares for every request
  // 1. log requests
  // 2. handle cors requests
  // 3. parse header cookie
  app.use(
    middlewareCreator.createLoggerMw(gcpProjectId),
    cors(corsOpts),
    cookieParser()
  )

  // Set the global JSON body limit to 1MB to support typical GraphQL payloads
  app.use(express.json({ limit: '1mb' }))

  // Health check route
  app.use(createHealthRouter())

  // RESTful GraphQL routes
  app.use(createGqlRestRouter(gql))

  // Auth routes
  app.use(createAuthRouter())

  /**
   *  Application level error handler
   */
  const errorHandler: express.ErrorRequestHandler = (
    err,
    req,
    res,
    /* eslint-disable-line */ next
  ) => {
    const annotatingError = errors.helpers.wrap(
      err,
      'UnknownError',
      'Express error handler catches an unknown error'
    )

    const entry = Object.assign(
      {
        severity: 'ERROR',
        // All exceptions that include a stack trace will be
        // integrated with Error Reporting.
        // See https://cloud.google.com/run/docs/error-reporting
        message: errors.helpers.printAll(
          annotatingError,
          {
            withStack: true,
            withPayload: true,
          },
          0,
          0
        ),
      },
      res.locals.globalLogFields
    )
    emitStructured(entry)
    res.status(statusCodes.internalServerError).send({
      status: 'error',
      error: annotatingError.error,
    })
  }

  app.use(errorHandler)

  return app
}
