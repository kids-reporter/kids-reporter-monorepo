import { z } from 'zod'

export const RestErrorCodeSchema = z.enum([
  'invalid_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'upstream_error',
  'service_unavailable',
  'internal_server_error',
])

export const RestErrorBodySchema = z.object({
  error: z.object({
    code: RestErrorCodeSchema,
    message: z.string(),
    /** `z.json()` is recursive and breaks zod-to-openapi (stack overflow on /openapi.json). */
    details: z.unknown().optional(),
  }),
})

export const RestOkSchema = z.object({
  status: z.literal('success'),
  data: z.unknown(),
})

export const RestFailSchema = z.object({
  status: z.literal('fail'),
  data: z.unknown(),
})

export const RestErrorSchema = z.object({
  status: z.literal('error'),
  message: z.string().optional(),
  error: z.unknown().optional(),
  errors: z.unknown().optional(),
})

export const RestEnvelopeSchema = z.union([
  RestOkSchema,
  RestFailSchema,
  RestErrorSchema,
])
