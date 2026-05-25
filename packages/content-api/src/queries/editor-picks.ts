import {
  V1EditorPicksSettingsResponseSchema,
  V1PopularKeywordsResponseSchema,
} from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  asOrderJson,
  buildPublicPostWhere,
  mapPostCard,
  orderTargetsByOrderJson,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1EditorPicksSettingsResponse = z.infer<
  typeof V1EditorPicksSettingsResponseSchema
>
type V1PopularKeywordsResponse = z.infer<typeof V1PopularKeywordsResponseSchema>

/** `GET /v1/editor-picks-settings` */
export async function fetchEditorPicksSettings(
  take: number,
  now: Date
): Promise<V1EditorPicksSettingsResponse> {
  const postWhere = buildPublicPostWhere(now)

  const settings = await prisma.editorPicksSetting.findMany({
    take,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      editorPicksOfPostsOrderJson: true,
      popularKeywordsOrderJson: true,
      editorPicksOfPosts: {
        where: postWhere,
        select: postCardSelect,
      },
      editorPicksOfTags: {
        select: { name: true, slug: true },
      },
      popularKeywords: {
        select: { id: true, name: true },
      },
    },
  })

  const result = settings.map((s) => {
    const editorPicksOfPostsOrdered = orderTargetsByOrderJson(
      s.editorPicksOfPosts,
      asOrderJson(s.editorPicksOfPostsOrderJson)
    ).map(mapPostCard)

    const popularKeywordsOrdered = orderTargetsByOrderJson(
      s.popularKeywords,
      asOrderJson(s.popularKeywordsOrderJson)
    ).map((k) => ({ name: k.name }))

    return {
      id: s.id,
      editorPicksOfPostsOrdered,
      editorPicksOfTags: s.editorPicksOfTags,
      popularKeywordsOrdered,
    }
  })
  return result
}

/** `GET /v1/popular-keywords` */
export async function fetchPopularKeywords(): Promise<V1PopularKeywordsResponse> {
  const setting = await prisma.editorPicksSetting.findFirst({
    orderBy: { id: 'asc' },
    select: {
      popularKeywordsOrderJson: true,
      popularKeywords: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!setting) return []

  return orderTargetsByOrderJson(
    setting.popularKeywords,
    asOrderJson(setting.popularKeywordsOrderJson)
  ).map((k) => ({ name: k.name }))
}
