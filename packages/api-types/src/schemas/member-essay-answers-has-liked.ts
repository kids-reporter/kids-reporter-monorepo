import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

/** GET `essayAnswerIds` query: comma-separated ID strings. */
export const V1EssayAnswersHasLikedQuerySchema = z.object({
  essayAnswerIds: z
    .string()
    .max(10_000)
    .optional()
    .describe(
      'Comma-separated essay answer IDs. Omit or leave empty for an empty result list.'
    ),
})

export const V1EssayAnswersHasLikedItemSchema = z
  .object({
    essayAnswerId: z
      .string()
      .describe('Essay answer ID from the request, in request order.'),
    hasLiked: z.boolean().describe('Whether the member has liked this answer.'),
    essayAnswerLikeId: z
      .string()
      .describe(
        'Like row id when hasLiked is true; empty string when not liked.'
      ),
  })
  .openapi('MemberEssayAnswerHasLikedItem')

/** Root JSON array. */
export const V1EssayAnswersHasLikedResponseSchema = z
  .array(V1EssayAnswersHasLikedItemSchema)
  .describe('One entry per requested ID, in the same order.')

/** Normalize Express `req.query.essayAnswerIds` to a single string for Zod. */
export function essayAnswerIdsQueryToString(
  raw: string | string[] | undefined
): string | undefined {
  if (raw === undefined) return undefined
  if (Array.isArray(raw)) return raw.map(String).join(',')
  return String(raw)
}

/** Split comma-separated query into ID strings (trim, drop empties). */
export function essayAnswerIdsFromCommaSeparatedParam(
  value: string | undefined
): string[] {
  if (value === undefined || value === '') return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
