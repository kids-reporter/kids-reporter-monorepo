/* global NodeJS */

import { randomBytes } from 'node:crypto'
import { PassThrough } from 'node:stream'

import { emitStructured } from '@kids-reporter/logger'
import axios from 'axios'
import Busboy from 'busboy'
import express from 'express'
import FormData from 'form-data'
import { type DocumentNode, print } from 'graphql'

import { formatAxiosError } from '../utils/format-axios-error.js'
import { logResponse } from './gql-rest-logger.js'
import { clientGqlErrorCodes, errors, statusCodes } from './gql-rest-shared.js'

type BuildVariables = (input: { name: string }) => Record<string, unknown>

type MultipartRewriteOptions = {
  apiOrigin: string
  operationName: string
  document: DocumentNode
  map: Record<string, string[]>
  buildVariables: BuildVariables
}

// Base fallback when the client does not provide a usable file name.
const defaultUploadName = 'memberAvatar'

// Create a unique name to avoid overwriting previously uploaded files.
const buildUniqueSuffix = () =>
  `${Date.now()}-${randomBytes(4).toString('hex')}`

// Strip extension, normalize, and add a unique suffix for CMS display/storage.
const deriveUploadName = (fileName?: string) => {
  const trimmed = fileName?.trim()
  if (!trimmed) {
    return `${defaultUploadName}-${buildUniqueSuffix()}`
  }
  const baseName = trimmed.replace(/\.[^/.]+$/, '')
  const safeBase = baseName || defaultUploadName
  return `${safeBase}-${buildUniqueSuffix()}`
}

// Optional size guard; unset keeps current behavior (no limit).
const resolveMaxUploadBytes = () => {
  const raw = process.env.GQL_REST_UPLOAD_MAX_BYTES
  if (!raw) {
    return undefined
  }
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    return undefined
  }
  return value
}

