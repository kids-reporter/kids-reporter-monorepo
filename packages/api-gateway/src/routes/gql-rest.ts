import express from 'express'
import { print } from 'graphql'

import { buildAuthContext } from '../graphql/auth.js'
import { callCmsGraphql } from '../graphql/cms-client.js'
import { operations } from '../graphql/operations.js'
import { ensureRecord, parseVars } from '../graphql/operations/shared.js'
import { logAndSend } from './gql-rest-logger.js'
import { createMemberAvatarUploadHandler } from './gql-rest-member-avatar-upload.js'
import { clientGqlErrorCodes, errors, statusCodes } from './gql-rest-shared.js'

export function createGqlRestRouter({
  apiOrigin,
  headlessAccount,
}: {
  apiOrigin: string
  headlessAccount: { email: string; password: string }
}) {
  const router = express.Router()

  // Dedicated handler for file uploads; keep it out of the JSON-oriented loop below.
  const createMemberAvatarOp = operations['create-member-avatar']
  if (createMemberAvatarOp) {
    const multipartRewriteHandler = createMemberAvatarUploadHandler({
      apiOrigin,
    })

    router.post('/api/rest/create-member-avatar', async (req, res, next) => {
      const startAt = process.hrtime.bigint()
      const contentType = req.get('Content-Type') || ''
      const isMultipart = contentType.includes('multipart/form-data')
      if (!isMultipart) {
        const payload = {
          status: 'fail',
          data: { message: 'Multipart form required for this operation' },
        }
        return logAndSend(
          res,
          statusCodes.badRequest,
          payload,
          startAt,
          'create-member-avatar'
        )
      }

      try {
        const authContext = await buildAuthContext({
          req,
          apiOrigin,
          headlessAccount,
          auth: createMemberAvatarOp.auth,
        })
        res.locals.gqlRestStartAt = startAt
        res.locals.gqlRestAuthContext = authContext
        return multipartRewriteHandler(req, res, next)
      } catch (err) {
        const payload = {
          status: 'fail',
          data: {
            message: 'buildAuthContext fails. ' + (err as Error).message,
          },
        }
        return logAndSend(
          res,
          statusCodes.badRequest,
          payload,
          startAt,
          'create-member-avatar'
        )
      }
    })
  }

  // Register method-specific handlers for each operation
  Object.entries(operations).forEach(([operationName, op]) => {
    if (operationName === 'create-member-avatar') {
      // Handled by the multipart proxy route above.
      return
    }
    const method = op.method.toLowerCase() as keyof express.Router
    const methodFn = router[method]

    if (typeof methodFn === 'function') {
      ;(
        methodFn as (
          this: express.Router,
          path: string,
          handler: express.RequestHandler
        ) => void
      ).call(router, `/api/rest/${operationName}`, async (req, res) => {
        const startAt = process.hrtime.bigint()
        let variables
        try {
          const input = ensureRecord(parseVars(req), 'Missing variables')
          variables = op.buildVariables(input)
        } catch (err) {
          const payload = {
            status: 'fail',
            data: {
              message: 'buildVariables fails. ' + (err as Error).message,
            },
          }
          return logAndSend(
            res,
            statusCodes.badRequest,
            payload,
            startAt,
            operationName
          )
        }

        let authContext
        try {
          authContext = await buildAuthContext({
            req,
            apiOrigin,
            headlessAccount,
            auth: op.auth,
          })
        } catch (err) {
          const payload = {
            status: 'fail',
            data: {
              message: 'buildAuthContext fails. ' + (err as Error).message,
            },
          }
          return logAndSend(
            res,
            statusCodes.badRequest,
            payload,
            startAt,
            operationName,
            variables
          )
        }

        try {
          const gqlRes = await callCmsGraphql({
            apiOrigin,
            document: print(op.document),
            variables,
            operationName: op.operationName,
            headers: authContext.headers,
            originalCookie: authContext.originalCookie,
            mode: authContext.mode,
            tokenManager: authContext.tokenManager,
          })

          if (op.auth === 'auth') {
            res.set('Cache-Control', 'no-store')
          } else if (op.cacheTtl && op.method === 'GET') {
            res.set('Cache-Control', `public, max-age=${op.cacheTtl}`)
          }

          const gqlPayload = gqlRes?.data

          if (gqlPayload?.errors?.length) {
            const hasClientError = gqlPayload.errors.some(
              (error: { extensions?: { code?: string } }) =>
                clientGqlErrorCodes.has(error?.extensions?.code ?? '')
            )
            const status = hasClientError
              ? statusCodes.badRequest
              : statusCodes.internalServerError
            const payload = {
              status: 'error',
              message: 'CMS GraphQL responded with errors',
              errors: gqlPayload.errors,
            }
            return logAndSend(
              res,
              status,
              payload,
              startAt,
              operationName,
              variables
            )
          }

          const payload = {
            status: 'success',
            data: gqlPayload?.data ?? {},
          }
          return logAndSend(
            res,
            statusCodes.ok,
            payload,
            startAt,
            operationName,
            variables
          )
        } catch (err) {
          const annotatedErr = errors.helpers.wrap(
            err,
            'GraphQLRestError',
            'Failed to call CMS GraphQL'
          )
          console.error(
            JSON.stringify({
              severity: 'ERROR',
              message: errors.helpers.printAll(
                annotatedErr,
                {
                  withStack: true,
                  withPayload: true,
                },
                0,
                0
              ),
              ...res?.locals?.globalLogFields,
            })
          )
          const payload = {
            status: 'error',
            message: 'Failed to process request',
          }
          return logAndSend(
            res,
            statusCodes.internalServerError,
            payload,
            startAt,
            operationName,
            variables
          )
        }
      })
    }
  })

  router.all('/api/rest/:operation', (req, res) => {
    const startAt = process.hrtime.bigint()
    const op = operations[req.params.operation]
    if (!op) {
      const payload = {
        status: 'fail',
        data: {
          message: `Unknown operation: '${req.params.operation}'. Available operations: [${Object.keys(operations).join(', ')}]`,
        },
      }
      return logAndSend(
        res,
        statusCodes.badRequest,
        payload,
        startAt,
        req.params.operation
      )
    }
    const payload = {
      status: 'fail',
      data: { message: `Use ${op.method}` },
    }
    return logAndSend(
      res,
      statusCodes.methodNotAllowed,
      payload,
      startAt,
      req.params.operation
    )
  })

  return router
}
