/**
 * Cross-package contract types inferred from Zod schemas.
 * UI-specific aliases belong in frontend `types/api.ts`.
 */
import type { z } from 'zod'

import {
  RestEnvelopeSchema,
  RestErrorBodySchema,
  RestErrorCodeSchema,
} from './rest.js'
import {
  PostContentSchema,
  V1AccessTokenResponseSchema,
  V1MemberProfilePatchBodySchema,
  V1MemberProfileSchema,
} from './schemas/content.js'

export type RestErrorCode = z.infer<typeof RestErrorCodeSchema>
export type RestErrorBody = z.infer<typeof RestErrorBodySchema>
export type RestEnvelope = z.infer<typeof RestEnvelopeSchema>

export type PostContent = z.infer<typeof PostContentSchema>

export type MemberProfile = z.infer<typeof V1MemberProfileSchema>
export type MemberProfilePatch = z.infer<typeof V1MemberProfilePatchBodySchema>

/** Alias for OpenAPI body name; same shape as `MemberProfilePatch`. */
export type V1MemberProfilePatchBody = MemberProfilePatch

export type AccessTokenResponse = z.infer<typeof V1AccessTokenResponseSchema>