export const createMultipartRewriteHandler = ({
  apiOrigin,
  operationName,
  document,
  map,
  buildVariables,
}: MultipartRewriteOptions) => {
  const handler: express.RequestHandler = (req, res) => {
    let uploadPromise: Promise<unknown> | undefined
    let uploadController: AbortController | undefined
    let responded = false

    // Keep response formatting consistent with other REST GQL handlers.
    const respond = (status: number, payload: unknown, err?: Error) => {
      if (responded || res.headersSent) {
        return
      }
      responded = true
      if (status >= statusCodes.internalServerError && err) {
        const annotatedErr = errors.helpers.wrap(
          err,
          'GraphQLRestMultipartServerError',
          'GraphQL REST multipart server error'
        )
        emitStructured({
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
      }
      res.set('Cache-Control', 'no-store')
      logResponse(
        res,
        status,
        payload,
        res.locals.gqlRestStartAt,
        operationName
      )
      res.status(status).json(payload)
    }

    const contentType = req.get('Content-Type') || ''
    const isMultipart = contentType.includes('multipart/form-data')
    if (!isMultipart) {
      return respond(statusCodes.badRequest, {
        status: 'fail',
        data: {
          code: 'INVALID_MULTIPART',
          message: 'Multipart form required for this operation',
        },
      })
    }

    const maxFileBytes = resolveMaxUploadBytes()
    // Parse multipart to extract only the file stream.
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        ...(maxFileBytes ? { fileSize: maxFileBytes } : {}),
      },
    })

    // Stop processing and abort any in-flight upload.
    const abortWith = (status: number, payload: unknown, error?: Error) => {
      if (uploadController) {
        uploadController.abort()
      }
      req.unpipe(busboy)
      req.resume()
      respond(status, payload, error)
    }

    // Handle the file stream; size is enforced via busboy limits.
    busboy.on(
      'file',
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: {
          filename: string
          encoding: string
          mimeType: string
        }
      ) => {
        const { filename: fileName, mimeType } = info
        // Pipe the incoming file into a pass-through stream for forwarding to CMS GraphQL.
        const uploadStream = new PassThrough()
        let uploadStarted = false
        let uploadBytes = 0

        uploadStream.on('error', () => {
          uploadStream.destroy()
          return abortWith(statusCodes.badRequest, {
            status: 'fail',
            data: {
              code: 'UPLOAD_STREAM_ERROR',
              message: 'Failed to process upload stream',
            },
          })
        })

        const onData = (chunk: unknown) => {
          if (uploadStarted) {
            return
          }
          // Guard: some clients submit an empty "file" field when no avatar is chosen.
          const size =
            typeof chunk === 'string'
              ? Buffer.byteLength(chunk)
              : Buffer.isBuffer(chunk)
                ? chunk.length
                : 0
          uploadBytes += size
          // Defer starting the CMS upload until we see at least one byte.
          if (!uploadStarted && uploadBytes > 0) {
            uploadStarted = true
            file.off('data', onData)

            const nameForUpload = deriveUploadName(fileName)
            // Build a fixed GraphQL multipart payload (no client query allowed).
            const operationsPayload = {
              query: print(document),
              operationName,
              variables: buildVariables({ name: nameForUpload }),
            }

            // Rebuild multipart with server-side operations/map and the file stream.
            const form = new FormData()
            form.append('operations', JSON.stringify(operationsPayload))
            form.append('map', JSON.stringify(map))
            form.append('1', uploadStream, {
              filename: fileName,
              contentType: mimeType || 'application/octet-stream',
            })

            // Forward only validated auth headers from buildAuthContext.
            const authContext = (res.locals?.gqlRestAuthContext || {}) as {
              headers?: Record<string, string>
            }
            const headers = {
              ...(authContext.headers || {}),
              'x-apollo-operation-name': operationName,
            }

            // Stream the rebuilt multipart payload to CMS GraphQL.
            uploadController = new AbortController()
            uploadPromise = axios
              .post(`${apiOrigin}/api/graphql`, form, {
                headers,
                signal: uploadController.signal,
                maxBodyLength: Infinity,
              })
              .then((axiosRes) => axiosRes.data)
              .catch((error) => {
                abortWith(
                  statusCodes.internalServerError,
                  {
                    status: 'error',
                    message: 'Failed to process upload request',
                  },
                  formatAxiosError(error)
                )
              })
          }
        }

        file.on('data', onData)

        file.pipe(uploadStream)
        file.on('limit', () => {
          uploadStream.destroy()
          return abortWith(statusCodes.badRequest, {
            status: 'fail',
            data: {
              code: 'FILE_TOO_LARGE',
              message: 'File exceeds upload size limit',
              ...(maxFileBytes ? { limitBytes: maxFileBytes } : {}),
            },
          })
        })

        file.on('end', () => {
          // If the client submitted an empty file field, treat as missing avatar.
          if (!uploadStarted && uploadBytes === 0 && !responded) {
            uploadStream.destroy()
            return abortWith(statusCodes.badRequest, {
              status: 'fail',
              data: {
                code: 'MISSING_FILE',
                message: 'Missing upload file',
              },
            })
          }
        })
      }
    )

    // Ignore non-file fields; frontend is expected to only send the file.
    busboy.on('field', () => {})

    // Enforce the single-file rule.
    busboy.on('filesLimit', () => {
      return abortWith(statusCodes.badRequest, {
        status: 'fail',
        data: {
          code: 'MULTIPLE_FILES_NOT_ALLOWED',
          message: 'Only one file is allowed',
        },
      })
    })

    // Reject malformed multipart payloads.
    busboy.on('error', (err) => {
      emitStructured({
        severity: 'INFO',
        message: 'Invalid multipart payload',
        context: {
          error: {
            message: (err as Error).message,
            stack: (err as Error).stack,
          },
        },
      })
      return abortWith(statusCodes.badRequest, {
        status: 'fail',
        data: {
          code: 'INVALID_MULTIPART',
          message: 'Invalid multipart payload',
        },
      })
    })

    // Once parsing completes, wait for CMS GraphQL upload response.
    busboy.on('finish', async () => {
      if (responded || res.headersSent) {
        return
      }

      if (!uploadPromise) {
        return respond(statusCodes.badRequest, {
          status: 'fail',
          data: {
            code: 'MISSING_FILE',
            message: 'Missing upload file',
          },
        })
      }

      try {
        // Normalize CMS GraphQL response into REST-style payload.
        const gqlPayload = (await uploadPromise) as
          | { data?: unknown; errors?: unknown }
          | undefined

        if (Array.isArray(gqlPayload?.errors) && gqlPayload?.errors?.length) {
          const gqlErrors = gqlPayload.errors
          const hasClientError = gqlPayload.errors.some(
            (error: { extensions?: { code?: string } }) =>
              clientGqlErrorCodes.has(error?.extensions?.code ?? '')
          )
          // Mirror gql-rest.ts: 400 for client GraphQL error codes, otherwise treat as server-side fault.
          const status = hasClientError
            ? statusCodes.badRequest
            : statusCodes.internalServerError
          return respond(
            status,
            {
              status: 'error',
              message: 'CMS GraphQL responded with errors',
              errors: gqlErrors,
            },
            errors.helpers.wrap(
              undefined,
              'GraphQLError',
              'CMS GraphQL responded with errors',
              {
                context: {
                  errors: gqlErrors,
                },
              }
            )
          )
        }
        return respond(statusCodes.ok, {
          status: 'success',
          data: gqlPayload?.data ?? {},
        })
      } catch (err) {
        const error = formatAxiosError(err)
        return respond(
          statusCodes.internalServerError,
          {
            status: 'error',
            message: 'Failed to process upload request',
          },
          error
        )
      }
    })

    req.on('error', () => {
      return abortWith(statusCodes.badRequest, {
        status: 'fail',
        data: {
          code: 'REQUEST_STREAM_ERROR',
          message: 'Failed to read upload request',
        },
      })
    })

    req.on('aborted', () => {
      return abortWith(statusCodes.badRequest, {
        status: 'fail',
        data: {
          code: 'REQUEST_ABORTED',
          message: 'Upload request was aborted',
        },
      })
    })

    req.pipe(busboy)
  }

  return handler
}
